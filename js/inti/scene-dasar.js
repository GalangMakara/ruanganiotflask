import * as THREE from "three";

/* ---------------------------------------------------------------------
   SCENE & RENDERER DASAR
   Modul ini membuat objek THREE.Scene, WebGLRenderer, dan grup "root"
   tempat seluruh dinding & furnitur ditambahkan. Modul lain cukup
   mengimpor { root } untuk menambahkan objek ke dalam ruangan.
--------------------------------------------------------------------- */
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe7e2d7);
scene.fog = new THREE.Fog(0xcfe1f2, 14, 30);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById("app").prepend(renderer.domElement);

// grup induk: semua dinding & furnitur ditambahkan ke sini
export const root = new THREE.Group();
scene.add(root);
