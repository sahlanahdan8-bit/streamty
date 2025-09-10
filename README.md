# YouTube 24/7 Livestream Controller

This project provides a complete, production-ready solution for running a 24/7 YouTube livestream from a low-resource VPS (1 vCPU, 1-2 GB RAM). It features a lightweight web admin panel, a resilient FFmpeg worker process with auto-restart capabilities, and a suite of scripts for easy installation and maintenance.

---

### **Daftar Isi (Bahasa Indonesia)**
Proyek ini menyediakan solusi siap produksi untuk menjalankan livestream YouTube 24/7 dari VPS dengan sumber daya rendah. Lihat bagian di bawah untuk instruksi lengkap dalam Bahasa Inggris.

- **Fitur Utama**: Panel admin, auto-restart, monitoring real-time.
- **Instalasi Satu Perintah**: Jalankan skrip `install.sh` di server Ubuntu 22.04 LTS baru.
- **Konfigurasi**: Atur stream key dan unggah video setelah instalasi.
- **Troubleshooting**: Tips untuk mengatasi masalah umum.

---

## Key Features

- **Web Admin Dashboard**: A simple, clean React-based UI to monitor and control your stream.
- **High Reliability**: Designed for a 1-year uptime target with zero manual intervention.
  - **Auto-Restart**: Automatically restarts FFmpeg on failure (crash, stuck, zero bitrate).
  - **Exponential Backoff**: Prevents hammering the system with rapid restarts.
  - **Systemd Services**: Manages the web, worker, and watchdog processes, ensuring they run on boot and restart if they crash.
  - **External Watchdog**: An extra layer of monitoring to ensure the stream is always healthy.
- **Low Resource Usage**: Optimized for small VPS instances.
- **Flexible Video Sources**: Automatically creates a playlist from all videos in the `/opt/stream/videos` directory.

## One-Command Installation (Fresh Ubuntu 22.04 LTS)

1.  **Log in to your VPS as root.**

2.  **Clone the repository and run the installation script:**
    This single command will clone the repository, enter the directory, and execute the installation script with the necessary permissions.

    ```bash
    apt-get update && apt-get install -y git && git clone https://github.com/your-username/your-repo.git youtube-streamer && cd youtube-streamer && sudo bash scripts/install.sh
    ```
    *Note: Replace `https://github.com/your-username/your-repo.git` with the actual URL of this repository.*

3.  **The script will handle everything**:
    - Creating a dedicated `streamer` user.
    - Setting up directories (`/opt/stream`, `/opt/stream/videos`, etc.).
    - Installing Node.js and FFmpeg.
    - Building the application.
    - Setting up and enabling the `systemd` services.
    - Creating a default `.env` file.

## Post-Installation Configuration (Crucial!)

After the script finishes, you **must** configure your stream.

1.  **Edit the `.env` file**:
    ```bash
    sudo nano /opt/stream/.env
    ```
    - **Change `ADMIN_PASS`**: Set a strong, unique password for the web dashboard.
    - **Set `STREAM_KEY`**: Paste your stream key from YouTube.
    - Save the file (Ctrl+X, then Y, then Enter).

2.  **Restart the services** to apply the new configuration:
    ```bash
    sudo systemctl restart streamer-web streamer-worker
    ```

3.  **Upload Your Videos**:
    - Use SCP, SFTP, or rsync to upload your video files (`.mp4`, `.mkv`, etc.) to the `/opt/stream/videos` directory on your VPS. The system will automatically find them and create a looping playlist.

4.  **Access the Web UI**:
    - Open your browser and navigate to `http://<your-vps-ip>:8080`.
    - **Username**: `admin`
    - **Password**: The new password you just set.
    - Click "Start" to begin your livestream.

## Troubleshooting

-   **Check the service logs**:
    ```bash
    # Check the FFmpeg worker log (most common issues are here)
    sudo journalctl -u streamer-worker -n 100 --no-pager
    
    # Check the Web UI / API server log
    sudo journalctl -u streamer-web -n 100 --no-pager

    # Check the watchdog log
    sudo journalctl -u streamer-watchdog -n 100 --no-pager
    ```
-   **Check the raw log files**:
    - Worker log: `sudo tail -f /opt/stream/logs/worker.log`
    - FFmpeg raw output: `sudo tail -f /opt/stream/data/ffmpeg.log`

-   **Common Issues**:
    - **Invalid Stream Key**: Double-check your key in `/opt/stream/.env`.
    - **No Videos Uploaded**: The stream will fail if `/opt/stream/videos` is empty.
    - **Firewall**: If you use `ufw`, ensure you allow the port: `sudo ufw allow 8080/tcp`.

## Hardening & Security Checklist

-   [x] **Change Default Password**: Done in the post-installation steps.
-   [x] **Run Services as Non-Root User**: The `install.sh` script creates a dedicated `streamer` user.
-   [ ] **Firewall**: Manually enable `ufw` if needed.
-   [ ] **Reverse Proxy (Optional but Recommended)**: Set up Nginx or Caddy to add SSL/TLS (HTTPS).
