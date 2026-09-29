# 🌿 BioBoard - Web Board Game Edukatif Ekosistem

Aplikasi permainan papan edukasi biologi berbasis web (*Full Digital Interactive Web App*) pada materi **Ekosistem**, dirancang untuk melatih **6 Indikator Keterampilan Berpikir Kritis** (Facione: Interpretasi, Analisis, Evaluasi, Inferensi, Eksplanasi, dan Regulasi Diri) pada level kognitif C2 hingga C5.

---

## 🎯 Fitur & Struktur Antarmuka

Aplikasi ini memisahkan peran pengguna secara terstruktur melalui sistem *routing*:

### 1. 🎒 Interface Murid (`/`)
* **Halaman Pemilihan Kelompok:** Siswa memilih identitas kelompok (default 3 kelompok satwa: Harimau 🐯, Elang 🦅, Komodo 🦎) sebelum masuk ke papan permainan.
* **Papan Interaktif Racetrack:** 50 petak terbagi dalam 4 zona ekosistem yang dilengkapi *smart camera focus*, kontrol sentuh *pinch-to-zoom*, dan *drag-to-pan*.
* **Pengerjaan LKPD Digital:** 24 aktivitas (*Challenge* & *Riddle*) yang memuat instruksi autentik, stimulus pengamatan, dan form jawaban.
* **Kamera Bukti Lapangan:** Fitur ambil foto langsung menggunakan kamera *smartphone* untuk dokumentasi pengamatan komponen biotik/abiotik.
* **Refleksi Regulasi Diri:** Fitur pengecekan kunci rujukan konsep biologi dan catatan perbaikan jawaban mandiri.
* **Evaluasi Pre-Test & Post-Test:** Instrumen tes berpikir kritis untuk mengukur capaian awal dan akhir.
* **Klasemen Leaderboard:** Pemantauan skor akumulasi LKPD dan poin lencana kecepatan.

### 2. 👨‍🏫 Interface Guru (`/teachers`)
* **Sesi Spin Wheel (Roda Putar):** Menentukan urutan giliran kelompok (Giliran 1 s/d n) di layar proyektor kelas sebelum penjelajahan dimulai.
* **Layar Proyektor Monitoring:** Guru fokus memantau posisi seluruh pion siswa di papan secara *live* tanpa mengontrol jalannya pion.
* **Panel Penilaian Rubrik LKPD (Bagian H):** Form penilaian jawaban siswa dengan skor resmi:
  * **Skor 3:** Lengkap dan tepat, didukung bukti data pengamatan/rujukan.
  * **Skor 2:** Cukup lengkap, bukti kurang mendalam.
  * **Skor 1:** Belum lengkap, bukti minim.
  * **Skor 0:** Tidak relevan / tidak dikerjakan.
* **Pencatatan Lencana Zona (Bagian C):** Formulir penetapan peraih bonus kecepatan tiba di petak lencana (Juara 1: +3 pt, Juara 2: +2 pt, Juara 3: +1 pt).
* **Manajemen Kelompok:** Guru dapat menambah kelompok baru secara dinamis atau mereset data permainan untuk kelas baru.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS (Desain minimalis, estetika *calming porcelain*, Google Font *Lexend*)
* **Routing:** React Router DOM v7
* **Ikonografi & Animasi:** Lucide React, Canvas Confetti
* **Grafis Papan:** Vector SVG Racetrack dengan dukungan Touch Gestures

---

## 🚀 Panduan Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi dapat diakses melalui:
* Tampilan Murid: `http://localhost:3000/`
* Tampilan Guru: `http://localhost:3000/teachers`

### 3. Kompilasi Produksi (Build)
```bash
npm run build
```
Output hasil *build* akan tersimpan di direktori `dist/`.

---

## 📁 Struktur Direktori

```text
├── public/                 # Aset statis & mockup papan
├── src/
│   ├── components/
│   │   ├── board/         # GameBoard, PawnMarker, TileMarker, MobileBoard
│   │   ├── dashboard/     # TeacherDashboardModal (Rubrik LKPD & Lencana)
│   │   ├── modals/        # ActivityModal (LKPD), PrePostTestModal, LeaderboardModal
│   │   ├── spin/          # SpinWheel (Roda putar penentuan giliran)
│   │   └── student/       # TeamSelectionScreen (Menu pilih kelompok siswa)
│   ├── data/
│   │   └── boardData.ts   # 50 petak, 24 aktivitas verbatim, rubrik, preset tim
│   ├── types/
│   │   └── index.ts       # Definisi TypeScript interface
│   ├── App.tsx            # Komponen root & pengatur alur
│   ├── main.tsx           # Entry point dengan BrowserRouter
│   └── index.css          # Tailwind CSS & konfigurasi font
├── .gitignore             # Pengabaian file build, modul, dan sistem
├── index.html             # HTML template
├── package.json           # Dependensi & script proyek
├── tailwind.config.js     # Konfigurasi Tailwind CSS
├── tsconfig.json          # Konfigurasi TypeScript
└── vite.config.ts         # Konfigurasi bundler Vite
```
