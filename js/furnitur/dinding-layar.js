import * as THREE from "three";
import { ROOM_W, ROOM_H } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { metalBlackMat } from "../inti/material.js";
import { whiteboardTexture } from "../inti/tekstur.js";

export let mainScreenMesh = null;

/* =====================================================================
   DINDING DEPAN (Z = 0) — sesuai foto referensi:

   ┌─────────────────────────────────────────────────┐  ROOM_H
   │          plafon / dinding atas krem             │
   ├──────────────────────────────────────────────────┤  WALL_TOP ≈ 2.95
   │ [slat]│[col]│         LAYAR LED           │[col]│[slat] │
   │ krem  │coklat│      hitam matte           │coklat│krem  │
   ├───────┴──────┴────────────────────────────┴──────┴───────┤  CONSOLE_H ≈ 0.80
   │          KONSOL / MEJA KAYU PANJANG                      │
   └──────────────────────────────────────────────────────────┘  Y=0

   Elemen:
   1. Dinding belakang penuh (plester krem muda)
   2. Panel slat kayu krem bergerigi vertikal — kiri & kanan layar
   3. Kolom kayu coklat tua vertikal — batas antara slat & layar
   4. Trim/border horizontal kayu di atas layar
   5. Layar LED hitam matte besar di tengah
   6. Konsol meja kayu panjang bawah
   7. Speaker kiri & kanan di atas konsol
===================================================================== */

/* -----------------------------------------------------------------------
   DIMENSI
----------------------------------------------------------------------- */
const CONSOLE_H    = 0.80;   // tinggi konsol meja
const CONSOLE_D    = 0.45;   // kedalaman konsol
const WALL_TOP     = ROOM_H; // layar mepet plafon
const SCREEN_W     = 4.60;   // lebar layar LED (dominan di foto)
const SCREEN_H     = 2.05;   // tinggi layar LED
const SCREEN_CX    = ROOM_W / 2;            // pusat horizontal layar
const SCREEN_BOT_Y = CONSOLE_H + 0.06;      // layar mulai tepat di atas konsol
const SCREEN_TOP_Y = SCREEN_BOT_Y + SCREEN_H;
const SCREEN_MID_Y = SCREEN_BOT_Y + SCREEN_H / 2;

// Kolom kayu coklat di kiri & kanan layar
const COL_W   = 0.12;    // lebar kolom
const COL_D   = 0.10;    // kedalaman (menonjol dari dinding)
const COL_H   = SCREEN_H + 0.08;
const COL_LX  = SCREEN_CX - SCREEN_W / 2 - COL_W / 2;   // pusat kolom kiri
const COL_RX  = SCREEN_CX + SCREEN_W / 2 + COL_W / 2;   // pusat kolom kanan

// Panel slat krem — dari tepi ruangan ke kolom
const SLAT_LEFT_W  = COL_LX - COL_W / 2;            // lebar panel slat kiri
const SLAT_RIGHT_W = ROOM_W - (COL_RX + COL_W / 2); // lebar panel slat kanan

/* -----------------------------------------------------------------------
   MATERIAL LOKAL
----------------------------------------------------------------------- */
// Plester krem (dinding belakang + atas)
const plasterMat = new THREE.MeshStandardMaterial({
  color: 0xf2e8d0,
  roughness: 0.88,
});

// Kayu krem muda untuk slat dan konsol
const woodCreamMat = new THREE.MeshStandardMaterial({
  color: 0xe8ddb8,
  roughness: 0.55,
  metalness: 0.02,
});

// Kayu coklat tua untuk kolom & trim
const woodDarkAccentMat = new THREE.MeshStandardMaterial({
  color: 0x5a3018,
  roughness: 0.40,
  metalness: 0.04,
});

// Layar LED — hitam matte, sedikit emissive biru saat ON
const ledScreenMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.75,
  metalness: 0.10,
  emissive: new THREE.Color(0x3a8fff),
  emissiveIntensity: 0.45,
});

// Bezel tipis layar (sangat tipis, hampir tidak kelihatan seperti LED wall)
const bezelMat = new THREE.MeshStandardMaterial({
  color: 0x0d0d0d,
  roughness: 0.5,
  metalness: 0.6,
});

/* -----------------------------------------------------------------------
   HELPER
----------------------------------------------------------------------- */
function box(sx, sy, sz, mat, lx, ly, lz) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(lx, ly, lz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* -----------------------------------------------------------------------
   TEKSTUR SLAT KAYU (procedural canvas)
   Alur vertikal rapat mirip acoustic slat panel di foto
----------------------------------------------------------------------- */
function slatTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 512;
  const ctx = c.getContext("2d");

  // base krem
  ctx.fillStyle = "#e6dab0";
  ctx.fillRect(0, 0, 128, 512);

  // garis groove vertikal — setiap ~6px
  const slotW = 6;
  for (let x = 0; x < 128; x += slotW) {
    // sisi kiri slot (shadow)
    ctx.fillStyle = "rgba(80,55,20,0.22)";
    ctx.fillRect(x, 0, 1.5, 512);
    // sisi kanan slot (highlight)
    ctx.fillStyle = "rgba(255,240,200,0.18)";
    ctx.fillRect(x + slotW - 1.5, 0, 1.5, 512);
  }

  // serat kayu halus (horizontal samar)
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * 512;
    ctx.strokeStyle = `rgba(90,60,20,${0.03 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.8 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + (Math.random() - 0.5) * 8);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const slatTex = slatTexture();
const slatMat = new THREE.MeshStandardMaterial({
  map: slatTex,
  roughness: 0.60,
  metalness: 0.01,
});

/* -----------------------------------------------------------------------
   BUILD DINDING DEPAN
----------------------------------------------------------------------- */
function buildScreenWall() {
  const grp = new THREE.Group();

  /* ── 1. DINDING BELAKANG PENUH (plester krem) ── */
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_H), plasterMat
  );
  backWall.position.set(ROOM_W / 2, ROOM_H / 2, 0.001);
  backWall.receiveShadow = true;
  grp.add(backWall);

  /* ── 2. PANEL SLAT KAYU (kiri & kanan layar) ── */
  // Slat kiri — dari X=0 ke tepi kiri kolom
  if (SLAT_LEFT_W > 0.05) {
    slatTex.repeat.set(SLAT_LEFT_W * 5, 1);
    const slatL = new THREE.Mesh(
      new THREE.PlaneGeometry(SLAT_LEFT_W, SCREEN_H),
      slatMat.clone()   // clone agar repeat berbeda tiap sisi
    );
    slatL.material.map = slatTex.clone();
    slatL.material.map.repeat.set(SLAT_LEFT_W * 5, 1);
    slatL.material.map.needsUpdate = true;
    slatL.position.set(SLAT_LEFT_W / 2, SCREEN_MID_Y, 0.025);
    slatL.receiveShadow = true;
    grp.add(slatL);
  }

  // Slat kanan — dari tepi kanan kolom ke X=ROOM_W
  if (SLAT_RIGHT_W > 0.05) {
    const slatR = new THREE.Mesh(
      new THREE.PlaneGeometry(SLAT_RIGHT_W, SCREEN_H),
      slatMat.clone()
    );
    slatR.material.map = slatTex.clone();
    slatR.material.map.repeat.set(SLAT_RIGHT_W * 5, 1);
    slatR.material.map.needsUpdate = true;
    slatR.position.set(ROOM_W - SLAT_RIGHT_W / 2, SCREEN_MID_Y, 0.025);
    slatR.receiveShadow = true;
    grp.add(slatR);
  }

  /* ── 3. KOLOM KAYU COKLAT (kiri & kanan layar) ── */
  const colGeom = new THREE.BoxGeometry(COL_W, COL_H, COL_D);
  const colL = new THREE.Mesh(colGeom, woodDarkAccentMat);
  colL.position.set(COL_LX, SCREEN_MID_Y, COL_D / 2);
  colL.castShadow = true;
  grp.add(colL);

  const colR = new THREE.Mesh(colGeom, woodDarkAccentMat);
  colR.position.set(COL_RX, SCREEN_MID_Y, COL_D / 2);
  colR.castShadow = true;
  grp.add(colR);

  /* ── 4. TRIM HORIZONTAL DI ATAS LAYAR ── */
  // Batang kayu krem tipis memanjang di atas layar, dari kolom ke kolom
  const trimTopW = SCREEN_W + COL_W * 2;
  const trimTop = new THREE.Mesh(
    new THREE.BoxGeometry(trimTopW, 0.06, COL_D * 0.85),
    woodCreamMat
  );
  trimTop.position.set(SCREEN_CX, SCREEN_TOP_Y + 0.03, COL_D * 0.42);
  trimTop.castShadow = true;
  grp.add(trimTop);

  // Ridge kecil (tonjolan dekoratif kecil di tepi atas trim)
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(trimTopW + 0.02, 0.016, 0.018),
    woodDarkAccentMat
  );
  ridge.position.set(SCREEN_CX, SCREEN_TOP_Y + 0.068, 0.06);
  grp.add(ridge);

  /* ── 5. LAYAR LED HITAM MATTE ── */
  // Bezel tipis (frame layar)
  const BEZEL = 0.022;
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(SCREEN_W + BEZEL * 2, SCREEN_H + BEZEL * 2, 0.055),
    bezelMat
  );
  bezel.position.set(SCREEN_CX, SCREEN_MID_Y, 0.027);
  grp.add(bezel);

  // Panel layar utama
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    ledScreenMat
  );
  screen.position.set(SCREEN_CX, SCREEN_MID_Y, 0.057);
  mainScreenMesh = screen;
  grp.add(screen);

  // Efek refleksi permukaan — overlay tipis glossy
  const gloss = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.025,
      roughness: 0.05,
      metalness: 0.0,
      depthWrite: false,
    })
  );
  gloss.position.set(SCREEN_CX, SCREEN_MID_Y, 0.060);
  grp.add(gloss);

  /* ── 6. KONSOL / MEJA KAYU PANJANG ── */
  const consoleW = ROOM_W - 0.12;

  // Meja utama
  const consoleBody = box(
    consoleW, CONSOLE_H, CONSOLE_D,
    woodCreamMat,
    ROOM_W / 2, CONSOLE_H / 2, CONSOLE_D / 2
  );
  grp.add(consoleBody);

  // Top surface (sedikit lebih terang)
  const consoleSurf = new THREE.Mesh(
    new THREE.BoxGeometry(consoleW, 0.022, CONSOLE_D),
    woodDarkAccentMat
  );
  consoleSurf.position.set(ROOM_W / 2, CONSOLE_H + 0.011, CONSOLE_D / 2);
  grp.add(consoleSurf);

  // Panel groove vertikal di muka konsol (ribs seperti foto)
  const ribCount = Math.floor(consoleW / 0.12);
  const ribW = consoleW / ribCount;
  for (let i = 0; i < ribCount; i++) {
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, CONSOLE_H - 0.06, 0.006),
      woodDarkAccentMat
    );
    groove.position.set(
      0.06 + i * ribW,
      CONSOLE_H / 2,
      CONSOLE_D - 0.003
    );
    grp.add(groove);
  }

  /* ── 7. SPEAKER DI UJUNG KONSOL (kiri & kanan) ── */
  function buildSpeaker(cx) {
    const s = new THREE.Group();

    // body speaker horizontal
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.10, 0.14, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.6, metalness: 0.4 })
    );
    s.add(body);

    // grille fabric
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.082, 0.008),
      new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.85 })
    );
    grille.position.set(0, 0, 0.114);
    s.add(grille);

    // LED strip tipis di atas speaker
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.80, 0.007, 0.006),
      new THREE.MeshStandardMaterial({
        color: 0x60d8ff,
        emissive: new THREE.Color(0x40c8f0),
        emissiveIntensity: 1.0,
      })
    );
    led.position.set(0, 0.075, 0.108);
    s.add(led);

    s.position.set(cx, CONSOLE_H + 0.10, CONSOLE_D * 0.55);
    s.castShadow = true;
    return s;
  }

  grp.add(buildSpeaker(0.65));
  grp.add(buildSpeaker(ROOM_W - 0.65));

  root.add(grp);
}

buildScreenWall();

/* -----------------------------------------------------------------------
   WHITEBOARD PORTABEL (tidak berubah)
----------------------------------------------------------------------- */
function buildWhiteboard(x, z, rotY) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.6 });
  const metalBlack = metalBlackMat;
  const grp = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.15),
    new THREE.MeshStandardMaterial({ map: whiteboardTexture(), roughness: 0.35 })
  );
  board.position.y = 1.55;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.23, 0.03), whiteMat);
  frame.position.y = 1.55;
  frame.position.z = -0.02;
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), metalBlack);
  standPole.position.y = 0.75;
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.2), metalBlack);
  footL.position.set(0, 0.03, 0);
  const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8);
  for (const dx of [-0.24, 0.24]) {
    for (const dz of [-0.08, 0.08]) {
      const wm = new THREE.Mesh(wheelGeo, metalBlack);
      wm.rotation.z = Math.PI / 2;
      wm.position.set(dx, 0.03, dz);
      grp.add(wm);
    }
  }
  grp.add(board, frame, standPole, footL);
  grp.position.set(x, 0, z);
  grp.rotation.y = rotY;
  root.add(grp);
}

buildWhiteboard(6.55, 1.05, -Math.PI * 0.06);
