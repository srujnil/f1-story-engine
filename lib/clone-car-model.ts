import type { Object3D } from "three";

// useGLTF caches one scene object per file and hands the *same* instance to
// every component that asks for it. <primitive object={scene} position=... />
// then writes that position onto the shared object — so the Welcome hero
// (which offsets the car to spin it around its centre) silently moved the car
// for the Car Explorer, which reuses the same cached object, while the
// Explorer's hotspot dots stayed at the original coordinates. Every canvas
// must render its own clone, with the root transform reset so it never
// inherits whatever another canvas did to the shared original.
export function cloneCarModel(scene: Object3D): Object3D {
  const clone = scene.clone(true);
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(1, 1, 1);
  return clone;
}
