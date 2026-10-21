# boot.py — dijalankan pertama kali saat ESP32 menyala
# Menghubungkan ke WiFi.
#
# PENTING untuk hosting PythonAnywhere:
#   Hotspot/router WiFi ini HARUS punya akses internet, karena ESP32
#   akan mengirim data ke server public di pythonanywhere.com.
#   (Bisa pakai WiFi rumah, atau hotspot HP dengan kuota data aktif.)

import network
import time

SSID = "NAMA_HOTSPOT_ANDA"     # Ganti: nama WiFi yang punya internet
PASSWORD = "PASSWORD_HOTSPOT"  # Ganti: password WiFi

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("[WiFi] Sudah terhubung:", wlan.ifconfig())
        return wlan

    print(f"[WiFi] Menghubungkan ke '{SSID}'...")
    wlan.connect(SSID, PASSWORD)

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
        print("[WiFi] GAGAL terhubung ke WiFi. Cek SSID.")

    return wlan

# Jalankan koneksi saat boot
wlan = connect_wifi()
