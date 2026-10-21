import * as THREE from "three";
import { ROOM_W } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { metalBlackMat } from "../inti/material.js";

/* =====================================================================
   RAK BESI TERBUKA — realistis sesuai foto referensi
   Posisi: dinding kanan (X≈ROOM_W), dekat area meja bos

   Isi per shelf (atas → bawah):
   Shelf 4 (top) : patung Garuda emas, kotak hijau, kotak kecil coklat,
                   bingkai sertifikat kayu, bingkai foto
   Shelf 3       : 2 laci kayu ber-handle metal, printer putih HP
   Shelf 2       : panel listrik abu + saklar, tumpukan kertas,
                   5 binder kayu coklat berdiri
   Shelf 1       : koper aluminium hitam, binder putih berdiri,
                   3 folder kayu berdiri
   Lantai (base) : 4 aki / baterai hitam besar
===================================================================== */

/* -----------------------------------------------------------------------
   DIMENSI UTAMA RAK
----------------------------------------------------------------------- */
const W  = 1.22;   // lebar
const D  = 0.46;   // kedalaman
const H  = 1.92;   // tinggi total
const SH = 0.038;  // tebal shelf board
const PROFILE = 0.038;  // penampang kaki/tiang

// Y dasar setiap shelf (dari lantai)
const SHELF_Y = [
  0.00,   // alas bawah / lantai
  0.46,   // shelf 1
  0.88,   // shelf 2
  1.30,   // shelf 3
  H,      // shelf 4 / top
];

/* -----------------------------------------------------------------------
   MATERIAL
----------------------------------------------------------------------- */
// Besi hitam profil
const steelMat = new THREE.MeshStandardMaterial({
  color: 0x111111, roughness: 0.45, metalness: 0.75,
});
// Shelf board / papan rak (hitam agak gelap)
const boardMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a, roughness: 0.55, metalness: 0.4,
});
// Kayu coklat — laci, binder, folder
function makeWoodMat(h = 0xc8874a) {
  return new THREE.MeshStandardMaterial({ color: h, roughness: 0.55, metalness: 0.05 });
}
const woodMat   = makeWoodMat(0xb87940);
const woodDark  = makeWoodMat(0x9a6328);
// Handle metal
const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.25, metalness: 0.88 });
// Putih (printer, binder putih)
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.6 });
// Abu-abu panel listrik
const panelBoxMat = new THREE.MeshStandardMaterial({ color: 0xb8bab6, roughness: 0.5, metalness: 0.2 });
// Hitam pekat (aki, koper)
const blackMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.55, metalness: 0.15 });
// Emas (patung Garuda)
const goldMat = new THREE.MeshStandardMaterial({ color: 0xc8960c, roughness: 0.3, metalness: 0.85 });
// Hijau (kotak hijau)
const greenMat = new THREE.MeshStandardMaterial({ color: 0x2d6a2d, roughness: 0.6 });
// Krem/kertas
const paperMat = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.85 });
// Bingkai kayu foto
const frameMat = makeWoodMat(0x7a4a1e);

/* -----------------------------------------------------------------------
   HELPERS
----------------------------------------------------------------------- */
function box(grp, sx, sy, sz, mat, lx, ly, lz) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(lx, ly, lz);
  m.castShadow = true;
  m.receiveShadow = true;
  grp.add(m);
  return m;
}

function cyl(grp, rt, rb, h, mat, lx, ly, lz, rx = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 12), mat);
  m.position.set(lx, ly, lz);
  m.rotation.set(rx, 0, rz);
  m.castShadow = true;
  grp.add(m);
  return m;
}

/* -----------------------------------------------------------------------
   MEMBANGUN RAK
----------------------------------------------------------------------- */
function buildMetalRack(cx, cz) {
  const grp = new THREE.Group();
  const hw = W / 2, hd = D / 2;

  // Semua ISI rak ditaruh di contentGrp yang dirotasi 180° di Y
  // supaya label/handle/muka benda menghadap ke ruangan (arah -Z lokal → +Z dunia)
  const contentGrp = new THREE.Group();
  contentGrp.rotation.y = Math.PI;
  grp.add(contentGrp);

  /* ============================================================
     RANGKA: 4 KAKI VERTIKAL + BRACING HORIZONTAL
  ============================================================ */
  // 4 kaki sudut
  const legPositions = [
    [-hw + PROFILE / 2, 0,  -hd + PROFILE / 2],
    [ hw - PROFILE / 2, 0,  -hd + PROFILE / 2],
    [-hw + PROFILE / 2, 0,   hd - PROFILE / 2],
    [ hw - PROFILE / 2, 0,   hd - PROFILE / 2],
  ];
  legPositions.forEach(([lx, , lz]) => {
    box(grp, PROFILE, H, PROFILE, steelMat, lx, H / 2, lz);
  });

  // Cross bracing horizontal di sisi depan & belakang per shelf
  SHELF_Y.forEach(sy => {
    // sisi depan
    box(grp, W - PROFILE * 2, PROFILE * 0.6, PROFILE * 0.6,
      steelMat, 0, sy + PROFILE * 0.4, -hd + PROFILE / 2);
    // sisi belakang
    box(grp, W - PROFILE * 2, PROFILE * 0.6, PROFILE * 0.6,
      steelMat, 0, sy + PROFILE * 0.4,  hd - PROFILE / 2);
    // sisi kiri
    box(grp, PROFILE * 0.6, PROFILE * 0.6, D - PROFILE * 2,
      steelMat, -hw + PROFILE / 2, sy + PROFILE * 0.4, 0);
    // sisi kanan
    box(grp, PROFILE * 0.6, PROFILE * 0.6, D - PROFILE * 2,
      steelMat,  hw - PROFILE / 2, sy + PROFILE * 0.4, 0);
  });

  /* ============================================================
     PAPAN RAK
  ============================================================ */
  SHELF_Y.forEach(sy => {
    box(grp, W - PROFILE * 2, SH, D - PROFILE * 2,
      boardMat, 0, sy + SH / 2, 0);
  });

  /* ============================================================
     SHELF 4 (TOP) — Y = H = 1.92
     Patung Garuda, kotak hijau, kotak coklat kecil, sertifikat, bingkai foto
  ============================================================ */
  const s4y = H + SH;   // permukaan shelf 4

  // Kotak hijau (kiri)
  box(contentGrp, 0.22, 0.08, 0.30, greenMat, -0.36, s4y + 0.04, 0.0);

  // Kotak coklat kecil (dekat tengah kiri)
  box(contentGrp, 0.14, 0.06, 0.14, woodMat,  -0.14, s4y + 0.03, 0.0);
  // detail tutup kotak
  box(contentGrp, 0.15, 0.012, 0.15, woodDark, -0.14, s4y + 0.066, 0.0);

  // Patung Garuda (tengah)
  const garGrp = new THREE.Group();
  cyl(garGrp, 0.032, 0.038, 0.04, goldMat, 0, 0.02, 0);
  cyl(garGrp, 0.028, 0.032, 0.10, goldMat, 0, 0.09, 0);
  box(garGrp, 0.06, 0.06, 0.06, goldMat, 0, 0.165, 0);
  box(garGrp, 0.10, 0.07, 0.025, goldMat, -0.07, 0.12, 0);
  box(garGrp, 0.10, 0.07, 0.025, goldMat,  0.07, 0.12, 0);
  box(garGrp, 0.025, 0.025, 0.032, goldMat, 0, 0.158, -0.045);
  garGrp.position.set(0.02, s4y, 0.0);
  contentGrp.add(garGrp);

  // Bingkai sertifikat kayu (tengah-kanan)
  const certGrp = new THREE.Group();
  box(certGrp, 0.26, 0.20, 0.015, frameMat, 0, 0.10, 0);
  box(certGrp, 0.22, 0.16, 0.008, paperMat, 0, 0.10, -0.012);
  box(certGrp, 0.08, 0.008, 0.006, new THREE.MeshStandardMaterial({ color: 0x1a3a6a }), 0, 0.14, -0.016);
  box(certGrp, 0.10, 0.006, 0.006, new THREE.MeshStandardMaterial({ color: 0x333333 }), 0, 0.12, -0.016);
  box(certGrp, 0.09, 0.006, 0.006, new THREE.MeshStandardMaterial({ color: 0x333333 }), 0, 0.10, -0.016);
  certGrp.rotation.x = 0.18;
  certGrp.position.set(0.28, s4y, 0.04);
  contentGrp.add(certGrp);

  // Bingkai foto kecil (paling kanan)
  const photoGrp = new THREE.Group();
  box(photoGrp, 0.17, 0.135, 0.012, frameMat, 0, 0.067, 0);
  box(photoGrp, 0.13, 0.100, 0.007, new THREE.MeshStandardMaterial({ color: 0x4a5568 }), 0, 0.067, -0.010);
  photoGrp.rotation.x = 0.22;
  photoGrp.position.set(0.46, s4y, 0.04);
  contentGrp.add(photoGrp);

  /* ============================================================
     SHELF 3 — Y = 1.30
     2 laci kayu ber-handle metal, printer putih HP (kanan)
  ============================================================ */
  const s3y = SHELF_Y[3] + SH;  // ≈ 1.338

  // Laci kayu kiri
  const drawerL = new THREE.Group();
  box(drawerL, 0.28, 0.22, 0.34, woodMat, 0, 0.11, 0);
  // front panel sedikit lebih terang
  box(drawerL, 0.28, 0.20, 0.012, makeWoodMat(0xd09050), 0, 0.10, -0.175);
  // handle metal
  const hGeo = new THREE.TorusGeometry(0.028, 0.006, 6, 14, Math.PI);
  const hL = new THREE.Mesh(hGeo, handleMat);
  hL.rotation.z = Math.PI; hL.rotation.x = Math.PI / 2;
  hL.position.set(0, 0.10, -0.188);
  drawerL.add(hL);
  drawerL.position.set(-0.30, s3y, 0.02);
  contentGrp.add(drawerL);

  // Laci kayu kanan
  const drawerR = drawerL.clone();
  drawerR.position.set(0.02, s3y, 0.02);
  contentGrp.add(drawerR);

  // Printer putih HP (paling kanan)
  const printerGrp = new THREE.Group();
  box(printerGrp, 0.30, 0.14, 0.30, whiteMat, 0, 0.07, 0);
  box(printerGrp, 0.28, 0.012, 0.28, new THREE.MeshStandardMaterial({ color: 0xd5d2c8, roughness: 0.5 }), 0, 0.146, 0);
  box(printerGrp, 0.04, 0.015, 0.005, new THREE.MeshStandardMaterial({ color: 0x005dab }), 0.08, 0.12, -0.152);
  box(printerGrp, 0.22, 0.008, 0.005, new THREE.MeshStandardMaterial({ color: 0xaaa9a5 }), 0, 0.09, -0.152);
  box(printerGrp, 0.008, 0.008, 0.005,
    new THREE.MeshStandardMaterial({ color: 0x00cc44, emissive: 0x00cc44, emissiveIntensity: 0.6 }),
    -0.10, 0.115, -0.152);
  printerGrp.position.set(0.41, s3y, 0.0);
  contentGrp.add(printerGrp);

  /* ============================================================
     SHELF 2 — Y = 0.88
     Panel listrik abu-putih + 3 saklar berwarna, tumpukan kertas,
     5 binder/folder kayu berdiri (kanan)
  ============================================================ */
  const s2y = SHELF_Y[2] + SH;  // ≈ 0.918

  // Panel listrik / electrical box
  const elecGrp = new THREE.Group();
  box(elecGrp, 0.28, 0.30, 0.14, panelBoxMat, 0, 0.15, 0);
  // pintu panel (sedikit lebih cerah)
  box(elecGrp, 0.26, 0.28, 0.012,
    new THREE.MeshStandardMaterial({ color: 0xcaccc8, roughness: 0.45 }), 0, 0.14, -0.076);
  // label teks (strip hitam kecil)
  box(elecGrp, 0.14, 0.016, 0.005, new THREE.MeshStandardMaterial({ color: 0x111 }), 0, 0.245, -0.082);
  // Saklar merah
  cyl(elecGrp, 0.018, 0.018, 0.022,
    new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.3 }),
    -0.06, 0.17, -0.083, 0, 0);
  // Saklar hijau
  cyl(elecGrp, 0.018, 0.018, 0.022,
    new THREE.MeshStandardMaterial({ color: 0x11aa11, roughness: 0.3 }),
    0.00, 0.17, -0.083, 0, 0);
  // Saklar kuning
  cyl(elecGrp, 0.018, 0.018, 0.022,
    new THREE.MeshStandardMaterial({ color: 0xddaa00, roughness: 0.3 }),
    0.06, 0.17, -0.083, 0, 0);
  // Tombol hitam kecil bawah
  cyl(elecGrp, 0.012, 0.012, 0.016,
    new THREE.MeshStandardMaterial({ color: 0x111 }),
    -0.04, 0.10, -0.083, 0, 0);
  cyl(elecGrp, 0.012, 0.012, 0.016,
    new THREE.MeshStandardMaterial({ color: 0x111 }),
    0.04, 0.10, -0.083, 0, 0);
  elecGrp.position.set(-0.38, s2y, 0.0);
  contentGrp.add(elecGrp);

  // Tumpukan kertas / dokumen
  const paperStack = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    box(paperStack, 0.22, 0.007, 0.28,
      new THREE.MeshStandardMaterial({ color: 0xf2efe5, roughness: 0.9 }),
      (Math.random() - 0.5) * 0.012, i * 0.008, (Math.random() - 0.5) * 0.01);
  }
  paperStack.position.set(-0.06, s2y, 0.0);
  contentGrp.add(paperStack);

  // 5 binder kayu berdiri
  const binderColors = [0xb87030, 0xc07838, 0xa86825, 0xb87030, 0xbe7832];
  binderColors.forEach((col, i) => {
    const bGrp = new THREE.Group();
    box(bGrp, 0.06, 0.30, 0.28, makeWoodMat(col), 0, 0.15, 0);
    box(bGrp, 0.058, 0.06, 0.005,
      new THREE.MeshStandardMaterial({ color: 0xf0ece0 }),
      0, 0.22, -0.143);
    bGrp.position.set(0.24 + i * 0.075, s2y, 0.0);
    contentGrp.add(bGrp);
  });

  /* ============================================================
     SHELF 1 — Y = 0.46
     Koper aluminium hitam (kiri), binder putih berdiri (tengah),
     3 folder kayu berdiri (kanan)
  ============================================================ */
  const s1y = SHELF_Y[1] + SH;  // ≈ 0.498

  // Koper hitam aluminium (besar)
  const caseGrp = new THREE.Group();
  box(caseGrp, 0.40, 0.26, 0.30, blackMat, 0, 0.13, 0);
  // garis tepi aluminium
  box(caseGrp, 0.40, 0.008, 0.30,
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.2, metalness: 0.85 }),
    0, 0.13, 0);
  // kunci / latch
  box(caseGrp, 0.04, 0.02, 0.015,
    new THREE.MeshStandardMaterial({ color: 0x888, roughness: 0.2, metalness: 0.8 }),
    -0.08, 0.13, -0.155);
  box(caseGrp, 0.04, 0.02, 0.015,
    new THREE.MeshStandardMaterial({ color: 0x888, roughness: 0.2, metalness: 0.8 }),
    0.08, 0.13, -0.155);
  // handle atas
  const caseHandle = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.008, 6, 14, Math.PI),
    handleMat
  );
  caseHandle.rotation.set(Math.PI / 2, 0, 0);
  caseHandle.position.set(0, 0.27, 0);
  caseGrp.add(caseHandle);
  caseGrp.position.set(-0.34, s1y, 0.0);
  contentGrp.add(caseGrp);

  // Binder / map putih berdiri (tengah)
  const wBinder = new THREE.Group();
  box(wBinder, 0.055, 0.32, 0.28, whiteMat, 0, 0.16, 0);
  box(wBinder, 0.055, 0.32, 0.006,
    new THREE.MeshStandardMaterial({ color: 0xcccccc }),
    0, 0.16, -0.143);
  wBinder.position.set(0.02, s1y, 0.0);
  contentGrp.add(wBinder);

  // 3 folder kayu berdiri (kanan)
  [0xb07030, 0x9a6022, 0xb87838].forEach((col, i) => {
    const fGrp = new THREE.Group();
    box(fGrp, 0.065, 0.32, 0.28, makeWoodMat(col), 0, 0.16, 0);
    box(fGrp, 0.063, 0.055, 0.005,
      new THREE.MeshStandardMaterial({ color: 0xf0ece0 }),
      0, 0.26, -0.143);
    fGrp.position.set(0.22 + i * 0.085, s1y, 0.0);
    contentGrp.add(fGrp);
  });

  /* ============================================================
     LANTAI / BASE — Y = 0
     4 aki / baterai hitam besar (2 depan + 2 belakang)
  ============================================================ */
  const batteryPositions = [
    [-0.30, 0, -0.08], [-0.08, 0, -0.08],
    [ 0.14, 0, -0.08], [ 0.35, 0, -0.08],
  ];
  batteryPositions.forEach(([bx, , bz]) => {
    const batGrp = new THREE.Group();
    // badan aki
    box(batGrp, 0.18, 0.20, 0.24, blackMat, 0, 0.10, 0);
    // tutup atas sedikit lebih terang
    box(batGrp, 0.17, 0.012, 0.22,
      new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.4 }),
      0, 0.206, 0);
    // terminal + (merah kecil)
    cyl(batGrp, 0.012, 0.014, 0.018,
      new THREE.MeshStandardMaterial({ color: 0xcc2222 }),
      0.04, 0.222, 0);
    // terminal - (hitam)
    cyl(batGrp, 0.012, 0.014, 0.018, blackMat, -0.04, 0.222, 0);
    // label strip putih
    box(batGrp, 0.12, 0.04, 0.005,
      new THREE.MeshStandardMaterial({ color: 0xe0ddd8 }),
      0, 0.12, -0.122);
    batGrp.position.set(bx, 0, bz);
    contentGrp.add(batGrp);
  });

  /* ============================================================
     POSISI FINAL RAK
     Rak menghadap ke dalam ruangan (arah -X), menempel dinding kanan.
     rotation.y = -Math.PI/2  → kedalaman rak (Z lokal) jadi sumbu X dunia
     cx = ROOM_W - D/2        → sisi belakang rak tepat di X=ROOM_W
  ============================================================ */
  grp.rotation.y = -Math.PI / 2;
  grp.position.set(cx, 0, cz);
  root.add(grp);
}

// Dinding kanan X=ROOM_W=8, kedalaman rak D=0.46
// cx = ROOM_W - D/2 = 8 - 0.23 = 7.77 → sisi belakang pas di tembok
buildMetalRack(ROOM_W - D / 2, 9.6);
