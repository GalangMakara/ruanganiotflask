/**
 * dashboard.js — IoT Smart Control Panel
 * Terhubung ke Flask backend (server.py) via REST API.
 *
 * API:
 *   GET  /api/sensor/latest  → polling data suhu, kelembapan, alarm
 *   POST /api/control        → kirim toggle perangkat { device, state }
 *   GET  /api/control/state  → sync state awal saat halaman dimuat
 */

import { setLampuBaris } from "../inti/pencahayaan.js";
import { acUnits }       from "../furnitur/ac.js";
import { setACAnimState } from "./animasi-ac.js";

/* -----------------------------------------------------------------------
   KONFIGURASI API
   Jika Flask berjalan di mesin yang sama → "/api/..."
   Jika beda mesin → "http://192.168.x.x:5000/api/..."
----------------------------------------------------------------------- */
const API_BASE = "";   // kosong = same-origin (Flask serve index.html)

/* -----------------------------------------------------------------------
   STATE PERANGKAT
----------------------------------------------------------------------- */
const deviceState = {
  lampu1: true, lampu2: true, lampu3: true,
  acBos:  true, acRapat: true, layar: true,
};

/* -----------------------------------------------------------------------
   LAYAR MONITOR
----------------------------------------------------------------------- */
let screenMesh = null;
export function registerScreenMesh(mesh) { screenMesh = mesh; }

function setLayar(on) {
  deviceState.layar = on;
  if (!screenMesh) return;
  screenMesh.material.emissive.set(on ? 0x3a8fff : 0x000000);
  screenMesh.material.emissiveIntensity = on ? 0.45 : 0;
  screenMesh.material.color.set(on ? 0x1a1a2e : 0x050505);
}

/* -----------------------------------------------------------------------
   KONTROL AC
----------------------------------------------------------------------- */
function setAC(index, on) {
  const unit = acUnits[index];
  if (!unit) return;
  unit.group.traverse(child => {
    if (!child.isMesh || !child.material) return;
    const m = child.material;
    if (m.emissive && m.color.getHex && m.color.getHex() === 0x162a2d) {
      m.emissive.set(on ? 0x63c4c9 : 0x111111);
      m.emissiveIntensity = on ? 0.65 : 0;
    }
    if (m.emissive && m.color.getHex && m.color.getHex() === 0x1e1e1e) {
      m.emissive.set(on ? 0x2ee06a : 0x111111);
      m.emissiveIntensity = on ? 1.2 : 0;
    }
  });
  setACAnimState(index, on);
}

/* -----------------------------------------------------------------------
   MAP: key perangkat → fungsi 3D
----------------------------------------------------------------------- */
const deviceActions = {
  lampu1:  (on) => setLampuBaris(0, on),
  lampu2:  (on) => setLampuBaris(1, on),
  lampu3:  (on) => setLampuBaris(2, on),
  acBos:   (on) => { setAC(0, on); deviceState.acBos  = on; },
  acRapat: (on) => { setAC(1, on); deviceState.acRapat = on; },
  layar:   (on) => setLayar(on),
};

/* -----------------------------------------------------------------------
   API HELPERS
----------------------------------------------------------------------- */
async function apiPost(path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    console.warn("[API] POST gagal:", path, e.message);
    return null;
  }
}

async function apiGet(path) {
  try {
    const res = await fetch(API_BASE + path);
    return await res.json();
  } catch (e) {
    console.warn("[API] GET gagal:", path, e.message);
    return null;
  }
}

/* -----------------------------------------------------------------------
   SENSOR UI
----------------------------------------------------------------------- */
let elTemp, elHum, elTempBar, elHumBar, elTempStatus, elHumStatus;
let elAlarmBanner;

function updateSensorUI(data) {
  if (!elTemp || !data) return;

  const t = parseFloat(data.temperature).toFixed(1);
  const h = Math.round(parseFloat(data.humidity));

  elTemp.textContent = t + "°C";
  elHum.textContent  = h + "%";

  elTempBar.style.width = Math.min(100, Math.max(0, ((t - 16) / 20) * 100)) + "%";
  elHumBar.style.width  = Math.min(100, Math.max(0, h)) + "%";

  // Warna suhu
  if (t < 22) {
    elTempBar.style.background = "#60a5fa";
    elTempStatus.textContent   = "Dingin";
    elTempStatus.style.color   = "#60a5fa";
  } else if (t < 26) {
    elTempBar.style.background = "#34d399";
    elTempStatus.textContent   = "Nyaman";
    elTempStatus.style.color   = "#34d399";
  } else if (t < 30) {
    elTempBar.style.background = "#fbbf24";
    elTempStatus.textContent   = "Hangat";
    elTempStatus.style.color   = "#fbbf24";
  } else {
    elTempBar.style.background = "#f87171";
    elTempStatus.textContent   = "Panas";
    elTempStatus.style.color   = "#f87171";
  }

  // Warna kelembapan
  if (h < 40) {
    elHumBar.style.background = "#fb923c";
    elHumStatus.textContent   = "Kering";
    elHumStatus.style.color   = "#fb923c";
  } else if (h < 70) {
    elHumBar.style.background = "#34d399";
    elHumStatus.textContent   = "Normal";
    elHumStatus.style.color   = "#34d399";
  } else {
    elHumBar.style.background = "#818cf8";
    elHumStatus.textContent   = "Lembap";
    elHumStatus.style.color   = "#818cf8";
  }

  // Alarm banner
  if (data.alarm) {
    elAlarmBanner.style.display = "flex";
    elAlarmBanner.querySelector(".alarm-msg").textContent =
      "⚠ " + (data.alarm_reason || "Kondisi kritis!");
  } else {
    elAlarmBanner.style.display = "none";
  }
}

/* -----------------------------------------------------------------------
   POLLING SENSOR — setiap 2 detik
----------------------------------------------------------------------- */
async function pollSensor() {
  const data = await apiGet("/api/sensor/latest");
  updateSensorUI(data);
}

setInterval(pollSensor, 2000);

/* -----------------------------------------------------------------------
   SYNC STATE AWAL DARI FLASK
   Saat halaman pertama dimuat, ambil state perangkat dari server
----------------------------------------------------------------------- */
async function syncStateFromServer() {
  const state = await apiGet("/api/control/state");
  if (!state) return;

  Object.keys(state).forEach(key => {
    const on = !!state[key];
    deviceState[key] = on;

    // Update tampilan kartu
    const card = document.querySelector(`.db-card[data-key="${key}"]`);
    if (card) {
      card.classList.toggle("on",  on);
      card.classList.toggle("off", !on);
      const txt = card.querySelector(".db-state-text");
      if (txt) txt.textContent = on ? "ON" : "OFF";
    }

    // Terapkan ke scene 3D
    if (deviceActions[key]) deviceActions[key](on);
  });
}

/* -----------------------------------------------------------------------
   DEFINISI KARTU PERANGKAT
----------------------------------------------------------------------- */
const ICON_LAMPU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 5 11.95V17H7v-3.05A7 7 0 0 1 12 2z"/>
</svg>`;

const ICON_AC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="6" width="20" height="8" rx="2"/>
  <path d="M7 14v4M12 14v4M17 14v4M6 10h.01M10 10h.01M14 10h.01"/>
  <path d="M8 6V4M12 6V4M16 6V4"/>
</svg>`;

const ICON_MONITOR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="3" width="20" height="14" rx="2"/>
  <path d="M8 21h8M12 17v4"/>
  <circle cx="12" cy="10" r="3"/>
  <path d="M12 7v1M12 12v1M9 10H8M16 10h-1M10.2 8.2l-.7-.7M15.2 13.2l-.7-.7M13.8 8.2l.7-.7M8.8 13.2l.7-.7"/>
</svg>`;

const devices = [
  { key:"lampu1",  icon:ICON_LAMPU,   label:"Lampu Baris 1",  sublabel:"Area Layar",       color:"#f5c842" },
  { key:"lampu2",  icon:ICON_LAMPU,   label:"Lampu Baris 2",  sublabel:"Area Tengah",       color:"#f5c842" },
  { key:"lampu3",  icon:ICON_LAMPU,   label:"Lampu Baris 3",  sublabel:"Area Meja Bos",     color:"#f5c842" },
  { key:"acBos",   icon:ICON_AC,      label:"AC Meja Bos",    sublabel:"Dinding Kiri",      color:"#42c8f5" },
  { key:"acRapat", icon:ICON_AC,      label:"AC Meja Rapat",  sublabel:"Dinding Belakang",  color:"#42c8f5" },
  { key:"layar",   icon:ICON_MONITOR, label:"Layar Monitor",  sublabel:"Monitor Utama",     color:"#a78bfa" },
];

/* -----------------------------------------------------------------------
   RENDER DASHBOARD
----------------------------------------------------------------------- */
function createDashboard() {
  const app = document.getElementById("app");

  /* ---- Tombol toggle show/hide ---- */
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "db-toggle-btn";
  toggleBtn.title = "Tampilkan Dashboard";
  // Ikon hamburger (☰) — tampil saat panel tertutup
  // Ikon X (✕)        — tampil saat panel terbuka
  toggleBtn.innerHTML = `
    <svg id="db-icon-panel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
    <svg id="db-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  `;
  app.appendChild(toggleBtn);

  /* ---- Panel utama ---- */
  const wrapper = document.createElement("div");
  wrapper.id = "iot-dashboard";
  wrapper.innerHTML = `
    <div class="db-header">
      <div class="db-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      </div>
      <div class="db-title-block">
        <span class="db-title">Ruang Rapat</span>
        <span class="db-sub">Smart Control Panel</span>
      </div>
      <div class="db-status-pill">
        <div class="db-status-dot"></div>
        <span class="db-status-text">Online</span>
      </div>
    </div>

    <div class="db-alarm-banner" id="db-alarm-banner" style="display:none">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span class="alarm-msg">⚠ Kondisi kritis!</span>
    </div>

    <div class="db-sensor-row">
      <div class="db-sensor-card">
        <div class="db-sensor-head">
          <div class="db-sensor-icon temp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
          </div>
          <span class="db-sensor-label">Suhu</span>
        </div>
        <div class="db-sensor-value" id="sensor-temp-val">--°C</div>
        <div class="db-sensor-footer">
          <span class="db-sensor-status" id="temp-status">--</span>
          <div class="db-sensor-bar-bg">
            <div class="db-sensor-bar" id="temp-bar" style="width:0%;background:#34d399"></div>
          </div>
        </div>
      </div>

      <div class="db-sensor-card">
        <div class="db-sensor-head">
          <div class="db-sensor-icon hum">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <span class="db-sensor-label">Kelembapan</span>
        </div>
        <div class="db-sensor-value" id="sensor-hum-val">--%</div>
        <div class="db-sensor-footer">
          <span class="db-sensor-status" id="hum-status">--</span>
          <div class="db-sensor-bar-bg">
            <div class="db-sensor-bar" id="hum-bar" style="width:0%;background:#34d399"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="db-divider"></div>

    <div class="db-grid">
      ${devices.map(d => `
        <button class="db-card on" data-key="${d.key}" style="--accent:${d.color}">
          <div class="db-icon">${d.icon}</div>
          <div class="db-info">
            <span class="db-name">${d.label}</span>
            <span class="db-loc">${d.sublabel}</span>
          </div>
          <div class="db-toggle">
            <div class="db-track"><div class="db-thumb"></div></div>
            <span class="db-state-text">ON</span>
          </div>
        </button>
      `).join("")}
    </div>
  `;
  app.appendChild(wrapper);

  /* ---- Cache elemen sensor & alarm ---- */
  elTemp        = wrapper.querySelector("#sensor-temp-val");
  elHum         = wrapper.querySelector("#sensor-hum-val");
  elTempBar     = wrapper.querySelector("#temp-bar");
  elHumBar      = wrapper.querySelector("#hum-bar");
  elTempStatus  = wrapper.querySelector("#temp-status");
  elHumStatus   = wrapper.querySelector("#hum-status");
  elAlarmBanner = wrapper.querySelector("#db-alarm-banner");

  /* ---- Toggle show/hide ---- */
  // Di mobile: default tersembunyi. Di desktop: default terbuka.
  const isMobile = () => window.innerWidth <= 768;
  let visible = !isMobile();

  const iconPanel = toggleBtn.querySelector("#db-icon-panel");
  const iconClose = toggleBtn.querySelector("#db-icon-close");

  function applyVisible(v) {
    visible = v;
    wrapper.classList.toggle("db-hidden", !v);
    iconPanel.style.display = v ? "none"  : "block";
    iconClose.style.display = v ? "block" : "none";
    toggleBtn.title = v ? "Sembunyikan Dashboard" : "Tampilkan Dashboard";
    // Geser tombol ke kanan panel saat panel terbuka di desktop
    if (window.innerWidth > 768) {
      toggleBtn.style.left = v ? "344px" : "16px";
    } else {
      toggleBtn.style.left = "16px";
      toggleBtn.style.right = "auto";
    }
  }

  // Terapkan state awal
  applyVisible(visible);

  toggleBtn.addEventListener("click", () => applyVisible(!visible));

  // Saat resize: sesuaikan posisi & state default
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      toggleBtn.style.right = "auto";
      applyVisible(visible); // pertahankan state user
    } else {
      toggleBtn.style.left = "16px";
      toggleBtn.style.right = "auto";
      toggleBtn.style.bottom = "";
      toggleBtn.style.top = "";
    }
  });

  /* ---- Toggle kartu perangkat — kirim ke Flask ---- */
  wrapper.querySelectorAll(".db-card").forEach(card => {
    card.addEventListener("click", async () => {
      const key   = card.dataset.key;
      const nowOn = !card.classList.contains("on");

      // Update UI langsung (optimistic)
      deviceState[key] = nowOn;
      card.classList.toggle("on",  nowOn);
      card.classList.toggle("off", !nowOn);
      card.querySelector(".db-state-text").textContent = nowOn ? "ON" : "OFF";

      // Terapkan ke scene 3D
      if (deviceActions[key]) deviceActions[key](nowOn);

      // Kirim ke Flask
      await apiPost("/api/control", { device: key, state: nowOn });
    });
  });

  /* ---- Sync state dari server saat pertama muat ---- */
  syncStateFromServer();
  // Polling sensor pertama langsung
  pollSensor();
}

createDashboard();
