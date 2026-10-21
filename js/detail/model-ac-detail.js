import * as THREE from "three";

/* ---------------------------------------------------------------------
   MODEL DETAIL — UNIT AC SPLIT (BONGKAR / CUTAWAY)
   File ini membangun model 3D unit AC indoor dalam kondisi "terbongkar":
   casing dibuat tembus pandang (ghost) dan panel depan terbuka penuh,
   sehingga SELURUH komponen di dalamnya selalu terlihat jelas — dibuat
   sedetail & serealistis mungkin (bentuk 3D nyata, bukan kotak polos)
   supaya mudah dipelajari.

   Setiap bagian didaftarkan ke array `components` lengkap dengan nama,
   kategori, dan penjelasan singkat, dipakai oleh js/detail/main-detail.js
   untuk daftar sidebar, highlight, dan fokus kamera.
--------------------------------------------------------------------- */

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

export function buildACDetailModel() {
  const group = new THREE.Group();
  const components = [];

  function registerComponent(key, name, category, desc, object) {
    object.userData.compKey = key;
    components.push({ key, name, category, desc, object });
  }

  /* =====================================================================
     1. CASING / BODI — dibuat tembus pandang (ghost) permanen supaya
        seluruh isi di dalamnya selalu terlihat, tapi bentuk aslinya
        tetap terlihat jelas sebagai konteks.
  ===================================================================== */
  const casingGroup = new THREE.Group();
  const bodyMat = mat({ color: 0xf3f4f2, roughness: 0.5, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.29, 0.25), bodyMat);
  body.position.set(0, 0.01, 0.01);
  casingGroup.add(body);

  const backFrameMat = mat({ color: 0xe9ece9, roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.22, depthWrite: false });
  const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.22, 0.18), backFrameMat);
  backFrame.position.set(0.02, 0.02, -0.02);
  casingGroup.add(backFrame);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.88, 0.29, 0.25)),
    new THREE.LineBasicMaterial({ color: 0xc7cac8, transparent: true, opacity: 0.55 })
  );
  edges.position.copy(body.position);
  casingGroup.add(edges);

  group.add(casingGroup);
  registerComponent(
    "casing", "Casing / Bodi Unit", "Bodi & Panel",
    "Rumah pelindung terluar unit AC indoor. Menjaga seluruh komponen di dalamnya dari debu dan benturan, sekaligus memberi tampilan rapi saat terpasang di dinding. Di sini bodinya dibuat tembus pandang supaya isi di dalamnya tetap terlihat.",
    casingGroup
  );

  /* =====================================================================
     2. PANEL DEPAN — dibuka penuh (seperti sedang diservis) supaya
        jalur masuk udara & tampilan luar tetap terlihat jelas.
  ===================================================================== */
  const acPanelMat = mat({ color: 0xe2e2df, roughness: 0.38, metalness: 0.08 });
  const ventMat = mat({ color: 0xb7b9b8, roughness: 0.42 });
  const flapMat = mat({ color: 0x808688, roughness: 0.5, metalness: 0.18 });
  const displayMat = mat({ color: 0x162a2d, emissive: 0x63c4c9, emissiveIntensity: 0.8 });
  const accentMat = mat({ color: 0x868d8f, roughness: 0.42, metalness: 0.55 });
  const panelScrewMat = mat({ color: 0x90969a, roughness: 0.3, metalness: 0.85 });

  const doorGroup = new THREE.Group();
  doorGroup.position.set(-0.4, 0, -0.125);
  doorGroup.rotation.y = -2.05; // dibuka penuh, statis

  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.235, 0.018), acPanelMat);
  frontPanel.position.set(0.4, 0.01, 0);
  const panelInset = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.17, 0.014), mat({ color: 0xdfe1df, roughness: 0.45 }));
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
  for (let i = 0; i < 4; i++) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 10), panelScrewMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0.12 + i * 0.21, 0.07, -0.028);
    doorGroup.add(screw);
  }
  group.add(doorGroup);
  registerComponent(
    "panel_depan", "Panel Depan", "Bodi & Panel",
    "Penutup depan yang bisa dibuka saat servis atau pembersihan. Di baliknya ada kisi pengarah udara (louvre) dan layar indikator suhu/mode. Di sini panel sengaja ditampilkan terbuka penuh agar bagian dalamnya terlihat.",
    doorGroup
  );

  /* =====================================================================
     3. FILTER UDARA
  ===================================================================== */
  const filterFrameMat = mat({ color: 0x9fb9bd, roughness: 0.4, metalness: 0.1 });
  const filterMeshMat = mat({ color: 0xcfe3e6, roughness: 0.5, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const filterGroup = new THREE.Group();
  filterGroup.position.set(0, 0.02, -0.055);
  const fW = 0.66, fH = 0.16;
  const barTB = new THREE.BoxGeometry(fW, 0.012, 0.006);
  const barLR = new THREE.BoxGeometry(0.012, fH, 0.006);
  const frameInset = new THREE.Mesh(new THREE.BoxGeometry(fW + 0.02, fH + 0.02, 0.016), mat({ color: 0xc9d6d7, roughness: 0.38 }));
  frameInset.position.set(0, 0, -0.006);
  filterGroup.add(frameInset);
  const fTop = new THREE.Mesh(barTB, filterFrameMat); fTop.position.y = fH / 2;
  const fBot = new THREE.Mesh(barTB, filterFrameMat); fBot.position.y = -fH / 2;
  const fLeft = new THREE.Mesh(barLR, filterFrameMat); fLeft.position.x = -fW / 2;
  const fRight = new THREE.Mesh(barLR, filterFrameMat); fRight.position.x = fW / 2;
  filterGroup.add(fTop, fBot, fLeft, fRight);
  const netPanel = new THREE.Mesh(new THREE.PlaneGeometry(fW - 0.02, fH - 0.02), filterMeshMat);
  filterGroup.add(netPanel);
  for (let i = 1; i < 8; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(fW - 0.02, 0.003, 0.004), filterFrameMat);
    line.position.y = -fH / 2 + (fH / 8) * i;
    filterGroup.add(line);
  }
  for (let i = 1; i < 7; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.003, fH - 0.03, 0.004), filterFrameMat);
    line.position.x = -fW / 2 + (fW / 7) * i;
    filterGroup.add(line);
  }
  group.add(filterGroup);
  registerComponent(
    "filter_udara", "Filter Udara", "Aliran Udara",
    "Jaring penyaring yang menangkap debu sebelum udara ruangan melewati evaporator. Letaknya paling depan di jalur masuk udara. Perlu dibersihkan berkala agar AC tetap dingin maksimal dan hemat listrik.",
    filterGroup
  );

  /* =====================================================================
     4. EVAPORATOR — sirip aluminium + pipa tembaga berbentuk U
  ===================================================================== */
  const finMat = mat({ color: 0xd1d8d8, roughness: 0.32, metalness: 0.25 });
  const finRibMat = mat({ color: 0xb7c0bf, roughness: 0.4, metalness: 0.25 });
  const copperMat = mat({ color: 0xb56722, roughness: 0.22, metalness: 0.78 });
  const finCore = new THREE.Group();
  const finPack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.04), finMat);
  finPack.position.set(0, 0.03, -0.015);
  finCore.add(finPack);
  for (let i = 0; i < 16; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.0028, 0.05), finRibMat);
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
  group.add(finCore);
  registerComponent(
    "evaporator", "Evaporator", "Aliran Udara",
    "Kumpulan pipa tembaga berisi refrigerant yang dililit sirip-sirip aluminium tipis. Di sinilah panas dari udara ruangan diserap oleh refrigerant, sehingga udara yang lewat menjadi dingin.",
    finCore
  );

  /* =====================================================================
     5. NAMPAN AIR (DRAIN PAN)
  ===================================================================== */
  const panMat = mat({ color: 0xd8d9d4, roughness: 0.58 });
  const drainPanGroup = new THREE.Group();
  const drainPan = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.18), panMat);
  drainPan.position.set(0, -0.11, 0.01);
  const panLip = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.034, 0.012), panMat);
  panLip.position.set(0, -0.097, -0.08);
  const drainOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 10), mat({ color: 0xdad9d5, roughness: 0.55 }));
  drainOutlet.position.set(0.08, -0.18, 0.01);
  drainOutlet.rotation.z = Math.PI / 2;
  drainPanGroup.add(drainPan, panLip, drainOutlet);
  group.add(drainPanGroup);
  registerComponent(
    "drain_pan", "Nampan Air (Drain Pan)", "Aliran Udara",
    "Menampung air hasil kondensasi/embun yang menetes dari evaporator, lalu mengalirkannya keluar lewat pipa pembuangan supaya tidak menetes ke lantai ruangan.",
    drainPanGroup
  );

  /* =====================================================================
     6. BLOWER / KIPAS SENTRIFUGAL
  ===================================================================== */
  const fan = new THREE.Group();
  fan.position.set(0, -0.07, 0.045);
  const shaftMat = mat({ color: 0x2d3032, roughness: 0.35, metalness: 0.72 });
  const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.62, 12), shaftMat);
  shaftMesh.rotation.z = Math.PI / 2;
  fan.add(shaftMesh);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 20), mat({ color: 0x4a5054, roughness: 0.42, metalness: 0.45 }));
  hub.rotation.z = Math.PI / 2;
  fan.add(hub);
  const bladeMat = mat({ color: 0x50575a, roughness: 0.5, metalness: 0.28, side: THREE.DoubleSide });
  const bladeCount = 12;
  for (let i = 0; i < bladeCount; i++) {
    const ang = (i / bladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.008, 0.065), bladeMat);
    blade.position.set(Math.cos(ang) * 0.06, 0, Math.sin(ang) * 0.06);
    blade.rotation.y = ang + Math.PI / 2;
    blade.rotation.z = 0.25;
    fan.add(blade);
  }
  const shroudRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.006, 12, 32), mat({ color: 0x1d2123, roughness: 0.4, metalness: 0.4 }));
  shroudRing.rotation.y = Math.PI / 2;
  fan.add(shroudRing);
  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.01), mat({ color: 0x202328, roughness: 0.6, metalness: 0.35 }));
  backPlate.position.set(0, 0, 0.04);
  fan.add(backPlate);
  group.add(fan);
  registerComponent(
    "blower", "Blower (Kipas Sentrifugal)", "Aliran Udara",
    "Kipas berbentuk tabung bersudu banyak yang menghisap udara ruangan melewati filter & evaporator, lalu menghembuskannya kembali dalam kondisi dingin. Kipas ini berputar terus selama unit menyala.",
    fan
  );

  /* =====================================================================
     7. MOTOR BLOWER
  ===================================================================== */
  const motorMat = mat({ color: 0x171717, roughness: 0.45, metalness: 0.55 });
  const motorGroup = new THREE.Group();
  const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.065, 20), motorMat);
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(0.36, -0.07, 0.045);
  const motorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 14), mat({ color: 0x2b2d2e, roughness: 0.35, metalness: 0.7 }));
  motorCap.rotation.z = Math.PI / 2;
  motorCap.position.set(0.42, -0.07, 0.045);
  const supportPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.09), mat({ color: 0x2a2d2f, roughness: 0.5, metalness: 0.3 }));
  supportPlate.position.set(0.24, -0.07, 0.045);
  motorGroup.add(motorBody, motorCap, supportPlate);
  group.add(motorGroup);
  registerComponent(
    "motor_blower", "Motor Blower", "Aliran Udara",
    "Motor listrik yang memutar blower. Kecepatan putarannya menentukan besar-kecilnya hembusan angin (pilihan kecepatan kipas pada remote AC).",
    motorGroup
  );

  /* =====================================================================
     8. PCB KONTROL + komponen elektronik pendukung
  ===================================================================== */
  const pcbGroup = new THREE.Group();
  const pcbMat = mat({ color: 0x1d5c34, roughness: 0.6, metalness: 0.05 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.008), pcbMat);
  pcb.position.set(-0.3, 0.095, 0.065);
  const pcbHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.012), mat({ color: 0x3d4d50, roughness: 0.4, metalness: 0.5 }));
  pcbHeader.position.set(-0.3, 0.128, 0.07);
  const relay = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.024, 0.022), mat({ color: 0x8b7d5e, roughness: 0.55, metalness: 0.2 }));
  relay.position.set(-0.25, 0.085, 0.08);
  const resistor = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 12), mat({ color: 0x8e7a4b, roughness: 0.4, metalness: 0.3 }));
  resistor.rotation.z = Math.PI / 2;
  resistor.position.set(-0.38, 0.095, 0.065);
  const capacitor = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.038, 12), mat({ color: 0x3a6ea5, roughness: 0.35, metalness: 0.3 }));
  capacitor.rotation.z = Math.PI / 2;
  capacitor.position.set(-0.34, 0.075, 0.05);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 12), mat({ color: 0xe0e3e7, roughness: 0.5 }));
  capTop.rotation.z = Math.PI / 2;
  capTop.position.set(-0.355, 0.075, 0.05);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), mat({ color: 0x1e1e1e, emissive: 0x2ee06a, emissiveIntensity: 1.2 }));
  led.position.set(-0.22, 0.085, 0.072);
  pcbGroup.add(pcb, pcbHeader, relay, resistor, capacitor, capTop, led);
  const chipMat = mat({ color: 0x111111, roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.012), chipMat);
    chip.position.set(-0.33 + i * 0.038, 0.1, 0.075);
    pcbGroup.add(chip);
  }
  group.add(pcbGroup);
  registerComponent(
    "pcb_kontrol", "PCB Kontrol", "Elektronik",
    "Papan sirkuit — otak dari unit indoor. Menerima sinyal dari remote, lalu mengatur suhu, kecepatan kipas, mode operasi, arah kisi-kisi, hingga menyalakan/mematikan komponen lain seperti motor & kompresor outdoor.",
    pcbGroup
  );

  /* =====================================================================
     9. TERMINAL & KABEL KELISTRIKAN
  ===================================================================== */
  const wiringGroup = new THREE.Group();
  const termBlockMat = mat({ color: 0xd0ab60, roughness: 0.6 });
  const termBlock = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.024, 0.032), termBlockMat);
  termBlock.position.set(-0.39, -0.05, 0.07);
  wiringGroup.add(termBlock);
  const terminalScrewMat = mat({ color: 0x8a8f92, roughness: 0.3, metalness: 0.75 });
  for (let i = 0; i < 3; i++) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 8), terminalScrewMat);
    screw.position.set(-0.4 + i * 0.014, -0.038, 0.07);
    screw.rotation.x = Math.PI / 2;
    wiringGroup.add(screw);
  }
  function makeWire(points, color) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 28, 0.0038, 7, false);
    return new THREE.Mesh(geo, mat({ color, roughness: 0.5 }));
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
  wiringGroup.add(wireRed, wireBlack, wireYellow, wireBlue);
  group.add(wiringGroup);
  registerComponent(
    "kabel_terminal", "Kabel & Terminal", "Elektronik",
    "Blok terminal tempat kabel daya & sinyal disambungkan dengan aman, menghubungkan PCB kontrol ke motor blower, motor swing, dan sumber listrik utama.",
    wiringGroup
  );

  /* =====================================================================
     10. MOTOR PENGGERAK KISI-KISI (SWING MOTOR)
  ===================================================================== */
  const metalBlackMat = mat({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.75 });
  const swingGroup = new THREE.Group();
  const swingMotorMat = mat({ color: 0x2a2d2e, roughness: 0.4, metalness: 0.45 });
  const swingMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), swingMotorMat);
  swingMotor.rotation.x = Math.PI / 2;
  swingMotor.position.set(0.36, 0.1, 0.03);
  const swingMotorGear = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), metalBlackMat);
  swingMotorGear.rotation.x = Math.PI / 2;
  swingMotorGear.position.set(0.36, 0.1, 0.052);
  const swingBracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), mat({ color: 0x313538, roughness: 0.5, metalness: 0.3 }));
  swingBracket.position.set(0.36, 0.08, 0.06);
  swingGroup.add(swingMotor, swingMotorGear, swingBracket);
  group.add(swingGroup);
  registerComponent(
    "motor_swing", "Motor Penggerak Kisi-Kisi", "Elektronik",
    "Motor kecil yang menggerakkan kisi-kisi arah angin (louvre) secara otomatis naik-turun/berayun, supaya hembusan udara dingin merata ke seluruh ruangan.",
    swingGroup
  );

  /* =====================================================================
     11. PIPA REFRIGERANT & KAPILER
  ===================================================================== */
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
    return new THREE.Mesh(geo, mat({ color, roughness: 0.35, metalness: 0.7 }));
  }
  const pipaGroup = new THREE.Group();
  const capillaryCoil = makeCoil(new THREE.Vector3(0.15, 0.02, 0.12), 0.025, 5, 0.05, 0xc7c7c0);
  const pipeMat = mat({ color: 0xd8d8d2, roughness: 0.42, metalness: 0.6 });
  const outPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.17, 10), pipeMat);
  outPipe.rotation.x = Math.PI / 2;
  outPipe.position.set(0.05, 0.02, 0.185);
  const insulation = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 10), mat({ color: 0x2a2a2a, roughness: 0.7 }));
  insulation.rotation.x = Math.PI / 2;
  insulation.position.set(0.05, 0.02, 0.145);
  pipaGroup.add(capillaryCoil, outPipe, insulation);
  group.add(pipaGroup);
  registerComponent(
    "pipa_refrigerant", "Pipa Refrigerant", "Pipa & Struktur",
    "Pipa tembaga yang mengalirkan refrigerant (freon) antara unit indoor & outdoor. Di sinilah berlangsung siklus pendinginan yang membuat evaporator menjadi dingin.",
    pipaGroup
  );

  /* =====================================================================
     12. PIPA PEMBUANGAN AIR
  ===================================================================== */
  const drainMat = mat({ color: 0xe8e8e0, roughness: 0.5 });
  const drainPipeGroup = new THREE.Group();
  const drainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 10), drainMat);
  drainPipe.position.set(0.04, -0.19, 0.02);
  drainPipe.rotation.z = Math.PI / 2;
  drainPipeGroup.add(drainPipe);
  group.add(drainPipeGroup);
  registerComponent(
    "pipa_pembuangan", "Pipa Pembuangan Air", "Pipa & Struktur",
    "Selang/pipa yang membuang air hasil kondensasi dari nampan penampung (drain pan) menuju ke luar ruangan, biasanya diarahkan ke talang atau area terbuka.",
    drainPipeGroup
  );

  /* =====================================================================
     13. RANGKA PENOPANG
  ===================================================================== */
  const rangkaGroup = new THREE.Group();
  const supportFrame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.02, 0.14), mat({ color: 0xaeb2b7, roughness: 0.55, metalness: 0.25 }));
  supportFrame.position.set(0, -0.15, 0.02);
  const sideRailL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.18, 0.15), mat({ color: 0xc4c7c9, roughness: 0.5 }));
  sideRailL.position.set(-0.36, 0.0, 0.02);
  const sideRailR = sideRailL.clone();
  sideRailR.position.x = 0.36;
  rangkaGroup.add(supportFrame, sideRailL, sideRailR);
  group.add(rangkaGroup);
  registerComponent(
    "rangka_support", "Rangka Penopang", "Pipa & Struktur",
    "Rangka logam di dalam casing yang menjadi dudukan & penguat seluruh komponen, supaya posisi tiap bagian tetap stabil dan tidak bergeser.",
    rangkaGroup
  );

  return { group, components, fan };
}
