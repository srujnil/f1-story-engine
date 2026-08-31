"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import type { Group } from "three";

const MODEL_PATH = "/models/f1-car.glb";
// Same measured bounding box as app/car-explorer/car-scene.tsx — reusing the
// known-good framing rather than an auto-fit helper.
const MODEL_CENTER: [number, number, number] = [0, 0.13, -2.84];
const CAMERA_POSITION: [number, number, number] = [6.5, 2.1, -2.84];

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
    group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group} position={MODEL_CENTER}>
      <primitive object={scene} position={[0, 0, 0]} />
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
