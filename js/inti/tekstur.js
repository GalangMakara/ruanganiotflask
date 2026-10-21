import * as THREE from "three";
import { ROOM_W, ROOM_L } from "./konfigurasi.js";

/* ---------------------------------------------------------------------
   TEKSTUR PROSEDURAL (Canvas2D) — tidak perlu file gambar eksternal.
   Dipakai oleh js/inti/material.js dan beberapa file di js/furnitur/.
--------------------------------------------------------------------- */
function makeCanvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  return c;
}

function floorTexture() {
  const c = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e3d2b3";
    ctx.fillRect(0, 0, w, h);
    const tile = w / 8; // 60cm tile relatif ke ~4.8m repeat area di UV
    ctx.strokeStyle = "rgba(120,95,60,0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(w, i * tile); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const g = ctx.createLinearGradient(i*tile, j*tile, (i+1)*tile, (j+1)*tile);
      const base = 205 + Math.random()*25;
      g.addColorStop(0, `rgba(${base+15},${base+2},${base-30},0.5)`);
      g.addColorStop(1, `rgba(${base-10},${base-15},${base-45},0.15)`);
      ctx.fillStyle = g;
      ctx.fillRect(i*tile+1, j*tile+1, tile-2, tile-2);
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(ROOM_W / 4.8, ROOM_L / 4.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wallTexture(baseHex, brickMode = false) {
  const c = makeCanvas(256, 256, (ctx, w, h) => {
    const base = new THREE.Color(baseHex);
    ctx.fillStyle = `#${base.getHexString()}`;
    ctx.fillRect(0, 0, w, h);

    if (brickMode) {
      // Batako / concrete block — kotak lebih besar, garis tegas
      const bW = 48, bH = 26, mortar = 3;
      // base texture noise
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * w, y = Math.random() * h;
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
      // garis nat batako
      ctx.strokeStyle = "rgba(30,30,30,0.85)";
      ctx.lineWidth = mortar;
      for (let row = 0; row * (bH + mortar) < h + bH; row++) {
        const y = row * (bH + mortar);
        const offset = row % 2 === 0 ? 0 : bW / 2;
        // nat horizontal
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        // nat vertikal (versatz antar baris)
        for (let col = -1; col * (bW + mortar) < w + bW; col++) {
          const x = col * (bW + mortar) + offset;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + bH + mortar); ctx.stroke();
        }
      }
      // highlight tepi blok — sedikit lebih terang agar terlihat di warna gelap
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      for (let row = 0; row * (bH + mortar) < h + bH; row++) {
        const y = row * (bH + mortar) + mortar;
        const offset = row % 2 === 0 ? 0 : bW / 2;
        for (let col = -1; col * (bW + mortar) < w + bW; col++) {
          const x = col * (bW + mortar) + offset + mortar;
          ctx.strokeRect(x, y, bW - 1, bH - 1);
        }
      }
    } else {
      for (let i = 0; i < 4000; i++) {
        const x = Math.random()*w, y = Math.random()*h;
        const a = Math.random()*0.06;
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      for (let y = 0; y < h; y += 16) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function woodTexture(baseHex, w=256, h=256) {
  const c = makeCanvas(w, h, (ctx, w, h) => {
    const base = new THREE.Color(baseHex);
    ctx.fillStyle = `#${base.getHexString()}`;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const y = Math.random()*h;
      ctx.strokeStyle = `rgba(0,0,0,${0.05+Math.random()*0.12})`;
      ctx.lineWidth = 1 + Math.random()*2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x=0;x<=w;x+=16){ ctx.lineTo(x, y + Math.sin(x*0.05+i)*4); }
      ctx.stroke();
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function graniteTexture() {
  const c = makeCanvas(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#101214";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      const shade = 38 + Math.random() * 45;
      ctx.fillStyle = `rgba(${shade},${shade},${shade + 3},${0.18 + Math.random() * 0.34})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5);
    }
    ctx.strokeStyle = "rgba(190, 198, 202, 0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w * 0.35, y + (Math.random() - 0.5) * 18);
      ctx.lineTo(w * 0.7, y + (Math.random() - 0.5) * 14);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.6, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function whiteboardTexture() {
  const c = makeCanvas(512, 384, (ctx, w, h) => {
    ctx.fillStyle = "#f7f7f5"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = "rgba(40,60,140,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30,40); ctx.lineTo(220,40); ctx.lineTo(180,90); ctx.lineTo(60,90); ctx.stroke();
    ctx.strokeStyle = "rgba(180,40,40,0.3)";
    ctx.beginPath(); ctx.moveTo(260,60); ctx.lineTo(460,60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(260,90); ctx.lineTo(420,90); ctx.stroke();
    ctx.strokeStyle = "rgba(30,30,30,0.25)";
    for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(40, 150+i*30); ctx.lineTo(260,150+i*30); ctx.stroke(); }
    ctx.strokeStyle = "rgba(40,60,140,0.2)";
    ctx.beginPath(); ctx.arc(380, 230, 55, 0, Math.PI*2); ctx.stroke();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function skylineTexture() {
  const c = makeCanvas(1024, 512, (ctx, w, h) => {
    // Langit cerah bergradasi seperti foto referensi
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0,    "#7db8e8");
    sky.addColorStop(0.45, "#a8d0ee");
    sky.addColorStop(1,    "#d0e8f5");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.62);

    // Awan
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    [[160,60,90,28],[400,45,120,22],[680,70,80,25],[820,50,110,20],[90,80,60,18]].forEach(([cx,cy,rw,rh]) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx+rw*0.4, cy+5, rw*0.6, rh*0.7, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx-rw*0.3, cy+8, rw*0.5, rh*0.65, 0, 0, Math.PI*2);
      ctx.fill();
    });

    const horizon = h * 0.62;

    // Latar belakang: area kota/perumahan
    const treeBg = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 40);
    treeBg.addColorStop(0, "#6a9a4a");
    treeBg.addColorStop(1, "#4d7a36");
    ctx.fillStyle = treeBg;
    ctx.fillRect(0, horizon - 10, w, 50);

    // Gedung-gedung di kejauhan
    for (let i = 0; i < 18; i++) {
      const bw = 20 + Math.random() * 45;
      const bx = (i / 18) * w * 1.05 - 10;
      const bh = 55 + Math.random() * 130;
      const shade = 160 + Math.random() * 50;
      ctx.fillStyle = `rgba(${shade-20},${shade-15},${shade+5},0.75)`;
      ctx.fillRect(bx, horizon - bh, bw, bh);
      // jendela gedung
      ctx.fillStyle = "rgba(255,240,180,0.35)";
      for (let wy = horizon - bh + 8; wy < horizon - 8; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 9) {
          if (Math.random() > 0.45) ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }

    // Atap perumahan oranye-merah seperti referensi
    for (let i = 0; i < 28; i++) {
      const hx = (i / 28) * w * 1.1 - 20;
      const hw = 30 + Math.random() * 50;
      const hbaseY = horizon + 15 + Math.random() * 20;
      const hpeakY = hbaseY - 14 - Math.random() * 12;
      ctx.fillStyle = `rgba(${185 + Math.random()*30},${85 + Math.random()*25},${40 + Math.random()*20},0.85)`;
      ctx.beginPath();
      ctx.moveTo(hx, hbaseY);
      ctx.lineTo(hx + hw / 2, hpeakY);
      ctx.lineTo(hx + hw, hbaseY);
      ctx.closePath();
      ctx.fill();
      // dinding rumah
      ctx.fillStyle = `rgba(230,220,200,0.7)`;
      ctx.fillRect(hx + 4, hbaseY, hw - 8, 20 + Math.random() * 15);
    }

    // Pohon-pohon di depan
    for (let i = 0; i < 22; i++) {
      const tx = Math.random() * w;
      const tr = 12 + Math.random() * 22;
      const ty = horizon + 5 + Math.random() * 25;
      const g = 90 + Math.random() * 50;
      ctx.fillStyle = `rgba(30,${g},25,0.82)`;
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ceilingPanelTexture() {
  const c = makeCanvas(128,128,(ctx,w,h)=>{
    ctx.fillStyle="#f4f1e9"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(0,0,0,0.06)"; ctx.lineWidth=2;
    ctx.strokeRect(2,2,w-4,h-4);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export {
  floorTexture,
  wallTexture,
  woodTexture,
  graniteTexture,
  whiteboardTexture,
  skylineTexture,
  ceilingPanelTexture,
};
