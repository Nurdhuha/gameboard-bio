# 🌿 Ecoplay Backend Server & Database Guide

Backend ini melayani RESTful API dan Real-time WebSocket (Socket.io) untuk platform pembelajaran digital **Ecoplay**.

---

## 🗄️ 1. Persiapan Database (Supabase / PostgreSQL)

Database menggunakan **PostgreSQL** yang kompatibel penuh dengan **Supabase (Free Tier)**.

### Langkah Setup di Supabase:
1. Buka [supabase.com](https://supabase.com) dan login dengan akun GitHub Anda.
2. Buat proyek baru (*New Project*):
   - **Name**: `ecoplay-db`
   - **Database Password**: Buat password yang kuat dan catat baik-baik.
   - **Region**: Pilih **Singapore (ap-southeast-1)** untuk latensi terendah ke Indonesia.
3. Setelah proyek selesai dibuat, pilih menu **SQL Editor** pada sidebar kiri.
4. Buka file [`schema.sql`](./schema.sql), salin seluruh kodenya, tempelkan ke SQL Editor Supabase, lalu klik **Run**.
   > *Tabel yang akan dibuat: `teachers`, `game_sessions`, `teams`, `lkpd_submissions`, `badge_claims` (tanpa pre-test/post-test).*
5. Buka **Project Settings** (ikon roda gigi) -> **Database** -> scroll ke **Connection string** -> tab **URI**.
6. Salin URL koneksi tersebut, ganti `[YOUR-PASSWORD]` dengan password database Anda:
   ```text
   postgresql://postgres:[PASSWORD-ANDA]@db.xxxxxxxx.supabase.co:5432/postgres
   ```

---

## ⚙️ 2. Konfigurasi Lingkungan (`.env`)

Buka file [`.env`](./.env) di dalam folder `backend/`, lalu masukkan connection string Anda:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD-ANDA]@db.xxxxxxxx.supabase.co:5432/postgres
FRONTEND_URL=http://localhost:5173
JWT_SECRET=ecoplay-rahasia-guru-2026-super-secure
```

---

## 🚀 3. Menjalankan Backend

### Opsi A: Menjalankan Migrasi Otomatis (Jika belum lewat SQL Editor)
```bash
npm run migrate
```

### Opsi B: Menjalankan Server Mode Development (Hot Reload)
```bash
npm run dev
```
Server akan aktif di:
- **REST API**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Opsi C: Build Produksi
```bash
npm run build
npm run start
```

---

## 📋 4. Ringkasan Endpoint REST API

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck status server |
| `POST` | `/api/auth/register` | Pendaftaran akun pendidik/guru |
| `POST` | `/api/auth/login` | Login pendidik & perolehan JWT |
| `GET` | `/api/auth/me` | Validasi token & data profil guru |
| `POST` | `/api/sessions` | Guru membuat sesi room baru (`ECO88`) |
| `GET` | `/api/sessions/:roomCode` | Mengambil snapshot sesi, tim, & jawaban |
| `PATCH` | `/api/sessions/:roomCode/phase` | Memperbarui fase pembelajaran (`spin`/`board`) |
| `POST` | `/api/sessions/:roomCode/reset` | Mereset nilai & posisi pion untuk kelas baru |
| `POST` | `/api/sessions/:roomCode/end` | Mengakhiri sesi kelas, menghapus progres & jawaban LKPD |
| `GET` | `/api/sessions/:roomCode/teams` | Mengambil data kelompok & posisi pion |
| `POST` | `/api/sessions/:roomCode/teams` | Menambah kelompok baru secara dinamis |
| `PATCH` | `/api/sessions/:roomCode/teams/:teamId/pawn` | Memperbarui koordinat/petak pion tim |
| `GET` | `/api/sessions/:roomCode/submissions` | Mengambil seluruh jawaban LKPD |
| `POST` | `/api/sessions/:roomCode/submissions/lkpd` | Siswa mengirim jawaban LKPD (teks/foto) |
| `PATCH` | `/api/sessions/submissions/:id/grade` | Guru menilai skor rubrik (0-3) & catatan |
| `POST` | `/api/sessions/:roomCode/upload` | Mengunggah foto observasi lapangan siswa |
| `GET` | `/api/sessions/:roomCode/export/excel` | Ekspor rekap nilai & klasemen ke file `.xlsx` |

---

## ⚡ 5. Kontrak Event Real-time WebSocket (Socket.io)

Semua klien bergabung ke room: `room:${roomCode}`.

| Event Emit (Klien -> Server) | Payload | Deskripsi |
| :--- | :--- | :--- |
| `session:join` | `{ roomCode, role, teamId }` | Bergabung ke room & terima state awal |
| `pawn:move` | `{ roomCode, teamId, targetTile, delta }` | Gerakkan pion & siarkan posisi baru |
| `spin:complete` | `{ roomCode, orderedTeams }` | Siarkan hasil roda putar giliran |
| `activity:submit` | `{ roomCode, teamId, activityCode, answerText, photoUrl, reflectionText }` | Simpan jawaban LKPD & siarkan ke guru |
| `teacher:grade` | `{ roomCode, submissionId, score, teacherFeedback }` | Guru beri skor rubrik (0-3) & update klasemen |
| `badge:claim_race` | `{ roomCode, teamId, tileNumber }` | Transaksi atomik lencana kecepatan (petak 10, 22, 38, 50) |
| `phase:update` | `{ roomCode, phase, activeZone }` | Ubah fase tampilan di seluruh layar siswa |
