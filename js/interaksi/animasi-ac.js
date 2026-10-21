/**
 * animasi-ac.js
 * Animasi visual per-frame untuk unit AC:
 *   - Kipas (blower) berputar saat ON, berhenti saat OFF
 *   - Partikel "aliran udara" dari kisi-kisi bawah saat ON
 *   - Glow emissive pada panel display berkedip pelan saat ON
 *   - Transisi speed kipas (spin-up / spin-down) yang halus
 */

import * as THREE from "three";
import { scene } from "../inti/scene-dasar.js";
import { acUnits } from "../furnitur/ac.js";

/* -----------------------------------------------------------------------
   STATE KECEPATAN KIPAS PER UNIT
   targetSpeed: kecepatan target (rad/frame), currentSpeed: nilai saat ini
----------------------------------------------------------------------- */
const SPEED_ON  = 0.18;   // ~10-11 putaran/detik pada 60fps
const SPEED_OFF = 0.0;
const ACCEL     = 0.004;  // percepatan spin-up / spin-down per frame

const fanSpeeds = [];     // { current, target } per acUnit index

/* -----------------------------------------------------------------------
   PARTIKEL ALIRAN UDARA
   Setiap AC punya pool kecil partikel yang keluar dari kisi bawah
   dan "melayang" turun dengan drift horizontal, lalu reset.
----------------------------------------------------------------------- */
const PARTICLE_COUNT = 18;
const acParticles = [];   // array of { mesh, vel, life, maxLife, unitIdx }

function createParticlePool(unit) {
  const pool = [];
  const mat = new THREE.MeshBasicMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const geo = new THREE.SphereGeometry(0.012, 5, 5);
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.visible = false;
    scene.add(mesh);
    pool.push({
      mesh,
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0,
      active: false,
    });
  }
  return pool;
}

/* -----------------------------------------------------------------------
   INISIALISASI — dipanggil sekali setelah acUnits sudah terisi
----------------------------------------------------------------------- */
export function initACAnimation() {
  acUnits.forEach((unit, idx) => {
    fanSpeeds.push({ current: SPEED_ON, target: SPEED_ON }); // mulai ON
    acParticles.push(createParticlePool(unit));
  });
}

/* -----------------------------------------------------------------------
   SET STATE AC (dipanggil oleh dashboard.js)
----------------------------------------------------------------------- */
export function setACAnimState(index, on) {
  if (fanSpeeds[index] === undefined) return;
  fanSpeeds[index].target = on ? SPEED_ON : SPEED_OFF;
}

/* -----------------------------------------------------------------------
   HELPER: posisi dunia kisi bawah AC
----------------------------------------------------------------------- */
function getVentWorldPos(unit) {
  const pos = new THREE.Vector3();
  unit.group.getWorldPosition(pos);
  // kisi bawah AC ada sedikit di bawah tengah casing dan ke depan
  const dir = new THREE.Vector3();
  unit.group.getWorldDirection(dir);
  pos.addScaledVector(dir, 0.14);
  pos.y -= 0.10;
  return pos;
}

/* -----------------------------------------------------------------------
   SPAWN partikel baru dari pool
----------------------------------------------------------------------- */
function spawnParticle(pool, unit) {
  const p = pool.find(p => !p.active);
  if (!p) return;

  const base = getVentWorldPos(unit);

  // sebar acak di sepanjang kisi
  const right = new THREE.Vector3();
  unit.group.getWorldDirection(right);
  right.cross(new THREE.Vector3(0, 1, 0)).normalize();

  const spread = (Math.random() - 0.5) * 0.55;
  p.mesh.position.copy(base).addScaledVector(right, spread);

  // arah: ke bawah + sedikit maju
  const dir = new THREE.Vector3();
  unit.group.getWorldDirection(dir);
  p.vel.set(
    dir.x * 0.009 + (Math.random() - 0.5) * 0.003,
    -0.012 - Math.random() * 0.006,
    dir.z * 0.009 + (Math.random() - 0.5) * 0.003,
  );

  p.maxLife = 40 + Math.random() * 30;
  p.life = 0;
  p.active = true;
  p.mesh.visible = true;
  p.mesh.material.opacity = 0;
  p.mesh.material.color.set(0xaaddff);
}

/* -----------------------------------------------------------------------
   UPDATE — dipanggil setiap frame dari main.js
----------------------------------------------------------------------- */
let frameCount = 0;

export function updateACAnimation() {
  frameCount++;

  acUnits.forEach((unit, idx) => {
    const fs = fanSpeeds[idx];
    if (!fs) return;

    /* --- Spin-up / spin-down kipas --- */
    if (fs.current < fs.target) {
      fs.current = Math.min(fs.current + ACCEL, fs.target);
    } else if (fs.current > fs.target) {
      fs.current = Math.max(fs.current - ACCEL * 0.6, fs.target);
    }

    /* --- Putar kipas blower --- */
    if (unit.fan && fs.current > 0.0001) {
      unit.fan.rotation.x += fs.current;
    }

    /* --- Glow display berkedip pelan saat ON --- */
    const isOn = fs.target > 0;
    unit.group.traverse(child => {
      if (!child.isMesh || !child.material) return;
      const m = child.material;
      if (m.emissive && m.color.getHex && m.color.getHex() === 0x162a2d) {
        if (isOn) {
          const pulse = 0.65 + Math.sin(frameCount * 0.04 + idx * 1.3) * 0.15;
          m.emissiveIntensity = pulse;
        }
      }
    });

    /* --- Partikel udara --- */
    const pool = acParticles[idx];
    if (!pool) return;

    // spawn rate: tiap 3 frame saat ON & kecepatan hampir penuh
    if (isOn && fs.current > SPEED_ON * 0.5 && frameCount % 3 === idx % 3) {
      spawnParticle(pool, unit);
    }

    pool.forEach(p => {
      if (!p.active) return;
      p.life++;

      const t = p.life / p.maxLife;
      // fade in cepat, fade out perlahan
      p.mesh.material.opacity = t < 0.15
        ? t / 0.15 * 0.45
        : (1 - t) * 0.45;

      p.mesh.position.add(p.vel);
      // sedikit turbulensi
      p.mesh.position.x += Math.sin(p.life * 0.3 + idx) * 0.001;

      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        p.mesh.material.opacity = 0;
      }
    });

    /* --- Matikan semua partikel saat AC mati --- */
    if (!isOn && fs.current < 0.01) {
      pool.forEach(p => {
        if (p.active) {
          p.active = false;
          p.mesh.visible = false;
        }
      });
    }
  });
}
