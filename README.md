# YouTube 24/7 Livestream Controller

Sebuah panel admin berbasis web untuk mengelola livestream YouTube 24/7 menggunakan FFmpeg di VPS. Didesain untuk keandalan tinggi dengan fitur monitoring, kontrol start/stop, dan kemampuan auto-restart.

---

## ⚡ Instalasi Cepat (Otomatis)

Metode ini direkomendasikan untuk **server Ubuntu 22.04 LTS yang baru dan bersih**. Perintah tunggal ini akan mengunduh dan menjalankan skrip instalasi yang menangani semua dependensi dan konfigurasi secara otomatis.

```bash
curl -o install.sh https://raw.githubusercontent.com/sahlanahdan8-bit/yt-livestream-controller/main/install.sh && chmod +x install.sh && ./install.sh
```

---

## 🔧 Instalasi Manual (Langkah demi Langkah)

Gunakan panduan ini jika Anda ingin kontrol penuh atau menginstal di sistem yang sudah ada. Ikuti setiap langkah dengan teliti.

### Tahap 1: Persiapan Server dan Dependensi

Pertama, kita akan memperbarui server dan menginstal semua perangkat lunak yang dibutuhkan.

**1.1. Perbarui Sistem Operasi**
Selalu mulai dengan memperbarui daftar paket dan meng-upgrade sistem Anda untuk keamanan dan stabilitas.
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

**1.2. Instal Git dan FFmpeg**
`git` dibutuhkan untuk mengunduh kode aplikasi, dan `ffmpeg` adalah mesin inti untuk streaming.
```bash
sudo apt-get install -y git ffmpeg
```

**1.3. Instal Node.js v20**
Aplikasi ini berjalan di atas Node.js. Perintah ini akan menambahkan repositori NodeSource dan menginstal versi 20.
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**1.4. Verifikasi Instalasi**
Pastikan semua perangkat lunak terinstal dengan benar.
```bash
node --version
npm --version
ffmpeg -version
```
> Anda seharusnya melihat output versi untuk setiap perintah, misalnya `v20.x.x`.

### Tahap 2: Unduh dan Konfigurasi Aplikasi

Sekarang kita akan mengunduh aplikasi dan mengatur konfigurasinya.

**2.1. Unduh, Masuk, dan Instal Dependensi**
Salin dan tempel **seluruh blok di bawah ini** ke terminal. Perintah ini akan mengunduh repositori, langsung masuk ke foldernya, dan menginstal semua pustaka yang dibutuhkan.
```bash
git clone https://github.com/sahlanahdan8-bit/yt-livestream-controller.git && cd yt-livestream-controller && npm install
```
> ✅ **Info**: Karena repositori ini bersifat publik, Anda tidak akan dimintai username atau password. Perintah ini dirancang untuk berhenti jika salah satu langkah gagal, jadi Anda bisa langsung tahu jika ada masalah.

**2.2. Buat File Konfigurasi `.env`**
Salin dan tempel **seluruh blok di bawah ini** ke terminal Anda lalu tekan Enter. Ini akan secara otomatis membuat file `.env` di dalam direktori `yt-livestream-controller`.
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

**2.3. Edit File Konfigurasi (WAJIB!)**
Buka file yang baru saja dibuat untuk memasukkan Kunci Stream YouTube Anda.
```bash
nano .env
```
Di dalam editor `nano`:
1.  Cari baris `STREAM_KEY=ganti-dengan-kunci-stream-anda`.
2.  Ganti `ganti-dengan-kunci-stream-anda` dengan Kunci Stream Anda yang sebenarnya.
3.  Tekan `CTRL + X`, lalu `Y`, lalu `Enter` untuk menyimpan dan keluar.

### Tahap 3: Build dan Jalankan Aplikasi

Aplikasi siap untuk di-build dan dijalankan secara permanen menggunakan PM2.

**3.1. Build Aplikasi**
Perintah ini akan mengompilasi kode dari TypeScript ke JavaScript agar siap dijalankan di lingkungan produksi.
```bash
npm run build
```

**3.2. Instal PM2 (Process Manager)**
PM2 adalah alat yang akan menjaga aplikasi Anda tetap berjalan 24/7 dan me-restartnya secara otomatis jika terjadi crash.
```bash
sudo npm install pm2 -g
```

**3.3. Jalankan Aplikasi dengan PM2**
Jalankan perintah ini dari dalam direktori `yt-livestream-controller`. PM2 akan menjalankan proses server web dan worker streaming.
```bash
pm2 start npm --name "streamer-web" -- run start:web
pm2 start npm --name "streamer-worker" -- run start:worker
```

**3.4. (Opsional) Atur PM2 agar Berjalan saat Startup**
Langkah ini sangat direkomendasikan agar aplikasi otomatis berjalan kembali setelah server di-reboot.
```bash
pm2 save
pm2 startup
```
> 👉 Setelah menjalankan `pm2 startup`, Anda akan diberikan satu perintah lagi oleh PM2. Salin dan jalankan perintah tersebut untuk menyelesaikan proses.

### Tahap 4: Konfigurasi Firewall dan Akses

Langkah terakhir adalah memastikan aplikasi dapat diakses dari luar.

**4.1. Buka Port di Firewall (UFW)**
Izinkan koneksi masuk ke port yang digunakan oleh aplikasi (misalnya 8080) dan port SSH.
```bash
sudo ufw allow ssh
sudo ufw allow 8080
sudo ufw enable
```
> Saat diminta konfirmasi untuk `ufw enable`, ketik `y` lalu Enter.

**4.2. Akses Aplikasi**
Sekarang Anda dapat mengakses panel admin melalui browser di:
`http://IP_VPS_ANDA:8080`

Selamat, instalasi selesai! Anda dapat mulai mengunggah video dan mengelola stream Anda.