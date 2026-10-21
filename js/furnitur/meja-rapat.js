import * as THREE from "three";
import { ROOM_W, ROOM_L } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { woodDarkMat, glassDarkMat, whiteMat, metalBlackMat } from "../inti/material.js";

/* ---------------------------------------------------------------------
   MEJA RAPAT UTAMA
   TABLE_CENTER, TABLE_LEN, dan TABLE_W diekspor karena dipakai juga
   oleh furnitur/kursi.js untuk menata posisi kursi di sekeliling meja.
--------------------------------------------------------------------- */
const TABLE_CENTER = new THREE.Vector3(ROOM_W/2 - 1.65, 0, ROOM_L*0.5);
const TABLE_LEN = 4.8, TABLE_W = 1.6, TABLE_H = 0.75;

function buildTable() {
  const grp = new THREE.Group();
  // kaki/base kayu bawah meja
  const base = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W-0.15, TABLE_H-0.06, TABLE_LEN-0.2), woodDarkMat);
  base.position.y = (TABLE_H-0.06)/2;
  base.castShadow = true; base.receiveShadow = true;
  grp.add(base);

  // top kaca gelap glossy
  const top = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W, 0.045, TABLE_LEN), glassDarkMat);
  top.position.y = TABLE_H;
  top.castShadow = true; top.receiveShadow = true;
  grp.add(top);

  // panel putih memanjang di tengah
  const centerPanel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, TABLE_LEN-0.3), whiteMat);
  centerPanel.position.y = TABLE_H + 0.03;
  grp.add(centerPanel);

  // modul power/data outlet hitam
  const nModules = 5;
  for (let i=0;i<nModules;i++){
    const mz = -((TABLE_LEN-0.3)/2) + ((TABLE_LEN-0.3)/(nModules-1))*i;
    const mod = new THREE.Mesh(new THREE.BoxGeometry(0.16,0.02,0.12), metalBlackMat);
    mod.position.set(0, TABLE_H+0.037, mz);
    grp.add(mod);
  }

  grp.position.copy(TABLE_CENTER);
  root.add(grp);
}
buildTable();

export { TABLE_CENTER, TABLE_LEN, TABLE_W, TABLE_H };
