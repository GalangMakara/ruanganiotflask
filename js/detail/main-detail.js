import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildACDetailModel } from "./model-ac-detail.js";

/* ---------------------------------------------------------------------
   HALAMAN DETAIL — PEMBELAJARAN KOMPONEN AC
   Halaman mandiri (bukan bagian scene ruang rapat) yang menampilkan
   model 3D unit AC dalam kondisi terbongkar, bisa diputar & di-zoom
   bebas, dengan daftar komponen di sisi kanan. Klik komponen (di
   daftar ATAU langsung di model 3D) untuk menyorot bagian tsb, kamera
   otomatis mendekat, dan penjelasan fungsinya ditampilkan.
--------------------------------------------------------------------- */

const appEl = document.getElementById("app");
const params = new URLSearchParams(window.location.search);
const unitParam = params.get("unit");
const subtitleEl = document.getElementById("detail-subtitle");
if (unitParam && subtitleEl) {
  subtitleEl.textContent = `Unit: ${unitParam} — Pelajari fungsi setiap komponen`;
}

/* ---------- scene, renderer, kamera ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14181c);
scene.fog = new THREE.Fog(0x14181c, 3.2, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
appEl.prepend(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.02, 40);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.9;
controls.minDistance = 0.1;
controls.maxDistance = 4.5;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.9;
controls.target.set(0, -0.01, 0);

/* ---------- pencahayaan studio ---------- */
scene.add(new THREE.HemisphereLight(0xdfe8ee, 0x1a1712, 0.65));
const ambient = new THREE.AmbientLight(0xffffff, 0.32);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff3de, 1.5);
keyLight.position.set(1.4, 1.6, 1.1);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 0.2;
keyLight.shadow.camera.far = 6;
keyLight.shadow.camera.left = -1.2;
keyLight.shadow.camera.right = 1.2;
keyLight.shadow.camera.top = 1.2;
keyLight.shadow.camera.bottom = -1.2;
keyLight.shadow.bias = -0.002;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xcfe0ff, 0.55);
fillLight.position.set(-1.6, 0.8, -0.6);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-0.4, 1.1, -1.6);
scene.add(rimLight);

// lampu sorot yang mengikuti komponen terpilih
const focusLight = new THREE.PointLight(0xffcf8a, 0, 1.6, 2.1);
scene.add(focusLight);

/* ---------- lantai studio (penangkap bayangan) ---------- */
const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.24;
ground.receiveShadow = true;
scene.add(ground);

const ringMat = new THREE.MeshBasicMaterial({ color: 0x2a2f35, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
for (let r = 0.5; r <= 2.2; r += 0.56) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.004, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.239;
  scene.add(ring);
}

/* ---------- model AC ---------- */
const { group: acGroup, components, fan } = buildACDetailModel();
acGroup.traverse((o) => {
  if (o.isMesh) {
    // bagian yang sangat transparan (casing "ghost") tidak perlu
    // melempar bayangan solid — supaya tetap terlihat realistis.
    const veryTransparent = o.material && o.material.transparent && o.material.opacity < 0.5;
    o.castShadow = !veryTransparent;
    o.receiveShadow = true;
  }
});
scene.add(acGroup);

/* ---------- util: sesuaikan kamera ke objek ---------- */
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function tweenCameraTo(toPos, toTarget, duration = 900, onDone) {
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(fromPos, toPos, e);
    controls.target.lerpVectors(fromTarget, toTarget, e);
    camera.lookAt(controls.target);
    if (t < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  }
  requestAnimationFrame(step);
}

function computeFraming(object3d, dir, fitRatio = 1.6, minDist = 0.22) {
  const box = new THREE.Box3().setFromObject(object3d);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 0.02);
  const fovRad = (camera.fov * Math.PI) / 180;
  let dist = (maxSize / 2 / Math.tan(fovRad / 2)) * fitRatio;
  dist = Math.max(dist, minDist);
  const camPos = center.clone().addScaledVector(dir.clone().normalize(), dist);
  return { camPos, target: center, radius: maxSize / 2 };
}

const overviewDir = new THREE.Vector3(1.15, 0.68, 1.35);
const overview = computeFraming(acGroup, overviewDir, 1.55, 0.9);
camera.position.copy(overview.camPos);
controls.target.copy(overview.target);
camera.lookAt(controls.target);

/* ---------- highlight komponen ---------- */
const HILITE_COLOR = new THREE.Color(0xffb347);
let selected = null; // {key, object, ...meta}
let userInteracted = false;

function clearHighlight(obj) {
  if (!obj) return;
  obj.traverse((o) => {
    if (o.isMesh && o.material && o.userData._origEmissive) {
      o.material.emissive.copy(o.userData._origEmissive);
      o.material.emissiveIntensity = o.userData._origEmissiveIntensity;
      delete o.userData._origEmissive;
      delete o.userData._origEmissiveIntensity;
    }
  });
}

function primeHighlight(obj) {
  obj.traverse((o) => {
    if (o.isMesh && o.material && "emissive" in o.material && !o.userData._origEmissive) {
      o.userData._origEmissive = o.material.emissive.clone();
      o.userData._origEmissiveIntensity = o.material.emissiveIntensity ?? 1;
    }
  });
}

/* ---------- sidebar & info panel ---------- */
const listEl = document.getElementById("komponen-list");
const infoTitleEl = document.getElementById("info-title");
const infoDescEl = document.getElementById("info-desc");

const categoriesOrder = ["Bodi & Panel", "Aliran Udara", "Elektronik", "Pipa & Struktur"];
const byCategory = new Map();
categoriesOrder.forEach((c) => byCategory.set(c, []));
components.forEach((c) => {
  if (!byCategory.has(c.category)) byCategory.set(c.category, []);
  byCategory.get(c.category).push(c);
});

const itemEls = new Map();
categoriesOrder.forEach((cat) => {
  const items = byCategory.get(cat);
  if (!items || items.length === 0) return;
  const heading = document.createElement("div");
  heading.className = "komponen-kategori";
  heading.textContent = cat;
  listEl.appendChild(heading);
  items.forEach((c) => {
    const item = document.createElement("button");
    item.className = "komponen-item";
    item.type = "button";
    item.textContent = c.name;
    item.addEventListener("click", () => selectComponent(c.key));
    listEl.appendChild(item);
    itemEls.set(c.key, item);
  });
});

function selectComponent(key) {
  if (selected && selected.key === key) { deselect(); return; }
  if (selected) {
    clearHighlight(selected.object);
    if (itemEls.get(selected.key)) itemEls.get(selected.key).classList.remove("active");
  }
  const comp = components.find((c) => c.key === key);
  if (!comp) return;
  selected = comp;
  primeHighlight(comp.object);
  if (itemEls.get(key)) itemEls.get(key).classList.add("active");

  infoTitleEl.textContent = comp.name;
  infoDescEl.textContent = comp.desc;

  controls.autoRotate = false;
  userInteracted = true;
  const { camPos, target, radius } = computeFraming(comp.object, new THREE.Vector3(1.1, 0.75, 1.25), 2.1, 0.14);
  tweenCameraTo(camPos, target, 850);
  focusLight.position.copy(target).add(new THREE.Vector3(0, radius * 2 + 0.15, 0));
  maybeCloseSidebar();
}

function deselect() {
  if (selected) {
    clearHighlight(selected.object);
    if (itemEls.get(selected.key)) itemEls.get(selected.key).classList.remove("active");
  }
  selected = null;
  infoTitleEl.textContent = "Tampilan Keseluruhan";
  infoDescEl.textContent = "Klik salah satu komponen pada daftar di bawah, atau klik langsung pada model 3D, untuk mempelajari fungsi tiap bagian unit AC indoor.";
  const ov = computeFraming(acGroup, overviewDir, 1.55, 0.9);
  tweenCameraTo(ov.camPos, ov.target, 850);
}

/* ---------- klik langsung pada model 3D ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = null;

renderer.domElement.addEventListener("pointerdown", (ev) => {
  pointerDownPos = { x: ev.clientX, y: ev.clientY };
});

renderer.domElement.addEventListener("pointerup", (ev) => {
  if (!pointerDownPos) return;
  const dx = ev.clientX - pointerDownPos.x;
  const dy = ev.clientY - pointerDownPos.y;
  pointerDownPos = null;
  if (Math.hypot(dx, dy) > 6) return; // itu drag orbit, bukan klik

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(acGroup, true);
  if (hits.length === 0) return;
  let o = hits[0].object;
  while (o && !o.userData.compKey) o = o.parent;
  if (o) selectComponent(o.userData.compKey);
});

controls.addEventListener("start", () => { userInteracted = true; controls.autoRotate = false; });

/* ---------- tombol UI ---------- */
document.getElementById("btn-kembali-ruangan").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("btn-reset-tampilan").addEventListener("click", () => {
  deselect();
  userInteracted = false;
  controls.autoRotate = true;
});

const sidebarEl = document.getElementById("detail-sidebar");
const toggleBtn = document.getElementById("btn-toggle-sidebar");

// Di mobile: sidebar mulai tersembunyi, harus klik tombol untuk buka
// Di desktop: sidebar selalu terlihat (CSS posisi absolute biasa)
function updateToggleIcon() {
  if (sidebarEl.classList.contains("open")) {
    toggleBtn.classList.add("open");
    toggleBtn.title = "Tutup Daftar Komponen";
  } else {
    toggleBtn.classList.remove("open");
    toggleBtn.title = "Buka Daftar Komponen";
  }
}

toggleBtn.addEventListener("click", () => {
  sidebarEl.classList.toggle("open");
  updateToggleIcon();
});

// Saat komponen dipilih di mobile: otomatis tutup sidebar supaya
// model 3D terlihat
function maybeCloseSidebar() {
  if (window.innerWidth <= 760 && sidebarEl.classList.contains("open")) {
    sidebarEl.classList.remove("open");
    updateToggleIcon();
  }
}

updateToggleIcon();

/* ---------- resize ---------- */
window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

/* ---------- loop render ---------- */
function animate(now) {
  requestAnimationFrame(animate);
  fan.rotation.x += 0.045; // kipas berputar pelan, permanen

  if (selected) {
    const pulse = 0.4 + Math.sin(now * 0.005) * 0.28;
    selected.object.traverse((o) => {
      if (o.isMesh && o.material && "emissive" in o.material) {
        o.material.emissive.copy(HILITE_COLOR);
        o.material.emissiveIntensity = Math.max(pulse, 0.15);
      }
    });
    focusLight.intensity = 0.9 + Math.sin(now * 0.006) * 0.15;
  } else {
    focusLight.intensity = 0;
  }

  controls.update();
  renderer.render(scene, camera);
}

const loadingEl = document.getElementById("loading");
requestAnimationFrame(() => {
  setTimeout(() => {
    loadingEl.style.opacity = "0";
    setTimeout(() => loadingEl.remove(), 650);
  }, 350);
});

requestAnimationFrame(animate);
