# YouTube 24/7 Livestream Controller

Sebuah panel admin berbasis web untuk mengelola livestream YouTube 24/7 menggunakan FFmpeg di VPS. Didesain untuk keandalan tinggi dengan fitur monitoring, kontrol start/stop, dan kemampuan auto-restart.

---

## ⚡ Instalasi Cepat (Otomatis)

Metode ini **sangat direkomendasikan** untuk server **Ubuntu 22.04 LTS yang baru dan bersih**. Cukup salin, tempel, dan jalankan satu perintah ini di terminal Anda. Skrip akan menangani semua dependensi dan konfigurasi secara otomatis.

> 👉 **Peringatan:** Jangan jalankan skrip ini di server yang sudah memiliki aplikasi web lain, karena dapat menimpa konfigurasi yang ada.

```bash
curl -o install.sh https://raw.githubusercontent.com/sahlanahdan8-bit/yt-livestream-controller/main/install.sh && chmod +x install.sh && ./install.sh
```

---

## 🔧 Instalasi Manual (Langkah demi Langkah)

Gunakan panduan ini jika Anda ingin kontrol penuh, menginstal pada sistem operasi yang berbeda, atau pada server yang sudah ada. Ikuti setiap langkah dengan teliti untuk memastikan keberhasilan.

### Tahap 1: Persiapan Server

Di tahap ini, kita akan memperbarui server dan menginstal semua perangkat lunak yang dibutuhkan oleh aplikasi.

**1. Perbarui Sistem Operasi**
Selalu mulai dengan memperbarui daftar paket perangkat lunak server Anda. Ini penting untuk keamanan dan stabilitas.
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

**2. Instal Git dan FFmpeg**
Kita butuh `git` untuk mengunduh kode aplikasi, dan `ffmpeg` sebagai mesin inti untuk streaming video.
```bash
sudo apt-get install -y git ffmpeg
```

**3. Instal Node.js versi 20**
Aplikasi ini berjalan di atas Node.js. Perintah di bawah ini akan menambahkan repositori resmi Node.js dan menginstal versi 20.
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**4. Verifikasi Instalasi**
Pastikan semua perangkat lunak utama terinstal dengan benar dengan memeriksa versinya.
```bash
node --version
npm --version
ffmpeg -version
```
> ✅ **Hasil yang Diharapkan:** Anda akan melihat output versi untuk setiap perintah (misalnya, `v20.x.x`). Jika ada error, ulangi langkah sebelumnya.

---

### Tahap 2: Unduh dan Konfigurasi Aplikasi

Sekarang kita akan mengunduh aplikasi dari GitHub dan mengatur konfigurasinya.

**1. Unduh Aplikasi dan Instal Dependensi**
Salin dan tempel **seluruh blok kode di bawah ini**. Perintah ini akan mengunduh repositori, langsung masuk ke dalam foldernya, dan menginstal semua pustaka yang dibutuhkan.
```bash
git clone https://github.com/sahlanahdan8-bit/yt-livestream-controller.git && cd yt-livestream-controller && npm install
```
> 👉 **Penting:** Semua perintah selanjutnya harus dijalankan dari dalam direktori `yt-livestream-controller`.

**2. Buat File Konfigurasi `.env`**
File ini menyimpan semua pengaturan penting seperti Kunci Stream Anda. Salin dan tempel **seluruh blok kode di bawah ini** untuk membuatnya secara otomatis.
```bash
cat << EOF > .env
# Konfigurasi Web Server
PORT=8080

# Konfigurasi Stream (WAJIB DIUBAH)
STREAM_KEY=ganti-dengan-kunci-stream-anda
RTMP_URL=rtmp://a.rtmp.youtube.com/live2

# Path Absolut (PENTING: sesuaikan jika path instalasi berbeda)
# Menggunakan $(pwd) untuk secara otomatis mengisi direktori saat ini
DATA_DIR=$(pwd)/data
VIDEO_DIR=$(pwd)/videos

# Lingkungan
NODE_ENV=production
EOF
```

**3. ❗ Edit File Konfigurasi (Langkah Wajib!)**
Buka file yang baru saja dibuat menggunakan editor teks `nano` untuk memasukkan Kunci Stream YouTube Anda.
```bash
nano .env
```
Di dalam editor `nano`:
1.  Gunakan tombol panah untuk mencari baris `STREAM_KEY=ganti-dengan-kunci-stream-anda`.
2.  Hapus `ganti-dengan-kunci-stream-anda` dan masukkan Kunci Stream Anda yang sebenarnya.
3.  Untuk menyimpan dan keluar, tekan `CTRL + X`, lalu tekan `Y`, dan terakhir tekan `Enter`.

---

### Tahap 3: Build dan Jalankan Aplikasi

Aplikasi siap untuk di-build (dikompilasi) dan dijalankan secara permanen menggunakan manajer proses PM2.

**1. Build Aplikasi**
Perintah ini akan mengubah kode sumber (TypeScript) menjadi kode JavaScript yang siap dijalankan dan dioptimalkan.
```bash
npm run build
```

**2. Instal PM2 (Process Manager)**
PM2 adalah alat yang akan menjaga aplikasi Anda tetap berjalan 24/7. Jika terjadi crash, PM2 akan me-restartnya secara otomatis.
```bash
sudo npm install pm2 -g
```

**3. Jalankan Aplikasi dengan PM2**
Perintah ini akan memulai dua proses: server web (antarmuka) dan worker streaming (mesin ffmpeg).
```bash
pm2 start npm --name "streamer-web" -- run start:web
pm2 start npm --name "streamer-worker" -- run start:worker
```
> ✅ **Cek Status:** Anda bisa melihat status proses dengan `pm2 list`. Keduanya harus dalam keadaan `online`.

**4. Atur PM2 agar Berjalan saat Startup (Sangat Direkomendasikan)**
Langkah ini memastikan aplikasi Anda akan otomatis berjalan kembali jika server di-reboot.
```bash
pm2 save
pm2 startup
```
> 👉 **Perhatian:** Setelah menjalankan `pm2 startup`, terminal akan memberikan satu perintah lagi. Salin dan jalankan perintah tersebut untuk menyelesaikan proses.

---

### Tahap 4: Buka Akses Firewall

Langkah terakhir adalah membuka port di firewall agar panel admin dapat diakses dari browser.

**1. Izinkan Koneksi di UFW (Uncomplicated Firewall)**
Perintah ini akan membuka port SSH (untuk Anda) dan port aplikasi (default 8080).
```bash
sudo ufw allow ssh
sudo ufw allow 8080
sudo ufw enable
```
> Saat diminta konfirmasi untuk `ufw enable`, ketik `y` lalu tekan `Enter`. Jika Anda mengubah `PORT` di file `.env`, ganti `8080` di atas sesuai dengan port Anda.

**2. Akses Panel Admin**
Instalasi selesai! Buka browser Anda dan navigasi ke alamat berikut:
`http://IP_VPS_ANDA:8080`

---

### Manajemen Aplikasi (Setelah Instalasi)

Berikut adalah beberapa perintah PM2 yang berguna untuk mengelola aplikasi Anda.

- **Melihat Log Aplikasi (untuk troubleshooting):**
  ```bash
  # Melihat log dari worker streaming (ffmpeg)
  pm2 logs streamer-worker

  # Melihat log dari server web
  pm2 logs streamer-web
  ```

- **Menghentikan, Memulai, atau Me-restart Aplikasi:**
  ```bash
  # Menghentikan semua proses
  pm2 stop all

  # Memulai ulang semua proses
  pm2 restart all

  # Menghapus proses dari daftar PM2
  pm2 delete all
  ```

- **Menambahkan Video:**
  Unggah file video Anda (misalnya via SFTP atau SCP) ke dalam direktori `~/yt-livestream-controller/videos`. Aplikasi akan secara otomatis mendeteksinya.