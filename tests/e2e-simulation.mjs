import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

function logStep(step, message) {
  console.log(`\n======================================================`);
  console.log(`🔹 [${step}] ${message}`);
  console.log(`======================================================`);
}

function logSuccess(message) {
  console.log(`   ✅ PASS: ${message}`);
}

function logFail(message) {
  console.error(`   ❌ FAIL: ${message}`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper untuk mencari dan mengklik elemen yang tampak (visible) berdasarkan teks dalam DOM
async function clickByText(page, selector, textPattern) {
  const clicked = await page.evaluate(({ sel, pattern }) => {
    const elements = Array.from(document.querySelectorAll(sel));
    for (const el of elements) {
      if (el.innerText && el.innerText.toLowerCase().includes(pattern.toLowerCase())) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          el.click();
          return true;
        }
      }
    }
    return false;
  }, { sel: selector, pattern: textPattern });
  return clicked;
}

async function runSimulation() {
  console.log('🚀 MEMULAI PENGUJIAN SIMULASI END-TO-END ECOPLAY BOARDGAME...');
  console.log(`Target URL: ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      logSuccess(message);
      passedTests++;
    } else {
      logFail(message);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // =========================================================================
    // SKENARIO 1: AUTENTIKASI GURU & LOBBY (LANGKAH 1)
    // =========================================================================
    logStep('SKENARIO 1', 'Autentikasi Guru & Verifikasi Alur Langkah 1 (Ruang Tunggu)');
    
    const teacherContext = await browser.createBrowserContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.setViewport({ width: 1280, height: 800 });

    await teacherPage.goto(`${BASE_URL}/teacher`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // 1.1 Masuk mode simulasi guru
    const clickedDemo = await clickByText(teacherPage, 'button', 'Masuk Mode Simulasi');
    assert(clickedDemo, 'Tombol "Masuk Mode Simulasi / Coba Cepat" berhasil diklik');
    await sleep(1500);

    // 1.2 Verifikasi berada di Ruang Tunggu (Lobby Guru - Langkah 1)
    const isLobby = await teacherPage.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('KODE KELAS') || text.includes('Mulai Permainan');
    });
    assert(isLobby, 'Guru langsung berada di Ruang Tunggu (Lobby Langkah 1)');

    const isSpinVisible = await teacherPage.evaluate(() => {
      return document.body.innerText.includes('Urutan Melangkah') || document.body.innerText.includes('Putar Roda Giliran');
    });
    assert(!isSpinVisible, 'Guru TIDAK langsung melompat ke halaman Spin (Langkah 2)');

    // 1.3 Verifikasi daftar kelompok
    const teamCardsCount = await teacherPage.evaluate(() => {
      const allText = document.body.innerText;
      return (allText.match(/Kelompok \d+/g) || []).length;
    });
    assert(teamCardsCount >= 3, 'Tersedia daftar kelompok awal pada ruang tunggu guru');

    // =========================================================================
    // SKENARIO 2: SISWA BERGABUNG & PEMILIHAN KELOMPOK
    // =========================================================================
    logStep('SKENARIO 2', 'Siswa Masuk, Validasi Penghapusan Label Lama & Pemilihan Kelompok');

    const studentContext = await browser.createBrowserContext();
    const studentPage = await studentContext.newPage();
    await studentPage.setViewport({ width: 1280, height: 800 });

    await studentPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // 2.1 Siswa masuk menggunakan mode simulasi
    const studentDemoClicked = await clickByText(studentPage, 'button', 'Mode Simulasi');
    assert(studentDemoClicked, 'Tombol "Mode Simulasi (Coba Sendiri)" berhasil diklik oleh siswa');
    await sleep(1000);

    // 2.2 Verifikasi Keterangan "Kelas X Biologi & Sains" SUDAH TIDAK ADA
    const pageText = await studentPage.evaluate(() => document.body.innerText);
    const hasOldClassLabel = pageText.includes('Kelas X Biologi & Sains');
    assert(!hasOldClassLabel, 'Keterangan "Kelas X Biologi & Sains" sudah BERHASIL DIHILANGKAN dari halaman siswa');

    // 2.3 Verifikasi Lencana Kode Kelas bersih
    const hasCleanBadge = await studentPage.evaluate(() => {
      return document.body.innerText.includes('Kode Kelas:') || document.body.innerText.includes('ECO-DEMO');
    });
    assert(hasCleanBadge, 'Lencana Kode Kelas bersih tampil tanpa teks nama kelas redundan');

    // 2.4 Siswa memilih Kelompok 1
    const choseTeam1 = await studentPage.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const team1Title = h3s.find((h) => h.innerText.includes('Kelompok 1'));
      if (team1Title) {
        const card = team1Title.closest('.cursor-pointer') || team1Title;
        card.click();
        return true;
      }
      return false;
    });
    assert(choseTeam1, 'Siswa berhasil memilih Kelompok 1');
    await sleep(1500);

    // =========================================================================
    // SKENARIO 3 & 4: GURU MULAI PERMAINAN & SPIN GILIRAN (LANGKAH 2 -> LANGKAH 3)
    // =========================================================================
    logStep('SKENARIO 3 & 4', 'Guru Memulai Permainan, Melakukan Spin Giliran, & Membuka Papan');

    // Guru klik Mulai Permainan
    const startClicked = await clickByText(teacherPage, 'button', 'Mulai Permainan');
    assert(startClicked, 'Guru mengklik tombol "Mulai Permainan"');
    await sleep(1200);

    // Verifikasi layar guru berpindah ke Langkah 2: Spin Giliran
    const isSpinPhase = await teacherPage.evaluate(() => {
      return document.body.innerText.includes('Urutan Melangkah') || document.body.innerText.includes('Acak Semua') || document.body.innerText.includes('Putar');
    });
    assert(isSpinPhase, 'Layar Guru berpindah ke Langkah 2: Spin Roda Giliran');

    // Lakukan quick shuffle agar seluruh urutan tim langsung teracak
    const shuffleClicked = await clickByText(teacherPage, 'button', 'Acak Semua');
    assert(shuffleClicked, 'Guru mengacak giliran seluruh tim dengan tombol "Acak Semua"');
    await sleep(1000);

    // Masuk ke Papan Permainan dengan urutan hasil acak
    const enterBoardClicked = await clickByText(teacherPage, 'button', 'Mulai Board Game');
    assert(enterBoardClicked, 'Guru menekan tombol "Mulai Board Game dengan Urutan Ini"');
    await sleep(1500);

    // Verifikasi guru telah berada di Langkah 3: Papan Permainan
    const teacherOnBoard = await teacherPage.evaluate(() => {
      return document.body.innerText.includes('Langkah 3') || document.body.innerText.includes('Panel Penilaian');
    });
    assert(teacherOnBoard, 'Guru berhasil masuk ke Langkah 3: Papan Permainan');

    // Verifikasi guru TIDAK BISA kembali ke halaman Spin
    const canReturnToSpin = await teacherPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
      return buttons.some(txt => txt.includes('Kembali ke Spin') || txt.includes('Roda Putar'));
    });
    assert(!canReturnToSpin, 'Guru TIDAK dapat kembali mundur ke halaman Spin');

    // =========================================================================
    // SKENARIO 5: PEMBATASAN MELANGKAH SEBELUM LKPD DIKERJAKAN (ACTIVITY GATE)
    // =========================================================================
    logStep('SKENARIO 5', 'Uji Coba Activity Gate: Siswa Tidak Bisa Melewati Aktivitas Tanpa Kirim LKPD');

    await studentPage.bringToFront();
    await sleep(800);

    // 5.1 Cek posisi awal pion di Petak #0 (START)
    let posText = await studentPage.evaluate(() => document.body.innerText);
    assert(posText.includes('Petak #0'), 'Posisi awal pion siswa berada di Petak #0');

    // 5.2 Melangkah bebas ke Petak #1 (Transisi tanpa aktivitas)
    const movedTo1 = await clickByText(studentPage, 'button', '+1 Maju');
    assert(movedTo1, 'Siswa menekan tombol "+1 Maju" ke Petak #1');
    await sleep(800);
    posText = await studentPage.evaluate(() => document.body.innerText);
    assert(posText.includes('Petak #1'), 'Pion berhasil melangkah ke Petak #1 (Petak Transisi Bebas)');

    // 5.3 Melangkah ke Petak #2 (KE-01: Challenge Biotik/Abiotik)
    const movedTo2 = await clickByText(studentPage, 'button', '+1 Maju');
    assert(movedTo2, 'Siswa menekan tombol "+1 Maju" ke Petak #2');
    await sleep(800);
    posText = await studentPage.evaluate(() => document.body.innerText);
    assert(posText.includes('Petak #2'), 'Pion tiba di Petak #2 (KE-01: Challenge)');

    // 5.4 UJI ACTIVITY GATE: Tombol +1 Maju dan Lompat wajib DISABLED
    const isPlus1Disabled = await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => {
        const rect = b.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && b.innerText && b.innerText.includes('+1');
      });
      return btns.length > 0 ? btns[0].disabled : false;
    });
    assert(isPlus1Disabled, 'Tombol "+1 Maju" OTOMATIS TERKUNCI (disabled) karena LKPD KE-01 belum selesai');

    const isJumpDisabled = await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => {
        const rect = b.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && b.innerText && (b.innerText.includes('Lompat') || b.innerText.includes('Terkunci') || b.innerText.includes('Maju ke Aktivitas'));
      });
      return btns.length > 0 ? btns[0].disabled : false;
    });
    assert(isJumpDisabled, 'Tombol "Maju ke Aktivitas" OTOMATIS TERKUNCI (disabled) karena LKPD KE-01 belum selesai');

    // 5.5 Cek indikator visual LKPD belum selesai
    const hasUncompletedLabel = await studentPage.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Kerjakan') || text.includes('Wajib Diselesaikan') || text.includes('Terkunci');
    });
    assert(hasUncompletedLabel, 'Indikator visual peringatan LKPD tampil dengan jelas');

    // 5.6 Buka modal LKPD KE-01 dan kerjakan
    const lkpdOpened = await clickByText(studentPage, 'button', 'Kerjakan') || await clickByText(studentPage, 'button', 'Buka Lembar Kerja');
    assert(lkpdOpened, 'Tombol pengerjaan LKPD berhasil diklik');
    await sleep(1000);

    const isModalOpen = await studentPage.evaluate(() => {
      return document.body.innerText.includes('KE-01') || document.body.innerText.includes('Komponen Ekosistem');
    });
    assert(isModalOpen, 'Modal lembar kerja LKPD KE-01 terbuka untuk siswa');

    // Berpindah ke Tab 2: Lembar LKPD jika ada
    await clickByText(studentPage, 'button', 'Lembar LKPD');
    await sleep(500);

    // Isi lembar kerja
    await studentPage.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      if (inputs[0]) {
        inputs[0].value = 'Pohon Mangga';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (inputs[1]) {
        inputs[1].value = 'Air dan Tanah';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const textareas = Array.from(document.querySelectorAll('textarea'));
      if (textareas[0]) {
        textareas[0].value = 'Biotik adalah makhluk hidup, abiotik adalah benda tak hidup.';
        textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
        textareas[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(500);

    // Kirim jawaban LKPD (pastikan mengklik tombol submit modal yang aktif, bukan tombol 'Terkunci' di background)
    const submitClicked = await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) => !b.disabled);
      const submitBtn = btns.find((b) => b.innerText.trim() === 'Kirim Jawaban');
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });
    assert(submitClicked, 'Jawaban LKPD KE-01 berhasil dikirimkan');
    await sleep(1500);

    // 5.7 Verifikasi tombol melangkah TERBUKA KEMBALI
    const isPlus1Unlocked = await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().height > 0
      );
      const plus1 = btns.find((b) => b.innerText && b.innerText.includes('+1 Maju'));
      return plus1 ? !plus1.disabled : false;
    });
    assert(isPlus1Unlocked, 'Tombol "+1 Maju" OTOMATIS TERBUKA KEMBALI (unlocked) setelah LKPD dikirim');

    // Melangkah maju ke Petak #3 (KE-02 Riddle)
    const movedTo3 = await clickByText(studentPage, 'button', '+1 Maju');
    assert(movedTo3, 'Siswa menekan tombol "+1 Maju" ke Petak #3');
    await sleep(800);
    posText = await studentPage.evaluate(() => document.body.innerText);
    assert(posText.includes('Petak #3'), 'Pion berhasil melangkah maju ke Petak #3');

    // =========================================================================
    // SKENARIO 6: PERSISTENSI SESI SISWA (LOCALSTORAGE REFRESH TEST)
    // =========================================================================
    logStep('SKENARIO 6', 'Uji Ketahanan Sesi Siswa: Refresh Halaman Tanpa Kehilangan State');

    console.log('   🔄 Me-refresh halaman browser siswa (simulasi tab tidak sengaja tertutup/refresh)...');
    await studentPage.reload({ waitUntil: 'networkidle2' });
    await sleep(1500);

    // 6.1 Verifikasi siswa langsung pulih di Papan Permainan
    const refreshedText = await studentPage.evaluate(() => document.body.innerText);
    assert(!refreshedText.includes('Masukkan Kode Kelas'), 'Siswa TIDAK terlempar ke layar input kode kelas');
    assert(refreshedText.includes('Petak #3'), 'Posisi pion siswa tetap di Petak #3 setelah refresh');

    // 6.2 Verifikasi data jawaban LKPD tetap tersimpan di localStorage
    const savedAnswers = await studentPage.evaluate(() => {
      return localStorage.getItem('ecoplay_student_team_answers');
    });
    assert(savedAnswers !== null && savedAnswers.includes('KE-01'), 'Data jawaban LKPD tersimpan persisten di localStorage');

    // =========================================================================
    // SKENARIO 7: MONITORING GURU & PANEL PENILAIAN
    // =========================================================================
    logStep('SKENARIO 7', 'Pemantauan Guru, Switch Kelompok, & Buka Panel Penilaian');

    await teacherPage.bringToFront();
    await sleep(600);

    // 7.1 Buka Panel Penilaian
    const panelOpened = await clickByText(teacherPage, 'button', 'Panel Penilaian');
    assert(panelOpened, 'Guru berhasil membuka Panel Penilaian Rubrik');
    await sleep(1000);

    const isGradingModalOpen = await teacherPage.evaluate(() => {
      return document.body.innerText.includes('Penilaian') || document.body.innerText.includes('Rubrik');
    });
    assert(isGradingModalOpen, 'Modal Panel Penilaian Rubrik tampil di layar guru');

    // Tutup panel penilaian
    await teacherPage.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button')).filter(b => b.title?.includes('Tutup') || b.innerText?.includes('✕') || b.innerText?.includes('Tutup'));
      if (closeButtons.length > 0) closeButtons[0].click();
    });
    await sleep(600);

    // =========================================================================
    // SKENARIO 8: PENGAKHIRAN KELAS & MODAL KONFIRMASI KUSTOM
    // =========================================================================
    logStep('SKENARIO 8', 'Pengakhiran Sesi Kelas & Verifikasi Modal Konfirmasi Kustom');

    // 8.1 Klik tombol Akhiri Kelas
    const endClassClicked = await clickByText(teacherPage, 'button', 'Akhiri Kelas');
    assert(endClassClicked, 'Tombol "Akhiri Kelas" berhasil diklik');
    await sleep(1000);

    // 8.2 Verifikasi Modal Konfirmasi Kustom
    const endModalContent = await teacherPage.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Akhiri Sesi Kelas Ini?') || text.includes('Konfirmasi Guru') || text.includes('seluruh posisi pion');
    });
    assert(endModalContent, 'Modal konfirmasi kustom "Akhiri Kelas" tampil dengan peringatan yang jelas');

    // 8.3 Klik konfirmasi "Ya, Akhiri Sesi Kelas"
    const confirmEnd = await clickByText(teacherPage, 'button', 'Ya, Akhiri Sesi Kelas') || await clickByText(teacherPage, 'button', 'Akhiri Sesi');
    assert(confirmEnd, 'Tombol konfirmasi "Ya, Akhiri Sesi Kelas" berhasil diklik');
    await sleep(1500);

    // 8.4 Verifikasi kembali ke Ruang Tunggu (Lobby Langkah 1)
    const returnedToLobby = await teacherPage.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('KODE KELAS') || text.includes('Mulai Permainan');
    });
    assert(returnedToLobby, 'Guru berhasil kembali ke Ruang Tunggu (Langkah 1) dan permainan direset');

    // =========================================================================
    // REKAPITULASI HASIL PENGUJIAN
    // =========================================================================
    console.log(`\n======================================================`);
    console.log(`🎉 REKAPITULASI HASIL PENGUJIAN OTOMATIS:`);
    console.log(`   Total Pengujian  : ${totalTests}`);
    console.log(`   Lulus (Passed)   : ${passedTests}`);
    console.log(`   Gagal (Failed)   : ${totalTests - passedTests}`);
    console.log(`   Status Kelulusan : 100% SUKSES ✨`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('\n❌ ERROR SELAMA PENGUJIAN:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSimulation();
