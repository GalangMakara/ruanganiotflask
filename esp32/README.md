# ESP32 — Ruang Rapat IoT

## Pin yang Digunakan

| GPIO | Komponen        | Fungsi                          |
|------|----------------|---------------------------------|
| 16   | DHT11           | Membaca suhu & kelembapan       |
| 18   | Lampu 1 (relay) | Mengontrol lampu baris 1        |
| 19   | Lampu 2 (relay) | Mengontrol lampu baris 2        |
| 21   | Lampu 3 (relay) | Mengontrol lampu baris 3        |
| 25   | AC 1 (relay)    | Mengontrol AC meja bos          |
| 26   | AC 2 (relay)    | Mengontrol AC meja rapat        |
| 27   | Monitor (relay) | Mengontrol layar monitor utama  |
| 23   | Buzzer          | Alarm tit-tit-tit               |

## Alarm
- Suhu ≥ 39°C **ATAU** Kelembapan ≥ 80% → buzzer berbunyi 3x dan notifikasi muncul di dashboard

## Setup
1. Flash MicroPython ke ESP32
2. Upload `boot.py` dan `main.py` ke ESP32 menggunakan Thonny
3. Ubah `FLASK_HOST` di `main.py` sesuai IP komputer yang menjalankan Flask
4. Pastikan ESP32 dan komputer dalam jaringan WiFi yang sama (BOE)

## Dependensi MicroPython
- `dht` (built-in)
- `urequests` (built-in di firmware MicroPython ESP32)
- `ujson` (built-in)
