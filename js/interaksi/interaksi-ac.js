import * as THREE from "three";
import { camera1, controls } from "../inti/kamera.js";
import { renderer } from "../inti/scene-dasar.js";
import { acUnits } from "../furnitur/ac.js";
import { tweenCameraTo } from "../inti/animasi.js";

/* ---------------------------------------------------------------------
   INTERAKSI AC
   - Klik unit AC  -> kamera zoom mendekat lurus menghadap AC tsb,
     lalu muncul 2 tombol: "Lihat Lebih Detail" & "Keluar".
   - Tombol "Lihat Lebih Detail" -> BERPINDAH HALAMAN ke detail.html,
     yaitu halaman pembelajaran berisi model 3D bongkar-pasang AC
     (semua komponen di dalamnya) yang bisa diputar bebas & diberi
     penjelasan tiap bagian.
   - Tombol "Keluar" -> kamera kembali ke posisi semula, orbit kamera
     diaktifkan lagi.
--------------------------------------------------------------------- */

let mode = "idle"; // idle | animating | zoomed
let activeUnit = null;
let savedCamPos = null;
let savedTarget = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const appEl = document.getElementById("app");
const hintEl = document.getElementById("hint");

/* ---------- UI: panel tombol ---------- */
const panel = document.createElement("div");
panel.id = "ac-panel";
panel.innerHTML = `
  <button id="ac-btn-detail" class="ac-btn">Lihat Lebih Detail</button>
  <button id="ac-btn-keluar" class="ac-btn secondary">Keluar</button>
`;
appEl.appendChild(panel);

const btnDetail = panel.querySelector("#ac-btn-detail");
const btnKeluar = panel.querySelector("#ac-btn-keluar");

function findACRoot(obj) {
  let o = obj;
  while (o && !o.userData.isAC) o = o.parent;
  return o;
}

/* ---------- klik pada AC ---------- */
renderer.domElement.addEventListener("click", (ev) => {
  if (mode !== "idle") return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera1);

  const groups = acUnits.map(u => u.group);
  const hits = raycaster.intersectObjects(groups, true);
  if (hits.length === 0) return;

  const rootGrp = findACRoot(hits[0].object);
  if (!rootGrp) return;
  const unit = acUnits.find(u => u.group === rootGrp);
  if (unit) zoomToAC(unit);
});

function zoomToAC(unit) {
  mode = "animating";
  activeUnit = unit;
  controls.enabled = false;
  savedCamPos = camera1.position.clone();
  savedTarget = controls.target.clone();

  const acPos = new THREE.Vector3();
  unit.group.getWorldPosition(acPos);
  const dir = new THREE.Vector3();
  unit.group.getWorldDirection(dir);

  const distance = 1.6;
  const camPos = acPos.clone().addScaledVector(dir, distance);
  camPos.y = acPos.y + 0.15;

  if (hintEl) hintEl.style.opacity = "0";

  tweenCameraTo(camera1, controls, camPos, acPos, 950, () => {
    mode = "zoomed";
    panel.classList.add("show");
  });
}

/* ---------- kembali ke posisi kamera semula ---------- */
function kembaliKeRuangan() {
  mode = "animating";
  panel.classList.remove("show");
  tweenCameraTo(camera1, controls, savedCamPos, savedTarget, 850, () => {
    mode = "idle";
    controls.enabled = true;
    activeUnit = null;
    if (hintEl) { hintEl.style.transition = "opacity .5s ease"; hintEl.style.opacity = ""; }
  });
}

/* ---------- tombol "Lihat Lebih Detail" -> pindah ke halaman detail ---------- */
btnDetail.addEventListener("click", () => {
  if (!activeUnit) return;
  const unitId = encodeURIComponent(activeUnit.id);
  window.location.href = `detail.html?unit=${unitId}`;
});

/* ---------- tombol "Keluar" ---------- */
btnKeluar.addEventListener("click", () => {
  if (!activeUnit || mode !== "zoomed") return;
  kembaliKeRuangan();
});

/* ---------- dipanggil tiap frame dari render loop utama ---------- */
export function update() {
  // Pembongkaran & penjelasan komponen kini sepenuhnya dipindahkan ke
  // halaman tersendiri (detail.html), jadi tidak ada lagi animasi yang
  // perlu diperbarui di sini setiap frame.
}
