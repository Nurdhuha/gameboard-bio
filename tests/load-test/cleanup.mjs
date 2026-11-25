/**
 * Menghapus seluruh sesi kelas sintetis yang dibuat selama pengujian agar database tetap bersih.
 */
export async function cleanupTestSessions(baseUrl, createdSessions, metrics) {
  const results = [];

  for (const item of createdSessions) {
    const { roomCode, token } = item;
    const t0 = performance.now();
    try {
      const res = await fetch(`${baseUrl}/api/sessions/${encodeURIComponent(roomCode)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const duration = performance.now() - t0;
      const body = await res.json().catch(() => ({}));
      metrics?.record('DELETE /api/sessions/:roomCode', res.status, duration, res.ok ? null : body.message);
      results.push({
        roomCode,
        ok: res.ok && body.success !== false,
        status: res.status,
        message: body.message || '',
      });
    } catch (err) {
      const duration = performance.now() - t0;
      metrics?.record('DELETE /api/sessions/:roomCode', 0, duration, err.message);
      results.push({
        roomCode,
        ok: false,
        status: 0,
        message: err.message,
      });
    }
  }

  return results;
}
