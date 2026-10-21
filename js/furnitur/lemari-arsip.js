import * as THREE from "three";
import { ROOM_L } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { whiteMat, metalBlackMat } from "../inti/material.js";

/* ---------------------------------------------------------------------
   LEMARI ARSIP BESI — barisan 5 unit di dinding belakang, di sepanjang
   dinding tanpa menutup pintu kaca putih.
--------------------------------------------------------------------- */
function buildFilingCabinetUnit(x, z, w, h, d) {
  const grp = new THREE.Group();
  const plinthH = 0.05;
  const topH = h * 0.62;
  const botH = h - topH - plinthH;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcdd0d3, roughness: 0.45, metalness: 0.2 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x55595d, roughness: 0.38, metalness: 0.55 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xbfc2c5, roughness: 0.4, metalness: 0.3 });
  const drawerMat = new THREE.MeshStandardMaterial({ color: 0xb4b7ba, roughness: 0.4, metalness: 0.3 });
  const handleMat = whiteMat;
  const cabinetGlassMat = new THREE.MeshStandardMaterial({ color: 0x5f8b99, roughness: 0.18, metalness: 0.08, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });

  // plinth/kaki dasar
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w-0.04, plinthH, d-0.04), trimMat);
  plinth.position.y = plinthH/2;
  grp.add(plinth);

  // badan bawah tertutup dan ruang atas terbuka di belakang pintu kaca
  const lowerCarcass = new THREE.Mesh(new THREE.BoxGeometry(w, botH, d), bodyMat);
  lowerCarcass.position.y = plinthH + botH/2;
  lowerCarcass.castShadow = true; lowerCarcass.receiveShadow = true;
  const upperBack = new THREE.Mesh(new THREE.BoxGeometry(w, topH, 0.04), bodyMat);
  upperBack.position.set(0, plinthH + botH + topH/2, -d/2 + 0.025);
  const upperSideL = new THREE.Mesh(new THREE.BoxGeometry(0.045, topH, d), bodyMat);
  upperSideL.position.set(-w/2 + 0.0225, plinthH + botH + topH/2, 0);
  const upperSideR = upperSideL.clone();
  upperSideR.position.x = w/2 - 0.0225;
  grp.add(lowerCarcass, upperBack, upperSideL, upperSideR);

  // tutup atas sedikit menonjol
  const topCap = new THREE.Mesh(new THREE.BoxGeometry(w+0.03, 0.025, d+0.03), trimMat);
  topCap.position.y = plinthH + h + 0.0125;
  grp.add(topCap);

  // --- bagian atas: 2 pintu kaca ---
  const topY = plinthH + botH + topH/2;
  const doorW = w/2 - 0.02;
  for (const side of [-1, 1]) {
    const dx = side * (doorW/2 + 0.01);
    const doorZ = d/2 + 0.012;
    const railH = 0.045;
    const railW = 0.04;
    const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(doorW-railW*2, topH-railH*2, 0.014), cabinetGlassMat);
    glassDoor.position.set(dx, topY, doorZ);
    const glassReflection = new THREE.Mesh(new THREE.BoxGeometry(0.018, topH*0.7, 0.006), new THREE.MeshBasicMaterial({ color: 0xd7f4ff, transparent: true, opacity: 0.18 }));
    glassReflection.position.set(dx - side*doorW*0.18, topY + 0.02, doorZ + 0.012);
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, railH, 0.035), trimMat);
    railTop.position.set(dx, topY + topH/2 - railH/2, doorZ);
    const railBottom = railTop.clone();
    railBottom.position.y = topY - topH/2 + railH/2;
    const railNear = new THREE.Mesh(new THREE.BoxGeometry(railW, topH, 0.035), trimMat);
    railNear.position.set(dx - side*(doorW/2 - railW/2), topY, doorZ);
    const railFar = railNear.clone();
    railFar.position.x = dx + side*(doorW/2 - railW/2);
    grp.add(glassDoor, glassReflection, railTop, railBottom, railNear, railFar);

    // dua engsel dan handle vertikal pada setiap daun pintu
    for (const hingeY of [topY - topH*0.32, topY + topH*0.32]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.055,12), handleMat);
      hinge.rotation.z = Math.PI/2;
      hinge.position.set(dx - side*(doorW/2 - 0.025), hingeY, doorZ + 0.035);
      grp.add(hinge);
    }
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.14,8), handleMat);
    handle.position.set(dx + side*(doorW/2 - 0.055), topY, doorZ + 0.035);
    grp.add(handle);
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.012,12), handleMat);
    lock.rotation.x = Math.PI/2;
    lock.position.set(dx + side*(doorW/2 - 0.055), topY - 0.1, doorZ + 0.04);
    grp.add(lock);
  }
  const topSeam = new THREE.Mesh(new THREE.BoxGeometry(0.008, topH, 0.02), trimMat);
  topSeam.position.set(0, topY, d/2 + 0.006);
  grp.add(topSeam);

  // rak dalam + binder warna-warni, samar terlihat di balik kaca
  for (let s=0; s<2; s++){
    const shelfY = plinthH + botH + 0.28 + s*0.38;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(w-0.08, 0.018, d-0.08), trimMat);
    shelf.position.set(0, shelfY, 0);
    const shelfLip = new THREE.Mesh(new THREE.BoxGeometry(w-0.1, 0.035, 0.025), trimMat);
    shelfLip.position.set(0, shelfY + 0.025, d/2 - 0.035);
    grp.add(shelf, shelfLip);
    const nBind = 6 + Math.floor(Math.random()*3);
    for (let b=0;b<nBind;b++){
      const bw = (w-0.16)/nBind;
      const bx = -w/2 + 0.08 + bw*b + bw/2;
      const bh = 0.22 + Math.random()*0.08;
      const hue = [0x8a2c2c,0x2c4a7a,0x2c6a3a,0x7a5a2c,0x555555][b%5];
      const bind = new THREE.Mesh(new THREE.BoxGeometry(bw*0.8, bh, d-0.18), new THREE.MeshStandardMaterial({color:hue, roughness:0.6}));
      bind.position.set(bx, shelfY+bh/2+0.01, -0.01);
      grp.add(bind);
    }
    if (s === 0) {
      const equipmentCase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.18), new THREE.MeshStandardMaterial({ color: 0x4d5355, roughness: 0.48, metalness: 0.35 }));
      equipmentCase.position.set(w * 0.23, shelfY + 0.08, 0.11);
      const caseHandle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.018), metalBlackMat);
      caseHandle.position.set(w * 0.23, shelfY + 0.155, 0.11);
      const cableCoil = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 8, 20), new THREE.MeshStandardMaterial({ color: 0x9a3e20, roughness: 0.55 }));
      cableCoil.rotation.x = Math.PI / 2;
      cableCoil.position.set(-w * 0.24, shelfY + 0.08, 0.12);
      grp.add(equipmentCase, caseHandle, cableCoil);
    }
  }

  // --- bagian bawah: kiri 3 laci, kanan 1 pintu berkunci ---
  const leftW = w * 0.56;
  const rightW = w - leftW - 0.02;
  const leftX = -w/2 + leftW/2 + 0.01;
  const rightX = w/2 - rightW/2 - 0.01;
  const botY0 = plinthH;

  for (let r=0; r<3; r++){
    const drH = botH/3 - 0.025;
    const dy = botY0 + (botH/3)*r + (botH/3)/2;
    const face = new THREE.Mesh(new THREE.BoxGeometry(leftW-0.04, drH, 0.02), drawerMat);
    face.position.set(leftX, dy, d/2 + 0.011);
    grp.add(face);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(leftW*0.45, 0.015, 0.02), handleMat);
    handle.position.set(leftX, dy, d/2 + 0.025);
    const label = new THREE.Mesh(new THREE.BoxGeometry(leftW*0.22, 0.035, 0.008), new THREE.MeshStandardMaterial({ color: 0xd8dbdd, roughness: 0.4, metalness: 0.25 }));
    label.position.set(leftX, dy + 0.055, d/2 + 0.027);
    grp.add(handle, label);
  }

  const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(rightW-0.04, botH-0.03, 0.02), doorMat);
  rightDoor.position.set(rightX, botY0 + botH/2, d/2 + 0.011);
  grp.add(rightDoor);
  const rightHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.1,8), handleMat);
  rightHandle.rotation.x = Math.PI/2;
  rightHandle.position.set(rightX - rightW/2 + 0.06, botY0 + botH/2, d/2 + 0.025);
  grp.add(rightHandle);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.01,12), handleMat);
  lock.rotation.x = Math.PI/2;
  lock.position.set(rightX + rightW/2 - 0.09, botY0 + botH/2, d/2 + 0.024);
  grp.add(lock);

  // kaki adjustable dan ventilasi bawah khas lemari besi kantor
  const footMat = new THREE.MeshStandardMaterial({ color: 0x55585c, roughness: 0.5, metalness: 0.65 });
  for (const fx of [-w/2 + 0.12, w/2 - 0.12]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.08, 12), footMat);
    foot.position.set(fx, -0.04, 0);
    grp.add(foot);
  }
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x707479, roughness: 0.6, metalness: 0.35 });
  for (let i = 0; i < 4; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 0.12), ventMat);
    vent.position.set(rightX - 0.04 + i * 0.045, botY0 + 0.13, d/2 + 0.026);
    grp.add(vent);
  }

  const botSeam = new THREE.Mesh(new THREE.BoxGeometry(0.01, botH, 0.02), trimMat);
  botSeam.position.set((leftX+leftW/2 + rightX-rightW/2)/2, botY0+botH/2, d/2+0.011);
  grp.add(botSeam);

  grp.position.set(x, 0, z);
  // sisi pintu menghadap ke dalam ruangan dan meja bos
  grp.rotation.y = Math.PI;
  root.add(grp);
  return grp;
}
// barisan lemari besi abu-abu di dinding belakang — disusun panjang tanpa menutup pintu oranye
const FILING_W = 0.95, FILING_D = 0.45, FILING_H = 1.9, FILING_GAP = 0.05, FILING_COUNT = 5;
const filingStartX = 0.7;
for (let i=0; i<FILING_COUNT; i++){
  const cx = filingStartX + FILING_W/2 + i*(FILING_W+FILING_GAP);
  buildFilingCabinetUnit(cx, ROOM_L - FILING_D/2 - 0.02, FILING_W, FILING_H, FILING_D);
}
