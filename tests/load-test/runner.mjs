import { PROFILES } from './config.mjs';
import { MetricsCollector, saveReport } from './metrics.mjs';
import { cleanupTestSessions } from './cleanup.mjs';
import {
  endTeacherSession,
  runVirtualStudent,
  runVirtualTeacher,
  setupTeacherSession,
} from './virtual-users.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs() {
  const args = {
    url: process.env.TARGET_URL || '',
    profile: 'target-100',
    cleanup: true,
  };
  for (const raw of process.argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6).replace(/\/$/, '');
    else if (raw.startsWith('--profile=')) args.profile = raw.slice(10);
    else if (raw === '--no-cleanup') args.cleanup = false;
  }
  return args;
}

async function checkHealth(baseUrl) {
  console.log(`\n🩺 Memeriksa kesehatan target: ${baseUrl}/api/health ...`);
  const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`Healthcheck gagal dengan status HTTP ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));
  console.log(`✅ Target siap: ${data.service || 'Ecoplay API'} (status: ${data.status || 'ok'})`);
}

async function main() {
  const { url, profile: profileKey, cleanup } = parseArgs();

  if (!url) {
    console.error('❌ URL target wajib diisi. Gunakan: --url=https://domain-vercel-anda.vercel.app');
    process.exit(1);
  }

  const profile = PROFILES[profileKey];
  if (!profile) {
    console.error(`❌ Profil "${profileKey}" tidak ditemukan. Pilihan: ${Object.keys(PROFILES).join(', ')}`);
    process.exit(1);
  }

  console.log('================================================================');
  console.log(`🚀 ECOPLAY LOAD TEST — ${profile.name}`);
  console.log(`🎯 Target URL : ${url}`);
  console.log(`📋 Deskripsi  : ${profile.description}`);
  console.log('================================================================');

  await checkHealth(url);

  const metrics = new MetricsCollector();
  const runId = Date.now().toString(36).slice(-5);
  const teacherSessions = [];
  const activeStudents = [];

  try {
    // 1. Setup seluruh sesi guru uji
    console.log(`\n👩‍🏫 Menyiapkan ${profile.teachers} sesi kelas guru...`);
    for (let i = 0; i < profile.teachers; i++) {
      const ctx = await setupTeacherSession(url, i, profile.extraTeamsPerClass, metrics, runId);
      teacherSessions.push(ctx);
      console.log(`   ✓ Kelas ${i + 1}: Kode ${ctx.roomCode} (${ctx.teams.length} kelompok)`);
    }

    // Jalankan loop guru secara paralel
    const teacherStop = new AbortController();
    const teacherTasks = teacherSessions.map((ctx) =>
      runVirtualTeacher(url, ctx, metrics, teacherStop.signal)
    );

    // 2. Jalankan eskalasi tahap siswa
    let circuitBroken = false;
    for (const stage of profile.stages) {
      console.log(`\n⚡ Memulai ${stage.label} (${stage.targetStudents} siswa, ${stage.durationSec} detik)...`);

      while (activeStudents.length < stage.targetStudents) {
        const idx = activeStudents.length;
        const sessionCtx = teacherSessions[idx % teacherSessions.length];
        const ac = new AbortController();
        const promise = runVirtualStudent(url, idx, sessionCtx, metrics, ac.signal);
        activeStudents.push({ ac, promise });
      }

      await sleep(stage.durationSec * 1000);

      const snap = metrics.snapshotStage(
        stage.label,
        activeStudents.length,
        teacherSessions.length,
        stage.durationSec
      );
      console.log(
        `   📊 Hasil ${snap.label}: Req=${snap.stageRequests}, RPS=${snap.rps}, Error=${snap.errorRate}%, Avg=${snap.avgMs}ms, P95=${snap.p95Ms}ms, P99=${snap.p99Ms}ms`
      );

      if (snap.errorRate / 100 > profile.maxErrorRate || snap.p95Ms > profile.maxP95Ms) {
        console.warn(
          `\n⚠️ CIRCUIT BREAKER AKTIF pada "${snap.label}" (Error=${snap.errorRate}%, P95=${snap.p95Ms}ms). Menghentikan eskalasi.`
        );
        circuitBroken = true;
        break;
      }
    }

    // 3. Hentikan seluruh VU
    console.log('\n🛑 Menghentikan seluruh virtual users...');
    teacherStop.abort();
    activeStudents.forEach((s) => s.ac.abort());
    await Promise.allSettled([...teacherTasks, ...activeStudents.map((s) => s.promise)]);

    // 4. Akhiri sesi kelas
    for (const ctx of teacherSessions) {
      await endTeacherSession(url, ctx, metrics);
    }

    // 5. Cleanup sesi uji dari database
    let cleanupResults = [];
    if (cleanup) {
      console.log('\n🧹 Membersihkan sesi kelas uji dari database...');
      cleanupResults = await cleanupTestSessions(url, teacherSessions, metrics);
      const okCount = cleanupResults.filter((r) => r.ok).length;
      console.log(`   ✓ Cleanup selesai: ${okCount}/${cleanupResults.length} sesi berhasil dihapus.`);
    }

    // 6. Cetak & simpan laporan
    const summary = metrics.summarize();
    const { jsonPath, mdPath } = saveReport(url, profileKey, summary, cleanupResults);

    console.log('\n================================================================');
    console.log('📈 RINGKASAN AKHIR LOAD TEST');
    console.log('================================================================');
    console.log(`Durasi Total   : ${summary.elapsedSec} detik`);
    console.log(`Total Request  : ${summary.totalRequests} (${summary.overallRps} req/detik)`);
    console.log(`Sukses / Gagal : ${summary.totalSuccess} / ${summary.totalErrors} (Error: ${summary.overallErrorRatePct}%)`);
    console.log(
      `Latensi (ms)   : Avg=${summary.overallLatency.avg} | P50=${summary.overallLatency.p50} | P95=${summary.overallLatency.p95} | P99=${summary.overallLatency.p99} | Max=${summary.overallLatency.max}`
    );
    console.log(`Circuit Break  : ${circuitBroken ? 'YA (Batas terlampaui)' : 'TIDAK (Target lulus)'}`);
    console.log(`Laporan MD     : ${mdPath}`);
    console.log(`Laporan JSON   : ${jsonPath}`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ Pengujian berhenti karena error fatal:', err);
    if (cleanup && teacherSessions.length > 0) {
      await cleanupTestSessions(url, teacherSessions, metrics);
    }
    process.exit(1);
  }
}

main();
