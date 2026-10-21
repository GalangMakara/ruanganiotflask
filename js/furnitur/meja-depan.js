import * as THREE from "three";
import { ROOM_W, BOSS_DESK_Z } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { metalBlackMat, woodDarkMat } from "../inti/material.js";
import { graniteTexture } from "../inti/tekstur.js";

/* ---------------------------------------------------------------------
   MEJA BOS (dinding belakang, di depan lemari arsip): meja granit
   lengkap dengan monitor, keyboard, mouse, laptop, telepon, dan
   tempat alat tulis di atasnya.
--------------------------------------------------------------------- */
function buildFrontDesk() {
  const grp = new THREE.Group();
  const w = 3.8, depth = 1.0, h = 0.78;

  const woodLightMat = new THREE.MeshStandardMaterial({
    color: 0xbe8d5d,
    roughness: 0.5,
    metalness: 0.04,
  });

  // meja utama dibuat benar-benar berbedah: panjang, merah-kayu muda, ujung melengkung besar
  const topShape = new THREE.Shape();
  topShape.moveTo(-w / 2, -depth / 2);
  topShape.lineTo(w / 2 - 0.55, -depth / 2);
  topShape.quadraticCurveTo(w / 2 + 0.55, -depth / 2 + 0.14, w / 2 + 0.38, 0);
  topShape.quadraticCurveTo(w / 2 + 0.55, depth / 2 - 0.14, w / 2 - 0.55, depth / 2);
  topShape.lineTo(-w / 2, depth / 2);
  topShape.quadraticCurveTo(-w / 2 - 0.55, 0, -w / 2, -depth / 2);

  const topGeo = new THREE.ExtrudeGeometry(topShape, { depth: 0.1, bevelEnabled: false });
  topGeo.center();
  const top = new THREE.Mesh(topGeo, woodLightMat);
  top.position.y = h + 0.04;
  top.rotation.x = -Math.PI / 2;
  top.castShadow = true;
  top.receiveShadow = true;

  const base = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, 0.16, depth - 0.12), woodLightMat);
  base.position.set(0, h - 0.06, 0);

  const drawerL = new THREE.Mesh(new THREE.BoxGeometry(0.62, h - 0.07, depth - 0.05), woodLightMat);
  drawerL.position.set(-w / 2 + 0.28, (h - 0.05) / 2, 0);
  const drawerR = drawerL.clone(); drawerR.position.x = w / 2 - 0.28;
  grp.add(top, base, drawerL, drawerR);

  // laci detail garis
  for (const dx of [-w / 2 + 0.28, w / 2 - 0.28]) {
    for (let i = 1; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.01, 0.02), metalBlackMat);
      line.position.set(dx, (h - 0.05) / 3 * i, depth / 2 - 0.03);
      grp.add(line);
    }
  }

  const keyMat = new THREE.MeshStandardMaterial({color:0x3a3b3d, roughness:0.55});

  // area kerja dibuat lebih jelas dan lebih dekat ke tepi meja agar terlihat dari sudut kamera
  const itemTray = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.02, 0.46),
    new THREE.MeshStandardMaterial({ color: 0x1d1b19, roughness: 0.68, metalness: 0.12 })
  );
  itemTray.position.set(0.1, h + 0.02, 0.26);
  grp.add(itemTray);

  // monitor lebih realistis: kaki bundar + leher + bezel tipis + layar menyala
  const monX = -0.72;
  const monBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,0.018,32), metalBlackMat);
  monBase.position.set(monX, h+0.06, 0.12);
  const monNeck = new THREE.Mesh(new THREE.BoxGeometry(0.045,0.22,0.065), metalBlackMat);
  monNeck.position.set(monX, h+0.18, 0.12);
  const monArm = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.08), metalBlackMat);
  monArm.position.set(monX, h+0.29, 0.08);
  const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.17,0.022,0.2), metalBlackMat);
  monStand.position.set(monX, h+0.07, 0.12);
  const monBezelMat = new THREE.MeshStandardMaterial({color:0x121316, roughness:0.4, metalness:0.35});
  const monBezel = new THREE.Mesh(new THREE.BoxGeometry(0.72,0.46,0.028), monBezelMat);
  monBezel.position.set(monX, h+0.52, 0.08);
  monBezel.rotation.x = -0.05;
  const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.64,0.37), new THREE.MeshStandardMaterial({color:0x0a1420, emissive:0x3b7dea, emissiveIntensity:1.2, roughness:0.25}));
  monScreen.position.set(monX, h+0.52, 0.095);
  monScreen.rotation.x = -0.05;
  const monStatus = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.012,0.03), new THREE.MeshStandardMaterial({color:0x9ce7ff, emissive:0x6fc7ff, emissiveIntensity:0.9}));
  monStatus.position.set(monX+0.28, h+0.22, 0.065);
  const webcam = new THREE.Mesh(new THREE.SphereGeometry(0.018,12,8), metalBlackMat);
  webcam.position.set(monX, h+0.66, 0.06);
  grp.add(monBase, monNeck, monArm, monStand, monBezel, monScreen, monStatus, webcam);

  // keyboard eksternal dengan keycap terpisah agar bentuk tombol terbaca jelas
  const kbExtMat = new THREE.MeshStandardMaterial({color:0x202225, roughness:0.48, metalness:0.18});
  const keycapMat = new THREE.MeshStandardMaterial({color:0x55585d, roughness:0.5, metalness:0.08});
  const kbExtW = 0.62, kbExtD = 0.23;
  const kbExtBase = new THREE.Mesh(new THREE.BoxGeometry(kbExtW,0.024,kbExtD), kbExtMat);
  kbExtBase.position.set(monX, h+0.09, 0.28);
  const kbFrontEdge = new THREE.Mesh(new THREE.BoxGeometry(kbExtW-0.02,0.018,0.025), kbExtMat);
  kbFrontEdge.position.set(monX, h+0.108, 0.395);
  grp.add(kbExtBase, kbFrontEdge);
  const keyRows=6, keyCols=13;
  const keyW=(kbExtW-0.04)/keyCols, keyD=(kbExtD-0.04)/keyRows;
  for (let r=0;r<keyRows;r++){
    for (let c=0;c<keyCols;c++){
      if (r === 4 && c >= 4 && c <= 7) continue;
      const key = new THREE.Mesh(new THREE.BoxGeometry(keyW*0.82,0.012,keyD*0.78), r === 0 ? keyMat : keycapMat);
      key.position.set(monX - kbExtW/2 + keyW/2 + 0.02 + c*keyW, h+0.115, 0.28 - kbExtD/2 + keyD/2 + 0.02 + r*keyD);
      grp.add(key);
    }
  }
  const spacebar = new THREE.Mesh(new THREE.BoxGeometry(keyW*3.55,0.012,keyD*0.78), keycapMat);
  spacebar.position.set(monX, h+0.115, 0.28 - kbExtD/2 + keyD/2 + 0.02 + 4*keyD);
  const enterKey = new THREE.Mesh(new THREE.BoxGeometry(keyW*1.7,0.012,keyD*1.75), keycapMat);
  enterKey.position.set(monX + keyW*5.7, h+0.115, 0.28 - kbExtD/2 + keyD/2 + 0.02 + 2*keyD);
  const kbLedMat = new THREE.MeshStandardMaterial({color:0x62b8d9, emissive:0x368caf, emissiveIntensity:0.8});
  const kbLed = new THREE.Mesh(new THREE.BoxGeometry(0.012,0.006,0.012), kbLedMat);
  kbLed.position.set(monX + kbExtW/2 - 0.045, h+0.116, 0.28 - kbExtD/2 + 0.02);
  grp.add(spacebar, enterKey, kbLed);
  // mouse
  const mouseMat = new THREE.MeshStandardMaterial({color:0x1d1e20, roughness:0.32, metalness:0.12});
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.058,20,14), mouseMat);
  mouse.scale.set(0.8,0.5,1.45);
  mouse.position.set(monX+0.38, h+0.11, 0.42);
  const mouseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.028,10), new THREE.MeshStandardMaterial({color:0x777b80, roughness:0.35}));
  mouseWheel.rotation.z = Math.PI / 2;
  mouseWheel.position.set(monX+0.38, h+0.135, 0.42);
  grp.add(mouse, mouseWheel);

  // laptop terbuka dengan alas, engsel, layar, dan detail input yang terpisah
  const lapX = 0.82;
  const laptopBodyMat = new THREE.MeshStandardMaterial({color:0xc7c9cc, roughness:0.35, metalness:0.5});
  const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.52,0.028,0.34), laptopBodyMat);
  lapBase.position.set(lapX, h+0.10, 0.12);
  const lapFrontLip = new THREE.Mesh(new THREE.BoxGeometry(0.49,0.018,0.026), laptopBodyMat);
  lapFrontLip.position.set(lapX, h+0.114, 0.28);
  const lapDeck = new THREE.Mesh(new THREE.BoxGeometry(0.46,0.004,0.24), new THREE.MeshStandardMaterial({color:0x9a9c9f, roughness:0.5}));
  lapDeck.position.set(lapX, h+0.116, 0.1);
  grp.add(lapBase, lapFrontLip, lapDeck);

  // tombol-tombol keyboard laptop dengan area navigasi yang lebih jelas
  const lapKeyRows=5, lapKeyCols=12, lapKbW=0.34, lapKbD=0.13;
  const lapKeyW=lapKbW/lapKeyCols, lapKeyD=lapKbD/lapKeyRows;
  for (let r=0;r<lapKeyRows;r++){
    for (let c=0;c<lapKeyCols;c++){
      const key = new THREE.Mesh(new THREE.BoxGeometry(lapKeyW*0.75,0.005,lapKeyD*0.75), keyMat);
      key.position.set(lapX - lapKbW/2 + lapKeyW/2 + c*lapKeyW, h+0.122, 0.11 - lapKbD/2 + lapKeyD/2 - 0.01 + r*lapKeyD);
      grp.add(key);
    }
  }
  const trackpadFrame = new THREE.Mesh(new THREE.BoxGeometry(0.17,0.004,0.09), new THREE.MeshStandardMaterial({color:0x7f8388, roughness:0.42, metalness:0.25}));
  trackpadFrame.position.set(lapX, h+0.12, 0.22);
  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.002,0.07), new THREE.MeshStandardMaterial({color:0xb5b7ba, roughness:0.3, metalness:0.2}));
  trackpad.position.set(lapX, h+0.123, 0.22);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.34,16), metalBlackMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(lapX, h+0.132, -0.07);
  const hingeCapL = new THREE.Mesh(new THREE.CylinderGeometry(0.026,0.026,0.012,16), laptopBodyMat);
  hingeCapL.rotation.z = Math.PI / 2;
  hingeCapL.position.set(lapX-0.17, h+0.132, -0.07);
  const hingeCapR = hingeCapL.clone(); hingeCapR.position.x = lapX + 0.17;
  grp.add(trackpadFrame, trackpad, hinge, hingeCapL, hingeCapR);
  const lapScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52,0.35,0.024), new THREE.MeshStandardMaterial({color:0x1e2023, roughness:0.35, metalness:0.6}));
  lapScreenFrame.position.set(lapX, h+0.25, -0.05);
  lapScreenFrame.rotation.x = -0.35;
  const lapScreenBack = new THREE.Mesh(new THREE.BoxGeometry(0.49,0.31,0.015), laptopBodyMat);
  lapScreenBack.position.set(lapX, h+0.25, -0.05);
  lapScreenBack.rotation.x = -0.35;
  const lapScreenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.44,0.26), new THREE.MeshStandardMaterial({color:0x0a1420, emissive:0x3a7fe0, emissiveIntensity:1.25, roughness:0.25}));
  lapScreenGlow.position.set(lapX, h+0.258, -0.036);
  lapScreenGlow.rotation.x = -0.35;
  const lapWebcam = new THREE.Mesh(new THREE.SphereGeometry(0.012,10,8), metalBlackMat);
  lapWebcam.position.set(lapX, h+0.41, -0.06);
  grp.add(lapScreenFrame, lapScreenBack, lapScreenGlow, lapWebcam);

  // port tipis di sisi kanan alas
  for (let i = 0; i < 3; i++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.012,0.006,0.035), metalBlackMat);
    port.position.set(lapX+0.245, h+0.017, -0.015 + i*0.055);
    grp.add(port);
  }

  // telepon
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.16,0.05,0.16), new THREE.MeshStandardMaterial({color:0x1c1c1c}));
  phone.position.set(-1.1, h+0.025, 0.15);
  grp.add(phone);

  // tempat alat tulis
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.03,0.1,10), metalBlackMat);
  cup.position.set(1.1, h+0.05, 0.18);
  grp.add(cup);

  grp.position.set(ROOM_W/2, 0, BOSS_DESK_Z);
  grp.castShadow = true;
  root.add(grp);
  return grp;
}
buildFrontDesk();
