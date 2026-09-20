"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Line, useGLTF } from "@react-three/drei";
import { cloneCarModel } from "@/lib/clone-car-model";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import type { Line2, LineMaterial } from "three-stdlib";

import type { AirflowView, AirSpeed } from "./airflow-lab";

const MODEL_PATH = "/models/f1-car.glb";
const MODEL_CENTER = new Vector3(0, 0.08, -2.84);
const SPEED: Record<AirSpeed, number> = {
  slow: 0.055,
  race: 0.12,
  fast: 0.22,
};
const CAMERA: Record<AirflowView, Vector3> = {
  side: new Vector3(6.8, 2.2, -2.6),
  top: new Vector3(0.15, 8.5, -2.8),
  front: new Vector3(0, 1.25, 4.8),
  floor: new Vector3(5.6, -1.25, -2.1),
};

type FlowPath = {
  curve: CatmullRomCurve3;
  color: string;
  wake?: boolean;
};

function curve(points: [number, number, number][]) {
  return new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
}

function buildFlowPaths(): FlowPath[] {
  const paths: FlowPath[] = [];

  [-1.25, -0.72, 0, 0.72, 1.25].forEach((x, index) => {
    paths.push({
      curve: curve([
        [x, 0.18, 1.6],
        [x * 0.9, 0.2, -0.2],
        [x * 0.65, 0.72 + Math.abs(x) * 0.08, -2.0],
        [x * 0.55, 0.62, -3.75],
        [x * 0.75, 0.55, -5.35],
        [x * 1.15, 0.35 + index * 0.03, -6.9],
      ]),
      color: index === 2 ? "#ffd35a" : "#59d8ff",
    });
  });

  [-1.1, -0.55, 0, 0.55, 1.1].forEach((x, index) => {
    paths.push({
      curve: curve([
        [x, -0.38, 1.6],
        [x * 0.92, -0.42, -0.35],
        [x * 0.72, -0.54, -2.2],
        [x * 0.62, -0.48, -4.15],
        [x * 0.78, -0.28, -5.45],
        [x * 1.12, 0.02, -6.9],
      ]),
      color: index === 2 ? "#ffca48" : "#64f2d2",
    });
  });

  [-1.7, 1.7].forEach((x) => {
    paths.push({
      curve: curve([
        [x, 0.05, 1.6],
        [x * 1.12, 0.08, -0.45],
        [x * 1.15, 0.12, -2.6],
        [x * 0.9, 0.2, -4.7],
        [x * 1.35, 0.22, -6.9],
      ]),
      color: "#59d8ff",
    });
  });

  [-0.85, -0.42, 0, 0.42, 0.85].forEach((x, index) => {
    paths.push({
      curve: curve([
        [x * 0.65, 0.28, -4.9],
        [x * 0.9, 0.35, -5.5],
        [x * 1.25, 0.3 + (index % 2) * 0.12, -6.2],
        [x * 1.8, 0.05 + (index % 3) * 0.18, -7.15],
      ]),
      color: "#557cff",
      wake: true,
    });
  });

  return paths;
}

function TunnelCar() {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => {
    const clone = cloneCarModel(scene);
    const tunnelMaterial = new MeshStandardMaterial({
      color: "#dce7ef",
      emissive: "#102b3d",
      emissiveIntensity: 0.32,
      metalness: 0.72,
      roughness: 0.3,
    });
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.material = tunnelMaterial;
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

function CameraRig({ view }: { view: AirflowView }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const easing = 1 - Math.exp(-delta * 4.5);
    camera.position.lerp(CAMERA[view], easing);
    camera.lookAt(MODEL_CENTER);
  });

  return null;
}

function FlowField({
  speed,
  paused,
  showTurbulence,
}: {
  speed: AirSpeed;
  paused: boolean;
  showTurbulence: boolean;
}) {
  const paths = useMemo(() => buildFlowPaths(), []);
  const { size } = useThree();
  const particleCount = size.width < 640 ? 12 : 22;
  const visiblePaths = useMemo(
    () => paths.filter((path) => showTurbulence || !path.wake),
    [paths, showTurbulence],
  );
  const particles = useMemo(
    () =>
      visiblePaths.flatMap((path, pathIndex) =>
        Array.from({ length: particleCount }, (_, particleIndex) => ({
          path,
          pathIndex,
          offset: particleIndex / particleCount,
        })),
      ),
    [particleCount, visiblePaths],
  );
  const meshRef = useRef<InstancedMesh>(null);
  const progressRef = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  const forward = useMemo(() => new Vector3(0, 0, 1), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    particles.forEach((particle, index) => {
      mesh.setColorAt(index, new Color(particle.path.color));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!paused) progressRef.current += delta * SPEED[speed];

    particles.forEach((particle, index) => {
      const t =
        (progressRef.current + particle.offset + particle.pathIndex * 0.047) %
        1;
      particle.path.curve.getPointAt(t, point);

      if (showTurbulence && particle.path.wake) {
        point.x += Math.sin(t * 34 + particle.offset * 10) * t * 0.12;
        point.y += Math.cos(t * 29 + particle.offset * 8) * t * 0.09;
      }

      dummy.position.copy(point);
      particle.path.curve.getTangentAt(t, tangent).normalize();
      dummy.quaternion.setFromUnitVectors(forward, tangent);
      const pulse = 0.72 + Math.sin(t * Math.PI * 2 + particle.pathIndex) * 0.2;
      const width = (particle.path.wake ? 0.06 : 0.045) * pulse;
      const length = particle.path.wake ? 0.32 : 0.24;
      dummy.scale.set(width, width, length * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {visiblePaths.map((path, index) => (
        <AnimatedFlowLine
          key={index}
          path={path}
          speed={speed}
          paused={paused}
        />
      ))}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, particles.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 7, 7]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

function AnimatedFlowLine({
  path,
  speed,
  paused,
}: {
  path: FlowPath;
  speed: AirSpeed;
  paused: boolean;
}) {
  const lineRef = useRef<Line2>(null);

  useFrame((_, delta) => {
    if (paused || !lineRef.current) return;
    const material = lineRef.current.material as LineMaterial;
    material.dashOffset -= delta * SPEED[speed] * 18;
  });

  return (
    <Line
      ref={lineRef}
      points={path.curve.getPoints(90)}
      color={path.color}
      lineWidth={path.wake ? 1.7 : 1.4}
      dashed
      dashScale={1}
      dashSize={path.wake ? 0.2 : 0.26}
      gapSize={path.wake ? 0.17 : 0.14}
      transparent
      opacity={path.wake ? 0.62 : 0.7}
      depthWrite={false}
    />
  );
}

function PressureZones() {
  return (
    <group>
      <mesh position={[0, 0.02, -0.56]} scale={[1.25, 0.52, 0.22]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial
          color="#ff4e48"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0.45, -4.95]} scale={[1.08, 0.55, 0.32]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial
          color="#ff9850"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, -0.4, -3.2]} scale={[1.0, 0.18, 2.0]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial
          color="#ffd35a"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

type AirflowSceneProps = {
  view: AirflowView;
  speed: AirSpeed;
  showStreamlines: boolean;
  showPressure: boolean;
  showTurbulence: boolean;
  paused: boolean;
};

function WindTunnel({
  view,
  speed,
  showStreamlines,
  showPressure,
  showTurbulence,
  paused,
}: AirflowSceneProps) {
  return (
    <>
      <color attach="background" args={["#07111c"]} />
      <fog attach="fog" args={["#07111c", 8, 18]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 7, 4]} intensity={2.3} color="#d9f6ff" />
      <directionalLight
        position={[-4, 1, -5]}
        intensity={1.4}
        color="#3a7cff"
      />
      <pointLight position={[0, -0.6, -3]} intensity={1.2} color="#5fffe2" />
      <Environment preset="city" />

      <TunnelCar />
      {showStreamlines && (
        <FlowField
          speed={speed}
          paused={paused}
          showTurbulence={showTurbulence}
        />
      )}
      {showPressure && <PressureZones />}

      <gridHelper
        args={[18, 36, "#18344d", "#10263a"]}
        position={[0, -0.62, -2.8]}
      />
      <CameraRig view={view} />
    </>
  );
}

type ErrorBoundaryProps = { children: ReactNode; fallback: ReactNode };

class AirflowErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[airflow-lab] failed to render 3D wind tunnel:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function AirflowFallback() {
  return (
    <div className="grid h-full place-items-center bg-[#07111c] px-6 text-center">
      <div>
        <p className="font-heading text-lg font-black text-white">
          3D airflow unavailable
        </p>
        <p className="mt-2 max-w-md text-sm text-white/45">
          This browser could not start WebGL. The tyre and component labs remain
          available above.
        </p>
      </div>
    </div>
  );
}

export default function AirflowScene(props: AirflowSceneProps) {
  return (
    <AirflowErrorBoundary fallback={<AirflowFallback />}>
      <Canvas
        aria-label="Interactive three-dimensional CFD-inspired airflow visualisation around a Formula 1 concept car"
        role="img"
        camera={{
          fov: 42,
          position: CAMERA.side.toArray() as [number, number, number],
        }}
        dpr={[1, 1.4]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={<AirflowFallback />}
      >
        <Suspense fallback={null}>
          <WindTunnel {...props} />
        </Suspense>
      </Canvas>
    </AirflowErrorBoundary>
  );
}

useGLTF.preload(MODEL_PATH);
