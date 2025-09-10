# YouTube 24/7 Livestream Controller

Sebuah panel admin berbasis web untuk mengelola livestream YouTube 24/7 menggunakan FFmpeg di VPS. Didesain untuk keandalan tinggi dengan fitur monitoring, kontrol start/stop, dan kemampuan auto-restart.

---

## ⚡ Instalasi Cepat (Quick Installation)

Metode ini direkomendasikan untuk server Ubuntu 22.04 LTS yang baru. Perintah tunggal ini akan mengunduh dan menjalankan skrip instalasi yang akan menangani semua dependensi dan konfigurasi secara otomatis.

```bash
curl -o install.sh https://raw.githubusercontent.com/sahlanahdan8-bit/yt-livestream-controller/main/install.sh && chmod +x install.sh && ./install.sh
```
> ⚠️ **Penting**: Skrip di atas adalah contoh. Pastikan URL menunjuk ke file `install.sh` yang valid di repositori Anda.

---

## 🔧 Instalasi Manual

Ikuti langkah-langkah ini untuk instalasi manual di server Ubuntu 22.04.

### 1. Perbarui Sistem & Instalasi Dependensi

Pertama, perbarui sistem Anda dan instal semua perangkat lunak yang diperlukan.

```bash
# Perbarui daftar paket
sudo apt-get update && sudo apt-get upgrade -y

# Instal Git dan FFmpeg
sudo apt-get install -y git ffmpeg

# Instal Node.js v20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version # Harus menampilkan v20.x.x
npm --version
ffmpeg -version
```

### 2. Clone Repositori

Unduh kode sumber dari repositori GitHub Anda.

```bash
git clone https://github.com/sahlanahdan8-bit/yt-livestream-controller.git
```

### 3. Instalasi & Konfigurasi Proyek

Masuk ke direktori proyek, instal dependensi, dan atur file konfigurasi.

```bash
# Masuk ke folder proyek
cd yt-livestream-controller

# Instal semua package yang dibutuhkan
npm install

# Build aplikasi untuk produksi
npm run build
```

Selanjutnya, buat file konfigurasi `.env`. File ini berisi variabel penting seperti Stream Key.

```bash
# Buat file .env baru
nano .env
```

Isi file `.env` dengan konfigurasi minimal berikut. Path direktori harus absolut.

```dotenv
# Konfigurasi Web Server
PORT=8080

# Konfigurasi Stream
STREAM_KEY=ganti-dengan-kunci-stream-anda
RTMP_URL=rtmp://a.rtmp.youtube.com/live2

# Path Absolut (PENTING: sesuaikan path jika instalasi tidak di /opt/stream)
DATA_DIR=/opt/stream/data
VIDEO_DIR=/opt/stream/videos

# Lingkungan
NODE_ENV=development
```

### 4. Jalankan Aplikasi (Mode Development)

Untuk menjalankan dalam mode development, Anda perlu membuka dua terminal terpisah.

```bash
# Di terminal 1, jalankan web server
npm run dev:web

# Di terminal 2, jalankan worker
npm run dev:worker
```

---

## 🛡️ Konfigurasi Firewall (UFW)

Jika Anda menggunakan Uncomplicated Firewall (UFW), pastikan untuk membuka port yang diperlukan.

```bash
# Izinkan koneksi SSH (port 22)
sudo ufw allow ssh

# Izinkan port aplikasi (8080)
sudo ufw allow 8080

# Aktifkan UFW
sudo ufw enable

# Verifikasi status
sudo ufw status
```

---

## 🧠 Menjalankan di Produksi (PM2)

PM2 adalah manajer proses yang akan menjaga aplikasi tetap berjalan dan me-restartnya secara otomatis jika terjadi crash.

```bash
# Instal PM2 secara global
sudo npm install pm2 -g

# Masuk ke direktori proyek Anda yang sudah di-build
cd yt-livestream-controller

# Jalankan kedua proses (web dan worker) dengan PM2
# PM2 akan menjalankan skrip 'start' dari package.json
pm2 start npm --name "streamer-web" -- run start:web
pm2 start npm --name "streamer-worker" -- run start:worker

# (Opsional) Konfigurasi PM2 agar berjalan saat server startup
pm2 save
pm2 startup
```
Anda akan diberikan sebuah perintah untuk dijalankan setelah `pm2 startup`. Salin dan jalankan perintah tersebut untuk menyelesaikan setup.

---

## 🌐 Mengakses Aplikasi

Setelah aplikasi berjalan, Anda dapat mengakses panel admin melalui browser di:

`http://IP_VPS_ANDA:8080`

---

## ⏰ Konfigurasi Timezone Server

Penting untuk memastikan waktu server akurat, terutama untuk penjadwalan.

```bash
# Cek status waktu saat ini
timedatectl status

# (Opsional) Lihat daftar timezone yang tersedia
timedatectl list-timezones | grep Asia

# Set timezone ke Waktu Indonesia Barat (WIB)
sudo timedatectl set-timezone Asia/Jakarta

# Restart aplikasi agar mengambil timezone baru
pm2 restart streamer-web streamer-worker
```

---

## 🧯 Troubleshooting

### Permission Folder Video

Proses worker perlu izin untuk membaca file video. Pastikan folder video (`/opt/stream/videos` atau path yang Anda tentukan di `.env`) dapat diakses.

```bash
# Contoh memberikan permission yang aman
# Ganti 'streamer' dengan nama user yang menjalankan aplikasi jika berbeda
sudo chown -R namauser:namauser /opt/stream/videos
sudo chmod -R 755 /opt/stream/videos
```
> ⚠️ **Keamanan**: Hindari menggunakan `chmod 777` di lingkungan produksi.

### Port Bentrok

Jika aplikasi gagal dijalankan karena port sudah digunakan, cari dan hentikan proses yang menggunakan port tersebut.

```bash
# Cari proses yang menggunakan port 8080
sudo lsof -i :8080

# Hentikan proses dengan PID yang ditemukan
sudo kill -9 <PID>
```

### Catatan untuk Produksi

Untuk penggunaan produksi yang serius, sangat disarankan untuk:
1.  Set `NODE_ENV=production` di file `.env` Anda.
2.  Menggunakan reverse proxy seperti Nginx atau Caddy untuk menyediakan akses melalui HTTPS (SSL/TLS). Ini penting untuk keamanan.