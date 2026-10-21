# Ruang Rapat 3D — Three.js

## Cara menjalankan
File ini menggunakan ES Modules, jadi tidak bisa dibuka langsung dengan
double-click (`file://`) di sebagian browser — jalankan lewat local server:

**Opsi 1 — Python**
```
cd ruang-rapat-3d
python3 -m http.server 8000
```
Buka: http://localhost:8000

**Opsi 2 — Node**
```
npx serve .
```

## Struktur folder

```
ruang-rapat-3d/
├── index.html              # struktur halaman saja (tanpa CSS/JS inline)
├── css/
│   └── gaya.css             # semua styling UI (loading screen, hud, hint)
└── js/
    ├── main.js               # entry point: import semua modul + render loop
    ├── inti/                 # hal-hal dasar yang dipakai banyak modul lain
    │   ├── konfigurasi.js     # ukuran ruangan (ROOM_W/L/H) & palet warna
    │   ├── tekstur.js         # tekstur prosedural (Canvas2D)
    │   ├── material.js        # material THREE.js yang dipakai bersama
    │   ├── scene-dasar.js     # scene, renderer, grup root
    │   ├── kamera.js          # 2 kamera + OrbitControls
    │   └── pencahayaan.js     # lampu plafon, ambient, directional
    ├── ruangan/               # struktur bangunan ruangan
    │   ├── struktur.js        # lantai, plafon, 3 dinding polos
    │   ├── jendela-kiri.js    # jendela kaca besar dinding kiri
    │   ├── jendela-kanan.js   # jendela clerestory dinding kanan
    │   └── pintu.js           # pintu oranye + pintu kaca putih
    └── furnitur/              # semua perabotan, 1 file per jenis furnitur
        ├── meja-rapat.js      # meja rapat utama
        ├── kursi.js           # kursi rapat + kursi bos
        ├── meja-depan.js      # meja bos (granit + monitor/laptop dll)
        ├── meja-samping-layar.js  # meja instruktur + kursi merah
        ├── dinding-layar.js   # layar proyektor, speaker, whiteboard
        ├── lemari-arsip.js    # barisan lemari arsip besi
        ├── rak-logam.js       # rak besi terbuka
        ├── konsol-kayu.js     # rak kayu panjang dinding kanan
        ├── kit-iot.js         # kit peralatan IoT (ESP32, breadboard, dll)
        └── ac.js              # unit AC split
```

Setiap file JS punya tanggung jawab tunggal: modul `inti/` menyediakan hal
dasar (ukuran ruangan, material, kamera, cahaya), modul `ruangan/` membangun
struktur bangunan (dinding, jendela, pintu), dan modul `furnitur/` masing-masing
membangun satu jenis perabotan. `js/main.js` tinggal meng-import semuanya lalu
menjalankan render loop.

## Kontrol
- Drag mouse = orbit kamera
- Scroll = zoom

## Catatan teknis
- Three.js r160 dimuat via CDN (jsdelivr) memakai import map, termasuk
  OrbitControls dari examples/jsm.
- Semua tekstur (lantai keramik, dinding, kayu, whiteboard, skyline kota)
  dibuat secara prosedural lewat Canvas2D — tidak ada file gambar eksternal
  yang dibutuhkan.
- Material: `MeshStandardMaterial` / `MeshPhysicalMaterial`, shadow map
  PCFSoft, tone mapping ACESFilmic.
- Dua kamera (`PerspectiveCamera`, FOV 52°) diposisikan meniru dua foto
  referensi; ada pembatas sederhana (`clampCameraToRoom`) supaya kamera
  tidak menembus dinding/lantai/plafon saat di-orbit. OrbitControls saat
  ini selalu terpasang ke kamera pertama (`camera1`) — sama seperti versi
  sebelumnya, belum ada tombol UI untuk berpindah ke `camera2`.
