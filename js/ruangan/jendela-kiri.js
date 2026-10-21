import * as THREE from "three";
import { ROOM_L, ROOM_H } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { orangeFrameMat, curtainMat } from "../inti/material.js";
import { skylineTexture, wallTexture } from "../inti/tekstur.js";

/* =====================================================================
   DINDING KIRI (X = 0) — seluruh panjang ROOM_L = 12 m

   Layout sumbu Z (dilihat dari dalam ruangan):
   Z=0  ──── jendela ───────── Z≈5.35 │ AC gap │ Z≈6.65 ── jendela ── Z=12

   • Segmen DEPAN  : Z 0 → AC_START  → diisi jendela penuh
   • Segmen AC     : Z AC_START → AC_END → tembok solid (AC menempel di sini)
   • Segmen BELAKANG: Z AC_END → ROOM_L → diisi jendela penuh

   Setiap segmen jendela dibagi otomatis menjadi unit-unit lebar ≈1.20 m.
   Setiap unit: 3 panel vertikal + transom bar atas + bingkai kayu oranye
                + sepasang gorden di sisi kiri & kanan.

   Dinding bawah (0 → WIN_SILL_Y ≈ 0.95 m):
     • Bagian jendela: material batako abu-abu kotak-kotak
     • Bagian AC: sama (material batako, karena solid tembok)
   Dinding atas (WIN_TOP_Y ≈ 2.90 m → ROOM_H):
     • Plester krem di semua bagian
   Dinding tengah area AC (WIN_SILL_Y → WIN_TOP_Y):
     • Plester krem
===================================================================== */

/* -----------------------------------------------------------------------
   DIMENSI & POSISI
----------------------------------------------------------------------- */
const WIN_SILL_Y  = 0.95;           // ambang bawah jendela
const WIN_TOP_Y   = 2.90;           // ambang atas jendela
const WIN_H       = WIN_TOP_Y - WIN_SILL_Y;   // ≈ 1.95 m
const TRANSOM_H   = 0.38;           // tinggi panel transom atas
const FRAME_T     = 0.07;           // kedalaman frame (sumbu X)
const FRAME_W     = 0.055;          // lebar profil frame
const MULLION_W   = 0.042;          // lebar mullion/tiang tengah
const UNIT_W_TGT  = 1.20;          // lebar target per unit jendela
const GAP_COL     = 0.14;          // lebar pilar antar unit (tembok antara)

// Area AC di dinding kiri: AC pertama Z = ROOM_L/2 = 6.0
const AC_Z        = ROOM_L / 2;     // 6.0
const AC_GAP      = 1.30;          // lebar celah untuk unit AC
const AC_START    = AC_Z - AC_GAP / 2;  // 5.35
const AC_END      = AC_Z + AC_GAP / 2;  // 6.65

/* -----------------------------------------------------------------------
   MATERIAL
----------------------------------------------------------------------- */
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xc2dff5,
  roughness: 0.04,
  metalness: 0.0,
  transmission: 0.85,
  thickness: 0.04,
  transparent: true,
  opacity: 0.50,
  side: THREE.DoubleSide,
  depthWrite: false,
});

// Plester krem atas dinding
const plasterMat = new THREE.MeshStandardMaterial({
  color: 0xf0e8d5,
  roughness: 0.88,
});

// Batako abu-abu — pakai wallTexture brickMode
const batakTex = wallTexture(0x4a4a4a, true);
batakTex.repeat.set(4, 1.5);
const batakoMat = new THREE.MeshStandardMaterial({
  map: batakTex,
  roughness: 0.82,
  metalness: 0.02,
});

/* -----------------------------------------------------------------------
   HELPER: tambah plane ke dinding kiri (X=0, menghadap +X)
----------------------------------------------------------------------- */
function wallPlane(w, h, y, z, mat) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.rotation.y = Math.PI / 2;
  m.position.set(0.001, y, z);
  m.receiveShadow = true;
  root.add(m);
}

/* -----------------------------------------------------------------------
   LATAR PEMANDANGAN (skyline) — satu plane besar di luar dinding, X=-1.8
   Menutupi seluruh panjang dinding kiri di bagian jendela
----------------------------------------------------------------------- */
const skyTotal = ROOM_L;
const skyH     = WIN_H * 1.4;
const skyMesh  = new THREE.Mesh(
  new THREE.PlaneGeometry(skyTotal, skyH),
  new THREE.MeshBasicMaterial({ map: skylineTexture(), side: THREE.DoubleSide })
);
skyMesh.rotation.y = Math.PI / 2;
skyMesh.position.set(-1.8, WIN_SILL_Y + WIN_H * 0.5, ROOM_L / 2);
root.add(skyMesh);

/* -----------------------------------------------------------------------
   DINDING SEGMEN STATIS (bagian yang tidak punya kaca)
   1. Tembok atas krem  — sepanjang ROOM_L penuh
   2. Batako bawah      — sepanjang ROOM_L penuh
   3. Pilar antar unit  — di antara setiap jendela (kecuali di area AC)
   4. Area AC tengah    — plester krem WIN_SILL_Y…WIN_TOP_Y
----------------------------------------------------------------------- */

// 1. Tembok atas krem (WIN_TOP_Y → ROOM_H), full panjang
wallPlane(ROOM_L, ROOM_H - WIN_TOP_Y,
  WIN_TOP_Y + (ROOM_H - WIN_TOP_Y) / 2, ROOM_L / 2, plasterMat);

// 2. Batako bawah (0 → WIN_SILL_Y), full panjang
wallPlane(ROOM_L, WIN_SILL_Y,
  WIN_SILL_Y / 2, ROOM_L / 2, batakoMat);

// 3. Area AC solid (WIN_SILL_Y → WIN_TOP_Y) — plester krem
wallPlane(AC_GAP, WIN_H,
  WIN_SILL_Y + WIN_H / 2, AC_Z, plasterMat);

/* -----------------------------------------------------------------------
   FUNGSI BANGUN SEGMEN JENDELA
   Mengisi panjang `segLen` mulai dari Z = `segStart` dengan unit-unit
   jendela, diselingi pilar GAP_COL di antaranya.
----------------------------------------------------------------------- */
function buildWindowSegment(segStart, segLen) {
  if (segLen <= 0) return;

  // Hitung berapa unit yang pas — minimal 1
  const usable    = segLen;
  const nUnits    = Math.max(1, Math.round(usable / (UNIT_W_TGT + GAP_COL)));
  const totalGap  = GAP_COL * (nUnits - 1);
  const unitW     = (usable - totalGap) / nUnits;

  // Pilar di antara unit (dinding antara)
  for (let i = 1; i < nUnits; i++) {
    const pz = segStart + i * (unitW + GAP_COL) - GAP_COL / 2;
    wallPlane(GAP_COL, WIN_H, WIN_SILL_Y + WIN_H / 2, pz, plasterMat);
  }

  // Bangun tiap unit jendela
  for (let i = 0; i < nUnits; i++) {
    const zCenter = segStart + i * (unitW + GAP_COL) + unitW / 2;
    buildWindowUnit(zCenter, unitW);
  }
}

/* -----------------------------------------------------------------------
   SATU UNIT JENDELA
   • Frame oranye: sill, header, stile kiri/kanan, transom bar, 2 mullion
   • Kaca 3 panel (bawah lebar + transom atas)
   • Gorden di kiri & kanan
----------------------------------------------------------------------- */
function buildWindowUnit(zCenter, unitW) {
  const grp = new THREE.Group();
  const hw   = unitW / 2;
  const bY   = WIN_SILL_Y;
  const tY   = WIN_TOP_Y;
  const tBar = tY - TRANSOM_H;

  // -- Frame luar --
  // Sill bawah
  grp.add(makeBox(FRAME_T * 2.0, FRAME_W * 1.1, unitW + FRAME_W,
    0, bY - FRAME_W * 0.35, 0));
  // Header atas
  grp.add(makeBox(FRAME_T * 1.6, FRAME_W, unitW + FRAME_W,
    0, tY + FRAME_W * 0.4, 0));
  // Stile kiri
  grp.add(makeBox(FRAME_T, WIN_H + FRAME_W, FRAME_W,
    0, bY + WIN_H / 2, -hw));
  // Stile kanan
  grp.add(makeBox(FRAME_T, WIN_H + FRAME_W, FRAME_W,
    0, bY + WIN_H / 2,  hw));
  // Transom bar
  grp.add(makeBox(FRAME_T * 0.75, FRAME_W * 0.85, unitW - FRAME_W,
    0, tBar, 0));

  // -- Mullion (2 tiang vertikal, bagi 3 panel) --
  const panelW = (unitW - FRAME_W * 2) / 3;
  for (let col = 1; col < 3; col++) {
    const mz = -hw + FRAME_W + panelW * col;
    grp.add(makeBox(FRAME_T * 0.65, WIN_H, MULLION_W, 0, bY + WIN_H / 2, mz));
  }

  // -- Kaca per panel (bawah + transom) --
  for (let col = 0; col < 3; col++) {
    const gz  = -hw + FRAME_W + panelW * col + panelW / 2;
    const gw  = panelW - MULLION_W * 0.6;

    // Panel bawah
    const lH = tBar - bY - FRAME_W * 0.5;
    addGlass(grp, gw - 0.015, lH - 0.015,
      0.012, bY + FRAME_W * 0.3 + lH / 2, gz);

    // Panel transom
    const uH = tY - tBar - FRAME_W * 0.5;
    addGlass(grp, gw - 0.015, uH - 0.015,
      0.012, tBar + FRAME_W * 0.3 + uH / 2, gz);
  }

  // -- Gorden di kiri & kanan --
  const cW = Math.min(0.28, unitW * 0.20);
  const cH = WIN_H + 0.15;
  for (const side of [-1, 1]) {
    const geo  = new THREE.PlaneGeometry(cW, cH, 12, 1);
    const attr = geo.attributes.position;
    for (let v = 0; v < attr.count; v++) {
      const lx = attr.getX(v);
      attr.setZ(v, Math.sin((lx / cW + 0.5) * Math.PI * 5) * 0.038);
    }
    geo.computeVertexNormals();
    const curtain = new THREE.Mesh(geo, curtainMat);
    curtain.rotation.y = Math.PI / 2;
    curtain.position.set(0.09, WIN_SILL_Y + cH / 2 - 0.07,
      side * (hw - cW / 2 + 0.01));
    curtain.castShadow = true;
    grp.add(curtain);
  }

  grp.position.set(0.015, 0, zCenter);
  root.add(grp);
}

/* -----------------------------------------------------------------------
   HELPER GEOMETRI
----------------------------------------------------------------------- */
function makeBox(sx, sy, sz, lx, ly, lz) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), orangeFrameMat);
  m.position.set(lx, ly, lz);
  return m;
}

function addGlass(grp, w, h, lx, ly, lz) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
  m.rotation.y = Math.PI / 2;
  m.position.set(lx, ly, lz);
  grp.add(m);
}

/* -----------------------------------------------------------------------
   BANGUN SEGMEN JENDELA — DEPAN & BELAKANG
   Segmen depan : Z  0        → AC_START   (panjang AC_START)
   Segmen belakang: Z AC_END  → ROOM_L     (panjang ROOM_L - AC_END)
----------------------------------------------------------------------- */
buildWindowSegment(0, AC_START);
buildWindowSegment(AC_END, ROOM_L - AC_END);
