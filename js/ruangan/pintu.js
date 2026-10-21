import * as THREE from "three";
import { ROOM_W, ROOM_L } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { windowGlassMat } from "../inti/material.js";
import { woodTexture } from "../inti/tekstur.js";

/* ---------------------------------------------------------------------
   PINTU
   Dua pintu: pintu ganda oranye (dinding kanan, dekat layar) dan pintu
   kaca putih (dinding belakang, di sisi meja bos).
--------------------------------------------------------------------- */

// pintu ganda oranye, dinding kanan dekat screen
function buildDoor(x, z, rotY) {
  const grp = new THREE.Group();
  const doorW = 1.5, doorH = 2.15, leafW = doorW/2;
  const orangeDoorMat = new THREE.MeshStandardMaterial({ map: woodTexture(0xd8894f), color: 0xd8894f, roughness: 0.42, metalness: 0.08 });
  const doorInsetMat = new THREE.MeshStandardMaterial({ map: woodTexture(0xb96735), color: 0xb96735, roughness: 0.48, metalness: 0.06 });
  const whiteHandleMat = new THREE.MeshStandardMaterial({ color: 0xf1f1ed, roughness: 0.25, metalness: 0.65 });
  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorH, 0.1), orangeDoorMat);
  frameLeft.position.set(0, doorH/2, -doorW/2 - 0.03);
  const frameRight = frameLeft.clone();
  frameRight.position.z = doorW/2 + 0.03;
  const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, doorW + 0.16), orangeDoorMat);
  frameBottom.position.y = 0.05;
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, doorW + 0.16), orangeDoorMat);
  frameTop.position.set(0, doorH + 0.05, 0);
  grp.add(frameLeft, frameRight, frameBottom, frameTop);

  for (const side of [-1, 1]) {
    const leafZ = side * (leafW/2 - 0.015);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.05, doorH - 0.12, leafW - 0.045), orangeDoorMat);
    leaf.position.set(0.035, (doorH - 0.12)/2, leafZ);
    const inset = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.25, leafW - 0.18), doorInsetMat);
    inset.position.set(0.065, 1.3, leafZ);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.0, leafW - 0.2), windowGlassMat);
    glass.rotation.y = Math.PI/2;
    glass.position.set(0.071, 1.55, leafZ);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 16), whiteHandleMat);
    handle.position.set(0.095, 1.05, side * (0.17));
    const handleMountTop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.035, 12), whiteHandleMat);
    handleMountTop.rotation.z = Math.PI/2;
    handleMountTop.position.set(0.095, 1.26, side * 0.17);
    const handleMountBottom = handleMountTop.clone();
    handleMountBottom.position.y = 0.84;
    grp.add(leaf, inset, glass, handle, handleMountTop, handleMountBottom);

    for (const hingeY of [0.42, 1.1, 1.78]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), whiteHandleMat);
      hinge.rotation.z = Math.PI/2;
      hinge.position.set(0.08, hingeY, side * (leafW - 0.04));
      grp.add(hinge);
    }
  }
  grp.position.set(x,0,z);
  grp.rotation.y = rotY;
  root.add(grp);
}
buildDoor(ROOM_W - 0.12, 2.18, Math.PI);

function buildOrangeDoor(x,z,rotY){
  const grp = new THREE.Group();
  const doorW = 1.0, doorH = 2.2, depth = 0.1;
  const whiteDoorMat = new THREE.MeshStandardMaterial({ color: 0xf3f3ee, roughness: 0.3, metalness: 0.18 });
  const gasketMat = new THREE.MeshStandardMaterial({ color: 0x34383b, roughness: 0.5, metalness: 0.25 });
  const doorGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xb8d9e6, roughness: 0.08, metalness: 0.08, transmission: 0.72, thickness: 0.025, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
  const postL = new THREE.Mesh(new THREE.BoxGeometry(depth, doorH, 0.09), whiteDoorMat);
  postL.position.set(0, doorH/2, -doorW/2 - 0.045);
  const postR = postL.clone();
  postR.position.z = doorW/2 + 0.045;
  const head = new THREE.Mesh(new THREE.BoxGeometry(depth, 0.1, doorW + 0.18), whiteDoorMat);
  head.position.set(0, doorH + 0.05, 0);
  const threshold = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, doorW + 0.18), whiteDoorMat);
  threshold.position.set(0, 0.04, 0);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.55, doorW - 0.15), doorGlassMat);
  glass.position.set(0.035, 1.42, 0);
  const lowerPanel = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.38, doorW - 0.15), whiteDoorMat);
  lowerPanel.position.set(0.04, 0.39, 0);
  const divider = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.055, doorW - 0.12), whiteDoorMat);
  divider.position.set(0.045, 0.65, 0);
  const seal = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.55, 0.025), gasketMat);
  seal.position.set(0.058, 1.42, 0);
  grp.add(postL, postR, head, threshold, glass, lowerPanel, divider, seal);

  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.7 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 16), handleMat);
  handle.position.set(0.09, 1.12, 0.3);
  const handleMountTop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), handleMat);
  handleMountTop.rotation.z = Math.PI/2;
  handleMountTop.position.set(0.09, 1.34, 0.3);
  const handleMountBottom = handleMountTop.clone();
  handleMountBottom.position.y = 0.9;
  grp.add(handle, handleMountTop, handleMountBottom);
  for (const hingeY of [0.42, 1.1, 1.78]) {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), gasketMat);
    hinge.rotation.z = Math.PI/2;
    hinge.position.set(0.075, hingeY, -doorW/2 + 0.03);
    grp.add(hinge);
  }
  grp.position.set(x,0,z);
  grp.rotation.y = rotY;
  root.add(grp);
}
// pintu oranye: dinding belakang, di sisi kanan meja bos
buildOrangeDoor(7.0, ROOM_L - 0.02, Math.PI/2);
