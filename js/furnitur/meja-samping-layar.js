import * as THREE from "three";
import { root } from "../inti/scene-dasar.js";
import { whiteMat, metalBlackMat } from "../inti/material.js";

/* ---------------------------------------------------------------------
   MEJA INSTRUKTUR di depan layar (sisi kanan bila dilihat dari layar),
   lengkap dengan kursi kerja merahnya sendiri.
--------------------------------------------------------------------- */
function buildScreenSideDesk() {
  const desk = new THREE.Group();
  const deskW = 1.45, deskD = 0.62, deskH = 0.78;
  const woodEdge = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.45 });
  const woodTop = new THREE.MeshStandardMaterial({ color: 0x6b4024, roughness: 0.38 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.07, deskD), woodTop);
  top.position.y = deskH;
  const topEdge = new THREE.Mesh(new THREE.BoxGeometry(deskW + 0.03, 0.035, deskD + 0.03), woodEdge);
  topEdge.position.y = deskH - 0.035;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(deskW - 0.16, 0.48, 0.04), woodEdge);
  panel.position.set(0, 0.3, -deskD/2 + 0.04);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, deskH - 0.07, deskD), woodEdge);
  legL.position.set(-deskW/2 + 0.1, (deskH - 0.07)/2, 0);
  const legR = legL.clone();
  legR.position.x = deskW/2 - 0.1;
  desk.add(top, topEdge, panel, legL, legR);

  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.38), woodEdge);
  drawer.position.set(0.34, deskH - 0.08, 0.02);
  const drawerPull = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.018, 0.025), whiteMat);
  drawerPull.position.set(0.34, deskH - 0.08, 0.22);
  desk.add(drawer, drawerPull);

  // Semua alat di atas meja dihapus sesuai permintaan; meja menjadi kosong.
  // sisi kiri meja hampir menyentuh dinding kiri jika dilihat dari arah screen
  desk.position.set(0.8, 0, 1.35);
  desk.rotation.y = 0;
  root.add(desk);

  const redMat = new THREE.MeshStandardMaterial({ color: 0xa62929, roughness: 0.58, metalness: 0.05 });
  const redDark = new THREE.MeshStandardMaterial({ color: 0x551416, roughness: 0.5, metalness: 0.2 });
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.1, 24), redMat);
  seat.position.y = 0.5;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.66, 0.1), redMat);
  back.position.set(0, 0.92, 0.23);
  back.rotation.x = 0.08;
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.48, 0.018), redDark);
  backPanel.position.set(0, 0.92, 0.175);
  backPanel.rotation.x = 0.08;
  chair.add(seat, back, backPanel);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.3), redMat);
    arm.position.set(side * 0.26, 0.68, 0.03);
    chair.add(arm);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.43, 14), redDark);
  pole.position.y = 0.27;
  chair.add(pole);
  const base = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.05), redDark);
    leg.position.set(Math.cos(angle) * 0.16, 0.06, Math.sin(angle) * 0.16);
    leg.rotation.y = -angle;
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), metalBlackMat);
    wheel.position.set(Math.cos(angle) * 0.3, 0.035, Math.sin(angle) * 0.3);
    base.add(leg, wheel);
  }
  chair.add(base);
  // kursi berada di belakang meja, di sisi screen, menghadap ke meja bos
  chair.position.set(0.8, 0, 0.65);
  chair.rotation.y = Math.PI;
  root.add(chair);
}
buildScreenSideDesk();
