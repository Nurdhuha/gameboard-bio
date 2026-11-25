/**
 * Konfigurasi profil pengujian beban & trafik maksimum untuk Ecoplay (Vercel / Lokal).
 */

export const PROFILES = {
  'smoke-vercel': {
    name: 'Smoke Test Full-Feature (5 Siswa + 1 Guru)',
    description: 'Validasi seluruh endpoint fitur utama sebelum pengujian skala 100 siswa.',
    teachers: 1,
    extraTeamsPerClass: 1,
    stages: [
      { label: 'Smoke Full-Feature', targetStudents: 5, durationSec: 20 },
    ],
    maxErrorRate: 0.10,
    maxP95Ms: 5000,
  },
  'target-100': {
    name: 'Target Uji 100 Siswa Serentak (4 Kelas, Semua Fitur)',
    description: 'Ramp-up bertahap 25 -> 50 -> 100 siswa aktif bersamaan dengan 4 guru & seluruh fitur aktif.',
    teachers: 4,
    extraTeamsPerClass: 3, // 3 default + 3 extra = 6 tim per kelas
    stages: [
      { label: 'Warm-Up (25 Siswa)', targetStudents: 25, durationSec: 20 },
      { label: 'Mid-Load (50 Siswa)', targetStudents: 50, durationSec: 20 },
      { label: 'Target Penuh (100 Siswa)', targetStudents: 100, durationSec: 60 },
    ],
    maxErrorRate: 0.05,
    maxP95Ms: 3000,
  },
  'stress-beyond-100': {
    name: 'Stress Test Melebihi 100 Siswa (50 -> 100 -> 150 -> 200)',
    description: 'Mencari titik jenuh maksimum di atas 100 siswa dengan circuit breaker otomatis.',
    teachers: 6,
    extraTeamsPerClass: 3,
    stages: [
      { label: 'Tahap 1 (50 Siswa)', targetStudents: 50, durationSec: 20 },
      { label: 'Tahap 2 (100 Siswa)', targetStudents: 100, durationSec: 25 },
      { label: 'Tahap 3 (150 Siswa)', targetStudents: 150, durationSec: 25 },
      { label: 'Tahap 4 (200 Siswa)', targetStudents: 200, durationSec: 25 },
    ],
    maxErrorRate: 0.05,
    maxP95Ms: 3000,
  },
};

// Interval sinkronisasi sesuai konstanta di src/App.tsx
export const SYNC_INTERVAL_MS = 3000;
export const PRESENCE_INTERVAL_MS = 5000;

// Daftar kode aktivitas & petak dari src/data/boardData.ts untuk simulasi gerak pion & submit LKPD
export const SAMPLE_ACTIVITIES = [
  { tile: 2, code: 'A1' },
  { tile: 5, code: 'A2' },
  { tile: 10, code: 'L1' },
  { tile: 15, code: 'B1' },
  { tile: 22, code: 'L2' },
  { tile: 28, code: 'C1' },
  { tile: 38, code: 'L3' },
  { tile: 45, code: 'D1' },
  { tile: 50, code: 'L4' },
];

// Buffer PNG 1x1 piksel yang valid (67 byte) untuk menguji endpoint multipart upload foto
export const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
