import * as THREE from "three";
import { ROOM_W, ROOM_L, ROOM_H } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { orangeFrameMat, windowGlassMat, curtainMat } from "../inti/material.js";
import { skylineTexture } from "../inti/tekstur.js";

/* ---------------------------------------------------------------------
   DINDING KANAN (X=ROOM_W): buildWindow() tersedia tapi baris jendela
   besarnya sengaja dinonaktifkan (lihat komentar di bawah) — yang
   dipertahankan hanya jendela clerestory kecil di sisi meja bos.
--------------------------------------------------------------------- */
function buildWindow(z, width=1.7, sillY=1.05, height=1.75) {
  const grp = new THREE.Group();
  const frameThick = 0.08;

  // frame luar
  const frameMat = orangeFrameMat;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, frameThick, width+frameThick), frameMat);
  top.position.set(0, sillY+height, 0);
  const bottom = top.clone(); bottom.position.y = sillY;
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, height+frameThick, frameThick), frameMat);
  left.position.set(0, sillY+height/2, -width/2);
  const right = left.clone(); right.position.z = width/2;
  const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, 0.05), frameMat);
  mullion.position.set(0, sillY+height/2, 0);
  grp.add(top,bottom,left,right,mullion);

  // border gelap di sekitar kaca agar tampak seperti frame yang menonjol
  const darkBorder = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, height + 0.12, width + 0.12),
    new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.82, metalness: 0.15 })
  );
  darkBorder.position.set(-0.04, sillY + height / 2, 0);
  grp.add(darkBorder);

  // kaca
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(width-0.1, height-0.1), windowGlassMat);
  glass.rotation.y = Math.PI/2;
  glass.position.set(-0.02, sillY+height/2, 0);
  grp.add(glass);

  // transom kecil di atas
  const transomH = 0.5;
  const tTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, width+frameThick), frameMat);
  tTop.position.set(0, sillY+height+transomH, 0);
  const tLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, transomH, 0.05), frameMat);
  tLeft.position.set(0, sillY+height+transomH/2, -width/2);
  const tRight = tLeft.clone(); tRight.position.z = width/2;
  const tGlass = new THREE.Mesh(new THREE.PlaneGeometry(width-0.08, transomH-0.06), windowGlassMat);
  tGlass.rotation.y = Math.PI/2;
  tGlass.position.set(-0.02, sillY+height+transomH/2, 0);
  grp.add(tTop,tLeft,tRight,tGlass);

  grp.position.set(ROOM_W - 0.03, 0, z);
  grp.rotation.y = Math.PI/2;
  root.add(grp);

  // skyline di luar
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(width*1.3, height*1.6), new THREE.MeshBasicMaterial({ map: skylineTexture() }));
  sky.rotation.y = Math.PI/2;
  sky.position.set(ROOM_W + 1.4, sillY + height*0.55, z);
  root.add(sky);

  // tirai
  const curtainGeo = new THREE.PlaneGeometry(width*0.62, ROOM_H - 0.25, 12, 1);
  const posAttr = curtainGeo.attributes.position;
  for (let i=0;i<posAttr.count;i++){
    const x = posAttr.getX(i);
    posAttr.setZ(i, Math.sin(x*14)*0.035);
  }
  curtainGeo.computeVertexNormals();
  const curtain = new THREE.Mesh(curtainGeo, curtainMat);
  curtain.rotation.y = Math.PI/2;
  curtain.position.set(-0.15, (ROOM_H-0.25)/2 + 0.1, z - width*0.56);
  curtain.castShadow = true;
  grp.add(curtain);

  return grp;
}
// Jendela besar di dinding kanan yang muncul tiba-tiba dinonaktifkan.
// Yang ingin dipertahankan adalah jendela kecil di sisi meja bos.
// const windowZs = [1.7, 3.9, 6.1, 8.3];
// windowZs.forEach(z => buildWindow(z));

/* ---------------------------------------------------------------------
   Jendela kecil memanjang (clerestory) di dinding kanan, di sebelah
   kanan meja bos.
--------------------------------------------------------------------- */
// jendela kecil memanjang di dinding kanan, di sebelah kanan meja bos
function buildBossSideClerestoryWindow() {
  const grp = new THREE.Group();
  const windowZ = ROOM_L * 0.58;
  const windowY = 2.74;
  const windowW = ROOM_L - 0.6;
  const windowH = 0.56;
  const frameDepth = 0.12;
  const frameWidth = 0.07;
  const frameMat = orangeFrameMat;
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x172027,
    roughness: 0.12,
    metalness: 0.25,
    transmission: 0.3,
    thickness: 0.025,
    side: THREE.DoubleSide
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, frameWidth, windowW + frameWidth), frameMat);
  top.position.set(0, windowY + windowH / 2, 0);
  const bottom = top.clone();
  bottom.position.y = windowY - windowH / 2;
  const left = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, windowH, frameWidth), frameMat);
  left.position.set(0, windowY, -windowW / 2);
  const right = left.clone();
  right.position.z = windowW / 2;
  grp.add(top, bottom, left, right);

  // panel-panel kaca kecil memanjang dengan tiang pembagi dan frame bagian dalam
  const panelCount = 11;
  const panelW = windowW / panelCount;
  for (let i = 0; i < panelCount; i++) {
    const panelZ = -windowW / 2 + panelW / 2 + i * panelW;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.018, windowH - 0.12, panelW - 0.02), glassMat);
    glass.position.set(-0.068, windowY, panelZ);
    grp.add(glass);
  }
  for (let i = 1; i < panelCount; i++) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, windowH, frameWidth), frameMat);
    mullion.position.set(0, windowY, -windowW / 2 + i * panelW);
    grp.add(mullion);
  }

  // ambang dan reveal memberi kedalaman pada lubang jendela
  const sill = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, windowW + 0.14), frameMat);
  sill.position.set(-0.035, windowY - windowH / 2 - 0.035, 0);
  const revealTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, windowW), frameMat);
  revealTop.position.set(-0.035, windowY + windowH / 2 + 0.02, 0);
  grp.add(sill, revealTop);

  grp.position.set(ROOM_W - 0.08, 0, windowZ);
  root.add(grp);

  const outside = new THREE.Mesh(
    new THREE.PlaneGeometry(windowW * 1.12, windowH * 1.3),
    new THREE.MeshBasicMaterial({ map: skylineTexture(), color: 0xf1f0ea, side: THREE.DoubleSide })
  );
  outside.rotation.y = Math.PI / 2;
  outside.position.set(ROOM_W + 0.08, windowY, windowZ);
  root.add(outside);

}
buildBossSideClerestoryWindow();
