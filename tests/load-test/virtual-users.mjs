import {
  PRESENCE_INTERVAL_MS,
  SAMPLE_ACTIVITIES,
  SYNC_INTERVAL_MS,
  TINY_PNG_BUFFER,
} from './config.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function measuredFetch(metrics, endpointLabel, url, options = {}) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(15000),
    });
    const duration = performance.now() - t0;
    const contentType = res.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      await res.arrayBuffer().catch(() => null);
    }

    const errMsg = !res.ok ? (data?.message || `HTTP ${res.status}`) : null;
    metrics.record(endpointLabel, res.status, duration, errMsg);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    const duration = performance.now() - t0;
    metrics.record(endpointLabel, 0, duration, err.name === 'TimeoutError' ? 'Timeout 15s' : err.message);
    return { ok: false, status: 0, data: null, error: err };
  }
}

/**
 * Menyiapkan 1 akun guru uji + 1 sesi kelas + tim tambahan, lalu memulainya hingga fase board.
 */
export async function setupTeacherSession(baseUrl, teacherIdx, extraTeamsCount, metrics, runId) {
  const email = `loadtest.${runId}.guru${teacherIdx}@ecoplay.test`;
  const password = `LoadTest#${runId}`;

  // 1. Register guru uji
  const reg = await measuredFetch(metrics, 'POST /api/auth/register', `${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Guru Uji ${teacherIdx + 1}`,
      email,
      password,
    }),
  });

  let token = reg.data?.token;
  if (!token) {
    const login = await measuredFetch(metrics, 'POST /api/auth/login', `${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    token = login.data?.token;
  }

  if (!token) {
    throw new Error(`Gagal autentikasi guru uji #${teacherIdx + 1} (status ${reg.status})`);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. Verifikasi profil guru
  await measuredFetch(metrics, 'GET /api/auth/me', `${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 3. Buat sesi kelas
  const createRes = await measuredFetch(metrics, 'POST /api/sessions/create', `${baseUrl}/api/sessions/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      className: `Kelas LoadTest ${runId}-${teacherIdx + 1}`,
      academicYear: '2026/2027',
    }),
  });

  const roomCode = createRes.data?.session?.roomCode;
  if (!roomCode) {
    throw new Error(`Gagal membuat sesi kelas untuk guru #${teacherIdx + 1}`);
  }

  // 4. Cek riwayat sesi guru
  await measuredFetch(metrics, 'GET /api/sessions/my/list', `${baseUrl}/api/sessions/my/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 5. Tambah tim ekstra agar kapasitas tim per kelas realistis (default 3 + extra)
  const teams = [...(createRes.data?.teams || [])];
  for (let i = 0; i < extraTeamsCount; i++) {
    const addRes = await measuredFetch(
      metrics,
      'POST /api/sessions/:roomCode/teams',
      `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/teams`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    if (addRes.data?.team) {
      teams.push(addRes.data.team);
    }
  }

  // 6. Mulai sesi & masuk fase board
  await measuredFetch(
    metrics,
    'POST /api/sessions/:roomCode/start',
    `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/start`,
    { method: 'POST', headers: authHeaders }
  );

  await measuredFetch(
    metrics,
    'PATCH /api/sessions/:roomCode/phase',
    `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/phase`,
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ phase: 'board', activeZone: 1 }),
    }
  );

  return {
    teacherIdx,
    token,
    roomCode,
    teams,
  };
}

/**
 * Loop guru aktif: polling 3 detik, cek submissions, beri nilai rubrik, dan ekspor Excel.
 */
export async function runVirtualTeacher(baseUrl, sessionCtx, metrics, stopSignal) {
  const { roomCode, token } = sessionCtx;
  const gradedIds = new Set();

  // Jitter awal agar 4 guru tidak mem-poll di milidetik yang sama persis
  await sleep(Math.random() * 1000);

  let cycle = 0;
  while (!stopSignal.aborted) {
    cycle++;
    await measuredFetch(
      metrics,
      'GET /api/sessions/:roomCode',
      `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}`
    );

    // Setiap 3 siklus (~9 detik), guru memeriksa jawaban LKPD & memberi nilai
    if (cycle % 3 === 0) {
      const subsRes = await measuredFetch(
        metrics,
        'GET /api/sessions/:roomCode/submissions',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/submissions`
      );
      const list = subsRes.data?.submissions || [];
      const ungraded = list.find((s) => s.id && !gradedIds.has(s.id));
      if (ungraded) {
        gradedIds.add(ungraded.id);
        await measuredFetch(
          metrics,
          'PATCH /api/sessions/submissions/:id/grade',
          `${baseUrl}/api/sessions/submissions/${encodeURIComponent(ungraded.id)}/grade`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              score: 3,
              teacherFeedback: 'Observasi lengkap dan sesuai konsep ekosistem.',
            }),
          }
        );
      }
    }

    // Setiap 6 siklus (~18 detik), guru menguji ekspor laporan Excel (.xlsx)
    if (cycle % 6 === 0) {
      await measuredFetch(
        metrics,
        'GET /api/sessions/:roomCode/export/excel',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/export/excel`
      );
    }

    await sleep(SYNC_INTERVAL_MS);
  }
}

/**
 * Menutup sesi kelas (end) sebelum cleanup.
 */
export async function endTeacherSession(baseUrl, sessionCtx, metrics) {
  const { roomCode } = sessionCtx;
  await measuredFetch(
    metrics,
    'POST /api/sessions/:roomCode/end',
    `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/end`,
    { method: 'POST' }
  );
}

/**
 * Loop siswa aktif: join, polling 3s, presence 5s, gerak pion, upload foto, & submit LKPD.
 */
export async function runVirtualStudent(baseUrl, studentIdx, sessionCtx, metrics, stopSignal) {
  const { roomCode, teams } = sessionCtx;
  const team = teams[studentIdx % teams.length];
  const teamNumber = Number(team?.teamNumber || team?.team_number || (studentIdx % 3) + 1);
  const teamId = team?.id || teamNumber;

  // Jitter awal (0-2500ms) agar 100 siswa tidak menembak di 1ms yang sama
  await sleep(Math.random() * 2500);
  if (stopSignal.aborted) return;

  // 1. Siswa masuk kelas & mengambil daftar tim
  await measuredFetch(
    metrics,
    'GET /api/sessions/:roomCode',
    `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}`
  );
  await measuredFetch(
    metrics,
    'GET /api/sessions/:roomCode/teams',
    `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/teams`
  );

  // 2. Jalankan polling 3 detik secara paralel
  const pollLoop = (async () => {
    while (!stopSignal.aborted) {
      await measuredFetch(
        metrics,
        'GET /api/sessions/:roomCode',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}`
      );
      await sleep(SYNC_INTERVAL_MS + Math.random() * 300);
    }
  })();

  // 3. Jalankan heartbeat presence 5 detik secara paralel
  const presenceLoop = (async () => {
    while (!stopSignal.aborted) {
      await measuredFetch(
        metrics,
        'POST /api/sessions/:roomCode/teams/:teamNumber/presence',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/teams/${teamNumber}/presence`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ready: true }),
        }
      );
      await sleep(PRESENCE_INTERVAL_MS + Math.random() * 400);
    }
  })();

  // 4. Jalankan aksi gameplay siswa (gerak pion, upload foto, submit LKPD)
  const gameplayLoop = (async () => {
    let step = studentIdx % SAMPLE_ACTIVITIES.length;
    while (!stopSignal.aborted) {
      await sleep(6000 + Math.random() * 6000);
      if (stopSignal.aborted) break;

      const activity = SAMPLE_ACTIVITIES[step % SAMPLE_ACTIVITIES.length];
      step++;

      // Gerak pion
      await measuredFetch(
        metrics,
        'PATCH /api/sessions/:roomCode/teams/:teamId/pawn',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/teams/${encodeURIComponent(teamId)}/pawn`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetTile: activity.tile }),
        }
      );

      if (stopSignal.aborted) break;

      // Upload foto observasi (1 kali per beberapa aksi agar realistis)
      let photoUrl = null;
      if (step % 2 === 0) {
        const form = new FormData();
        form.append('photo', new Blob([TINY_PNG_BUFFER], { type: 'image/png' }), `obs-${studentIdx}.png`);
        const upRes = await measuredFetch(
          metrics,
          'POST /api/sessions/:roomCode/upload',
          `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/upload`,
          { method: 'POST', body: form }
        );
        photoUrl = upRes.data?.photoUrl || null;
      }

      if (stopSignal.aborted) break;

      // Submit LKPD
      await measuredFetch(
        metrics,
        'POST /api/sessions/:roomCode/submissions/lkpd',
        `${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}/submissions/lkpd`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: String(teamId),
            activityCode: activity.code,
            answerText: `Jawaban uji beban siswa #${studentIdx} pada aktivitas ${activity.code}`,
            photoUrl,
            reflectionText: 'Sudah memeriksa keterkaitan komponen biotik dan abiotik.',
          }),
        }
      );
    }
  })();

  await Promise.all([pollLoop, presenceLoop, gameplayLoop]);
}
