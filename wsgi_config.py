"""
wsgi_config.py — TEMPLATE konfigurasi WSGI untuk PythonAnywhere
================================================================
File ini bukan untuk dijalankan lokal. Ini contoh isi yang harus kamu
PASTE ke file WSGI PythonAnywhere-mu.

File WSGI asli berada di (contoh):
    /var/www/username_pythonanywhere_com_wsgi.py

Cara pakai:
  1. Buka tab Web di dashboard PythonAnywhere
  2. Klik link file WSGI (dekat bagian atas)
  3. Hapus isi default, lalu paste kode di bawah ini
  4. Ganti USERNAME dengan username PythonAnywhere kamu
  5. Save, lalu Reload web app

Mengapa pakai WSGI, bukan app.run()?
  PythonAnywhere menjalankan app lewat WSGI (ada server-nya sendiri).
  Baris app.run() di app.py ada di dalam `if __name__ == "__main__":`
  jadi otomatis di-skip saat di-import lewat WSGI. Aman.
"""

import sys

# Tambahkan folder project ke path agar `app` bisa di-import
# Ganti USERNAME dengan username PythonAnywhere kamu
project_home = '/home/USERNAME/ruang-rapatv4'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import objek `app` dari app.py dan beri nama `application`
# (PythonAnywhere WSGI harus menamainya `application`)
from app import app as application  # noqa
