# main.py — Program utama ESP32 Ruang Rapat IoT
#
# Pin yang digunakan:
#   GPIO 16 → DHT11       (sensor suhu & kelembapan)
#   GPIO 18 → Lampu 1     (relay, HIGH = ON)
#   GPIO 19 → Lampu 2
#   GPIO 21 → Lampu 3
#   GPIO 25 → AC 1        (relay, HIGH = ON)
#   GPIO 26 → AC 2
#   GPIO 27 → Monitor utama
#   GPIO 23 → Buzzer      (aktif HIGH, bunyi tit-tit-tit)
#
# Alur kerja:
#   1. Baca sensor DHT11 setiap 3 detik
#   2. Kirim data suhu & kelembapan ke Flask server via HTTP POST
#   3. Terima perintah kontrol perangkat dari Flask via HTTP GET
#   4. Jika suhu >= 39°C ATAU kelembapan >= 80% → nyalakan buzzer + kirim alarm
#   5. Eksekusi perintah relay sesuai respons Flask

import dht
import machine
import time
import urequests
import ujson

# -----------------------------------------------------------------------
# KONFIGURASI
# -----------------------------------------------------------------------
# === HOSTING DI PYTHONANYWHERE (INTERNET) ===
# Ganti NAMAUSER dengan username PythonAnywhere kamu.
# PAKAI HTTP (bukan https) supaya urequests ESP32 stabil (SSL MicroPython sering bermasalah).
# Jangan aktifkan opsi "Force HTTPS" di tab Web PythonAnywhere, atau ESP32 akan di-redirect ke https.
FLASK_HOST = "http://galangmakara.pythonanywhere.com"

# === ALTERNATIF: SERVER LOKAL (WiFi BOE, tanpa internet) ===
# FLASK_HOST = "http://192.168.1.X:5000"   # GANTI X dengan IP komputer (cek dengan ipconfig)
SENSOR_INTERVAL = 3   # detik antar pembacaan sensor

# Batas alarm
ALARM_TEMP     = 39.0   # °C
ALARM_HUMIDITY = 80.0   # %

# -----------------------------------------------------------------------
# INISIALISASI PIN
# -----------------------------------------------------------------------
sensor  = dht.DHT11(machine.Pin(16))

relay_lampu1  = machine.Pin(18, machine.Pin.OUT)
relay_lampu2  = machine.Pin(19, machine.Pin.OUT)
relay_lampu3  = machine.Pin(21, machine.Pin.OUT)
relay_ac1     = machine.Pin(25, machine.Pin.OUT)
relay_ac2     = machine.Pin(26, machine.Pin.OUT)
relay_monitor = machine.Pin(27, machine.Pin.OUT)
buzzer        = machine.Pin(23, machine.Pin.OUT)

# Relay aktif HIGH — mulai semua OFF
relay_lampu1.value(0)
relay_lampu2.value(0)
relay_lampu3.value(0)
relay_ac1.value(0)
relay_ac2.value(0)
relay_monitor.value(0)
buzzer.value(0)

# -----------------------------------------------------------------------
# FUNGSI BUZZER — bunyi tit tit tit (3x)
# -----------------------------------------------------------------------
def bunyi_alarm(kali=3):
    for _ in range(kali):
        buzzer.value(1)
        time.sleep_ms(200)
        buzzer.value(0)
        time.sleep_ms(200)

# -----------------------------------------------------------------------
# FUNGSI BACA SENSOR
# -----------------------------------------------------------------------
def baca_sensor():
    try:
        sensor.measure()
        suhu      = sensor.temperature()   # float °C
        kelembapan = sensor.humidity()     # float %
        return suhu, kelembapan
    except Exception as e:
        print("[Sensor] Error:", e)
        return None, None

# -----------------------------------------------------------------------
# FUNGSI KIRIM DATA KE FLASK
# -----------------------------------------------------------------------
def kirim_data(suhu, kelembapan, alarm):
    payload = ujson.dumps({
        "temperature": suhu,
        "humidity": kelembapan,
        "alarm": alarm
    })
    try:
        res = urequests.post(
            FLASK_HOST + "/api/sensor",
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=4
        )
        data = res.json()
        res.close()
        return data   # berisi perintah kontrol perangkat
    except Exception as e:
        print("[HTTP] Gagal kirim data:", e)
        return None

# -----------------------------------------------------------------------
# FUNGSI TERAPKAN PERINTAH RELAY DARI FLASK
# -----------------------------------------------------------------------
def terapkan_perintah(perintah):
    if not perintah:
        return
    relay_lampu1.value(1 if perintah.get("lampu1") else 0)
    relay_lampu2.value(1 if perintah.get("lampu2") else 0)
    relay_lampu3.value(1 if perintah.get("lampu3") else 0)
    relay_ac1.value(1    if perintah.get("acBos")   else 0)
    relay_ac2.value(1    if perintah.get("acRapat") else 0)
    relay_monitor.value(1 if perintah.get("layar")  else 0)

# -----------------------------------------------------------------------
# LOOP UTAMA
# -----------------------------------------------------------------------
print("[Main] ESP32 Ruang Rapat siap.")
alarm_aktif = False

while True:
    suhu, kelembapan = baca_sensor()

    if suhu is not None and kelembapan is not None:
        print(f"[Sensor] Suhu: {suhu}°C  Kelembapan: {kelembapan}%")

        # Cek kondisi alarm
        alarm = (suhu >= ALARM_TEMP) or (kelembapan >= ALARM_HUMIDITY)

        if alarm and not alarm_aktif:
            print("[ALARM] Kondisi kritis! Buzzer aktif.")
            bunyi_alarm(3)
            alarm_aktif = True
        elif not alarm and alarm_aktif:
            alarm_aktif = False
            buzzer.value(0)
            print("[ALARM] Kondisi normal kembali.")

        # Kirim ke Flask dan terima perintah relay
        perintah = kirim_data(suhu, kelembapan, alarm)
        terapkan_perintah(perintah)
    else:
        print("[Sensor] Data tidak terbaca, skip.")

    time.sleep(SENSOR_INTERVAL)
