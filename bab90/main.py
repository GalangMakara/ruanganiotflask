# MicroPython / ESP32 - contoh Bab 9
# Salin config_example.py menjadi config.py dan sesuaikan WiFi + IP Flask.
import time
import network
import ujson
import urequests
from machine import Pin, ADC
import dht
from config import WIFI_SSID, WIFI_PASSWORD, FLASK_BASE_URL, DEVICE_ID

sensor = dht.DHT11(Pin(16))
gas_adc = ADC(Pin(35))
try:
    gas_adc.atten(ADC.ATTN_11DB)
except Exception:
    pass

fan = Pin(5, Pin.OUT)       # demonstrasi LED/fan driver rendah tegangan
buzzer = Pin(23, Pin.OUT)
relay = Pin(13, Pin.OUT)    # gunakan isolasi/driver yang benar pada praktik nyata

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    time.sleep(1)
    wlan.active(True)
    if not wlan.isconnected():
        if WIFI_PASSWORD:
            wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        else:
            wlan.connect(WIFI_SSID)
        for _ in range(30):
            if wlan.isconnected() and wlan.ifconfig()[0] != '0.0.0.0':
                break
            time.sleep(1)
    if not wlan.isconnected() or wlan.ifconfig()[0] == '0.0.0.0':
        raise RuntimeError("WiFi gagal terhubung")
    print("IP ESP32:", wlan.ifconfig()[0])

def read_telemetry():
    sensor.measure()
    return {
        "device_id": DEVICE_ID,
        "temperature": sensor.temperature(),
        "humidity": sensor.humidity(),
        "gas": gas_adc.read(),
    }

def post_json(path, payload):
    r = urequests.post(
        FLASK_BASE_URL + path,
        data=ujson.dumps(payload),
        headers={"Content-Type": "application/json"},
    )
    data = r.json(); r.close(); return data

def get_json(path):
    r = urequests.get(FLASK_BASE_URL + path)
    data = r.json(); r.close(); return data

def execute(action):
    if action == "FAN_ON": fan.on()
    elif action == "FAN_OFF": fan.off()
    elif action == "BUZZER_ON": buzzer.on()
    elif action == "BUZZER_OFF": buzzer.off()
    elif action == "RELAY_OFF": relay.off()
    else: raise ValueError("Unknown action: " + action)

connect_wifi()
while True:
    try:
        telemetry = read_telemetry()
        print("Telemetry:", telemetry)
        post_json("/api/telemetry", telemetry)

        cmd = get_json("/api/command/" + DEVICE_ID).get("command")
        if cmd:
            try:
                execute(cmd["action"])
                post_json("/api/ack", {
                    "action_id": cmd["action_id"],
                    "device_id": DEVICE_ID,
                    "success": True,
                    "message": "Perintah dieksekusi ESP32",
                })
            except Exception as exc:
                post_json("/api/ack", {
                    "action_id": cmd["action_id"],
                    "device_id": DEVICE_ID,
                    "success": False,
                    "message": str(exc),
                })
    except Exception as exc:
        print("Error:", exc)
    time.sleep(5)

