import * as THREE from "three";
import { COLORS } from "./konfigurasi.js";
import {
  floorTexture,
  wallTexture,
  woodTexture,
} from "./tekstur.js";

/* ---------------------------------------------------------------------
   MATERIAL BERSAMA
   Material yang dipakai berulang kali oleh dinding, jendela, pintu, dan
   furnitur. Disatukan di sini supaya warna/tekstur mudah diubah sekali
   saja dan tetap konsisten di seluruh ruangan.
--------------------------------------------------------------------- */
const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.22, metalness: 0.08, envMapIntensity: 1.0 });
const wallUpperMat = new THREE.MeshStandardMaterial({ map: wallTexture(COLORS.creamWall), roughness: 0.85 });
const wallLowerMat = new THREE.MeshStandardMaterial({ map: wallTexture(COLORS.darkWallBase, true), roughness: 0.8 });
wallLowerMat.map.repeat.set(6, 1.2);
const ceilingMat = new THREE.MeshStandardMaterial({ color: COLORS.ceiling, roughness: 0.9 });
const woodDarkMat = new THREE.MeshStandardMaterial({ map: woodTexture(COLORS.woodDark), roughness: 0.45, metalness: 0.08 });
const woodMidMat = new THREE.MeshStandardMaterial({ map: woodTexture(COLORS.woodMid), roughness: 0.5 });
const woodPanelMat = new THREE.MeshStandardMaterial({ map: woodTexture(COLORS.woodMid, 64, 512), roughness: 0.55 });
const orangeFrameMat = new THREE.MeshStandardMaterial({ color: COLORS.orange, roughness: 0.35, metalness: 0.15 });
const glassDarkMat = new THREE.MeshPhysicalMaterial({ color: COLORS.glassDark, roughness: 0.08, metalness: 0.1, transmission: 0.55, thickness: 0.05, clearcoat: 1 });
const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0xf1eee5, roughness: 0.2, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
const curtainMat = new THREE.MeshStandardMaterial({ color: COLORS.curtain, roughness: 0.9, side: THREE.DoubleSide });
const chairMat = new THREE.MeshStandardMaterial({ color: COLORS.chairBlack, roughness: 0.55, metalness: 0.2 });
const chairMetalMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.35, metalness: 0.7 });
const metalBlackMat = new THREE.MeshStandardMaterial({ color: COLORS.metalBlack, roughness: 0.4, metalness: 0.75 });
const whiteMat = new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.6 });
const glassCabinetMat = new THREE.MeshPhysicalMaterial({ color: 0xdfeaf0, roughness: 0.05, transmission: 0.75, thickness: 0.02 });

export {
  floorMat,
  wallUpperMat,
  wallLowerMat,
  ceilingMat,
  woodDarkMat,
  woodMidMat,
  woodPanelMat,
  orangeFrameMat,
  glassDarkMat,
  windowGlassMat,
  curtainMat,
  chairMat,
  chairMetalMat,
  metalBlackMat,
  whiteMat,
  glassCabinetMat,
};
