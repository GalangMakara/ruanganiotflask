# boot.py — dijalankan pertama kali saat ESP32 menyala
# Menghubungkan ke WiFi BOE- (open network, tanpa password)
#
# WiFi BOE- harus punya akses internet agar ESP32 bisa
# mengirim data ke galangmakara.pythonanywhere.com

import network
import time

SSID = "BOE-"   # WiFi kantor BOE, open network tanpa password

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("[WiFi] Sudah terhubung:", wlan.ifconfig())
        return wlan

    print(f"[WiFi] Menghubungkan ke '{SSID}'...")
    wlan.connect(SSID)   # tanpa password untuk open network

    # Tunggu sampai terhubung (maks 15 detik)
    timeout = 15
    while not wlan.isconnected() and timeout > 0:
        print(f"[WiFi] Menunggu... ({timeout}s)")
        time.sleep(1)
        timeout -= 1

    if wlan.isconnected():
        ip, subnet, gateway, dns = wlan.ifconfig()
        print(f"[WiFi] Terhubung! IP: {ip}")
    else:
        print("[WiFi] GAGAL terhubung ke WiFi. Pastikan SSID benar.")

    return wlan

# Jalankan koneksi saat boot
wlan = connect_wifi()
