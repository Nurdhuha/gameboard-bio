import { Server, Socket } from 'socket.io';
import { db } from '../config/database';
import { claimSpeedBadge } from '../services/badgeService';
import { formatSession, formatTeam } from '../controllers/sessionController';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function findSession(roomCode: string) {
  const rawCode = String(roomCode || '').toUpperCase().trim();
  const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');
  return await db('game_sessions')
    .where({ room_code: rawCode })
    .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
    .first();
}

export function registerGameSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Klien terhubung via WebSocket: ${socket.id}`);

    // 1. Klien bergabung ke dalam room sesi kelas
    socket.on('session:join', async ({ roomCode, role, teamId }: { roomCode: string; role: string; teamId?: string }) => {
      if (!roomCode) return;
      const normalizedRoom = roomCode.toUpperCase().trim();
      const roomName = `room:${normalizedRoom}`;

      socket.join(roomName);
      console.log(`👥 [${socket.id}] bergabung ke ${roomName} sebagai ${role}${teamId ? ` (Tim: ${teamId})` : ''}`);

      try {
        const session = await findSession(normalizedRoom);
        if (session) {
          const teams = await db('teams').where({ session_id: session.id }).orderBy('team_number', 'asc');
          const submissions = await db('lkpd_submissions').where({ session_id: session.id });
          const badgeClaims = await db('badge_claims').where({ session_id: session.id });

          // Kirim snapshot state lengkap kepada klien yang baru bergabung
          socket.emit('session:sync_state', {
            session: formatSession(session),
            teams: teams.map(formatTeam),
            submissions,
            badgeClaims,
          });
        }
      } catch (err: any) {
        console.error('❌ Gagal sinkronisasi state awal:', err.message);
      }
    });

    // 2. Pergerakan Pion (Pawn Move)
    socket.on('pawn:move', async ({ roomCode, teamId, targetTile, delta }: { roomCode: string; teamId: string; targetTile: number; delta?: number }) => {
      if (!roomCode || !teamId || targetTile === undefined) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (!session) return;

        const actualTeam = UUID_REGEX.test(String(teamId))
          ? await db('teams').where({ id: teamId, session_id: session.id }).first()
          : await db('teams').where({ session_id: session.id, team_number: Number(teamId) }).first();

        if (!actualTeam) return;

        await db('teams')
          .where({ id: actualTeam.id })
          .update({ current_tile: targetTile, updated_at: new Date() });

        // Siarkan pergerakan pion ke seluruh klien di dalam room
        io.to(`room:${normalizedRoom}`).emit('pawn:moved', {
          teamId,
          targetTile,
          delta,
        });
      } catch (err: any) {
        console.error('❌ Gagal memproses pergerakan pion:', err.message);
      }
    });

    // 3. Selesai Spin Giliran Kelompok
    socket.on('spin:complete', ({ roomCode, orderedTeams }: { roomCode: string; orderedTeams: any[] }) => {
      if (!roomCode) return;
      const normalizedRoom = roomCode.toUpperCase();

      io.to(`room:${normalizedRoom}`).emit('spin:completed', { orderedTeams });
    });

    // 4. Pengiriman Jawaban LKPD oleh Siswa
    socket.on('activity:submit', async (data: { roomCode: string; teamId: string; activityCode: string; answerText: any; photoUrl?: string; reflectionText?: string }) => {
      const { roomCode, teamId, activityCode, answerText, photoUrl, reflectionText } = data;
      if (!roomCode || !teamId || !activityCode) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (!session) return;

        const actualTeam = UUID_REGEX.test(String(teamId))
          ? await db('teams').where({ id: teamId, session_id: session.id }).first()
          : await db('teams').where({ session_id: session.id, team_number: Number(teamId) }).first();

        if (!actualTeam) return;
        const resolvedTeamId = actualTeam.id;

        const existing = await db('lkpd_submissions')
          .where({ session_id: session.id, team_id: resolvedTeamId, activity_code: activityCode })
          .first();

        let submission;
        if (existing) {
          [submission] = await db('lkpd_submissions')
            .where({ id: existing.id })
            .update({
              answer_text: typeof answerText === 'object' ? JSON.stringify(answerText) : String(answerText),
              photo_url: photoUrl !== undefined ? photoUrl : existing.photo_url,
              reflection_text: reflectionText !== undefined ? reflectionText : existing.reflection_text,
              submitted_at: new Date(),
            })
            .returning('*');
        } else {
          [submission] = await db('lkpd_submissions')
            .insert({
              session_id: session.id,
              team_id: resolvedTeamId,
              activity_code: activityCode,
              answer_text: typeof answerText === 'object' ? JSON.stringify(answerText) : String(answerText),
              photo_url: photoUrl || null,
              reflection_text: reflectionText || null,
              score: 3,
            })
            .returning('*');
        }

        const totalScoreResult = await db('lkpd_submissions')
          .where({ session_id: session.id, team_id: resolvedTeamId })
          .sum('score as total');
        const totalLkpd = Number(totalScoreResult[0]?.total) || 0;

        await db('teams')
          .where({ id: resolvedTeamId })
          .update({ total_lkpd_score: totalLkpd, updated_at: new Date() });

        io.to(`room:${normalizedRoom}`).emit('activity:submitted', {
          teamId,
          activityCode,
          submission,
          totalLkpdScore: totalLkpd,
        });
      } catch (err: any) {
        console.error('❌ Gagal memproses pengiriman aktivitas:', err.message);
      }
    });

    // 5. Penilaian Rubrik Guru
    socket.on('teacher:grade', async ({ roomCode, submissionId, score, teacherFeedback }: { roomCode: string; submissionId: string; score: number; teacherFeedback?: string }) => {
      if (!roomCode || !submissionId || score === undefined) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const [submission] = await db('lkpd_submissions')
          .where({ id: submissionId })
          .update({
            score,
            teacher_feedback: teacherFeedback || null,
            graded_at: new Date(),
          })
          .returning('*');

        if (!submission) return;

        const totalScoreResult = await db('lkpd_submissions')
          .where({ session_id: submission.session_id, team_id: submission.team_id })
          .sum('score as total');
        const totalLkpd = Number(totalScoreResult[0]?.total) || 0;

        const [team] = await db('teams')
          .where({ id: submission.team_id })
          .update({ total_lkpd_score: totalLkpd, updated_at: new Date() })
          .returning('*');

        io.to(`room:${normalizedRoom}`).emit('submission:graded', {
          submission,
          team: formatTeam(team),
        });
      } catch (err: any) {
        console.error('❌ Gagal memproses penilaian guru:', err.message);
      }
    });

    // 6. Perebutan Lencana Kecepatan Zona (Atomic Speed Badge Race)
    socket.on('badge:claim_race', async ({ roomCode, teamId, tileNumber }: { roomCode: string; teamId: string; tileNumber: number }) => {
      if (!roomCode || !teamId || !tileNumber) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (!session) return;

        const result = await claimSpeedBadge(session.id, teamId, tileNumber);

        if (result.success) {
          // Siarkan ke seluruh kelas bahwa tim ini berhasil meraih lencana
          io.to(`room:${normalizedRoom}`).emit('badge:claimed', {
            teamId,
            tileNumber,
            rank: result.rank,
            points: result.points,
            claim: result.claim,
            message: result.message,
          });
        } else {
          socket.emit('badge:claim_failed', {
            teamId,
            tileNumber,
            message: result.message,
          });
        }
      } catch (err: any) {
        console.error('❌ Gagal memproses klaim lencana kecepatan:', err.message);
      }
    });

    // 7. Penggantian Fase Permainan oleh Guru
    socket.on('phase:update', async ({ roomCode, phase, activeZone }: { roomCode: string; phase: string; activeZone?: number }) => {
      if (!roomCode || !phase) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (!session) return;

        await db('game_sessions')
          .where({ id: session.id })
          .update({
            phase,
            active_zone: activeZone || undefined,
          });

        io.to(`room:${normalizedRoom}`).emit('phase:updated', { phase, activeZone });
      } catch (err: any) {
        console.error('❌ Gagal memproses update fase:', err.message);
      }
    });

    // 8. Guru Memulai Permainan dari Ruang Tunggu (Lobby -> Spin/Board)
    socket.on('game:start', async ({ roomCode, initialPhase = 'spin' }: { roomCode: string; initialPhase?: string }) => {
      if (!roomCode) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (!session) return;

        await db('game_sessions')
          .where({ id: session.id })
          .update({
            phase: initialPhase,
            active_zone: 1,
          });

        io.to(`room:${normalizedRoom}`).emit('game:started', { phase: initialPhase, activeZone: 1 });
        io.to(`room:${normalizedRoom}`).emit('phase:updated', { phase: initialPhase, activeZone: 1 });
      } catch (err: any) {
        console.error('❌ Gagal memulai permainan dari guru:', err.message);
      }
    });

    // 9. Guru Mengakhiri Sesi Kelas (Hapus Progres & Jawaban)
    socket.on('class:end', async ({ roomCode }: { roomCode: string }) => {
      if (!roomCode) return;
      const normalizedRoom = roomCode.toUpperCase().trim();

      try {
        const session = await findSession(normalizedRoom);
        if (session) {
          await db.transaction(async (trx) => {
            await trx('teams').where({ session_id: session.id }).update({
              current_tile: 0,
              badge_points: 0,
              total_lkpd_score: 0,
              updated_at: new Date(),
            });
            await trx('lkpd_submissions').where({ session_id: session.id }).delete();
            await trx('badge_claims').where({ session_id: session.id }).delete();
            await trx('game_sessions').where({ id: session.id }).update({
              phase: 'ended',
              is_active: false,
              ended_at: new Date(),
            });
          });

          // Siarkan ke seluruh siswa bahwa kelas telah diakhiri oleh guru
          io.to(`room:${normalizedRoom}`).emit('class:ended', {
            message: 'Sesi kelas telah diakhiri oleh Bapak/Ibu Guru. Seluruh progres telah dibersihkan.',
          });
        }
      } catch (err: any) {
        console.error('❌ Gagal memproses pengakhiran kelas:', err.message);
      }
    });

    // 10. Pemutusan Sambungan (Disconnect)
    socket.on('disconnect', () => {
      console.log(`🔌 Klien terputus: ${socket.id}`);
    });
  });
}
