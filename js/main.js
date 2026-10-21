import { scene, renderer } from "./inti/scene-dasar.js";
import { camera1, camera2, activeCamera, controls, clampCameraToRoom } from "./inti/kamera.js";
import { panelLights, rowStates, BASE_INTENSITY } from "./inti/pencahayaan.js";

// Struktur ruangan (lantai, plafon, dinding, jendela, pintu)
import "./ruangan/struktur.js";
import "./ruangan/jendela-kiri.js";
import "./ruangan/jendela-kanan.js";
import "./ruangan/pintu.js";

// Furnitur & perlengkapan
import "./furnitur/ac.js";
import "./furnitur/rak-logam.js";
import "./furnitur/konsol-kayu.js";
import { mainScreenMesh } from "./furnitur/dinding-layar.js";
import "./furnitur/meja-samping-layar.js";
import "./furnitur/meja-depan.js";
import "./furnitur/lemari-arsip.js";
import "./furnitur/meja-rapat.js";
import "./furnitur/kursi.js";

// Interaksi: klik AC -> zoom & bongkar mesin dalam
import { update as updateInteraksiAC } from "./interaksi/interaksi-ac.js";

// Animasi AC (kipas + partikel udara)
import { initACAnimation, updateACAnimation } from "./interaksi/animasi-ac.js";

// Dashboard IoT — kontrol 6 perangkat
import { registerScreenMesh } from "./interaksi/dashboard.js";
registerScreenMesh(mainScreenMesh);

// Init animasi AC setelah semua modul dimuat
initACAnimation();

/* ---------------------------------------------------------------------
   RESIZE / RENDER LOOP
--------------------------------------------------------------------- */
window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  [camera1, camera2].forEach(c => { c.aspect = w/h; c.updateProjectionMatrix(); });
});

let flicker = 0;
function animate() {
  requestAnimationFrame(animate);
  flicker += 0.02;

  // Flicker hanya berlaku pada lampu yang sedang ON
  panelLights.forEach((pl, i) => {
    const rowIdx = Math.floor(i / 3);
    if (rowStates[rowIdx]) {
      const shimmer = BASE_INTENSITY + Math.sin(flicker * 3.1) * 0.05;
      pl.intensity = shimmer + Math.sin(flicker + i) * 0.03;
    }
  });

  clampCameraToRoom(activeCamera);
  controls.update();
  updateInteraksiAC();
  updateACAnimation();
  renderer.render(scene, activeCamera);
}

const loadingEl = document.getElementById("loading");
requestAnimationFrame(() => {
  setTimeout(() => {
    loadingEl.style.opacity = "0";
    setTimeout(() => loadingEl.remove(), 650);
  }, 350);
});

animate();