
import React from 'react';

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#161B22] border border-gray-700/50 rounded-lg">
    <div className="p-4 border-b border-gray-700/50">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
);

const Item: React.FC<{ title: string; symptom: string; fix: string | React.ReactNode; }> = ({ title, symptom, fix }) => (
  <div>
    <h3 className="font-semibold text-gray-200">{title}</h3>
    <p className="text-sm text-gray-400 mt-1"><span className="font-semibold">Gejala:</span> {symptom}</p>
    <div className="text-sm text-teal-400 mt-2">
      <span className="font-semibold text-green-400">✅ Fix:</span> {fix}
    </div>
  </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-gray-800 text-yellow-300 rounded px-2 py-1 font-mono text-xs">{children}</code>
);

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-[#0D1117] border border-gray-700/50 rounded-lg p-4 overflow-x-auto">
        <code className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
            {children}
        </code>
    </pre>
);

const TroubleshootingView = () => {
    const ffmpegCommand = `ffmpeg -re -stream_loop -1 -i /root/video.mp4 \\
-r 30 -vsync cfr -vf "scale=1280:720:flags=lanczos,format=yuv420p" \\
-c:v libx264 -preset veryfast -profile:v high -level 4.1 -pix_fmt yuv420p \\
-b:v 3000k -maxrate 3000k -bufsize 6000k -g 60 -keyint_min 60 \\
-c:a aac -b:a 128k -ar 44100 -ac 2 \\
-f flv "rtmps://a.rtmps.youtube.com/live2/YOUR_STREAM_KEY"`;

    const diagnosticCommands = `# proses teratas (cek ffmpeg/node pakai CPU)
ps aux --sort=-%cpu | head -15

# cek koneksi keluar / port
ss -tupn | grep ffmpeg

# log ffmpeg lebih jelas
ffmpeg -v info ... (atau -loglevel debug)

# bandwidth real-time
apt install nload -y && nload`;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">FFmpeg Streaming Troubleshooting Checklist</h1>
        <p className="text-gray-400">Common issues that cause "Bad" or "Disconnected" stream health on YouTube and how to fix them.</p>
        
        <Card title="1) SETTING ENCODER (FFmpeg) SALAH">
            <Item title="Keyframe interval (GOP) terlalu panjang" symptom="YouTube bilang “bingkai utama 8 detik”." fix={<>tambah <Code>-g 60 -keyint_min 60</Code> (30 fps) atau <Code>-g 120 -keyint_min 120</Code> (60 fps)</>} />
            <Item title="Bitrate ngaco (terlalu tinggi/spike)" symptom="“bitrate tidak stabil / buffering.”" fix={<>Gunakan CBR-ish: <Code>-b:v 3000k -maxrate 3000k -bufsize 6000k</Code> (720p30 contoh)</>} />
            <Item title="FPS mismatch / variable fps" symptom="jedag-jedug, laporan “frame rate tidak sesuai.”" fix={<>Pakai fps konstan: <Code>-r 30</Code> (atau <Code>-r 60</Code>) dan set <Code>-vsync cfr</Code></>} />
            <Item title="Resolusi tidak sesuai profil" symptom="YouTube turunin kualitas/komplain." fix={<>Pastikan scaler: <Code>-vf "scale=1280:720:flags=lanczos,format=yuv420p"</Code></>} />
            <Item title="Profil/level H.264 tidak kompatibel" symptom="Kompatibilitas video." fix={<>Tambah: <Code>-c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p</Code></>} />
            <Item title="Audio codec/samplerate salah" symptom="audio tidak ada / robotik." fix={<><Code>-c:a aac -b:a 128k -ar 44100 -ac 2</Code></>} />
            <Item title="Preset encoder terlalu berat" symptom="CPU 100%, drop frames." fix={<><Code>-preset veryfast</Code> (atau <Code>superfast</Code> buat VPS kecil)</>} />
        </Card>
        
        <Card title="2) JARINGAN / RTMP">
            <Item title="RTMP URL/Key salah" symptom="tidak connect." fix={<>Format: <Code>rtmp://a.rtmp.youtube.com/live2/STREAM_KEY</Code></>} />
            <Item title="Port keluar diblok firewall" symptom="Koneksi ditolak." fix="Pastikan outbound 1935/443 dibuka (YouTube RTMP pakai 1935, fallback 443)." />
            <Item title="Bandwidth tidak cukup / jitter tinggi" symptom="bitrate turun-naik parah." fix={<>Turunkan <Code>-b:v</Code> satu tingkat (mis. 4500k → 3000k), cek koneksi pakai <Code>nload</Code>/<Code>speedtest</Code>.</>} />
            <Item title="MTU/fragmentasi (jarang, tapi bikin putus-putus)" symptom="Stream putus-putus." fix={<>Coba RTMP TLS: <Code>rtmps://a.rtmps.youtube.com/live2/KEY</Code></>} />
        </Card>

        <Card title="3) SUMBER VIDEO / FILE">
            <Item title="File FPS beda dengan target" symptom="drop/dupe frames." fix={<>Pakai <Code>-r</Code> dan <Code>-vsync cfr</Code>, atau transcode: <Code>-vf fps=30</Code></>} />
            <Item title="Durasi habis / loop gagal" symptom="Stream berhenti setelah video selesai." fix={<>Pastikan <Code>-stream_loop -1</Code> sebelum <Code>-i</Code></>} />
        </Card>

        <Card title="4) RESOURCE VPS">
            <Item title="CPU tinggi (50–100%)" symptom="frame drop." fix={<>Cek <Code>htop</Code>. Naikkan preset (<Code>veryfast</Code>/<Code>superfast</Code>), turunkan resolusi/bitrate/fps.</>} />
            <Item title="Disk penuh (logs/db/uploads)" symptom="FFmpeg crash, service lain gagal." fix={<>Cek <Code>df -h</Code> dan bersihkan <Code>/var/log</Code>, cache apt.</>} />
            <Item title="RAM mepet" symptom="OOM kill (proses dimatikan sistem)." fix="Kurangi buffer (bitrate), tutup proses lain, atau tambah swap kecil." />
        </Card>
        
        <Card title="5) WAKTU / NTP">
            <Item title="Clock server ngaco" symptom="masalah tanda tangan/RTMP stall." fix={<><Code>timedatectl set-timezone Asia/Jakarta && timedatectl set-ntp true</Code></>} />
        </Card>

        <Card title="6) DOCKER / PERMISSION (kalau pakai container)">
             <Item title="Tidak bisa login / session hilang" symptom="Aplikasi tidak bisa login atau session hilang." fix="Dev: NODE_ENV=development (HTTP). Prod: NODE_ENV=production + akses lewat HTTPS." />
             <Item title="Folder permission (uploads/logs/db)" symptom="Aplikasi tidak bisa menulis file." fix={<><Code>chmod -R 755 public/uploads/</Code> (atau sesuai panduan app)</>} />
             <Item title="Port bentrok" symptom="Aplikasi gagal start." fix={<><Code>sudo lsof -i :PORT</Code> → <Code>sudo kill -9 PID</Code></>} />
        </Card>

        <Card title="7) REVERSE PROXY / NGINX">
            <Item title="Web kebuka tapi stream gagal (proxy salah)" symptom="UI/panel bisa diakses, stream tidak connect." fix="Jangan proxikan RTMP lewat Nginx HTTP biasa. FFmpeg push langsung ke rtmp(s):// YouTube. Nginx hanya buat UI/panel." />
        </Card>
        
        <Card title="8) PERINTAH FFmpeg CONTOH (720p 30fps stabil)">
           <CodeBlock>{ffmpegCommand}</CodeBlock>
        </Card>

        <Card title="9) DIAGNOSTIK CEPAT">
           <CodeBlock>{diagnosticCommands}</CodeBlock>
        </Card>
    </div>
  );
};

export default TroubleshootingView;
