import * as THREE from "three";
import { ROOM_W } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { buildIoTLabKit } from "./kit-iot.js";
import { graniteTexture } from "../inti/tekstur.js";

/* ---------------------------------------------------------------------
   KONSOL/RAK KAYU PANJANG — dinding kanan (sisi jendela), sekarang
   dibuat menyerupai meja granit hitam dengan 1 unit IoT di ujung.
--------------------------------------------------------------------- */
function buildWoodConsole(x, z0, z1) {
  const len = z1 - z0;
  const grp = new THREE.Group();

  const graniteMat = new THREE.MeshStandardMaterial({
    map: graniteTexture(),
    color: 0x1f2023,
    roughness: 0.22,
    metalness: 0.28,
    envMapIntensity: 1.15,
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, len), graniteMat);
  top.position.set(0, 0.78, len / 2);

  const baseBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.75, len), new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.55 }));
  baseBack.position.set(0, 0.375, len / 2);

  grp.add(top, baseBack);

  grp.position.set(x, 0, z0);
  grp.castShadow = true;
  grp.receiveShadow = true;
  root.add(grp);
}

buildWoodConsole(ROOM_W - 0.22, 3.0, 8.8);
buildIoTLabKit(ROOM_W - 0.28, 8.55, 0.78, 0.88);
