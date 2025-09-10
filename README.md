# Streanty

Panel admin berbasis web untuk mengelola dan memonitor livestream 24/7 di server pribadi (VPS). Dirancang untuk keandalan tinggi dengan fitur kontrol, penjadwalan, dan kemampuan auto-restart.

---

## ⚡ Instalasi Cepat (Otomatis)

Metode ini **sangat direkomendasikan** untuk server **Ubuntu 22.04 LTS yang baru dan bersih**. Cukup salin, tempel, dan jalankan satu perintah ini di terminal Anda. Skrip akan menangani semua dependensi dan konfigurasi secara otomatis.

> 👉 **Peringatan:** Jangan jalankan skrip ini di server yang sudah memiliki aplikasi web lain, karena dapat menimpa konfigurasi yang ada.

```bash
curl -o install.sh https://raw.githubusercontent.com/sahlanahdan8-bit/Streanty/main/install.sh && chmod +x install.sh && ./install.sh
```

---

## 🔧 Instalasi Manual (Langkah demi Langkah)

Gunakan panduan ini jika Anda ingin kontrol penuh, menginstal pada sistem operasi yang berbeda, atau pada server yang sudah ada.

### 1. Persiapan Server

**a. Perbarui Sistem Operasi**
Selalu mulai dengan memperbarui daftar paket perangkat lunak server Anda untuk keamanan dan stabilitas.
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

**b. Instal Dependensi Utama (Git, FFmpeg, Node.js)**
Kita butuh `git` untuk mengunduh kode, `ffmpeg` sebagai mesin streaming, dan `Node.js` untuk menjalankan aplikasi.
```bash
# Instal Git dan FFmpeg
sudo apt-get install -y git ffmpeg

# Instal Node.js versi 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**c. Verifikasi Instalasi**
Pastikan semua perangkat lunak terinstal dengan benar dengan memeriksa versinya.
```bash
node --version
npm --version
ffmpeg -version
```
> ✅ **Hasil yang Diharapkan:** Anda akan melihat output versi untuk setiap perintah (misalnya, `v22.x.x`).

### 2. Konfigurasi Aplikasi

**a. Unduh Aplikasi**

Pilih **salah satu** dari dua metode di bawah ini untuk mendapatkan kode aplikasi.

**Opsi 1: Menggunakan Git (Direkomendasikan)**

Metode ini adalah cara standar dan memudahkan untuk mendapatkan pembaruan di masa depan.
```bash
git clone https://github.com/sahlanahdan8-bit/Streanty.git
cd Streanty
```

**Opsi 2: Menggunakan File ZIP (Jika Sudah Diunggah)**

Gunakan metode ini jika Anda telah mengunggah file `.zip` proyek ke VPS Anda.
```bash
# 1. (Jika belum ada) Instal 'unzip'
sudo apt-get install -y unzip

# 2. Ekstrak file zip Anda (ganti nama file jika berbeda)
unzip Streanty-main.zip

# 3. Ganti nama folder agar sesuai dengan panduan (PENTING!)
mv Streanty-main Streanty

# 4. Masuk ke folder aplikasi
cd Streanty
```
> 👉 **Catatan:** Nama folder setelah ekstraksi biasanya `Streanty-main`. Perintah `mv` di atas mengubahnya menjadi `Streanty` agar semua perintah lain dalam panduan ini berfungsi tanpa perlu diubah.

**b. Instal Pustaka (Dependencies)**

Setelah berada di dalam folder `Streanty` (baik dari `git clone` maupun `unzip`), jalankan perintah ini untuk menginstal semua pustaka yang dibutuhkan.
```bash
npm install
```

**c. Buat File Konfigurasi `.env`**
File ini menyimpan semua pengaturan penting. Salin dan tempel blok di bawah ini untuk membuatnya.
```bash
cat << EOF > .env
PORT=7575
SESSION_SECRET=ganti_dengan_teks_acak_yang_sangat_panjang_dan_aman
NODE_ENV=development
EOF
```
> ⚠️ **Penting:** Ganti nilai `SESSION_SECRET` dengan string acak buatan Anda sendiri (misalnya, dari generator password).

**d. Build Aplikasi**
Karena ini adalah proyek TypeScript, kita perlu mengkompilasi kode ke JavaScript biasa.
```bash
npm run build
```

**e. Jalankan Aplikasi (Mode Development)**
Untuk pengujian, Anda bisa menjalankan server dengan perintah berikut. Buka dua terminal, satu untuk web dan satu untuk worker.
```bash
# Di terminal 1
npm run dev:web

# Di terminal 2
npm run dev:worker
```

---

## 🧠 Process Manager (PM2)

PM2 akan menjaga aplikasi Anda tetap berjalan 24/7 dan me-restartnya secara otomatis jika terjadi crash.

**1. Instal PM2 Secara Global**
```bash
sudo npm install pm2 -g
```

**2. Jalankan Aplikasi dengan PM2**
Perintah ini akan memulai server web dan worker streaming dengan nama `streamflow`.
```bash
pm2 start npm --name "streamflow-web" -- run start:web
pm2 start npm --name "streamflow-worker" -- run start:worker
```

**3. Simpan Konfigurasi PM2 (Sangat Direkomendasikan)**
Langkah ini memastikan aplikasi Anda akan otomatis berjalan kembali jika server di-reboot.
```bash
pm2 save
pm2 startup
```
> 👉 **Perhatian:** Setelah menjalankan `pm2 startup`, terminal akan memberikan satu perintah lagi. Salin dan jalankan perintah tersebut untuk menyelesaikan proses.

---

## 🛡️ Firewall (UFW)

Buka akses port agar panel admin dapat diakses dari browser.

**1. Izinkan Koneksi**
Perintah ini akan membuka port SSH (untuk Anda) dan port aplikasi (7575).
```bash
sudo ufw allow ssh
sudo ufw allow 7575
```

**2. Aktifkan dan Cek Status Firewall**
```bash
sudo ufw enable
sudo ufw status
```
> Saat diminta konfirmasi, ketik `y` lalu tekan `Enter`.

---

## 🌐 Akses Aplikasi

Instalasi selesai! Buka browser Anda dan navigasi ke alamat berikut:
`http://IP_SERVER_ANDA:7575`

---

## 🔐 Reset Password

Jika aplikasi Anda memiliki fitur reset password melalui skrip, jalankan perintah ini dari dalam direktori aplikasi.
```bash
# Pastikan Anda berada di dalam folder /Streanty
node reset-password.js
```

---

## ⏰ Timezone Server

Pengaturan waktu yang benar penting untuk penjadwalan dan logging.

**1. Cek Timezone Saat Ini**
```bash
timedatectl status
```

**2. Set Timezone ke Waktu Indonesia Barat (WIB)**
```bash
sudo timedatectl set-timezone Asia/Jakarta
```

**3. Restart Aplikasi untuk Menerapkan Perubahan**
```bash
pm2 restart streamflow-web streamflow-worker
```

---

## 🐳 Deploy via Docker

Sebagai alternatif dari instalasi manual, Anda dapat menggunakan Docker untuk deployment yang terisolasi dan konsisten.

**1. Persiapan Environment**
Buat file `.env` di root proyek dengan konten berikut:
```
PORT=7575
SESSION_SECRET=ganti_dengan_teks_acak_yang_sangat_panjang_dan_aman
NODE_ENV=development
```

**2. Build dan Jalankan Container**
```bash
docker-compose up --build
```
Aplikasi sekarang dapat diakses di `http://localhost:7575` (atau `http://IP_SERVER_ANDA:7575`).

**3. Data Persistence**
Data akan tersimpan secara otomatis di volume Docker yang ter-map ke folder lokal:
-   **Database:** `db/`
-   **Logs:** `logs/`
-   **Uploads:** `public/uploads/`

**4. Reset Password (dalam Container)**
Jika fitur ini tersedia, jalankan perintah berikut dari terminal host:
```bash
docker-compose exec app node reset-password.js
```

---

## 🧯 Troubleshooting

**Permission Error (Gagal Upload)**
Jika aplikasi gagal mengunggah file, perbaiki izin folder.
```bash
chmod -R 755 public/uploads/
```
> ⚠️ **Catatan Keamanan:** Hindari menggunakan `chmod 777` di lingkungan produksi. `755` sudah cukup untuk sebagian besar kasus.

**Port Already in Use**
Jika aplikasi gagal start karena port sudah terpakai.
```bash
# Cek proses yang menggunakan port 7575
sudo lsof -i :7575

# Matikan proses tersebut jika diperlukan
sudo kill -9 <PID>
```

**Database Error / Reset Data**
Untuk mereset database ke kondisi awal.
> ⚠️ **PERINGATAN:** Perintah ini akan **menghapus semua data** yang ada secara permanen.
```bash
# Hapus file database
rm db/*.db

# Restart aplikasi untuk membuat database baru
pm2 restart streamflow-web
```

**Masalah Session/Login di Produksi**
-   Pastikan `NODE_ENV=production` di file `.env`.
-   Akses aplikasi **wajib melalui HTTPS**. Cookie session modern memerlukan koneksi aman (HTTPS) untuk dapat berfungsi dengan benar di browser.