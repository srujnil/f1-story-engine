"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import type { Group } from "three";

const MODEL_PATH = "/models/f1-car.glb";
// Same measured bounding box as app/car-explorer/car-scene.tsx — reusing the
// known-good numbers rather than an auto-fit helper. Importantly, this is the
// midpoint of the model's *local* bounding box (z spans roughly -5.24 to
// -0.45 — nowhere near the model's own origin at 0), not a position to move
// the model to.
const MODEL_CENTER: [number, number, number] = [0, 0.13, -2.84];
// Centered under the headline now (was offset hard left for a side-by-side
// text layout) — smaller X offset keeps a flattering three-quarter angle
// without pushing the car to one side of its now-bounded, narrower box.
//
// These numbers are sized against the model's WORST-CASE footprint while
// rotating, not just its resting pose — the car sweeps a full 360°, and at
// some angles its length projects much wider across the frame than at
// others. Prior versions were tuned against a single snapshot and clipped
// at other angles. Local bbox half-extents: x:0.825, y:0.48, z:2.395 →
// horizontal sweep radius (rotation is Y-axis only, so XZ-plane matters)
// = sqrt(0.825² + 2.395²) ≈ 2.53. At CAR_SCALE below, scaled radius ≈ 4.05;
// this camera distance/fov combo keeps ~15-20% margin beyond that at every
// rotation angle, confirmed by sampling screenshots across a full sweep,
// not a single moment.
const CAMERA_POSITION: [number, number, number] = [8.1, 2.6, -2.84];
const CAR_SCALE = 1.6;

useGLTF.preload(MODEL_PATH);

function RotatingCar() {
  const group = useRef<Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const { scene } = useGLTF(MODEL_PATH);

  useFrame((_, delta) => {
    if (reducedMotion.current || !group.current) return;
    // Slow, full turntable sweep — was 0.15 (~40s/revolution), now ~100s.
    group.current.rotation.y += delta * 0.063;
  });

  return (
    // The outer group sits at MODEL_CENTER in world space (same spot the
    // camera below is framed around) and is what actually rotates — around
    // its own local origin. The inner primitive is shifted by -MODEL_CENTER
    // so the model's true geometric center lands exactly on that origin.
    // Without this offset, rotation.y spins the model around its own local
    // (0,0,0) instead — which sits well past one end of the car, not its
    // middle — producing a fishtail-around-the-nose motion instead of a
    // clean turntable spin. (This was the bug in the first version.)
    <group ref={group} position={MODEL_CENTER} scale={CAR_SCALE}>
      <primitive
        object={scene}
        position={[-MODEL_CENTER[0], -MODEL_CENTER[1], -MODEL_CENTER[2]]}
      />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 38, position: CAMERA_POSITION }}
      className="absolute inset-0"
    >
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 8, 22]} />
      <ambientLight intensity={0.35} />
      {/* Red rim light — echoes the site's primary accent on the car body. */}
      <directionalLight position={[-6, 3, -1]} intensity={2.2} color="#ff2f4f" />
      {/* Electric-blue fill from the opposite side for contrast. */}
      <directionalLight position={[4, 2, 3]} intensity={1.1} color="#3fa9ff" />
      <directionalLight position={[0, 5, -6]} intensity={0.6} color="#ffffff" />
      <Environment preset="night" />
      <Suspense fallback={null}>
        <RotatingCar />
      </Suspense>
    </Canvas>
  );
}
