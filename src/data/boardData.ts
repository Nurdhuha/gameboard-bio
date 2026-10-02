import { TileData, ActivityData, Team, TestQuestion } from '../types';

export const BOARD_TILES: TileData[] = [
  // =========================================================================
  // ZONA 1: KOMPONEN EKOSISTEM (Petak 1 - 10) • Jalur Baris 1 (Y: 130)
  // =========================================================================
  { id: 0, x: 160, y: 1530, type: 'step', zone: 1, label: 'START' },
  { id: 1, x: 438.5, y: 1501.9, type: 'step', zone: 1 },
  { id: 2, x: 558.5, y: 1421.7, type: 'challenge', zone: 1, activityCode: 'KE-01' },
  { id: 3, x: 678.6, y: 1501.8, type: 'riddle', zone: 1, activityCode: 'KE-02' },
  { id: 4, x: 799.4, y: 1421.7, type: 'step', zone: 1 },
  { id: 5, x: 919.5, y: 1501.8, type: 'riddle', zone: 1, activityCode: 'KE-03' },
  { id: 6, x: 1039.5, y: 1421.7, type: 'riddle', zone: 1, activityCode: 'KE-04' },
  { id: 7, x: 1159.6, y: 1341.5, type: 'step', zone: 1 },
  { id: 8, x: 1113.3, y: 1221.3, type: 'challenge', zone: 1, activityCode: 'KE-05' },
  { id: 9, x: 993.3, y: 1141.1, type: 'step', zone: 1 },
  { id: 10, x: 873.3, y: 1061.2, type: 'badge', zone: 1, activityCode: 'KE-06', badgePoints: 3 },

  // =========================================================================
  // ZONA 2: INTERAKSI MAKHLUK HIDUP (Petak 11 - 22) • Jalur Baris 2 (Y: 330)
  // =========================================================================
  { id: 11, x: 734.4, y: 1022.3, type: 'step', zone: 2 },
  { id: 12, x: 632.7, y: 940.1, type: 'step', zone: 2 },
  { id: 13, x: 513.2, y: 860.6, type: 'challenge', zone: 2, activityCode: 'IA-01' },
  { id: 14, x: 660.3, y: 839.5, type: 'riddle', zone: 2, activityCode: 'IA-02' },
  { id: 15, x: 807.4, y: 808.2, type: 'step', zone: 2 },
  { id: 16, x: 954.2, y: 808.1, type: 'riddle', zone: 2, activityCode: 'IA-03' },
  { id: 17, x: 1101.2, y: 768.1, type: 'step', zone: 2 },
  { id: 18, x: 1163.1, y: 669.1, type: 'riddle', zone: 2, activityCode: 'IA-04' },
  { id: 19, x: 1014.1, y: 625.5, type: 'step', zone: 2 },
  { id: 20, x: 880.0, y: 569.0, type: 'challenge', zone: 2, activityCode: 'IA-05' },
  { id: 21, x: 739.4, y: 545.6, type: 'step', zone: 2 },
  { id: 22, x: 605.3, y: 524.9, type: 'badge', zone: 2, activityCode: 'IA-06', badgePoints: 3 },

  // =========================================================================
  // ZONA 3: ALIRAN ENERGI (Petak 23 - 38) • Jalur Baris 3 (Y: 540)
  // =========================================================================
  { id: 23, x: 538.9, y: 434.0, type: 'challenge', zone: 3, activityCode: 'AE-01' },
  { id: 24, x: 598.9, y: 339.2, type: 'step', zone: 3 },
  { id: 25, x: 739.4, y: 299.1, type: 'step', zone: 3 },
  { id: 26, x: 880.0, y: 284.0, type: 'riddle', zone: 3, activityCode: 'AE-02' },
  { id: 27, x: 1020.6, y: 259.1, type: 'step', zone: 3 },
  { id: 28, x: 1161.2, y: 244.0, type: 'riddle', zone: 3, activityCode: 'AE-03' },
  { id: 29, x: 1301.7, y: 219.0, type: 'step', zone: 3 },
  { id: 30, x: 1354.9, y: 122.9, type: 'step', zone: 3 },
  { id: 31, x: 1195.2, y: 111.5, type: 'riddle', zone: 3, activityCode: 'AE-04' },
  { id: 32, x: 1035.4, y: 83.7, type: 'step', zone: 3 },
  { id: 33, x: 869.3, y: 99.0, type: 'step', zone: 3 },
  { id: 34, x: 709.0, y: 83.7, type: 'step', zone: 3 },
  { id: 35, x: 545.8, y: 83.7, type: 'step', zone: 3 },
  { id: 36, x: 401.1, y: 123.8, type: 'challenge', zone: 3, activityCode: 'AE-05' },
  { id: 37, x: 117.2, y: 371.0, type: 'step', zone: 3 },
  { id: 38, x: 206.0, y: 451.1, type: 'badge', zone: 3, activityCode: 'AE-06', badgePoints: 3 },

  // =========================================================================
  // ZONA 4: JENIS EKOSISTEM (Petak 39 - 50) • Jalur Baris 4 (Y: 750)
  // =========================================================================
  { id: 39, x: 309.8, y: 532.0, type: 'challenge', zone: 4, activityCode: 'JE-01' },
  { id: 40, x: 224.9, y: 623.6, type: 'riddle', zone: 4, activityCode: 'JE-02' },
  { id: 41, x: 134.1, y: 703.5, type: 'step', zone: 4 },
  { id: 42, x: 250.2, y: 784.6, type: 'step', zone: 4 },
  { id: 43, x: 146.0, y: 881.1, type: 'riddle', zone: 4, activityCode: 'JE-03' },
  { id: 44, x: 160.9, y: 1000.2, type: 'step', zone: 4 },
  { id: 45, x: 189.8, y: 1123.6, type: 'step', zone: 4 },
  { id: 46, x: 331.3, y: 1083.5, type: 'riddle', zone: 4, activityCode: 'JE-04' },
  { id: 47, x: 472.9, y: 1123.6, type: 'step', zone: 4 },
  { id: 48, x: 540.9, y: 1217.7, type: 'challenge', zone: 4, activityCode: 'JE-05' },
  { id: 49, x: 420.9, y: 1288.6, type: 'step', zone: 4 },
  { id: 50, x: 271.3, y: 1323.9, type: 'badge', zone: 4, activityCode: 'JE-06', badgePoints: 3 },
  { id: 51, x: 160, y: 1395, type: 'finish', zone: 4, label: 'FINISH' }
];

export const ACTIVITIES: Record<string, ActivityData> = {
  'KE-01': {
    code: 'KE-01',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 2,
    indicator: 'Interpretasi',
    level: 'C2',
    cardType: 'Challenge',
    title: 'KE-01: Interpretasi (C2)',
    instruction: "Amati area yang ditentukan guru selama 5 menit.\nCatat pada tabel pengamatan di LKPD minimal 4 komponen biotik dan 4 komponen abiotik yang kalian temukan.\nSetelah itu, jelaskan perbedaan komponen biotik dan abiotik berdasarkan temuan kelompokmu!",
    expectedResult: "Hasil menyesuaikan murid. Contoh: biotik: rumput, semut, tanaman kecil, cacing tanah. Abiotik: tanah, cahaya matahari, air, batu, udara.\nBiotik adalah komponen hidup, sedangkan abiotik adalah komponen tak hidup yang memengaruhi kehidupan organisme.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan murid. Contoh: biotik: rumput, semut, tanaman kecil, cacing tanah. Abiotik: tanah, cahaya matahari, air, batu, udara.\nBiotik adalah komponen hidup, sedangkan abiotik adalah komponen tak hidup yang memengaruhi kehidupan organisme.",
    maxScore: 3
  },
  'KE-02': {
    code: 'KE-02',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 3,
    indicator: 'Analisis',
    level: 'C4',
    cardType: 'Riddle',
    title: 'KE-02: Analisis (C4)',
    instruction: "Gunakan tabel pengamatanmu!\nPasangkan minimal 3 komponen abiotik dengan biotik yang kalian temukan di area pengamatan, kemudian jelaskan hubungan sebab-akibat antara keduanya!",
    expectedResult: "Hasil menyesuaikan data, contoh: cahaya cukup → rumput tumbuh subur karena dapat berfotosintesis; tanah lembap dan banyak serasah → cacing tanah atau jamur ditemukan; tempat teduh → lumut tumbuh.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data, contoh: cahaya cukup → rumput tumbuh subur karena dapat berfotosintesis; tanah lembap dan banyak serasah → cacing tanah atau jamur ditemukan; tempat teduh → lumut tumbuh.",
    maxScore: 3
  },
  'KE-03': {
    code: 'KE-03',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 5,
    indicator: 'Evaluasi',
    level: 'C5',
    cardType: 'Riddle',
    title: 'KE-03: Evaluasi (C5)',
    instruction: "Perhatikan dua pernyataan murid pada kotak stimulus di bawah ini:\n• Murid A: “Keberadaan organisme di suatu area tidak dipengaruhi faktor abiotik.”\n• Murid B: “Faktor abiotik seperti cahaya dan kelembapan memengaruhi jenis organisme yang hidup di suatu area.”\nNilailah pernyataan mana yang lebih didukung! Gunakan bukti data dari tabel pengamatan kelompokmu!",
    expectedResult: "Contoh hasil:\nPernyataan Murid B lebih didukung. Kelompok menunjukkan bukti dari areanya sendiri, misalnya organisme tertentu hanya ditemukan pada bagian yang lembap atau teduh.\nPernyataan Murid A terlalu menggeneralisasi karena mengabaikan hubungan komponen abiotik dengan biotik.",
    qrCode: "Pernyataan dua murid dan perbandingan area teduh vs terbuka",
    selfRegulationReference: "Contoh hasil:\nPernyataan Murid B lebih didukung. Kelompok menunjukkan bukti dari areanya sendiri, misalnya organisme tertentu hanya ditemukan pada bagian yang lembap atau teduh.\nPernyataan Murid A terlalu menggeneralisasi karena mengabaikan hubungan komponen abiotik dengan biotik.",
    stimulus: {
      type: 'data',
      content: "Stimulus Komparasi Pernyataan:\n• Murid A: “Keberadaan organisme di suatu area tidak dipengaruhi faktor abiotik.”\n• Murid B: “Faktor abiotik seperti cahaya dan kelembapan memengaruhi jenis organisme yang hidup di suatu area.”\n(Bandingkan temuan kelompokmu antara area teduh/lembap vs area terbuka/terik)."
    },
    maxScore: 3
  },
  'KE-04': {
    code: 'KE-04',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 6,
    indicator: 'Inferensi',
    level: 'C4',
    cardType: 'Riddle',
    title: 'KE-04: Inferensi (C4)',
    instruction: "Bayangkan area pengamatan kalian tidak terkena hujan selama 2 minggu.\nBuat 2 dugaan perubahan pada komponen biotik yang kalian temukan, dan jelaskan alasannya berdasarkan data pengamatan!",
    expectedResult: "Hasil menyesuaikan data dari jawaban murid. Contoh: rumput mengering karena kekurangan air; cacing tanah atau serangga tanah berpindah atau berkurang karena tanah kering; jamur berkurang karena kelembapan menurun.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data dari jawaban murid. Contoh: rumput mengering karena kekurangan air; cacing tanah atau serangga tanah berpindah atau berkurang karena tanah kering; jamur berkurang karena kelembapan menurun.",
    maxScore: 3
  },
  'KE-05': {
    code: 'KE-05',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 8,
    indicator: 'Eksplanasi',
    level: 'C4',
    cardType: 'Challenge',
    title: 'KE-05: Eksplanasi (C4)',
    instruction: "Dengan bantuan sketsa area pengamatan, buatlah video presentasi kelompok mengenai bagaimana komponen biotik dan abiotik di area kalian saling berhubungan beserta bukti konkret temuan lapangan.\nKirimkan video ke link Google Drive yang tersedia di bawah, lalu tuliskan konfirmasi pengumpulan pada LKPD!",
    expectedResult: "Hasil menyesuaikan jawaban dari murid. Contoh: penjelasan runtut, yaitu bukti pengamatan → hubungan sebab-akibat → kesimpulan, dengan istilah biotik dan abiotik yang tepat.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban dari murid. Contoh: penjelasan runtut, yaitu bukti pengamatan → hubungan sebab-akibat → kesimpulan, dengan istilah biotik dan abiotik yang tepat.",
    maxScore: 3
  },
  'KE-06': {
    code: 'KE-06',
    zoneId: 1,
    zoneName: 'Komponen Ekosistem',
    tileNumber: 10,
    indicator: 'Regulasi Diri',
    level: 'C5',
    cardType: 'Riddle',
    title: 'KE-06: Regulasi Diri (C5)',
    instruction: "Buka tab 'Regulasi Diri & Refleksi' untuk mengakses dokumen rujukan konsep di Google Drive dan membandingkannya dengan riwayat jawaban kelompokmu dari aktivitas KE-01 sampai KE-05.\nTandai bagian yang keliru atau kurang tepat, lalu tuliskan perbaikan jawaban atau alasan mempertahankan jawaban pada kolom refleksi yang disediakan!",
    expectedResult: "Hasil menyesuaikan dari hasil data murid. Contoh: kelompok menyebutkan minimal satu bagian yang diperiksa disertai bukti dari rujukan, misalnya semula memasukkan “matahari” sebagai komponen biotik, lalu memperbaikinya menjadi abiotik.",
    qrCode: "Rujukan mandiri pengelompokan biotik–abiotik",
    selfRegulationReference: "Kunci Rujukan Mandiri (Komponen Ekosistem):\n1. Komponen Biotik (Makhluk Hidup): Produsen (rumput, pohon, lumut), Konsumen (semut, belalang, cacing tanah, burung), Pengurai (jamur, bakteri serasah).\n2. Komponen Abiotik (Benda Tak Hidup): Cahaya matahari, suhu lingkungan, air/kelembapan, udara/angin, tanah, batu, derajat keasaman (pH).\n3. Hubungan Sebab-Akibat: Faktor abiotik membatasi jenis dan kelimpahan organisme yang hidup di area tersebut.\n\nDokumen lengkap dapat diakses melalui tombol tautan Google Drive di atas.",
    stimulus: {
      type: 'data',
      content: "Petunjuk: Bandingkan riwayat jawaban kelompokmu (KE-01 s/d KE-05) dengan Dokumen Rujukan Mandiri pada tab Regulasi Diri & Refleksi, lalu tuliskan catatan evaluasi dan perbaikannya."
    },
    maxScore: 3
  },
  'IA-01': {
    code: 'IA-01',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 13,
    indicator: 'Interpretasi',
    level: 'C2',
    cardType: 'Challenge',
    title: 'IA-01: Interpretasi (C2)',
    instruction: "Amati area di sekitar sekolah selama 10 menit, cari minimal 2 pasangan organisme yang tampak saling berhubungan.\nCatat pada tab LKPD: nama organisme, apa yang dilakukan, dan dampaknya bagi masing-masing organisme (untung, rugi, atau tidak terpengaruh).\n💡 Jika kelompokmu tidak menemukan interaksi langsung di lapangan, gunakan data interaksi alternatif yang tersedia pada kotak stimulus di bawah!",
    expectedResult: "Hasil menyesuaikan pengamatan murid. Contoh: lebah dan bunga: lebah memperoleh nektar, bunga terbantu penyerbukan (untung dan untung). Ulat dan daun: ulat memperoleh makanan, tanaman dirugikan (untung dan rugi). Lumut dan batang pohon: lumut memperoleh tempat tumbuh, pohon tidak terpengaruh (untung  dan tidak terpengaruh). Gulma dan tanaman: keduanya bersaing memperoleh cahaya, air, dan unsur hara (rugi dan rugi).",
    qrCode: "Kumpulan data dan fenomena interaksi organisme alternatif",
    selfRegulationReference: "Hasil menyesuaikan pengamatan murid. Contoh: lebah dan bunga: lebah memperoleh nektar, bunga terbantu penyerbukan (untung dan untung). Ulat dan daun: ulat memperoleh makanan, tanaman dirugikan (untung dan rugi). Lumut dan batang pohon: lumut memperoleh tempat tumbuh, pohon tidak terpengaruh (untung  dan tidak terpengaruh). Gulma dan tanaman: keduanya bersaing memperoleh cahaya, air, dan unsur hara (rugi dan rugi).",
    stimulus: {
      type: 'data',
      content: "Stimulus Interaksi Alternatif:\n1. Lebah madu menghisap nektar bunga tanaman hias (lebah memperoleh makanan, bunga terbantu penyerbukan).\n2. Ulat memakan helai daun sirih/tanaman pagar (ulat kenyang, daun tanaman berlubang/rusak).\n3. Lumut kerak atau paku sarang burung yang melekat di dahan pohon rindang (menumpang tempat tumbuh tanpa menyerap nutrisi inang).\n4. Gulma/rumput liar yang tumbuh rapat mengelilingi tanaman hias (saling berebut unsur hara dan air tanah)."
    },
    maxScore: 3
  },
  'IA-02': {
    code: 'IA-02',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 14,
    indicator: 'Analisis',
    level: 'C4',
    cardType: 'Riddle',
    title: 'IA-02: Analisis (C4)',
    instruction: "Gunakan pasangan organisme yang telah kalian catat! Tentukan jenis interaksinya (mutualisme, komensalisme, parasitisme, predasi, atau kompetisi) dan berikan alasan berdasarkan dampak pada masing-masing organisme!",
    expectedResult: "Hasil menyesuaikan data siswa. Contoh: lebah dan bunga = mutualisme (kedua pihak diuntungkan); ulat dan daun = predasi/herbivori (ulat diuntungkan, tanaman dirugikan); lumut dan batang pohon = komensalisme (lumut diuntungkan, pohon tidak terpengaruh); gulma dan tanaman = kompetisi (keduanya saling merugikan).",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data siswa. Contoh: lebah dan bunga = mutualisme (kedua pihak diuntungkan); ulat dan daun = predasi/herbivori (ulat diuntungkan, tanaman dirugikan); lumut dan batang pohon = komensalisme (lumut diuntungkan, pohon tidak terpengaruh); gulma dan tanaman = kompetisi (keduanya saling merugikan).",
    maxScore: 3
  },
  'IA-03': {
    code: 'IA-03',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 16,
    indicator: 'Evaluasi',
    level: 'C5',
    cardType: 'Riddle',
    title: 'IA-03: Evaluasi (C5)',
    instruction: "Seorang murid berkata: “Interaksi antarmakhluk hidup selalu menguntungkan kedua pihak.”\nNilailah pernyataan tersebut menggunakan bukti dari pasangan organisme yang kalian temukan!",
    expectedResult: "Hasil menyesuaikan data dari murid. Contoh: pernyataan tersebut tidak tepat. Data kelompok menunjukkan ada interaksi yang merugikan salah satu pihak atau kedua pihak (predasi, parasitisme, kompetisi) dan ada yang tidak berdampak pada salah satu pihak (komensalisme). Hanya mutualisme yang menguntungkan kedua pihak.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data dari murid. Contoh: pernyataan tersebut tidak tepat. Data kelompok menunjukkan ada interaksi yang merugikan salah satu pihak atau kedua pihak (predasi, parasitisme, kompetisi) dan ada yang tidak berdampak pada salah satu pihak (komensalisme). Hanya mutualisme yang menguntungkan kedua pihak.",
    maxScore: 3
  },
  'IA-04': {
    code: 'IA-04',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 18,
    indicator: 'Inferensi',
    level: 'C4',
    cardType: 'Riddle',
    title: 'IA-04: Inferensi (C4)',
    instruction: "Pilih satu pasangan organisme yang kalian temukan.\nJika salah satu organisme tiba-tiba hilang dari area, buat 2 dugaan perubahan yang terjadi pada organisme pasangannya atau organisme lain, dan jelaskan alasannya berdasarkan jenis interaksinya!",
    expectedResult: "Hasil menyesuaikan pilihan murid. Contoh: jika lebah hilang, penyerbukan berkurang sehingga bunga menghasilkan biji atau buah lebih sedikit. Jika ulat hilang, kerusakan daun berkurang, tetapi pemangsa ulat kehilangan salah satu sumber makanan.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan pilihan murid. Contoh: jika lebah hilang, penyerbukan berkurang sehingga bunga menghasilkan biji atau buah lebih sedikit. Jika ulat hilang, kerusakan daun berkurang, tetapi pemangsa ulat kehilangan salah satu sumber makanan.",
    maxScore: 3
  },
  'IA-05': {
    code: 'IA-05',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 20,
    indicator: 'Eksplanasi',
    level: 'C4',
    cardType: 'Challenge',
    title: 'IA-05: Eksplanasi (C4)',
    instruction: "Peragakan secara singkat salah satu bentuk interaksi yang kalian temukan di lapangan.\nSetelah itu, jelaskan mengapa interaksi tersebut terjadi dan apa dampaknya bagi masing-masing organisme!",
    expectedResult: "Hasil menyesuaikan jawaban dari murid. Contoh: peragaan sesuai interaksi yang dipilih, disertai penjelasan runtut: kebutuhan organisme (makanan, tempat, perlindungan) → bentuk interaksi → dampak bagi masing-masing pihak.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban dari murid. Contoh: peragaan sesuai interaksi yang dipilih, disertai penjelasan runtut: kebutuhan organisme (makanan, tempat, perlindungan) → bentuk interaksi → dampak bagi masing-masing pihak.",
    maxScore: 3
  },
  'IA-06': {
    code: 'IA-06',
    zoneId: 2,
    zoneName: 'Interaksi Antarmakhluk Hidup',
    tileNumber: 22,
    indicator: 'Regulasi Diri',
    level: 'C5',
    cardType: 'Riddle',
    title: 'IA-06: Regulasi Diri (C5)',
    instruction: "Buka tab '3. Regulasi Diri' untuk melihat tabel rujukan jenis interaksi antarmakhluk hidup.\nPeriksa kembali jenis interaksi yang kalian tetapkan pada IA-02. Tandai bagian yang keliru, perbaiki pada lembar LKPD, lalu jelaskan alasan perbaikan atau alasan mempertahankan jawaban pada kolom refleksi!",
    expectedResult: "Hasil menyesuaikan dari jawaban murid. Contoh: kelompok semula menyebut lumut di batang pohon sebagai parasit, lalu memperbaikinya menjadi komensalisme karena lumut memperoleh tempat tumbuh, sedangkan pohon tidak dirugikan maupun diuntungkan.",
    qrCode: "Tabel rujukan jenis interaksi beserta dampak dan contohnya",
    selfRegulationReference: "Kunci Rujukan Mandiri (Jenis Interaksi Antarmakhluk Hidup):\n• Mutualisme (+ / +): Kedua organisme saling diuntungkan (contoh: lebah & bunga mekar).\n• Komensalisme (+ / 0): Satu pihak diuntungkan, pihak lain tidak dirugikan maupun diuntungkan (contoh: anggrek/lumut pada dahan pohon inang).\n• Parasitisme (+ / -): Satu pihak mengambil keuntungan dengan merugikan inangnya (contoh: benalu/kutu pada inang).\n• Predasi & Herbivori (+ / -): Satu organisme memakan organisme lain sebagai sumber makanan (contoh: ulat memakan daun, burung memangsa ulat).\n• Kompetisi (- / -): Persaingan antarorganisme memperebutkan sumber daya hidup yang terbatas (contoh: gulma dan tanaman hias memperebutkan unsur hara tanah).",
    stimulus: {
      type: 'data',
      content: "Petunjuk: Buka tab '3. Regulasi Diri' di atas untuk memvalidasi analisis pola interaksi kelompokmu dengan tabel acuan ilmiah."
    },
    maxScore: 3
  },
  'AE-01': {
    code: 'AE-01',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 23,
    indicator: 'Interpretasi',
    level: 'C2',
    cardType: 'Challenge',
    title: 'AE-01: Interpretasi (C2)',
    instruction: "Amati lingkungan di sekitar sekolah selama 10 menit, cari bukti hubungan makan-memakan antarorganisme. Catat pada tab LKPD minimal 3 organisme: apa yang dimakan, siapa yang memakan, dan bukti yang ditemukan. Tentukan pula perannya (produsen atau konsumen).\n💡 Jika kelompokmu tidak menemukan hubungan makan-memakan secara langsung, gunakan bukti lapangan alternatif yang tersedia pada kotak stimulus di bawah!",
    expectedResult: "Hasil menyesuaikan pengamatan murid. Contoh: rumput (produsen) dimakan belalang (bukti: daun rumput berlubang); belalang (konsumen tingkat I) dimakan burung (bukti: burung mematuk belalang); semut (konsumen) membawa remah makanan.",
    qrCode: "Kumpulan bukti lapangan hubungan makan-memakan alternatif",
    selfRegulationReference: "Hasil menyesuaikan pengamatan murid. Contoh: rumput (produsen) dimakan belalang (bukti: daun rumput berlubang); belalang (konsumen tingkat I) dimakan burung (bukti: burung mematuk belalang); semut (konsumen) membawa remah makanan.",
    stimulus: {
      type: 'data',
      content: "Stimulus Bukti Hubungan Makan-Memakan Lapangan:\n1. Bukti 1: Daun tanaman hias berlubang bekas gigitan belalang/ulat (Produsen → Konsumen I).\n2. Bukti 2: Burung gereja/pipit terlihat mematuk ulat kecil di dahan pohon (Konsumen I → Konsumen II).\n3. Bukti 3: Rombongan semut membawa serpihan sisa makanan atau bangkai serangga ke sarangnya (Konsumen/Dekomposer)."
    },
    maxScore: 3
  },
  'AE-02': {
    code: 'AE-02',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 26,
    indicator: 'Analisis',
    level: 'C4',
    cardType: 'Riddle',
    title: 'AE-02: Analisis (C4)',
    instruction: "Gunakan data organisme yang telah kalian catat!\nSusun rantai makanan (minimal 3 tingkat) dengan tanda panah, dan tentukan tingkat trofik tiap organisme. Jika datamu memuat lebih dari satu rantai, hubungkan menjadi jaring makanan sederhana!",
    expectedResult: "Hasil menyesuaikan data yang didapat murid. Contoh: rumput → belalang → burung (produsen → konsumen tingkat I → konsumen tingkat II). Tanda panah menunjukkan arah aliran energi, yaitu dari organisme yang dimakan menuju organisme yang memakan.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data yang didapat murid. Contoh: rumput → belalang → burung (produsen → konsumen tingkat I → konsumen tingkat II). Tanda panah menunjukkan arah aliran energi, yaitu dari organisme yang dimakan menuju organisme yang memakan.",
    maxScore: 3
  },
  'AE-03': {
    code: 'AE-03',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 28,
    indicator: 'Evaluasi',
    level: 'C5',
    cardType: 'Riddle',
    title: 'AE-03: Evaluasi (C5)',
    instruction: "Seorang murid berkata: “Energi berpindah seluruhnya dari produsen ke konsumen, sehingga jumlah energi di setiap tingkat makanan sama besar.”\nNilailah pernyataan tersebut! Gunakan bukti dari rantai makanan kelompokmu!",
    expectedResult: "Hasil menyesuaikan jawaban murid. Contoh: pernyataan tidak tepat. Hanya sebagian kecil energi (sekitar 10%) yang berpindah ke tingkat berikutnya, sedangkan sisanya dipakai untuk aktivitas hidup atau dilepas sebagai panas. Bukti dari data: organisme di tingkat produsen biasanya paling banyak, sedangkan di tingkat konsumen puncak paling sedikit.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban murid. Contoh: pernyataan tidak tepat. Hanya sebagian kecil energi (sekitar 10%) yang berpindah ke tingkat berikutnya, sedangkan sisanya dipakai untuk aktivitas hidup atau dilepas sebagai panas. Bukti dari data: organisme di tingkat produsen biasanya paling banyak, sedangkan di tingkat konsumen puncak paling sedikit.",
    maxScore: 3
  },
  'AE-04': {
    code: 'AE-04',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 31,
    indicator: 'Inferensi',
    level: 'C4',
    cardType: 'Riddle',
    title: 'AE-04: Inferensi (C4)',
    instruction: "Bayangkan populasi konsumen tingkat I pada rantai makananmu berkurang drastis!\nKemudian buatlah 2 dugaan dampak yang terjadi pada produsen dan konsumen tingkat II! Jelaskan alasannya!",
    expectedResult: "Hasil menyesuaikan jawaban murid. Contoh: jika belalang berkurang drastis, rumput lebih sedikit dimakan sehingga populasinya cenderung meningkat; burung kehilangan sumber makanan sehingga populasinya menurun atau berpindah.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban murid. Contoh: jika belalang berkurang drastis, rumput lebih sedikit dimakan sehingga populasinya cenderung meningkat; burung kehilangan sumber makanan sehingga populasinya menurun atau berpindah.",
    maxScore: 3
  },
  'AE-05': {
    code: 'AE-05',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 36,
    indicator: 'Eksplanasi',
    level: 'C4',
    cardType: 'Challenge',
    title: 'AE-05: Eksplanasi (C4)',
    instruction: "Peragakan aliran energi pada rantai makananmu memakai sketsa dan tanda panah.\nPresentasikan bagaimana energi berpindah dari matahari sampai konsumen puncak, dan mengapa jumlah organisme di tingkat atas lebih sedikit!",
    expectedResult: "Hasil menyesuaikan jawaban murid. Contoh: matahari → produsen (fotosintesis) → konsumen tingkat I → konsumen tingkat II. Energi berkurang di tiap perpindahan karena sebagian dipakai untuk aktivitas hidup atau dilepas sebagai panas, sehingga organisme di tingkat atas jumlahnya lebih sedikit.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban murid. Contoh: matahari → produsen (fotosintesis) → konsumen tingkat I → konsumen tingkat II. Energi berkurang di tiap perpindahan karena sebagian dipakai untuk aktivitas hidup atau dilepas sebagai panas, sehingga organisme di tingkat atas jumlahnya lebih sedikit.",
    maxScore: 3
  },
  'AE-06': {
    code: 'AE-06',
    zoneId: 3,
    zoneName: 'Aliran Energi',
    tileNumber: 38,
    indicator: 'Regulasi Diri',
    level: 'C5',
    cardType: 'Riddle',
    title: 'AE-06: Regulasi Diri (C5)',
    instruction: "Buka tab '3. Regulasi Diri' untuk melihat bagan rujukan rantai makanan dan kaidah arah aliran energi!\nPeriksa kembali rantai makanan yang telah kelompokmu susun dan jawaban yang telah dibuat. Tandai bagian yang kurang tepat, perbaiki pada lembar LKPD, lalu jelaskan alasan perbaikan atau alasan mempertahankan jawaban pada kolom refleksi!",
    expectedResult: "Hasil menyesuaikan data dan jawaban murid. Contoh: kelompok semula menggambar burung → belalang, kemudian memperbaikinya menjadi belalang → burung karena panah menunjukkan arah aliran energi dari yang dimakan ke yang memakan.",
    qrCode: "Rujukan kaidah rantai makanan dan aliran energi",
    selfRegulationReference: "Kunci Rujukan Mandiri (Rantai Makanan & Aliran Energi):\n1. Arah Tanda Panah (→): Menunjukkan arah aliran energi dari organisme yang dimakan menuju pemakan (contoh: Rumput → Belalang → Burung).\n2. Tingkat Trofik:\n   • Trofik 1: Produsen (tumbuhan berklorofil penghasil energi melalui fotosintesis).\n   • Trofik 2: Konsumen Tingkat I / Herbivor (pemakan produsen).\n   • Trofik 3: Konsumen Tingkat II / Karnivor (pemakan herbivor).\n3. Hukum Aliran Energi: Hanya ~10% energi yang berpindah efisien ke trofik berikutnya (hukum 10%), sisanya hilang sebagai panas dan metabolisme respirasi.",
    stimulus: {
      type: 'data',
      content: "Petunjuk: Buka tab '3. Regulasi Diri' di atas untuk memvalidasi susunan rantai makanan serta arah tanda panah aliran energi kelompokmu."
    },
    maxScore: 3
  },
  'JE-01': {
    code: 'JE-01',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 39,
    indicator: 'Interpretasi',
    level: 'C2',
    cardType: 'Challenge',
    title: 'JE-01: Interpretasi (C2)',
    instruction: "Cermati informasi profil dua ekosistem pada kotak stimulus di bawah ini!\nCatat pada form LKPD untuk masing-masing ekosistem: nama ekosistem, ciri abiotik fisik (suhu, ketersediaan air / curah hujan, intensitas cahaya), serta contoh flora dan fauna yang khas.\nKelompokkan tiap ekosistem ke dalam jenisnya (alami atau buatan)!",
    expectedResult: "Hasil menyesuaikan tiap kelompok. Contoh: hutan hujan tropis (ekosistem darat alami): curah hujan tinggi, suhu hangat dan relatif stabil, tumbuhan lebat berlapis, banyak spesies. Gurun (ekosistem darat alami): curah hujan sangat rendah, siang sangat panas dan malam dingin, tumbuhan jarang seperti kaktus, hewan banyak aktif di malam hari.",
    qrCode: "Data profil dan komparasi dua ekosistem darat",
    selfRegulationReference: "Hasil menyesuaikan tiap kelompok. Contoh: hutan hujan tropis (ekosistem darat alami): curah hujan tinggi, suhu hangat dan relatif stabil, tumbuhan lebat berlapis, banyak spesies. Gurun (ekosistem darat alami): curah hujan sangat rendah, siang sangat panas dan malam dingin, tumbuhan jarang seperti kaktus, hewan banyak aktif di malam hari.",
    stimulus: {
      type: 'data',
      content: "Profil Ekosistem untuk Pengamatan:\n• Ekosistem A (Hutan Hujan Tropis): Curah hujan sangat tinggi (>2.000 mm/tahun), suhu hangat konstan (22-28°C), kanopi pohon bertingkat lebat. Flora: meranti, rotan, epifit anggrek. Fauna: kera, burung rangkong, harimau, serangga. (Jenis: Ekosistem Darat Alami).\n• Ekosistem B (Gurun / Padang Pasir): Curah hujan sangat minim (<250 mm/tahun), fluktuasi suhu ekstrem (siang terik >40°C, malam dingin <10°C). Flora: kaktus berduri penyimpan air. Fauna: kadal gurun, ular derik, unta, hewan aktif nokturnal. (Jenis: Ekosistem Darat Alami)."
    },
    maxScore: 3
  },
  'JE-02': {
    code: 'JE-02',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 40,
    indicator: 'Analisis',
    level: 'C4',
    cardType: 'Riddle',
    title: 'JE-02: Analisis (C4)',
    instruction: "Bandingkan kedua ekosistem yang telah kalian pelajari: Tuliskan minimal 3 perbedaan dan 1 persamaan, kemudian jelaskan hubungan antara ciri abiotik dan adaptasi biotik di sana!",
    expectedResult: "Hasil menyesuaikan jawaban murid. Contoh: perbedaan: curah hujan, kerapatan vegetasi, dan adaptasi tumbuhan (kaktus menyimpan air, daun berduri). Persamaan: keduanya memiliki komponen biotik dan abiotik yang saling berhubungan. Ketersediaan air yang tinggi mendukung vegetasi lebat, sedangkan air yang sangat terbatas membuat hanya organisme beradaptasi khusus yang bertahan.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan jawaban murid. Contoh: perbedaan: curah hujan, kerapatan vegetasi, dan adaptasi tumbuhan (kaktus menyimpan air, daun berduri). Persamaan: keduanya memiliki komponen biotik dan abiotik yang saling berhubungan. Ketersediaan air yang tinggi mendukung vegetasi lebat, sedangkan air yang sangat terbatas membuat hanya organisme beradaptasi khusus yang bertahan.",
    maxScore: 3
  },
  'JE-03': {
    code: 'JE-03',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 43,
    indicator: 'Evaluasi',
    level: 'C5',
    cardType: 'Riddle',
    title: 'JE-03: Evaluasi (C5)',
    instruction: "Perhatikan pernyataan evaluasi pada kotak stimulus berikut:\n“Semua ekosistem darat memiliki kondisi lingkungan dan jenis organisme yang sama karena sama-sama berada di permukaan daratan.”\nNilailah apakah pernyataan tersebut tepat atau keliru! Buktikan evaluasimu menggunakan fakta perbandingan dari dua ekosistem yang telah kelompokmu pelajari!",
    expectedResult: "Hasil menyesuaikan jawaban murid. Contoh: pernyataan tersebut tidak tepat. Hutan hujan tropis dan gurun sama-sama ekosistem darat, tetapi curah hujan, suhu, vegetasi, dan organismenya sangat berbeda. Ekosistem sejenis pun dapat berbeda karena faktor abiotiknya berbeda.",
    qrCode: "Pernyataan evaluasi keberagaman ekosistem darat",
    selfRegulationReference: "Kunci Evaluasi: Pernyataan tersebut TIDAK TEPAT / KELIRU. Walaupun sama-sama merupakan ekosistem darat, faktor abiotik seperti curah hujan, suhu, dan kelembapan sangat berbeda secara ekstrem antara satu ekosistem dengan lainnya (misal: Hutan Hujan Tropis vs Gurun), sehingga menyebabkan keanekaragaman flora-fauna dan adaptasinya berbeda secara drastis.",
    stimulus: {
      type: 'data',
      content: "Pernyataan Evaluasi Kritis:\n“Semua ekosistem darat memiliki kondisi lingkungan dan jenis organisme yang sama karena sama-sama berada di permukaan daratan.”"
    },
    maxScore: 3
  },
  'JE-04': {
    code: 'JE-04',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 46,
    indicator: 'Inferensi',
    level: 'C4',
    cardType: 'Riddle',
    title: 'JE-04: Inferensi (C4)',
    instruction: "Bayangkan salah satu ekosistem kelompokmu mengalami perubahan drastis pada komponen abiotiknya (misal: curah hujan turun drastis di hutan tropis atau meningkat di gurun)!\nBuat 2 dugaan perubahan yang akan terjadi pada organisme di sana, dan jelaskan alasannya!",
    expectedResult: "Hasil menyesuaikanjawaban tiap murid. Contoh: jika hujan di hutan hujan tropis berkurang drastis, tumbuhan berdaun lebar mengalami kekurangan air sehingga vegetasi menjadi kurang rapat dan hewan yang bergantung padanya berpindah. Jika hujan di gurun meningkat, biji tumbuhan dapat berkecambah sehingga vegetasi bertambah sementara.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikanjawaban tiap murid. Contoh: jika hujan di hutan hujan tropis berkurang drastis, tumbuhan berdaun lebar mengalami kekurangan air sehingga vegetasi menjadi kurang rapat dan hewan yang bergantung padanya berpindah. Jika hujan di gurun meningkat, biji tumbuhan dapat berkecambah sehingga vegetasi bertambah sementara.",
    maxScore: 3
  },
  'JE-05': {
    code: 'JE-05',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 48,
    indicator: 'Eksplanasi',
    level: 'C4',
    cardType: 'Challenge',
    title: 'JE-05: Eksplanasi (C4)',
    instruction: "Presentasikan ciri ekosistem yang kalian amati, contoh organisme beserta adaptasinya, dan hubungan keterkaitannya dengan kondisi abiotik setempat!",
    expectedResult: "Hasil menyesuaikan data dan jawaban dari murid. Contoh: sketsa berlabel komponen abiotik dan biotik, disertai penjelasan runtut: ciri lingkungan → organisme dan adaptasinya → kesimpulan mengapa organisme tersebut dapat hidup di ekosistem itu.",
    qrCode: "Tidak",
    selfRegulationReference: "Hasil menyesuaikan data dan jawaban dari murid. Contoh: sketsa berlabel komponen abiotik dan biotik, disertai penjelasan runtut: ciri lingkungan → organisme dan adaptasinya → kesimpulan mengapa organisme tersebut dapat hidup di ekosistem itu.",
    maxScore: 3
  },
  'JE-06': {
    code: 'JE-06',
    zoneId: 4,
    zoneName: 'Jenis Ekosistem',
    tileNumber: 50,
    indicator: 'Regulasi Diri',
    level: 'C5',
    cardType: 'Riddle',
    title: 'JE-06: Regulasi Diri (C5)',
    instruction: "Buka tab '3. Regulasi Diri' untuk melihat tabel rujukan komparasi ciri kedua ekosistem!\nPeriksa kembali tabel LKPD dan seluruh analisis kelompokmu sebelumnya. Tandai bagian yang kurang tepat, perbaiki pada jawaban, lalu jelaskan alasan perbaikan atau alasan mempertahankan jawaban pada kolom refleksi!",
    expectedResult: "Hasil menyesuaikan data dan jawaban tiap murid. Contoh: kelompok semula menulis kaktus sebagai tumbuhan khas hutan hujan tropis, lalu memperbaikinya menjadi tumbuhan khas gurun sesuai rujukan.",
    qrCode: "Tabel rujukan komparasi ciri kedua ekosistem",
    selfRegulationReference: "Kunci Rujukan Mandiri (Komparasi Ciri Ekosistem):\n1. Hutan Hujan Tropis: Curah hujan tinggi (>2000 mm/th), suhu hangat relatif konstan, vegetasi kanopi bertingkat lebat, flora fauna beraneka ragam tinggi (misal: epifit, liana, orangutan, harimau).\n2. Gurun (Padang Pasir): Curah hujan sangat rendah (<250 mm/th), evaporasi tinggi, suhu siang sangat panas dan malam dingin, adaptasi xerofit (daun duri, batang sukulen menyimpan air), hewan nokturnal.\n3. Kesimpulan Regulasi: Perbedaan faktor abiotik menentukan tipe vegetasi dan bentuk adaptasi morfologi/fisiologi makhluk hidup yang ada di dalamnya.",
    stimulus: {
      type: 'data',
      content: "Petunjuk: Buka tab '3. Regulasi Diri' di atas untuk memvalidasi komparasi ciri dan adaptasi ekosistem kelompokmu."
    },
    maxScore: 3
  },
};
export const TEAM_PRESETS = [
  { name: 'Harimau', icon: '🐯', color: '#ef4444', badgeColor: 'bg-red-500' },
  { name: 'Elang', icon: '🦅', color: '#3b82f6', badgeColor: 'bg-blue-500' },
  { name: 'Komodo', icon: '🦎', color: '#10b981', badgeColor: 'bg-emerald-500' },
  { name: 'Penyu', icon: '🐢', color: '#f59e0b', badgeColor: 'bg-amber-500' },
  { name: 'Rusa', icon: '🦌', color: '#8b5cf6', badgeColor: 'bg-purple-500' },
  { name: 'Beruang', icon: '🐻', color: '#06b6d4', badgeColor: 'bg-cyan-500' },
  { name: 'Kupu-kupu', icon: '🦋', color: '#ec4899', badgeColor: 'bg-pink-500' },
  { name: 'Lumba-lumba', icon: '🐬', color: '#0284c7', badgeColor: 'bg-sky-600' },
  { name: 'Serigala', icon: '🐺', color: '#64748b', badgeColor: 'bg-slate-500' },
  { name: 'Gajah', icon: '🐘', color: '#78716c', badgeColor: 'bg-stone-500' },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Kelompok 1 (Harimau)',
    color: '#ef4444', // Red
    badgeColor: 'bg-red-500',
    currentTile: 0,
    completedActivities: [],
    badgePoints: 0,
    lkpdScore: 0,
    avatarIcon: '🐯',
    hasFinishedPreTest: false,
    hasFinishedPostTest: false,
  },
  {
    id: 2,
    name: 'Kelompok 2 (Elang)',
    color: '#3b82f6', // Blue
    badgeColor: 'bg-blue-500',
    currentTile: 0,
    completedActivities: [],
    badgePoints: 0,
    lkpdScore: 0,
    avatarIcon: '🦅',
    hasFinishedPreTest: false,
    hasFinishedPostTest: false,
  },
  {
    id: 3,
    name: 'Kelompok 3 (Komodo)',
    color: '#10b981', // Green
    badgeColor: 'bg-emerald-500',
    currentTile: 0,
    completedActivities: [],
    badgePoints: 0,
    lkpdScore: 0,
    avatarIcon: '🦎',
    hasFinishedPreTest: false,
    hasFinishedPostTest: false,
  }
];

export const PRE_POST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    indicator: 'Interpretasi',
    level: 'C2',
    question: 'Di sebuah kolam sekolah ditemukan eceng gondok, ikan mas, air yang keruh, dan batu kerikil. Manakah pernyataan yang paling tepat mengenai komponen ekosistem kolam tersebut?',
    options: [
      'Eceng gondok dan air merupakan komponen biotik penghasil energi',
      'Ikan mas dan eceng gondok adalah biotik, sedangkan air keruh dan kerikil adalah abiotik',
      'Air keruh merupakan komponen biotik karena mengandung mikroba pengurai',
      'Batu kerikil dan ikan mas saling berkompetisi memperebutkan nutrisi'
    ],
    correctIndex: 1,
    explanation: 'Biotik mencakup organisme hidup (ikan, tanaman eceng gondok), sedangkan abiotik mencakup faktor fisik-kimia tak hidup (air, batu kerikil).'
  },
  {
    id: 2,
    indicator: 'Analisis',
    level: 'C4',
    question: 'Jika kadar kelembapan tanah di suatu kebun sangat rendah akibat kemarau, populasi manakah yang paling cepat mengalami penurunan drastis?',
    options: [
      'Cacing tanah dan mikroorganisme pembusuk tanah',
      'Pohon kelapa sawit dewasa',
      'Burung pemakan serangga terbang',
      'Batu karang dan pasir'
    ],
    correctIndex: 0,
    explanation: 'Cacing tanah bernapas melalui kulit basah dan memerlukan kelembapan tinggi untuk bertahan hidup; penurunan kelembapan berdampak langsung pada kelangsungan hidupnya.'
  },
  {
    id: 3,
    indicator: 'Evaluasi',
    level: 'C5',
    question: 'Murid X menyatakan: "Tanaman anggrek yang menempel pada pohon mangga adalah parasit karena merugikan pohon mangga". Bagaimana penilaian Anda terhadap pernyataan tersebut?',
    options: [
      'Tepat, karena anggrek menyerap air dan hasil fotosintesis dari floem mangga',
      'Keliru, anggrek hanya epifit yang menumpang tempat tumbuh tanpa mengambil nutrisi dari mangga',
      'Tepat, karena daun anggrek menutupi seluruh cabang mangga hingga mati',
      'Keliru, karena pohon mangga memperoleh makanan dari akar anggrek'
    ],
    correctIndex: 1,
    explanation: 'Interaksi anggrek dan inangnya adalah komensalisme (+/0), di mana anggrek mendapat tempat menempel untuk cahaya, sedangkan inang tidak dirugikan.'
  },
  {
    id: 4,
    indicator: 'Inferensi',
    level: 'C4',
    question: 'Dalam sebuah rantai makanan: Rumput → Belalang → Katak → Ular. Jika petani menyemprot insektisida hingga belalang punah, dugaan logis yang akan terjadi adalah...',
    options: [
      'Populasi katak meningkat karena terbebas dari hama belalang',
      'Populasi rumput menurun dan populasi ular meningkat pesat',
      'Populasi rumput bertambah lebat, sedangkan populasi katak menurun drastis karena kelaparan',
      'Katak langsung beralih memakan rumput untuk bertahan hidup'
    ],
    correctIndex: 2,
    explanation: 'Sebagai mangsa utama katak, hilangnya belalang menyebabkan katak kelaparan dan populasinya anjlok, sementara rumput tidak lagi dimakan belalang.'
  },
  {
    id: 5,
    indicator: 'Eksplanasi',
    level: 'C4',
    question: 'Mengapa dalam suatu ekosistem piramida biomassa selalu mengerucut ke atas (jumlah predator puncak jauh lebih sedikit dibanding herbivora)?',
    options: [
      'Karena predator puncak berukuran tubuh lebih kecil',
      'Karena terjadi kehilangan energi (sekitar 90%) di setiap perpindahan tingkat trofik',
      'Karena produsen terus-menerus memakan konsumen tingkat satu',
      'Karena predator puncak tidak membutuhkan energi metabolisme'
    ],
    correctIndex: 1,
    explanation: 'Hanya ~10% energi yang berhasil ditransfer ke trofik berikutnya. Akibatnya, energi yang tersisa di trofik puncak hanya cukup menopang sedikit individu.'
  }
];
