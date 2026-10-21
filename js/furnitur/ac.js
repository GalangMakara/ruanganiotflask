import * as THREE from "three";
import { ROOM_W, ROOM_L } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { whiteMat, metalBlackMat } from "../inti/material.js";

/* ---------------------------------------------------------------------
   AC SPLIT — dua unit di dinding, interaktif & bisa "dibongkar".
   Mesin dalamnya dibuat sebagai rakitan 3D nyata (bukan sekadar kotak
   polos) supaya pengguna bisa belajar bentuk & letak tiap komponen:

     - Filter udara (jaring plastik)
     - Evaporator: sirip aluminium + pipa tembaga berbentuk U
     - Nampan penampung air (drain pan)
     - Blower / kipas sentrifugal bersudu banyak + poros
     - Motor kipas
     - Papan PCB kontrol + kapasitor + terminal sambungan kabel
     - Kabel-kabel kelistrikan (melengkung, warna berbeda)
     - Motor penggerak kisi-kisi (swing motor)
     - Pipa kapiler melingkar + pipa refrigerant ke unit outdoor
     - Pipa pembuangan air (drain)

   Setiap unit didaftarkan ke `acUnits` supaya modul interaksi
   (js/interaksi/interaksi-ac.js) bisa mengontrolnya tanpa perlu tahu
   detail geometrinya.
--------------------------------------------------------------------- */
export const acUnits = [];

let acCounter = 0;

function buildLabelPoints(side = "right") {
  const sx = side === "left" ? -1 : 1;
  return [
    {text:"Filter Udara", pos:new THREE.Vector3(0, 0.02, -0.055), offset:{x:sx * 150, y:-38}},
    {text:"Evaporator", pos:new THREE.Vector3(0, 0.03, -0.015), offset:{x:sx * 170, y:-12}},
    {text:"Blower", pos:new THREE.Vector3(0, -0.07, 0.045), offset:{x:sx * 180, y:18}},
    {text:"PCB Kontrol", pos:new THREE.Vector3(-0.3, 0.095, 0.065), offset:{x:sx * -175, y:-36}},
    {text:"Kapasitor", pos:new THREE.Vector3(-0.34, 0.075, 0.05), offset:{x:sx * -120, y:-8}},
    {text:"Kabel & Terminal", pos:new THREE.Vector3(-0.39, -0.05, 0.07), offset:{x:sx * -200, y:42}},
    {text:"Pipa Refrigerant", pos:new THREE.Vector3(0.05, 0.02, 0.185), offset:{x:sx * 180, y:54}},
  ];
}

function buildAC(x, y, z, rotY, labelSide = "right") {
  const grp = new THREE.Group();
  grp.userData.isAC = true;
  const id = "ac-" + (++acCounter);
  grp.userData.acId = id;

  /* ---------- CASING LUAR (selalu terlihat) ---------- */
  const bodyMat = new THREE.MeshStandardMaterial({color:0xf3f4f2, roughness:0.48, metalness:0.12, transparent:false, opacity:1});
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.29, 0.25), bodyMat);
  body.position.set(0, 0.01, 0.01);
  body.material.depthWrite = true;
  grp.add(body);
  body.userData.isBody = true;

  const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.22, 0.18), new THREE.MeshStandardMaterial({color:0xe9ece9, roughness:0.35, metalness:0.15}));
  backFrame.position.set(0.02, 0.02, -0.02);
  grp.add(backFrame);

  /* ---------- PANEL DEPAN (jadi "pintu" yang bisa dibuka) ---------- */
  const acPanelMat = new THREE.MeshStandardMaterial({color:0xe2e2df, roughness:0.38, metalness:0.08});
  const ventMat = new THREE.MeshStandardMaterial({color:0xb7b9b8, roughness:0.42});
  const flapMat = new THREE.MeshStandardMaterial({color:0x808688, roughness:0.5, metalness:0.18});
  const displayMat = new THREE.MeshStandardMaterial({color:0x162a2d, emissive:0x63c4c9, emissiveIntensity:0.8});
  const accentMat = new THREE.MeshStandardMaterial({color:0x868d8f, roughness:0.42, metalness:0.55});

  const doorGroup = new THREE.Group();
  doorGroup.position.set(-0.4, 0, -0.125);

  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.235, 0.018), acPanelMat);
  frontPanel.position.set(0.4, 0.01, 0);
  const panelInset = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.17, 0.014), new THREE.MeshStandardMaterial({color:0xdfe1df, roughness:0.45}));
  panelInset.position.set(0.4, -0.005, -0.01);
  const vent = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.046, 0.022), ventMat);
  vent.position.set(0.4, -0.09, -0.016);
  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.018, 0.035), flapMat);
  flap.position.set(0.4, -0.13, -0.02);
  const display = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.028, 0.008), displayMat);
  display.position.set(0.65, 0.065, -0.015);
  const indicatorBar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.006, 0.005), accentMat);
  indicatorBar.position.set(0.64, 0.04, -0.018);
  doorGroup.add(frontPanel, panelInset, vent, flap, display, indicatorBar);

  for (let i = 0; i < 7; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.026, 0.012), accentMat);
    slat.position.set(0.13 + i * 0.09, -0.09, -0.032);
    doorGroup.add(slat);
  }
  const panelScrewMat = new THREE.MeshStandardMaterial({color:0x90969a, roughness:0.3, metalness:0.85});
  for (let i = 0; i < 4; i++) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 10), panelScrewMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0.12 + i * 0.21, 0.07, -0.028);
    doorGroup.add(screw);
  }
  grp.add(doorGroup);

  /* =====================================================================
     MESIN DALAM AC (tersembunyi sampai "dibongkar")
  ===================================================================== */
  const interior = new THREE.Group();

  /* ---- 1. Filter udara: bingkai + jaring, tepat di belakang panel ---- */
  const filterFrameMat = new THREE.MeshStandardMaterial({color:0x9fb9bd, roughness:0.4, metalness:0.1});
  const filterMeshMat = new THREE.MeshStandardMaterial({color:0xcfe3e6, roughness:0.5, transparent:true, opacity:0.6, side:THREE.DoubleSide});
  const filterGroup = new THREE.Group();
  filterGroup.position.set(0, 0.02, -0.055);
  const fW = 0.66, fH = 0.16;
  const barTB = new THREE.BoxGeometry(fW, 0.012, 0.006);
  const barLR = new THREE.BoxGeometry(0.012, fH, 0.006);
  const frameInset = new THREE.Mesh(new THREE.BoxGeometry(fW + 0.02, fH + 0.02, 0.016), new THREE.MeshStandardMaterial({color:0xc9d6d7, roughness:0.38}));
  frameInset.position.set(0, 0, -0.006);
  filterGroup.add(frameInset);
  const fTop = new THREE.Mesh(barTB, filterFrameMat); fTop.position.y = fH/2;
  const fBot = new THREE.Mesh(barTB, filterFrameMat); fBot.position.y = -fH/2;
  const fLeft = new THREE.Mesh(barLR, filterFrameMat); fLeft.position.x = -fW/2;
  const fRight = new THREE.Mesh(barLR, filterFrameMat); fRight.position.x = fW/2;
  filterGroup.add(fTop, fBot, fLeft, fRight);
  const netPanel = new THREE.Mesh(new THREE.PlaneGeometry(fW - 0.02, fH - 0.02), filterMeshMat);
  filterGroup.add(netPanel);
  for (let i = 1; i < 8; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(fW - 0.02, 0.003, 0.004), filterFrameMat);
    line.position.y = -fH/2 + (fH / 8) * i;
    filterGroup.add(line);
  }
  for (let i = 1; i < 7; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.003, fH - 0.03, 0.004), filterFrameMat);
    line.position.x = -fW/2 + (fW / 7) * i;
    filterGroup.add(line);
  }
  interior.add(filterGroup);

  /* ---- 2. Evaporator: sirip aluminium + pipa tembaga berbentuk U ---- */
  const finMat = new THREE.MeshStandardMaterial({color:0xd1d8d8, roughness:0.32, metalness:0.25});
  const copperMat = new THREE.MeshStandardMaterial({color:0xb56722, roughness:0.28, metalness:0.72});
  const finCore = new THREE.Group();
  const finPack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.04), finMat);
  finPack.position.set(0, 0.03, -0.015);
  finCore.add(finPack);
  for (let i = 0; i < 16; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.0028, 0.05), new THREE.MeshStandardMaterial({color:0xb7c0bf, roughness:0.4, metalness:0.25}));
    fin.position.set(0, -0.055 + i * 0.0095, -0.012);
    finCore.add(fin);
  }
  const tubeA = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.62, 12), copperMat);
  tubeA.rotation.z = Math.PI / 2;
  tubeA.position.set(0, 0.05, 0.0);
  const tubeB = tubeA.clone();
  tubeB.position.set(0, -0.03, 0.0);
  const bendR = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 8, 18, Math.PI), copperMat);
  bendR.rotation.y = Math.PI / 2;
  bendR.position.set(0.31, 0.01, 0.0);
  const bendL = bendR.clone();
  bendL.rotation.z = Math.PI;
  bendL.position.set(-0.31, 0.01, 0.0);
  finCore.add(tubeA, tubeB, bendR, bendL);
  interior.add(finCore);

  /* ---- 3. Nampan drain pan & saluran air ---- */
  const panMat = new THREE.MeshStandardMaterial({color:0xd8d9d4, roughness:0.58});
  const drainPan = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.18), panMat);
  drainPan.position.set(0, -0.11, 0.01);
  const panLip = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.034, 0.012), panMat);
  panLip.position.set(0, -0.097, -0.08);
  const drainOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 10), new THREE.MeshStandardMaterial({color:0xdad9d5, roughness:0.55}));
  drainOutlet.position.set(0.08, -0.18, 0.01);
  drainOutlet.rotation.z = Math.PI / 2;
  interior.add(drainPan, panLip, drainOutlet);

  /* ---- 4. Blower / kipas sentrifugal realistis ---- */
  const fan = new THREE.Group();
  fan.position.set(0, -0.07, 0.045);
  const shaftMat = new THREE.MeshStandardMaterial({color:0x2d3032, roughness:0.35, metalness:0.72});
  const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.62, 12), shaftMat);
  shaftMesh.rotation.z = Math.PI / 2;
  fan.add(shaftMesh);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 20), new THREE.MeshStandardMaterial({color:0x4a5054, roughness:0.42, metalness:0.45}));
  hub.rotation.z = Math.PI / 2;
  fan.add(hub);

  const bladeMat = new THREE.MeshStandardMaterial({color:0x50575a, roughness:0.5, metalness:0.28, side:THREE.DoubleSide});
  const bladeCount = 12;
  for (let i = 0; i < bladeCount; i++) {
    const ang = (i / bladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.008, 0.065), bladeMat);
    blade.position.set(Math.cos(ang) * 0.06, 0, Math.sin(ang) * 0.06);
    blade.rotation.y = ang + Math.PI / 2;
    blade.rotation.z = 0.25;
    fan.add(blade);
  }

  const shroudRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.006, 12, 32), new THREE.MeshStandardMaterial({color:0x1d2123, roughness:0.4, metalness:0.4}));
  shroudRing.rotation.y = Math.PI / 2;
  fan.add(shroudRing);
  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.01), new THREE.MeshStandardMaterial({color:0x202328, roughness:0.6, metalness:0.35}));
  backPlate.position.set(0, 0, 0.04);
  fan.add(backPlate);
  interior.add(fan);

  /* ---- 5. Motor blower + bracket motor ---- */
  const motorMat = new THREE.MeshStandardMaterial({color:0x171717, roughness:0.45, metalness:0.55});
  const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.065, 20), motorMat);
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(0.36, -0.07, 0.045);
  const motorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 14), new THREE.MeshStandardMaterial({color:0x2b2d2e, roughness:0.35, metalness:0.7}));
  motorCap.rotation.z = Math.PI / 2;
  motorCap.position.set(0.42, -0.07, 0.045);
  const supportPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.09), new THREE.MeshStandardMaterial({color:0x2a2d2f, roughness:0.5, metalness:0.3}));
  supportPlate.position.set(0.24, -0.07, 0.045);
  interior.add(motorBody, motorCap, supportPlate);

  /* ---- 6. Papan PCB + kapasitor + relay + kabel ---- */
  const pcbMat = new THREE.MeshStandardMaterial({color:0x1d5c34, roughness:0.65});
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.008), pcbMat);
  pcb.position.set(-0.3, 0.095, 0.065);
  const pcbHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.012), new THREE.MeshStandardMaterial({color:0x3d4d50, roughness:0.4, metalness:0.5}));
  pcbHeader.position.set(-0.3, 0.128, 0.07);
  const relay = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.024, 0.022), new THREE.MeshStandardMaterial({color:0x8b7d5e, roughness:0.55, metalness:0.2}));
  relay.position.set(-0.25, 0.085, 0.08);
  const resistor = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 12), new THREE.MeshStandardMaterial({color:0x8e7a4b, roughness:0.4, metalness:0.3}));
  resistor.rotation.z = Math.PI / 2;
  resistor.position.set(-0.38, 0.095, 0.065);
  const capacitor = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.038, 12), new THREE.MeshStandardMaterial({color:0x3a6ea5, roughness:0.35, metalness:0.3}));
  capacitor.rotation.z = Math.PI / 2;
  capacitor.position.set(-0.34, 0.075, 0.05);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 12), new THREE.MeshStandardMaterial({color:0xe0e3e7, roughness:0.5}));
  capTop.rotation.z = Math.PI / 2;
  capTop.position.set(-0.355, 0.075, 0.05);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), new THREE.MeshStandardMaterial({color:0x1e1e1e, emissive:0x2ee06a, emissiveIntensity:1.2}));
  led.position.set(-0.22, 0.085, 0.072);

  for (let i = 0; i < 5; i++) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.012), new THREE.MeshStandardMaterial({color:0x111111, roughness:0.4}));
    chip.position.set(-0.33 + i * 0.038, 0.1, 0.075);
    interior.add(chip);
  }
  interior.add(pcb, pcbHeader, relay, resistor, capacitor, capTop, led);

  /* ---- 7. Terminal sambungan kabel & socket blok ---- */
  const termBlockMat = new THREE.MeshStandardMaterial({color:0xd0ab60, roughness:0.6});
  const termBlock = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.024, 0.032), termBlockMat);
  termBlock.position.set(-0.39, -0.05, 0.07);
  const terminalScrewMat = new THREE.MeshStandardMaterial({color:0x8a8f92, roughness:0.3, metalness:0.75});
  for (let i = 0; i < 3; i++) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 8), terminalScrewMat);
    screw.position.set(-0.4 + i * 0.014, -0.038, 0.07);
    screw.rotation.x = Math.PI / 2;
    interior.add(screw);
  }
  interior.add(termBlock);

  /* ---- 8. Kabel kelistrikan realistis ---- */
  function makeWire(points, color) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 28, 0.0038, 7, false);
    const mat = new THREE.MeshStandardMaterial({color, roughness:0.5});
    return new THREE.Mesh(geo, mat);
  }
  const wireRed = makeWire([
    new THREE.Vector3(-0.29, 0.09, 0.07),
    new THREE.Vector3(-0.33, 0.04, 0.085),
    new THREE.Vector3(-0.39, -0.045, 0.075),
  ], 0xb22222);
  const wireBlack = makeWire([
    new THREE.Vector3(-0.26, 0.06, 0.07),
    new THREE.Vector3(-0.32, -0.01, 0.085),
    new THREE.Vector3(-0.394, -0.055, 0.078),
  ], 0x141414);
  const wireYellow = makeWire([
    new THREE.Vector3(-0.28, 0.092, 0.07),
    new THREE.Vector3(0.12, 0.07, 0.056),
    new THREE.Vector3(0.34, -0.06, 0.055),
  ], 0xd8b02a);
  const wireBlue = makeWire([
    new THREE.Vector3(-0.27, 0.085, 0.07),
    new THREE.Vector3(0.08, 0.13, 0.025),
    new THREE.Vector3(0.38, 0.1, 0.03),
  ], 0x2b5aa0);
  interior.add(wireRed, wireBlack, wireYellow, wireBlue);

  /* ---- 9. Motor penggerak kisi-kisi / swing ---- */
  const swingMotorMat = new THREE.MeshStandardMaterial({color:0x2a2d2e, roughness:0.4, metalness:0.45});
  const swingMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), swingMotorMat);
  swingMotor.rotation.x = Math.PI / 2;
  swingMotor.position.set(0.36, 0.1, 0.03);
  const swingMotorGear = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), metalBlackMat);
  swingMotorGear.rotation.x = Math.PI / 2;
  swingMotorGear.position.set(0.36, 0.1, 0.052);
  const swingBracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), new THREE.MeshStandardMaterial({color:0x313538, roughness:0.5, metalness:0.3}));
  swingBracket.position.set(0.36, 0.08, 0.06);
  interior.add(swingMotor, swingMotorGear, swingBracket);

  /* ---- 10. Pipa kapiler & refrigerant realistis ---- */
  function makeCoil(center, radius, turns, pitch, color) {
    const pts = [];
    const segs = turns * 10;
    for (let i = 0; i <= segs; i++) {
      const a = (i / 10) * Math.PI * 2;
      const z = (i / segs) * pitch - pitch / 2;
      pts.push(new THREE.Vector3(center.x + Math.cos(a) * radius, center.y + Math.sin(a) * radius, center.z + z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, pts.length, 0.0035, 6, false);
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color, roughness:0.35, metalness:0.7}));
  }
  const capillaryCoil = makeCoil(new THREE.Vector3(0.15, 0.02, 0.12), 0.025, 5, 0.05, 0xc7c7c0);
  const pipeMat = new THREE.MeshStandardMaterial({color:0xd8d8d2, roughness:0.42, metalness:0.6});
  const outPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.17, 10), pipeMat);
  outPipe.rotation.x = Math.PI / 2;
  outPipe.position.set(0.05, 0.02, 0.185);
  const insulation = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 10), new THREE.MeshStandardMaterial({color:0x2a2a2a, roughness:0.7}));
  insulation.rotation.x = Math.PI / 2;
  insulation.position.set(0.05, 0.02, 0.145);
  interior.add(capillaryCoil, outPipe, insulation);

  /* ---- 11. Pipa pembuangan air ---- */
  const drainMat = new THREE.MeshStandardMaterial({color:0xe8e8e0, roughness:0.5});
  const drainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 10), drainMat);
  drainPipe.position.set(0.04, -0.19, 0.02);
  drainPipe.rotation.z = Math.PI / 2;
  interior.add(drainPipe);

  /* ---- 12. Rangka support internal / dinding belakang timah ---- */
  const supportFrame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.02, 0.14), new THREE.MeshStandardMaterial({color:0xaeb2b7, roughness:0.55, metalness:0.25}));
  supportFrame.position.set(0, -0.15, 0.02);
  const sideRailL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.18, 0.15), new THREE.MeshStandardMaterial({color:0xc4c7c9, roughness:0.5}));
  sideRailL.position.set(-0.36, 0.0, 0.02);
  const sideRailR = sideRailL.clone();
  sideRailR.position.x = 0.36;
  interior.add(supportFrame, sideRailL, sideRailR);

  interior.visible = false;
  interior.position.set(0, 0.02, 0.08);
  interior.scale.set(1.05, 1.05, 1.05);
  interior.renderOrder = 10;
  grp.add(interior);

  /* ---------- titik-titik label edukasi (muncul saat dibongkar) ---------- */
  const labelPoints = buildLabelPoints(labelSide);

  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  root.add(grp);

  acUnits.push({
    id, group: grp, doorGroup, interior, fan, body,
    labelPoints, opened: false, openAngle: -2.05,
  });
}

buildAC(0.15, 2.55, ROOM_L/2, Math.PI/2, "right");
buildAC(2.3, 2.55, ROOM_L - 0.7, Math.PI, "left");

if (typeof window !== "undefined") {
  window.__acDebug = acUnits;
}