import * as THREE from "three";
import { BOSS_DESK_Z } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";

/* ---------------------------------------------------------------------
   KIT PERALATAN IoT (ESP32 + breadboard + sensor)
   buildIoTLabKit() diekspor karena juga dipakai berulang kali di
   furnitur/konsol-kayu.js untuk mengisi rak kayu panjang.
--------------------------------------------------------------------- */
function buildIoTLabKit(centerX, centerZ, topY, scale = 1) {
  const kit = new THREE.Group();
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x176b52, roughness: 0.42, metalness: 0.18 });
  const whiteMatLocal = new THREE.MeshStandardMaterial({ color: 0xf1f0e9, roughness: 0.65 });
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xc5a65a, roughness: 0.28, metalness: 0.72 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x292d30, roughness: 0.38, metalness: 0.3 });
  const redCableMat = new THREE.MeshStandardMaterial({ color: 0xe04b32, roughness: 0.58 });
  const blueCableMat = new THREE.MeshStandardMaterial({ color: 0x2f72d1, roughness: 0.5 });

  const esp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.13), pcbMat);
  esp.position.set(0.22, 0.02, -0.09);
  kit.add(esp);
  for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.035, 0.012), pinMat);
    pin.position.set(0.22 + side * 0.105, 0.04, -0.14 + i * 0.014);
    kit.add(pin);
  }
  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.028, 0.07), new THREE.MeshStandardMaterial({ color: 0x9ea5a7, roughness: 0.3, metalness: 0.65 }));
  usb.position.set(0.22, 0.03, -0.17);
  const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.055), new THREE.MeshStandardMaterial({ color: 0x161b1d, roughness: 0.3, metalness: 0.25 }));
  espChip.position.set(0.22, 0.035, -0.075);
  const flashChip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.01, 0.028), darkMat);
  flashChip.position.set(0.16, 0.034, -0.075);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 0.025), pinMat);
  antenna.position.set(0.22, 0.033, -0.015);
  const bootButton = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), whiteMatLocal);
  bootButton.position.set(0.13, 0.035, -0.14);
  const enableButton = bootButton.clone();
  enableButton.position.x = 0.31;
  const espLed = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4de08c, emissive: 0x27b867, emissiveIntensity: 0.85 }));
  espLed.position.set(0.28, 0.039, -0.075);
  kit.add(usb, espChip, flashChip, antenna, bootButton, enableButton, espLed);

  const breadboard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.026, 0.18), whiteMatLocal);
  breadboard.position.set(-0.05, 0.012, 0.02);
  kit.add(breadboard);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 14; col++) {
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), pinMat);
    socket.position.set(-0.19 + col * 0.021, 0.034, -0.025 + row * 0.022);
    kit.add(socket);
  }

  const sensorBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.1), pcbMat);
  sensorBoard.position.set(0.23, 0.02, 0.13);
  const sensorCap = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.06, 0.065), whiteMatLocal);
  sensorCap.position.set(0.23, 0.055, 0.13);
  kit.add(sensorBoard, sensorCap);
  const ultrasonic = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.1), pcbMat);
  ultrasonic.position.set(-0.05, 0.02, -0.2);
  kit.add(ultrasonic);
  for (const x of [-0.085, -0.015]) {
    const transducer = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 20), new THREE.MeshStandardMaterial({ color: 0xc2c5c4, roughness: 0.42, metalness: 0.3 }));
    transducer.rotation.x = Math.PI / 2;
    transducer.position.set(x, 0.032, -0.2);
    kit.add(transducer);
  }
  const powerPack = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), darkMat);
  powerPack.position.set(-0.28, 0.045, -0.1);
  kit.add(powerPack);
  const powerLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4de08c, emissive: 0x27b867, emissiveIntensity: 0.8 }));
  powerLed.position.set(-0.28, 0.082, -0.15);
  kit.add(powerLed);

  const redCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.047, -0.17), new THREE.Vector3(0.18, 0.075, -0.1), new THREE.Vector3(0.08, 0.05, 0.02)
  ]);
  const blueCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.05, -0.02), new THREE.Vector3(0.24, 0.075, 0.08), new THREE.Vector3(0.23, 0.05, 0.13)
  ]);
  kit.add(new THREE.Mesh(new THREE.TubeGeometry(redCurve, 16, 0.008, 8, false), redCableMat));
  kit.add(new THREE.Mesh(new THREE.TubeGeometry(blueCurve, 16, 0.006, 8, false), blueCableMat));
  kit.position.set(centerX, topY, centerZ);
  kit.scale.setScalar(scale);
  kit.castShadow = true;
  root.add(kit);
  return kit;
}
buildIoTLabKit(4.85, BOSS_DESK_Z - 0.25, 0.83, 1.22);

export { buildIoTLabKit };
