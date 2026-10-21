import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ROOM_W, ROOM_L, ROOM_H } from "./konfigurasi.js";
import { renderer } from "./scene-dasar.js";

/* ---------------------------------------------------------------------
   KAMERA
   Dua kamera perspektif diposisikan meniru dua foto referensi ruangan
   ("1 - Pintu Masuk" dan "2 - Ke Layar"). OrbitControls saat ini selalu
   terpasang ke camera1 (kamera aktif default).
--------------------------------------------------------------------- */
export const camera1 = new THREE.PerspectiveCamera(52, window.innerWidth/window.innerHeight, 0.1, 60);
camera1.position.set(2.1, 1.75, 1.8);
const camera1Target = new THREE.Vector3(4.2, 1.3, 7.8);
camera1.lookAt(camera1Target);

export const camera2 = new THREE.PerspectiveCamera(52, window.innerWidth/window.innerHeight, 0.1, 60);
camera2.position.set(5.0, 1.7, 9.8);
const camera2Target = new THREE.Vector3(4.8, 1.2, 0.35);
camera2.lookAt(camera2Target);

export let activeCamera = camera1;

export const controls = new OrbitControls(camera1, renderer.domElement);
controls.target.copy(camera1Target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 1.15;
controls.panSpeed = 0.8;
controls.screenSpacePanning = true;
controls.enablePan = true;
controls.maxDistance = 10.5;
controls.minDistance = 0.6;
controls.minPolarAngle = Math.PI * 0.16;
controls.maxPolarAngle = Math.PI * 0.68;

// batas sederhana agar kamera tidak menembus dinding/lantai/plafon
function clampCameraToRoom(cam) {
  const m = 0.35;
  cam.position.x = THREE.MathUtils.clamp(cam.position.x, m, ROOM_W - m);
  cam.position.z = THREE.MathUtils.clamp(cam.position.z, m, ROOM_L - m);
  cam.position.y = THREE.MathUtils.clamp(cam.position.y, 0.5, ROOM_H - 0.25);
}

export { clampCameraToRoom };
