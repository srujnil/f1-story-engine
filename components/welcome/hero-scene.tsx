"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { cloneCarModel } from "@/lib/clone-car-model";
import {
  Group,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";

const MODEL_PATH = "/models/f1-car.glb";
// Same measured bounding box as app/car-explorer/car-scene.tsx. This is the
// midpoint of the model's *local* bounding box (z spans roughly -5.24 to
// -0.45 — nowhere near the model's own origin at 0), not a position to move
// the model to.
const MODEL_CENTER: [number, number, number] = [0, 0.13, -2.84];

// Only the *angle* to view the car from (a three-quarter view) — CameraRig
// below scales this direction to whatever distance actually keeps the car
// fully in frame for the current canvas size, so this never controls size.
const VIEW_DIRECTION = new Vector3(2.2, 0.7, 0).normalize();

// Local bbox half-extents (measured, see car-scene.tsx): x:0.825, y:0.48,
// z:2.395. Rotation is Y-axis only, so as the car spins it sweeps a full
// circle of this radius in the XZ-plane — that circle, not the resting
// pose, is what has to stay inside the frame at every angle. A prior
// version was hand-tuned against one screenshot and clipped at other
// rotation angles once live.
const HORIZONTAL_SWEEP_RADIUS = Math.sqrt(0.825 ** 2 + 2.395 ** 2);
const VERTICAL_HALF_EXTENT = 0.48;
const CAR_SCALE = 1.6;
const SAFETY_MARGIN = 1.18;

useGLTF.preload(MODEL_PATH);

/**
 * Computes camera distance from the model's actual worst-case footprint and
 * the canvas's *actual* current aspect ratio (not an assumed one), and
 * explicitly aims the camera at MODEL_CENTER. Previously the camera had no
 * explicit lookAt at all — relying on react-three-fiber's implicit default
 * aim, which isn't guaranteed to land exactly on an off-origin target. That
 * unverified assumption is the most likely reason for a *one-sided* crop
 * report rather than a random one. Recomputes on resize via the `size`
 * dependency, so it stays correct across breakpoints instead of needing a
 * separate hand-tuned number per box size.
 */
function CameraRig() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof ThreePerspectiveCamera)) return;

    const verticalFovRad = (camera.fov * Math.PI) / 180;
    const aspect = size.width / size.height;
    const visibleHalfHeightPerUnit = Math.tan(verticalFovRad / 2);
    const visibleHalfWidthPerUnit = visibleHalfHeightPerUnit * aspect;

    const distanceForWidth =
      (HORIZONTAL_SWEEP_RADIUS * CAR_SCALE) / visibleHalfWidthPerUnit;
    const distanceForHeight =
      (VERTICAL_HALF_EXTENT * CAR_SCALE) / visibleHalfHeightPerUnit;
    const distance =
      Math.max(distanceForWidth, distanceForHeight) * SAFETY_MARGIN;

    const target = new Vector3(...MODEL_CENTER);
    camera.position.copy(target).addScaledVector(VIEW_DIRECTION, distance);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function RotatingCar() {
  const group = useRef<Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const { scene } = useGLTF(MODEL_PATH);
  // Own clone: the offset below must not be written onto the shared cached
  // scene the Car Explorer also uses (see lib/clone-car-model.ts).
  const model = useMemo(() => cloneCarModel(scene), [scene]);

  useFrame((_, delta) => {
    if (reducedMotion.current || !group.current) return;
    // Full turntable sweep — ~83s per revolution (was ~100s; sped up 20%).
    group.current.rotation.y += delta * 0.0756;
  });

  return (
    // The outer group sits at MODEL_CENTER in world space and is what
    // actually rotates — around its own local origin. The inner primitive
    // is shifted by -MODEL_CENTER so the model's true geometric center
    // lands exactly on that origin. Without this offset, rotation.y spins
    // the model around its own local (0,0,0) instead — which sits well past
    // one end of the car, not its middle — producing a fishtail-around-the-
    // nose motion instead of a clean turntable spin.
    <group ref={group} position={MODEL_CENTER} scale={CAR_SCALE}>
      <primitive
        object={model}
        position={[-MODEL_CENTER[0], -MODEL_CENTER[1], -MODEL_CENTER[2]]}
      />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: 38 }} className="absolute inset-0">
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 8, 22]} />
      <ambientLight intensity={0.35} />
      {/* Red rim light — echoes the site's primary accent on the car body. */}
      <directionalLight position={[-6, 3, -1]} intensity={2.2} color="#ff2f4f" />
      {/* Electric-blue fill from the opposite side for contrast. */}
      <directionalLight position={[4, 2, 3]} intensity={1.1} color="#3fa9ff" />
      <directionalLight position={[0, 5, -6]} intensity={0.6} color="#ffffff" />
      <Environment preset="night" />
      <CameraRig />
      <Suspense fallback={null}>
        <RotatingCar />
      </Suspense>
    </Canvas>
  );
}
