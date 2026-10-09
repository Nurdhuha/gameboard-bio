# 📋 IMPLEMENTATION PLAN: WEBSITE BOARD GAME EDUKASI EKOSISTEM (KELAS X SMA)
## Status: Final Architecture Design (Full Digital Integrated Web App)

Berdasarkan keputusan pengguna:
1. **Mode**: **Full Digital Web App** (Siswa bermain langsung di perangkat, pion bergerak digital, LKPD & lencana terintegrasi).
2. **Aset Visual**: Menggunakan gambar asli [image.png](file:///D:/Gameboard/image.png) (1600 × 1600 px) sebagai background kanvas papan permainan.
3. **Fitur Tambahan**: **Pre-test & Post-test** terintegrasi langsung dalam sistem untuk mengukur peningkatan keterampilan berpikir kritis siswa.

### 📑 Daftar Isi
1. [Rekomendasi Tech Stack Paling Sesuai](#1-rekomendasi-tech-stack-paling-sesuai)
2. [Struktur Modul & Alur Terintegrasi (3 Pertemuan)](#2-struktur-modul--alur-terintegrasi-3-pertemuan)
3. [Sistem Pemetaan 50 Petak pada image.png](#3-sistem-pemetaan-50-petak-pada-imagepng)
4. [Fitur Spesifik Berpikir Kritis & Gamifikasi](#4-fitur-spesifik-berpikir-kritis--gamifikasi)
5. [Rencana Tahapan Eksekusi (Sprint Plan)](#5-rencana-tahapan-eksekusi-sprint-plan)
6. [Rancangan Arsitektur Backend (Server, Database & Real-Time Sync)](#6-rancangan-arsitektur-backend-server-database--real-time-sync)
   * 6.1 [Topologi & Strategi Dual-Deployment (Cloud vs Offline LAN)](#61-topologi--strategi-dual-deployment-cloud-vs-offline-lan-sekolah)
   * 6.2 [Skema Database (ERD & DDL SQL)](#62-skema-database-database-schema--entity-relationship)
   * 6.3 [Protokol Real-Time WebSocket (Socket.io)](#63-protokol-real-time-websocket-socketio)
   * 6.4 [Penanganan Atomic Speed Badge Race & Mutex](#64-penanganan-masalah-kritis-atomic-speed-badge-race)
   * 6.5 [Spesifikasi REST API Endpoints](#65-spesifikasi-rest-api-endpoints)
   * 6.6 [Struktur Direktori Proyek Backend (`/backend`)](#66-struktur-direktori-proyek-backend-backend)
   * 6.7 [Langkah-Langkah Eksekusi Implementasi Backend](#67-langkah-langkah-eksekusi-implementasi-backend)
   * 6.8 [Panduan Praktis Deployment: Render.com + Supabase](#68-panduan-praktis-deployment-rendercom--supabase-100-free-tier)

---

## 1. Rekomendasi Tech Stack Paling Sesuai

Untuk mengolah mentahan [image.png](file:///D:/Gameboard/image.png) (1600 × 1600 px) menjadi papan interaktif yang cepat, mulus, dan tahan terhadap kondisi internet sekolah, stack terbaik yang direkomendasikan adalah:

```mermaid
flowchart TD
    subgraph Frontend [Client Layer - PWA Ready]
        A1[React 19 + TypeScript + Vite] --> A2[Tailwind CSS + Shadcn UI]
        A1 --> A3[SVG Coordinate Overlay System]
        A1 --> A4[Framer Motion - Pawn Animation]
        A1 --> A5[Panzoom - Smooth Zoom & Pan on Mobile]
    end

    subgraph Backend [Real-time & Server Layer]
        B1[Node.js + Express] --> B2[Socket.io - Realtime Movement & Race]
        B1 --> B3[SQLite / Supabase Postgres]
        B1 --> B4[Multer / Local / Cloud Storage - Upload Media Siswa]
    end

    Frontend <-->|WebSockets & REST API| Backend
```

### Rincian Komponen Tech Stack:
| Komponen | Pilihan Teknologi | Alasan Kesesuaian untuk Project Ini |
| :--- | :--- | :--- |
| **Frontend Framework** | **React + Vite (TypeScript)** | Sangat ringan, booting super cepat, dan mudah di-bundle menjadi aplikasi responsif untuk HP/Laptop siswa. |
| **Papan Game Engine** | **Interactive SVG Overlay di atas `image.png` (1600x1600)** | Menggunakan sistem koordinat `viewBox="0 0 1600 1600"`. Pin petak, pion, efek hover, dan animasi lompat pion akan **100% presisi** di atas gambar asli tanpa pecah di layar apapun. |
| **Animasi & Interaksi** | **Framer Motion + Panzoom** | Memungkinkan siswa melakukan *pinch-to-zoom* dan *drag-to-pan* di HP saat melihat peta pulau, serta animasi pion melompat antar petak secara mulus (*smooth bezier curves*). |
| **Realtime Engine** | **Socket.io + Node.js** (atau **Supabase Realtime**) | Memastikan saat Kelompok 1 menyelesaikan tugas, pion mereka langsung bergerak di layar proyektor guru dan layar kelompok lain secara instan tanpa perlu reload. |
| **Basis Data** | **SQLite (Better-SQLite3)** atau **PostgreSQL** | Struktur data yang efisien untuk menyimpan jawaban LKPD, urutan lencana, dan skor pre/post-test. Sangat mudah di-*backup* atau dioperasikan secara offline di LAN sekolah jika internet mati. |

---

## 2. Struktur Modul & Alur Terintegrasi (3 Pertemuan)

Sistem membagi 24 aktivitas dan 50 petak ke dalam **3 Pertemuan Terstruktur**. Alur kerja dan interaksi antara Siswa (Gameboard) serta Guru (Fasilitator & Penilai) disajikan pada diagram alur berikut:

```mermaid
flowchart TD
    subgraph P1["📅 PERTEMUAN 1: Komponen Ekosistem (90 Menit)"]
        direction TB
        P1_A["1. Login Kelompok & Masuk Ruang Game"]
        P1_SPIN["2. 🎡 Sesi Spin: Penentuan Urutan Giliran Kelompok (Roda Putar)"]
        P1_B["3. Mengerjakan Pre-Test Berpikir Kritis (10 Soal C2-C5)"]
        P1_C["4. Menjelajah ZONA 1 (Komponen Ekosistem: Petak 1 s.d. 10)"]
        P1_D["5. 🏆 PEREBUTAN LENCANA 1 di Petak 10 (Juara 1, 2, 3)"]
        P1_E["6. 👨‍🏫 Guru: Penilaian Rubrik LKPD Zona 1 (Skor 0 - 3 per aktivitas)"]
        
        P1_A --> P1_SPIN --> P1_B --> P1_C --> P1_D --> P1_E
    end

    subgraph P2["📅 PERTEMUAN 2: Interaksi & Aliran Energi (90 Menit)"]
        direction TB
        P2_A["1. 📢 Pengumuman Hasil Skor LKPD Zona 1"]
        P2_B["2. Menjelajah ZONA 2 (Interaksi Makhluk Hidup: Petak 11 s.d. 22)"]
        P2_C["3. 🏆 PEREBUTAN LENCANA 2 di Petak 22 (Juara 1, 2, 3)"]
        P2_D["4. Menjelajah ZONA 3 (Aliran Energi: Petak 23 s.d. 38)"]
        P2_E["5. 🏆 PEREBUTAN LENCANA 3 di Petak 38 (Juara 1, 2, 3)"]
        P2_F["6. 👨‍🏫 Guru: Penilaian Rubrik LKPD Zona 2 & 3"]

        P2_A --> P2_B --> P2_C --> P2_D --> P2_E --> P2_F
    end

    subgraph P3["📅 PERTEMUAN 3: Jenis Ekosistem & Evaluasi Akhir (90 Menit)"]
        direction TB
        P3_A["1. 📢 Pengumuman Hasil Skor LKPD Zona 2 & 3"]
        P3_B["2. Menjelajah ZONA 4 (Jenis-Jenis Ekosistem: Petak 39 s.d. 50)"]
        P3_C["3. 🏆 PEREBUTAN LENCANA 4 di Petak 50 (Juara 1, 2, 3)"]
        P3_D["4. Mengerjakan Post-Test Berpikir Kritis (Evaluasi Akhir)"]
        P3_E["5. 👨‍🏫 Guru: Finalisasi Penilaian & Analisis N-Gain"]
        P3_F["6. 🥇 SELEBRASI GRAND LEADERBOARD (Total Skor LKPD + Lencana)"]

        P3_A --> P3_B --> P3_C --> P3_D --> P3_E --> P3_F
    end

    P1 -->|Lanjut ke Minggu/Sesi Berikutnya| P2
    P2 -->|Lanjut ke Minggu/Sesi Berikutnya| P3
```

### Matriks Rincian Alur Pembelajaran per Pertemuan:

| Sesi Pertemuan | Cakupan Zona & Petak | Aktivitas Siswa di Gameboard | Tindakan Guru di Dashboard | Output & Rekapitulasi Nilai |
| :--- | :--- | :--- | :--- | :--- |
| **Pertemuan 1** | **Zona 1 (Petak 1–10)**<br>Sub-materi: *Komponen Ekosistem* | • Mengerjakan Pre-test (individu/tim)<br>• Selesaikan 6 aktivitas KE-01 s.d. KE-06<br>• Race kecepatan menuju Petak 10 | • Buka Sesi Pertemuan 1<br>• Pantau live peta proyektor<br>• Beri skor rubrik (0–3) untuk KE-01 s.d. KE-06 | • Skor Pre-test<br>• Poin Lencana 1 (3, 2, 1 pt)<br>• Skor LKPD KE (0–18 pt) |
| **Pertemuan 2** | **Zona 2 (Petak 11–22)**<br>Sub-materi: *Interaksi Makhluk Hidup*<br><br>**Zona 3 (Petak 23–38)**<br>Sub-materi: *Aliran Energi* | • Lihat skor Zona 1 yang telah dinilai<br>• Selesaikan IA-01 s.d. IA-06 (Race Petak 22)<br>• Selesaikan AE-01 s.d. AE-06 (Race Petak 38)<br>• Upload video peragaan 1 menit | • Buka Sesi Pertemuan 2<br>• Tampilkan update leaderboard<br>• Beri skor rubrik untuk aktivitas IA & AE | • Poin Lencana 2 (3, 2, 1 pt)<br>• Poin Lencana 3 (3, 2, 1 pt)<br>• Skor LKPD IA & AE (0–36 pt) |
| **Pertemuan 3** | **Zona 4 (Petak 39–50)**<br>Sub-materi: *Jenis Ekosistem* | • Selesaikan JE-01 s.d. JE-06 (Race Petak 50)<br>• Mengerjakan Post-test evaluasi<br>• Melihat selebrasi juara kelas | • Buka Sesi Pertemuan 3<br>• Nilai aktivitas JE-01 s.d. JE-06<br>• Umumkan Juara Kelas (LKPD + Lencana) | • Poin Lencana 4 (3, 2, 1 pt)<br>• Skor LKPD JE (0–18 pt)<br>• Skor Post-test & N-Gain<br>• **Pemenang Akhir (Maks 84 pt)** |

---

## 3. Sistem Pemetaan 50 Petak pada `image.png`

Karena ukuran gambar asli adalah **1600 × 1600 pixel**, kita menggunakan matriks koordinat $(X, Y)$ tepat di atas masing-masing bulatan petak:

* **Pintu Masuk (START)**: Sekitar $(280, 1530)$
* **Zona 1 (Bawah Tengah - Jalur Awal)**:
  * Petak 1: $(275, 1435)$
  * Petak 2 (🌿 KE-01): $(350, 1385)$
  * Petak 3 (🐉 KE-02): $(425, 1435)$
  * Petak 4: $(500, 1385)$
  * Petak 5 (🐉 KE-03): $(575, 1435)$
  * Petak 6 (🌿 KE-04): $(650, 1385)$
  * Petak 7: $(725, 1335)$
  * Petak 8 (🐉 KE-05): $(695, 1260)$
  * Petak 9: $(615, 1205)$
  * Petak 10 (🌟 Lencana Zona 1): $(550, 1160)$
* **Zona 2 (Pulau Tengah Hijau)**: Petak 11 s/d 22 (Jembatan gantung & pulau tengah)
* **Zona 3 (Atas Lautan & Arktik Kiri Atas)**: Petak 23 s/d 38
* **Zona 4 (Sisi Kiri Menuju Finish)**: Petak 39 s/d 50
* **FINISH**: $(100, 1420)$

Setiap elemen petak pada SVG memiliki struktur data:
1. `id`: Nomor urut petak (1–50).
2. `type`: `'step'` (petak langkah biasa), `'challenge'` (🌿 aktivitas pengamatan), `'riddle'` (🐉 aktivitas analitis), atau `'badge'` (🌟 perebutan lencana 10, 22, 38, 50).
3. `status`: `'locked'` (terkunci), `'current'` (posisi aktif), atau `'completed'` (selesai).
4. `pawns`: Array identitas tim yang sedang menempati petak tersebut.

### 3.1 Strategi Responsif: Mobile-First & Desktop / Proyektor

Dalam konteks pembelajaran di kelas X SMA, **siswa mayoritas mengakses melalui Smartphone (Android/iOS)** sedangkan **guru menggunakan Laptop / Proyektor LCD**. Oleh karena itu, antarmuka dirancang dengan dua orientasi khusus:

```mermaid
flowchart LR
    subgraph MobileView ["📱 Mobile Experience (Siswa di HP)"]
        M1["Smart Camera: Auto-Focus ke Petak Aktif"]
        M2["Pinch-to-Zoom & Drag Pan (Sentuh)"]
        M3["Bottom Sheet LKPD (Muncul dari bawah)"]
        M4["Direct Camera Upload (Foto Pengamatan)"]
    end

    subgraph DesktopView ["💻 Desktop & Proyektor (Guru / Laptop)"]
        D1["Split-Screen: Peta Penuh + Sidebar Tugas"]
        D2["Mode Proyektor Fullscreen (Live Klasemen & Pion)"]
        D3["Speed-Click Grading Rubrik (0 - 3)"]
        D4["Multi-Tab Monitor Semua Kelompok"]
    end
```

1. **Pengalaman Mobile (Smartphone Siswa)**:
   * **Smart Camera Tracking**: Papan secara cerdas melakukan auto-zoom ke zona aktif kelompok (misal jika kelompok berada di Petak 3, layar otomatis menyorot Zona 1), dilengkapi tombol cepat: *"Fokus ke Pion Saya"* dan *"Lihat Seluruh Peta"*.
   * **Bottom Sheet Card**: Form tugas LKPD dan stimulus muncul dari bawah layar (*slide-up drawer*) sehingga siswa tidak perlu zoom-in/out saat membaca soal atau mengetik jawaban.
   * **Native Camera Capture**: Tombol unggah foto pada LKPD langsung mengaktifkan kamera smartphone untuk memotret objek pengamatan di taman sekolah.
2. **Pengalaman Desktop & Proyektor (Laptop Guru / Siswa)**:
   * **Split-Screen Layout**: Peta interaktif berada di 60% layar kiri, dan panel LKPD/Status Kelompok berada di 40% layar kanan.
   * **Proyektor Mode**: Tampilan layar penuh (*fullscreen*) bersih tanpa tombol navigasi yang cocok disorotkan ke dinding kelas agar seluruh siswa dapat melihat perlombaan posisi pion secara real-time.

---

## 4. Fitur Spesifik Berpikir Kritis & Gamifikasi

### 4.1 Digital Card Modal (Challenge & Riddle)
Saat pion tiba di petak aktivitas, terbuka popup modal beranimasi:
* **Bagian Header**: Menampilkan Kode (misal `KE-03`), Level Kognitif (`C5 - Evaluasi`), dan Indikator.
* **Stimulus Box**:
  * Teks studi kasus / fenomena.
  * Foto pembanding (misal: area teduh vs area terbuka pada `KE-03`).
  * Cadangan foto organisme jika tidak ditemukan di lingkungan sekolah (`IA-01`, `AE-01`).
* **Form Pengisian Jawaban LKPD**:
  * Input analisis teks argumen siswa.
  * Upload foto pengamatan langsung di sekolah.
  * Upload link/file video rekaman peragaan/presentasi 1 menit (`KE-05`, `IA-05`, `AE-05`, `JE-05`).
* **Fitur Regulasi Diri (Self-Regulated Learning)**:
  * Khusus petak ke-6 tiap zona (`KE-06`, `IA-06`, `AE-06`, `JE-06`), tombol **"Buka Rujukan Pengecekan"** akan menampilkan data validasi konsep biologi.
  * Siswa diwajibkan menulis refleksi: *"Bagian mana yang Anda perbaiki setelah membandingkan dengan rujukan, dan apa alasannya?"*.

### 4.2 Lencana Kecepatan (Speed Badge Race)
* Begitu kelompok menyelesaikan petak 10, 22, 38, atau 50:
  * Server secara otomatis mencatat waktu kedatangan.
  * Tim tercepat ke-1 mendapat **Lencana Emas (+3 Poin)**.
  * Tim tercepat ke-2 mendapat **Lencana Perak (+2 Poin)**.
  * Tim tercepat ke-3 mendapat **Lencana Perunggu (+1 Poin)**.
  * Tim berikutnya tetap dapat lanjut namun tanpa poin lencana.
* Efek suara dan konfeti muncul di layar kelompok peraih lencana.

### 4.3 Dashboard Penilaian Cepat Guru (Speed Grading Rubric)
* Guru memiliki tampilan antarmuka khusus:
  * Memilih Kelompok (Kelompok 1 - 6) & Aktivitas.
  * Melihat jawaban teks dan foto/video yang diunggah siswa.
  * Menekan tombol cepat **[3] [2] [1] [0]** sesuai rubrik Bagian H.
  * Total skor langsung terakumulasi otomatis ke tabel peringkat.

---

## 5. Rencana Tahapan Eksekusi (Sprint Plan)

* **Sprint 1: Interactive Board & Map Engine**
  * Setup project Vite + React + Tailwind + Lucide.
  * Pembuatan komponen `<GameBoardMap />` berbasis SVG overlay pada `image.png` (1600x1600).
  * Kalibrasi 50 titik koordinat petak agar presisi dengan bulatan pada gambar.
  * Animasi pion bergerak antar petak.
* **Sprint 2: Activity Engine, LKPD & Database Soal**
  * Input seluruh 24 aktivitas dari dokumen kisi-kisi (KE, IA, AE, JE).
  * Komponen modal kartu soal (Riddle & Challenge) beserta stimulus dan form LKPD.
  * Mekanisme Regulasi Diri (panel komparasi draf vs rujukan validasi).
* **Sprint 3: Modul Pre-test & Post-test**
  * Form tes awal (Pre-test) dan tes akhir (Post-test) berbasis 6 indikator berpikir kritis.
  * Kalkulasi skor otomatis dan analisis peningkatan (Gain Score).
* **Sprint 4: Teacher Command Center & Real-time Multiplayer**
  * Integrasi Socket.io / State Sync: Monitor posisi pion seluruh tim di proyektor.
  * Rubrik penilaian cepat guru (0–3) dan sistem ranking lencana otomatis.
  * Leaderboard kalkulasi akhir: $\text{Skor LKPD} + \text{Poin Lencana}$.
* **Sprint 5: Testing, Audio Gamifikasi & Final Polish**
  * Efek suara gamifikasi (klik petak, selebrasi lencana, loncat pion).
  * Uji responsivitas di smartphone dan proyektor.

---

## 6. Rancangan Arsitektur Backend (Server, Database & Real-Time Sync)

Dokumen ini memuat spesifikasi teknis lengkap untuk pembangunan backend web app **Ecoplay (Board Game Edukasi Ekosistem)** guna mendukung sinkronisasi real-time antar perangkat siswa (smartphone) dan layar utama kelas/guru (proyektor).

```mermaid
flowchart TD
    subgraph Clients [Client Layer]
        C1["📱 Smartphone Siswa (Kelompok 1 - 6)\nMode: Input LKPD, Gerak Pion, Kamera"]
        C2["💻 Laptop Guru / Proyektor Kelas\nMode: Roda Spin, Papan Live, Speed-Rubric Grading"]
    end

    subgraph Network [Network & Gateway]
        NGINX["Reverse Proxy / Nginx / Cloudflare\nSSL/TLS Termination & WebSockets Upgrade"]
    end

    subgraph BackendApp [Node.js + Express + Socket.io Server]
        direction TB
        AUTH["🔑 Auth & Session Manager\n(JWT & 6-Digit Room Code)"]
        SOCKET["⚡ Socket.io Event Broker\n(Namespace: /game, Room: room_code)"]
        REST["🌐 REST API Controllers\n(CRUD Sesi, LKPD, Grading, Export)"]
        LOCK["🔒 Atomic Badge Race Mutex\n(Serialisasi Perebutan Juara Lencana)"]
        MEDIA["🖼️ Media Processing Service\n(Sharp Image Compression WebP)"]
    end

    subgraph Storage [Data & Persistence Layer]
        DB[("🗄️ Relational Database\nPostgreSQL (Cloud) / SQLite (Offline LAN)")]
        FILES[("📁 Media Storage\nLocal /uploads/ atau Cloud S3/Cloudinary")]
    end

    C1 <-->|HTTP / WSS| NGINX
    C2 <-->|HTTP / WSS| NGINX
    NGINX <--> AUTH
    NGINX <--> SOCKET
    NGINX <--> REST
    SOCKET <--> LOCK
    REST --> MEDIA
    REST & LOCK <--> DB
    MEDIA --> FILES
```

---

### 6.1 Topologi & Strategi Dual-Deployment (Cloud vs Offline LAN Sekolah)

Mengingat kondisi konektivitas internet di sekolah SMA seringkali tidak stabil, arsitektur backend dirancang **Dual-Mode**:

| Aspek | Mode A: Cloud Multi-Tenant (Online Penuh) | Mode B: Offline LAN / Portable Server (Solusi Internet Sekolah Lemah) |
| :--- | :--- | :--- |
| **Pusat Server** | Cloud VPS / PaaS (Railway, Render, Fly.io, DigitalOcean) | Laptop Guru menjalankan server Node.js lokal via Hotspot WiFi kelas (tanpa kuota internet). |
| **Database** | PostgreSQL (Supabase / Neon / Managed Postgres) | SQLite (`better-sqlite3`) — tersimpan dalam satu file `.sqlite` ringan di laptop guru. |
| **Media Storage** | Supabase Storage / Cloudinary / AWS S3 | Folder lokal `backend/uploads/` yang disajikan static oleh Express. |
| **Akses Siswa** | Mengakses domain web publik (misal: `ecoplay.vercel.app` atau domain sekolah) | Siswa terhubung ke WiFi Hotspot guru dan mengakses `http://192.168.x.x:5000`. |
| **Keandalan** | Akses fleksibel dari rumah untuk persiapan/post-test. | Bebas lag, 0 kuota internet, latency < 5 ms, 100% tahan pemadaman internet. |

---

### 6.2 Skema Database (Database Schema & Entity-Relationship)

Database dirancang berbasis relasional normalisasi tingkat ketiga (3NF) untuk menjamin integritas data penilaian dan riwayat permainan.

```mermaid
erDiagram
    TEACHERS ||--o{ GAME_SESSIONS : "membuat"
    GAME_SESSIONS ||--|{ TEAMS : "memiliki"
    GAME_SESSIONS ||--o{ BADGE_CLAIMS : "mencatat race"
    GAME_SESSIONS ||--o{ TEST_SUBMISSIONS : "menyimpan evaluasi"
    TEAMS ||--o{ LKPD_SUBMISSIONS : "mengumpulkan"
    TEAMS ||--o{ BADGE_CLAIMS : "memperoleh"
    TEAMS ||--o{ TEST_SUBMISSIONS : "mengerjakan"

    TEACHERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string school_name
        timestamp created_at
    }

    GAME_SESSIONS {
        uuid id PK
        string room_code UK "6-digit kode unik (misal: ECO88)"
        uuid teacher_id FK
        string class_name "misal: X MIPA 1"
        string academic_year "2026/2027"
        string phase "SPIN, ZONA_1, ZONA_2, ZONA_3, ZONA_4, TEST, FINISHED"
        int active_zone "1, 2, 3, 4"
        boolean is_active
        timestamp created_at
        timestamp ended_at
    }

    TEAMS {
        uuid id PK
        uuid session_id FK
        int team_number "1 s.d. 10"
        string name "Harimau, Elang, Komodo, dll"
        string avatar_icon "Emoji pion"
        string color_hex "#ef4444"
        int current_tile "0 s.d. 50"
        int badge_points "Total poin lencana kecepatan"
        int total_lkpd_score "Akumulasi skor rubrik guru"
        int grand_total_score "badge_points + total_lkpd_score"
        boolean has_finished_pretest
        boolean has_finished_posttest
        timestamp updated_at
    }

    LKPD_SUBMISSIONS {
        uuid id PK
        uuid session_id FK
        uuid team_id FK
        string activity_code "KE-01, IA-01, AE-01, JE-06, dll"
        text answer_text "Teks analisis / format tabel markdown"
        string photo_url "Path atau URL bukti foto lapangan"
        text reflection_text "Catatan regulasi diri & perbaikan jawaban"
        int score "Nilai rubrik guru: 0, 1, 2, atau 3"
        string teacher_feedback "Catatan apresiasi/koreksi dari guru"
        timestamp submitted_at
        timestamp graded_at
    }

    BADGE_CLAIMS {
        uuid id PK
        uuid session_id FK
        uuid team_id FK
        int tile_number "10, 22, 38, 50"
        int rank "1 (Emas), 2 (Perak), 3 (Perunggu)"
        int points_awarded "3, 2, 1 pt"
        timestamp claimed_at
    }

    TEST_SUBMISSIONS {
        uuid id PK
        uuid session_id FK
        uuid team_id FK
        string student_name "Nama siswa pengerja"
        string test_type "pre | post"
        int correct_count "Jumlah benar (0 - 10)"
        float final_score "Skala 0 - 100"
        jsonb answers_payload "Pilihan jawaban rincian soal 1 s.d. 10"
        timestamp submitted_at
    }
```

#### DDL Tabel Utama (PostgreSQL / SQLite Compatible Syntax)

```sql
-- 1. Tabel Sesi Permainan Kelas
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    class_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2026/2027',
    phase VARCHAR(30) DEFAULT 'SPIN',
    active_zone INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 2. Tabel Kelompok / Tim Siswa
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_number INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar_icon VARCHAR(10) NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    current_tile INT DEFAULT 0 CHECK (current_tile >= 0 AND current_tile <= 50),
    badge_points INT DEFAULT 0,
    total_lkpd_score INT DEFAULT 0,
    has_finished_pretest BOOLEAN DEFAULT FALSE,
    has_finished_posttest BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_per_session UNIQUE(session_id, team_number)
);

-- 3. Tabel Jawaban LKPD & Regulasi Diri Siswa
CREATE TABLE lkpd_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    activity_code VARCHAR(10) NOT NULL,
    answer_text TEXT NOT NULL,
    photo_url TEXT,
    reflection_text TEXT,
    score INT DEFAULT 3 CHECK (score >= 0 AND score <= 3),
    teacher_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_team_activity UNIQUE(session_id, team_id, activity_code)
);

-- 4. Tabel Perebutan Lencana Kecepatan (Speed Race)
CREATE TABLE badge_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tile_number INT NOT NULL CHECK (tile_number IN (10, 22, 38, 50)),
    rank INT NOT NULL CHECK (rank BETWEEN 1 AND 3),
    points_awarded INT NOT NULL CHECK (points_awarded BETWEEN 1 AND 3),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_tile_claim UNIQUE(session_id, team_id, tile_number),
    CONSTRAINT unique_rank_per_tile UNIQUE(session_id, tile_number, rank)
);

-- 5. Tabel Hasil Pre-Test & Post-Test
CREATE TABLE test_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_name VARCHAR(100),
    test_type VARCHAR(10) NOT NULL CHECK (test_type IN ('pre', 'post')),
    correct_count INT NOT NULL DEFAULT 0,
    final_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    answers_payload JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_submissions_team ON lkpd_submissions(session_id, team_id);
CREATE INDEX idx_badge_claims ON badge_claims(session_id, tile_number);
```

---

### 6.3 Protokol Real-Time WebSocket (Socket.io)

Semua event real-time dikelompokkan ke dalam room spesifik sesi: `room:${roomCode}`.

#### 1. Inisialisasi & Koneksi

```typescript
// Client handshake query:
const socket = io('https://server-domain.com', {
  query: {
    roomCode: 'ECO88',
    role: 'student' | 'teacher',
    teamId: 'uuid-kelompok-1' // Jika siswa
  }
});
```

#### 2. Tabel Kontrak Event WebSocket

| Nama Event | Pengirim (Sender) | Penerima (Receiver) | Payload Data | Aksi di Sisi Server / Klien |
| :--- | :--- | :--- | :--- | :--- |
| `session:join` | Klien (Siswa / Guru) | Server | `{ roomCode, role, teamId }` | Klien dimasukkan ke `socket.join(roomCode)`. Server membalas dengan snapshot state lengkap saat ini. |
| `session:sync_state` | Server | Klien Terhubung | `{ session, teams, submissions, badges }` | Sinkronisasi penuh state saat pertama kali masuk atau pulih dari jaringan putus (*reconnection*). |
| `spin:complete` | Guru | Seluruh Room | `{ orderedTeamIds: [2, 5, 1, 3] }` | Guru menyelesaikan roda acak giliran tim; broadcast urutan baru ke seluruh layar HP siswa. |
| `pawn:move` | Siswa / Guru | Seluruh Room | `{ teamId, targetTile, delta }` | Memperbarui `current_tile` di DB. Memancarkan posisi pion baru agar beranimasi di proyektor & HP kelompok lain. |
| `activity:submit` | Siswa | Guru & Pengirim | `{ teamId, activityCode, answer, reflection, photoUrl }` | Menyimpan jawaban LKPD. Mengirim notifikasi lencana badge baru di dashboard guru untuk dinilai. |
| `teacher:grade` | Guru | Seluruh Room | `{ submissionId, teamId, activityCode, score, feedback }` | Guru memberi nilai rubrik (0-3). Update skor tim seketika, broadcast update total nilai LKPD ke Leaderboard. |
| `badge:claim_race` | Siswa | Seluruh Room | `{ teamId, tileNumber }` | Dipicu otomatis saat pion mencapai petak 10, 22, 38, atau 50. Server menjalankan *atomic lock* untuk menentukan Juara 1, 2, atau 3. |
| `phase:update` | Guru | Seluruh Room | `{ phase: 'ZONA_2' \| 'POST_TEST' \| 'FINISHED' }` | Mengubah fase aktif pembelajaran secara serentak di semua perangkat siswa. |

---

### 6.4 Penanganan Masalah Kritis: Atomic Speed Badge Race

Pada petak **10, 22, 38, dan 50**, tim tercepat berhak memperoleh Lencana Emas (+3 pt), Perak (+2 pt), atau Perunggu (+1 pt). Masalah kritis muncul jika dua kelompok tiba dalam fraksi detik yang sama (*race condition*).

Untuk mencegah duplikasi juara, backend mengimplementasikan **Atomic Database Transaction dengan Mutex / Pessimistic Locking**:

```typescript
// backend/src/services/badgeService.ts
export async function claimSpeedBadge(sessionId: string, teamId: string, tileNumber: number) {
  return await db.transaction(async (trx) => {
    // 1. Cek apakah tim sudah pernah mengklaim lencana di petak ini
    const existingClaim = await trx('badge_claims')
      .where({ session_id: sessionId, team_id: teamId, tile_number: tileNumber })
      .first();

    if (existingClaim) {
      return { success: false, message: 'Lencana sudah pernah diklaim sebelumnya.' };
    }

    // 2. Kunci baris petak dan hitung berapa tim yang sudah berhasil klaim
    const currentClaimsCount = await trx('badge_claims')
      .where({ session_id: sessionId, tile_number: tileNumber })
      .count('id as count')
      .forUpdate(); // Kunci baris untuk mencegah persaingan baca-tulis bersamaan

    const nextRank = Number(currentClaimsCount[0].count) + 1;

    // Hanya 3 tim tercepat yang memperoleh poin lencana
    let points = 0;
    if (nextRank === 1) points = 3;      // Juara 1: Lencana Emas
    else if (nextRank === 2) points = 2; // Juara 2: Lencana Perak
    else if (nextRank === 3) points = 1; // Juara 3: Lencana Perunggu
    else return { success: false, message: 'Kuota lencana berpoin (Juara 1-3) sudah habis.' };

    // 3. Masukkan klaim lencana ke tabel
    const [claim] = await trx('badge_claims')
      .insert({
        session_id: sessionId,
        team_id: teamId,
        tile_number: tileNumber,
        rank: nextRank,
        points_awarded: points,
        claimed_at: new Date()
      })
      .returning('*');

    // 4. Perbarui total poin lencana pada tim
    await trx('teams')
      .where({ id: teamId })
      .increment('badge_points', points);

    return { success: true, rank: nextRank, points, claim };
  });
}
```

---

### 6.5 Spesifikasi REST API Endpoints

Selain WebSocket, backend menyediakan RESTful API untuk tugas administratif, autentikasi, unggah berkas, dan ekspor laporan nilai.

#### 1. Autentikasi & Guru
* `POST /api/auth/teacher/register` : Registrasi akun guru baru.
* `POST /api/auth/teacher/login` : Login guru; menghasilkan `jwt_token`.
* `GET /api/auth/me` : Validasi token guru yang sedang aktif.

#### 2. Manajemen Sesi Kelas (Game Sessions)
* `POST /api/sessions` : Guru membuat sesi ruang baru (membangkitkan `room_code` 6 karakter, misal `ECO72`).
* `GET /api/sessions/:roomCode` : Mengambil data sesi dan status aktif kelas.
* `PATCH /api/sessions/:roomCode/phase` : Guru mengubah fase pembelajaran (`SPIN`, `ZONA_1`, `ZONA_2`, `POST_TEST`, dsb).
* `POST /api/sessions/:roomCode/reset` : Reset posisi pion dan nilai seluruh kelompok untuk kelas baru.

#### 3. Manajemen Kelompok Siswa
* `GET /api/sessions/:roomCode/teams` : Mendapatkan daftar seluruh tim beserta posisi pion dan nilai saat ini.
* `POST /api/sessions/:roomCode/teams` : Guru menginisialisasi atau mengubah jumlah tim (3 s.d. 10 tim).
* `PATCH /api/sessions/:roomCode/teams/:teamId/pawn` : Endpoint HTTP fallback untuk memperbarui posisi petak tim.

#### 4. Pengumpulan & Penilaian LKPD (Submissions & Grading)
* `GET /api/sessions/:roomCode/submissions` : Guru mengambil seluruh lembar LKPD masuk untuk dinilai.
* `POST /api/sessions/:roomCode/submissions/lkpd` : Siswa mengirimkan lembar LKPD (teks, tautan foto, refleksi).
* `PATCH /api/submissions/:id/grade` : Guru memberikan skor rubrik (0, 1, 2, atau 3) dan catatan koreksi.

#### 5. Pengolahan Media Foto & Bukti Lapangan
* `POST /api/sessions/:roomCode/upload` : Endpoint Multipart/Form-data (`Multer`).
  * Menerima berkas foto kamera siswa (`image/jpeg`, `image/png`, `image/webp`, maks 5 MB).
  * Menjalankan kompresi otomatis via pustaka `sharp` (menjadi format WebP kualitas 80% dengan lebar maks 1280 px).
  * Mengembalikan URL berkas terkompresi (misal: `/uploads/ECO88/photo-171829.webp`).

#### 6. Evaluasi Pre-Test, Post-Test & Analisis N-Gain
* `POST /api/sessions/:roomCode/test` : Siswa mengirimkan jawaban soal tes pilihan ganda berpikir kritis.
  * Server secara otomatis mencocokkan kunci jawaban dan mengalkulasi nilai (0–100).
* `GET /api/sessions/:roomCode/analytics/n-gain` : Menghasilkan analisis skor rata-rata Pre-Test, Post-Test, dan $N\text{-Gain}$ tiap kelompok dengan formula Hake:
  $$g = \frac{\text{Skor Post-Test} - \text{Skor Pre-Test}}{100 - \text{Skor Pre-Test}}$$

#### 7. Ekspor Nilai ke Spreadsheet (Excel / CSV)
* `GET /api/sessions/:roomCode/export/excel` : Menghasilkan berkas Excel `.xlsx` komprehensif berisi:
  * **Sheet 1**: Rekapitulasi Akhir (Peringkat, Nama Tim, Poin Lencana, Skor LKPD, Skor Akhir).
  * **Sheet 2**: Nilai Rinci LKPD per Aktivitas (KE-01 s/d KE-06, IA-01 s/d IA-06, AE-01 s/d AE-06, JE-01 s/d JE-06).
  * **Sheet 3**: Rincian Teks Jawaban & Catatan Regulasi Diri Siswa.
  * **Sheet 4**: Hasil Pre-Test, Post-Test, dan Analisis $N\text{-Gain}$ Berpikir Kritis.

---

### 6.6 Struktur Direktori Proyek Backend (`/backend`)

Disarankan meletakkan proyek backend dalam folder `backend/` yang terpisah rapi dengan frontend:

```text
Gameboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # Koneksi Knex.js / Prisma (PostgreSQL / SQLite)
│   │   │   ├── socket.ts          # Konfigurasi Socket.io Server & CORS
│   │   │   └── storage.ts         # Konfigurasi Multer & Sharp Image Optimizer
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── sessionController.ts
│   │   │   ├── submissionController.ts
│   │   │   ├── testController.ts
│   │   │   └── exportController.ts
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts   # Verifikasi JWT Token Guru
│   │   │   ├── errorHandler.ts     # Centralized Error Catching
│   │   │   └── uploadMiddleware.ts # Validasi ekstensi & ukuran gambar
│   │   ├── models/
│   │   │   ├── Session.ts
│   │   │   ├── Team.ts
│   │   │   ├── Submission.ts
│   │   │   └── BadgeClaim.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── sessionRoutes.ts
│   │   │   ├── submissionRoutes.ts
│   │   │   └── testRoutes.ts
│   │   ├── services/
│   │   │   ├── badgeService.ts     # Logika Transaksi Atomic Speed Race
│   │   │   ├── gradingService.ts   # Akumulasi nilai rubrik & grand leaderboard
│   │   │   └── nGainService.ts     # Analisis Gain Skor Berpikir Kritis
│   │   ├── sockets/
│   │   │   ├── gameSocketHandler.ts# Event listener pion, submit, spin, grading
│   │   │   └── socketEmitter.ts    # Utility broadcast event per room
│   │   ├── app.ts                 # Setup Express App, Routes, & Middlewares
│   │   └── server.ts              # Entry Point: HTTP Server + Socket.io Listener
│   ├── uploads/                   # Folder lokal penyimpanan gambar teroptimasi
│   ├── migrations/                # Script migrasi tabel database
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── src/                           # Frontend React (Aplikasi saat ini)
└── IMPLEMENTATION_PLAN.md
```

---

### 6.7 Langkah-Langkah Eksekusi Implementasi Backend

Berikut urutan tahapan (roadmap implementasi) pembangunan backend:

1. **Tahap 1: Setup Lingkungan & Database**
   * Inisialisasi `npm init -y` di folder `backend/` dengan TypeScript, Express, Knex/Prisma, SQLite/PostgreSQL, dan Socket.io.
   * Eksekusi script migrasi tabel (`game_sessions`, `teams`, `lkpd_submissions`, `badge_claims`, `test_submissions`).
2. **Tahap 2: Real-time Socket Server & Room Management**
   * Bangun server Socket.io dengan room isolasi berbasis `roomCode`.
   * Implementasikan event `pawn:move`, `spin:complete`, dan `phase:update`.
3. **Tahap 3: Implementasi Atomic Badge Race & Mutex Locking**
   * Buat `badgeService.ts` dengan penanganan transaksi database untuk perebutan lencana 1, 2, dan 3.
4. **Tahap 4: REST API LKPD, Media Storage & Speed Grading**
   * Buat controller pengumpulan LKPD dan upload foto via `multer` + `sharp`.
   * Buat endpoint penilaian rubrik cepat guru dengan auto-broadcast ke proyektor.
5. **Tahap 5: Modul Tes, N-Gain & Export Excel**
   * Bangun skoring otomatis Pre/Post-test dan generator laporan Excel menggunakan pustaka `exceljs`.
6. **Tahap 6: Integrasi Frontend-Backend**
   * Tambahkan custom hook `useGameSocket(roomCode)` di frontend React untuk menggantikan `useState` lokal menjadi state tersinkronisasi server.
   * Uji coba simulasi 6 HP siswa + 1 laptop proyektor guru secara bersamaan.

---

### 6.8 Panduan Praktis Deployment: Render.com + Supabase (100% Free Tier)

Berikut adalah panduan langkah-demi-langkah mengonfigurasi **Supabase** (Database PostgreSQL) dan **Render.com** (Node.js + WebSockets Server):

```mermaid
flowchart LR
    subgraph Vercel ["🌐 Vercel (Frontend)"]
        FE["React 19 Web App\n(ecoplay.vercel.app)"]
    end

    subgraph Render ["⚡ Render.com (Backend)"]
        BE["Node.js + Express + Socket.io\n(ecoplay-backend.onrender.com)\nRegion: Singapore"]
    end

    subgraph Supabase ["🗄️ Supabase (Database)"]
        DB[("PostgreSQL Database\n(Port 5432 / 6543 Pooling)\nRegion: Singapore")]
    end

    FE <-->|HTTPS REST & WSS Socket.io| BE
    BE <-->|Direct TCP Connection| DB
```

#### Langkah 1: Setup Database di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan masuk menggunakan akun **GitHub**.
2. Klik tombol **New Project**:
   * **Name**: `ecoplay-db`
   * **Database Password**: Buat password yang kuat dan catat baik-baik.
   * **Region**: Pilih **Singapore (ap-southeast-1)** agar latensi jaringan ke Indonesia paling rendah (< 30 ms).
   * **Pricing Plan**: Pilih **Free Plan** ($0/bulan).
3. Setelah database siap (sekitar 1–2 menit), klik menu **SQL Editor** pada sidebar kiri.
4. Salin seluruh kode **DDL SQL** dari **Bagian 6.2** di atas, tempelkan ke SQL Editor, lalu klik tombol **Run**. Kelima tabel relasional (`game_sessions`, `teams`, `lkpd_submissions`, `badge_claims`, `test_submissions`) akan langsung tercipta.
5. Buka menu **Project Settings** (ikon roda gigi) -> **Database** -> scroll ke bagian **Connection string**:
   * Pilih tab **URI**.
   * Salin string koneksinya (ganti `[YOUR-PASSWORD]` dengan password database Anda):
     ```text
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
     ```
   * Simpan string ini untuk dimasukkan ke variabel lingkungan Render.

---

#### Langkah 2: Setup Web Service di Render.com
1. Kunjungi [render.com](https://render.com) dan login menggunakan akun **GitHub**.
2. Pada dashboard Render, klik tombol **New +** -> pilih **Web Service**.
3. Hubungkan repositori GitHub proyek `Gameboard` ini.
4. Lakukan konfigurasi Web Service:
   * **Name**: `ecoplay-backend`
   * **Region**: **Singapore** (pilih region yang sama dengan Supabase untuk kecepatan maksimal).
   * **Root Directory**: `backend` (jika kode backend berada dalam folder `backend`).
   * **Environment**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
   * **Instance Type**: **Free** ($0/mo).
5. Gulir ke bawah ke bagian **Environment Variables** dan tambahkan baris berikut:
   | Key | Value Contoh | Deskripsi |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Mode optimasi produksi Node.js |
   | `DATABASE_URL` | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` | Connection string dari Supabase |
   | `FRONTEND_URL` | `https://ecoplay.vercel.app` | Domain Vercel frontend agar lolos CORS |
   | `JWT_SECRET` | `kunci-rahasia-guru-ecoplay-2026-sangat-aman` | Kunci enkripsi token login guru |
   | `PORT` | `10000` | Port default Web Service Render |
6. Klik tombol **Deploy Web Service**.
7. Tunggu sekitar 2 menit hingga status berubah menjadi **Live**. Render akan memberikan URL publik backend Anda, misalnya:
   `https://ecoplay-backend.onrender.com`

---

#### Langkah 3: Menghubungkan Frontend di Vercel
1. Buka dashboard proyek Anda di [vercel.com](https://vercel.com).
2. Masuk ke **Settings** -> **Environment Variables**.
3. Tambahkan variabel baru:
   * **Name**: `VITE_BACKEND_URL`
   * **Value**: `https://ecoplay-backend.onrender.com`
4. Lakukan **Redeploy** pada deployment Vercel Anda agar variabel terbaca.

---

#### Langkah 4: Trik Mengatasi "Sleep Mode" Render Free Tier (100% Gratis & Selalu Siaga)
Server gratis di Render memiliki kebijakan *spin down* (tertidur) jika tidak menerima request selama 15 menit untuk menghemat resource.
* **Cara Mengatasinya**:
  1. Buat endpoint kesehatan sederhana di server: `GET /api/health` yang mengembalikan status `200 OK`.
  2. Gunakan layanan monitor gratis seperti **UptimeRobot** ([uptimerobot.com](https://uptimerobot.com)) atau **cron-job.org**.
  3. Setel ping otomatis setiap 10 menit ke:
     `https://ecoplay-backend.onrender.com/api/health`
  4. Dengan cara ini, server Render Anda akan **selalu aktif (*always awake*)** dan siap merespons gerakan pion siswa secara instan tanpa jeda *cold start*!


