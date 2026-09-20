"use client";

import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { cloneCarModel } from "@/lib/clone-car-model";

import { CAR_PARTS } from "./car-parts";

const MODEL_PATH = "/models/f1-car.glb";

// The model's real bounding box (measured after downloading/optimizing):
// roughly x:[-0.83,0.82] y:[-0.35,0.61] z:[-5.24,-0.45]. Framing the camera
// explicitly from this known box is simpler and more predictable than an
// auto-fit helper for a single fixed model.
const MODEL_CENTER: [number, number, number] = [0, 0.13, -2.84];
const CAMERA_START: [number, number, number] = [5.5, 1.8, -2.84];

// Preloading here is safe: this whole module is only ever loaded on the client.
// The dynamic(..., { ssr: false }) boundary in car-explorer-canvas.tsx guarantees
// it's never imported during server rendering.
useGLTF.preload(MODEL_PATH);

function Car() {
  const { scene } = useGLTF(MODEL_PATH);

  // The model has no per-part mesh names beyond "FRONT NOSE" and "floor" (checked
  // after downloading — it's a single-body hobbyist export, not organized into
  // named sub-assemblies), so hotspots below are positioned in 3D space rather
  // than tied to individual mesh names.

  // Own clone, never the shared cached scene — see lib/clone-car-model.ts.
  const model = useMemo(() => cloneCarModel(scene), [scene]);

  return <primitive object={model} />;
}

const worldPos = new Vector3();

// Hotspots live inside the WebGL scene (not as DOM overlays) so they are
// drawn in the same pass, with the same camera, as the car — they can never
// disagree with the model about where a part is, whatever the timing of a
// resize, a font/layout shift or a slow first frame. (The earlier drei <Html>
// overlay projected to DOM separately and drifted out of sync with the mesh.)
// Scale is recomputed each frame so a dot stays a constant size in CSS pixels
// regardless of camera distance or canvas size.
const DOT_PX = 7;

function Hotspot({
  position,
  selected,
  accent,
  onSelect,
}: {
  position: [number, number, number];
  selected: boolean;
  accent: string;
  onSelect: () => void;
}) {
  const group = useRef<Group>(null);
  const pulse = useRef<Mesh>(null);

  useFrame(({ camera, size, clock }) => {
    const g = group.current;
    if (!g) return;
    g.getWorldPosition(worldPos);
    const distance = camera.position.distanceTo(worldPos);
    const fov = "fov" in camera ? (camera.fov as number) : 40;
    const unitsPerPx =
      (2 * distance * Math.tan((fov * Math.PI) / 360)) / size.height;
    g.scale.setScalar(unitsPerPx * DOT_PX * (selected ? 1.25 : 1));

    const ring = pulse.current;
    if (ring) {
      const t = (clock.elapsedTime * 0.9) % 1;
      ring.scale.setScalar(1 + t * 1.6);
      (ring.material as MeshBasicMaterial).opacity = selected ? 0 : 0.55 * (1 - t);
    }
  });

  return (
    <group ref={group} position={position}>
      <Billboard>
        <mesh
          renderOrder={20}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          {/* generous invisible hit area (~22px radius) for touch */}
          <circleGeometry args={[3.2, 24]} />
          <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh ref={pulse} renderOrder={21}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color={accent} transparent depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh renderOrder={22}>
          <circleGeometry args={[1.38, 32]} />
          <meshBasicMaterial color="#ffffff" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh renderOrder={23}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color={selected ? "#d7192d" : accent}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

// Frames the whole car for the actual canvas shape. A fixed camera distance
// clips the car on narrower (phone / 4:3) canvases, and worst at the side-on
// angle the auto-rotate passes through. Distance = enough for the car's
// half-length (measured bbox z-span ~4.8) to fit the horizontal field of view
// with a safety margin for perspective, recomputed when the canvas resizes.
const CAR_HALF_LENGTH = 2.4;
const FIT_MARGIN = 1.22;
const BASE_DISTANCE = Math.hypot(
  CAMERA_START[0] - MODEL_CENTER[0],
  CAMERA_START[1] - MODEL_CENTER[1],
  CAMERA_START[2] - MODEL_CENTER[2],
);

function FitCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const fov = "fov" in camera ? (camera.fov as number) : 40;
    const aspect = size.width / size.height;
    const needed =
      (CAR_HALF_LENGTH * FIT_MARGIN) /
      (Math.tan((fov * Math.PI) / 360) * aspect);
    const distance = Math.min(14, Math.max(BASE_DISTANCE, needed));
    const target = new Vector3(...MODEL_CENTER);
    const direction = camera.position.clone().sub(target).normalize();
    camera.position.copy(target).addScaledVector(direction, distance);
  }, [camera, size.width, size.height]);

  return null;
}

function CarSceneContent({
  activePartId,
  showcaseActive,
  onSelect,
}: {
  activePartId: string;
  showcaseActive: boolean;
  onSelect: (id: string) => void;
}) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={CAMERA_START} />
      <FitCamera />
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={0.75} />
      {/* Key light: front-upper-left */}
      <directionalLight position={[5, 6, 5]} intensity={1.45} />
      {/* Fill light: opposite side, dimmer */}
      <directionalLight position={[-5, 2, 3]} intensity={0.65} />
      {/* Rim light: from behind, for edge definition */}
      <directionalLight position={[0, 3, -6]} intensity={0.85} />

      <Environment preset="studio" />

      <Car />

      {CAR_PARTS.map((part) => (
        <Hotspot
          key={part.id}
          position={part.hotspot}
          accent={part.accent}
          selected={part.id === activePartId}
          onSelect={() => onSelect(part.id)}
        />
      ))}

      <ContactShadows
        position={[0, -0.36, -2.84]}
        opacity={0.28}
        scale={12}
        blur={2.5}
        far={4}
        color="#5b6472"
      />

      <OrbitControls
        target={MODEL_CENTER}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={2}
        maxDistance={14}
        autoRotate={showcaseActive && !hasInteracted}
        autoRotateSpeed={0.45}
        onStart={() => setHasInteracted(true)}
      />
    </>
  );
}

type ErrorBoundaryProps = { children: ReactNode; fallback: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

// Catches both WebGL-context-creation failures (unsupported browsers) and GLTF
// load/parse failures, rendering a friendly message instead of crashing the route.
class ModelErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[car-explorer] failed to render 3D scene:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function LoadFailure() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">
        Couldn&apos;t load the 3D car model.
      </p>
      <p>
        Your browser may not support WebGL, or the model file is missing. Try a
        different browser, or check back later.
      </p>
    </div>
  );
}

export default function CarScene() {
  const [activePartId, setActivePartId] = useState(CAR_PARTS[0].id);
  const [showcaseActive, setShowcaseActive] = useState(true);
  const modelStageRef = useRef<HTMLDivElement>(null);
  const activePart = CAR_PARTS.find((part) => part.id === activePartId)!;

  useEffect(() => {
    const stage = modelStageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowcaseActive(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-3">
        <ModelErrorBoundary
          fallback={
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-black/10 bg-white lg:aspect-auto lg:h-[500px]">
              <LoadFailure />
            </div>
          }
        >
          <div
            ref={modelStageRef}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm lg:aspect-auto lg:h-[500px]"
          >
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 z-10 h-1 w-1/3 bg-primary"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/3 top-0 z-10 h-1 w-20 bg-electric"
            />
            <Canvas
              aria-label="Interactive 3D model of a Formula 1 car"
              role="img"
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <CarSceneContent
                  activePartId={activePartId}
                  showcaseActive={showcaseActive}
                  onSelect={setActivePartId}
                />
              </Suspense>
            </Canvas>
          </div>
        </ModelErrorBoundary>

        <div
          role="group"
          aria-label="Select a car part"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"
        >
          {CAR_PARTS.map((part) => {
            const selected = part.id === activePartId;
            return (
              <button
                key={part.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActivePartId(part.id)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  selected
                    ? "border-primary/40 bg-[#fff1f4] text-primary shadow-sm"
                    : "border-black/10 bg-white text-black/60 hover:-translate-y-0.5 hover:border-black/20 hover:text-black/80",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: part.accent }}
                />
                <span className="line-clamp-2">{part.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Card
        key={activePart.id}
        className="animate-in fade-in slide-in-from-bottom-2 border-t-4 duration-300 motion-reduce:animate-none lg:h-full lg:min-h-[500px]"
        style={{ borderTopColor: activePart.accent }}
      >
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: activePart.accent }}
            />
            Selected component
          </div>
          <CardTitle>{activePart.label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <CardDescription className="text-sm leading-relaxed">
            {activePart.description}
          </CardDescription>
          <div className="mt-8 border-t border-black/10 pt-5 lg:mt-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/35">
              Explore 7 systems
            </p>
            <div className="mt-3 flex items-center gap-2" aria-hidden="true">
              {CAR_PARTS.map((part) => (
                <span
                  key={part.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-opacity",
                    part.id === activePartId ? "opacity-100" : "opacity-25",
                  )}
                  style={{ backgroundColor: part.accent }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-black/45">
              Select a hotspot on the car or use the component controls below
              the studio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
