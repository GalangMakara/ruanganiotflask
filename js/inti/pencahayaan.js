import * as THREE from "three";
import { ROOM_W, ROOM_L, ROOM_H, BOSS_DESK_Z } from "./konfigurasi.js";
import { scene } from "./scene-dasar.js";

/* ---------------------------------------------------------------------
   PENCAHAYAAN
   Hemisphere + ambient untuk fill light, dua directional light meniru
   sinar matahari dari jendela, dan lampu panel plafon (3 baris x 3 kolom)
   yang intensitasnya diberi efek "flicker" halus di loop animasi (main.js).
   
   Setiap baris lampu dapat dikontrol secara independen melalui dashboard.
--------------------------------------------------------------------- */
scene.add(new THREE.HemisphereLight(0xf6efe0, 0x3a3327, 0.55));

const ambient = new THREE.AmbientLight(0xfff2df, 0.28);
scene.add(ambient);

// cahaya matahari masuk dari jendela (sisi X = ROOM_W)
const sun = new THREE.DirectionalLight(0xfff3da, 1.15);
sun.position.set(ROOM_W + 4, ROOM_H + 3, ROOM_L * 0.4);
sun.target.position.set(ROOM_W * 0.3, 0.8, ROOM_L * 0.45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 30;
sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
sun.shadow.bias = -0.0015;
scene.add(sun, sun.target);

// cahaya masuk dari jendela kaca dinding kiri (area meja bos)
const leftSun = new THREE.DirectionalLight(0xfff3da, 0.55);
leftSun.position.set(-4, ROOM_H + 2, BOSS_DESK_Z);
leftSun.target.position.set(ROOM_W * 0.4, 0.9, BOSS_DESK_Z);
scene.add(leftSun, leftSun.target);

// lampu plafon (panel fluorescent) — susunan 3 baris x 3 kolom
// panelLights[0..2] = baris 1 (depan, dekat layar)
// panelLights[3..5] = baris 2 (tengah)
// panelLights[6..8] = baris 3 (belakang, dekat meja bos)
const panelLights = [];
const panelMeshes = [];   // untuk mengontrol emissive material saat lampu mati
const rowStates = [true, true, true]; // state nyala/mati per baris
const BASE_INTENSITY = 4.2;

function addCeilingPanel(x, z) {
  const geo = new THREE.PlaneGeometry(1.15, 0.55);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6df, emissiveIntensity: 1.6, roughness:0.5 });
  const panel = new THREE.Mesh(geo, mat);
  panel.rotation.x = Math.PI/2;
  panel.position.set(x, ROOM_H - 0.03, z);
  scene.add(panel);
  panelMeshes.push(panel);

  const pl = new THREE.PointLight(0xfff3da, BASE_INTENSITY, 6.5, 2.1);
  pl.position.set(x, ROOM_H - 0.35, z);
  pl.castShadow = false;
  scene.add(pl);
  panelLights.push(pl);
}
const panelCols = [ROOM_W*0.28, ROOM_W*0.5, ROOM_W*0.72];
const panelRows = [ROOM_L*0.22, ROOM_L*0.5, ROOM_L*0.78];
panelRows.forEach(z => panelCols.forEach(x => addCeilingPanel(x, z)));

/**
 * Toggle lampu baris tertentu (0=baris1, 1=baris2, 2=baris3)
 * @param {number} rowIndex 
 * @param {boolean} on 
 */
function setLampuBaris(rowIndex, on) {
  rowStates[rowIndex] = on;
  for (let col = 0; col < 3; col++) {
    const idx = rowIndex * 3 + col;
    const light = panelLights[idx];
    const mesh = panelMeshes[idx];
    if (on) {
      light.intensity = BASE_INTENSITY;
      mesh.material.emissiveIntensity = 1.6;
      mesh.material.color.set(0xffffff);
    } else {
      light.intensity = 0;
      mesh.material.emissiveIntensity = 0;
      mesh.material.color.set(0xbbbbbb);
    }
  }
}

export { panelLights, panelMeshes, rowStates, setLampuBaris, BASE_INTENSITY };
