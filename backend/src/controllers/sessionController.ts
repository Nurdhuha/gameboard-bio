import { Request, Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ECO';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const INITIAL_TEAM_PRESETS = [
  { team_number: 1, name: 'Kelompok 1 (Harimau)', avatar_icon: '🐯', color_hex: '#f59e0b', badge_color: 'bg-amber-500' },
  { team_number: 2, name: 'Kelompok 2 (Elang)', avatar_icon: '🦅', color_hex: '#3b82f6', badge_color: 'bg-blue-500' },
  { team_number: 3, name: 'Kelompok 3 (Komodo)', avatar_icon: '🦎', color_hex: '#10b981', badge_color: 'bg-emerald-500' },
];

export function formatSession(s: any) {
  if (!s) return s;
  return {
    ...s,
    roomCode: s.room_code,
    className: s.class_name,
    academicYear: s.academic_year,
    teacherId: s.teacher_id,
    activeZone: s.active_zone,
    isActive: s.is_active,
    createdAt: s.created_at,
    endedAt: s.ended_at,
  };
}

export function formatTeam(t: any) {
  if (!t) return t;
  return {
    ...t,
    avatarIcon: t.avatar_icon,
    color: t.color_hex,
    badgeColor: t.badge_color,
    currentTile: t.current_tile,
    badgePoints: t.badge_points,
    lkpdScore: t.total_lkpd_score,
    teamNumber: t.team_number,
  };
}

export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { className, academicYear } = req.body;
    const teacherId = req.teacher?.id || null;

    let roomCode = generateRoomCode();
    // Pastikan kode unik
    let existing = await db('game_sessions').where({ room_code: roomCode }).first();
    while (existing) {
      roomCode = generateRoomCode();
      existing = await db('game_sessions').where({ room_code: roomCode }).first();
    }

    const [session] = await db('game_sessions')
      .insert({
        room_code: roomCode,
        teacher_id: teacherId,
        class_name: className || 'Kelas X Biologi',
        academic_year: academicYear || '2026/2027',
        phase: 'lobby',
        active_zone: 1,
        is_active: true,
      })
      .returning('*');

    // Inisialisasi 3 tim standar Ecoplay
    const teamsToInsert = INITIAL_TEAM_PRESETS.map((t) => ({
      session_id: session.id,
      team_number: t.team_number,
      name: t.name,
      avatar_icon: t.avatar_icon,
      color_hex: t.color_hex,
      badge_color: t.badge_color,
      current_tile: 0,
      badge_points: 0,
      total_lkpd_score: 0,
    }));

    const teams = await db('teams').insert(teamsToInsert).returning('*');

    res.status(201).json({
      success: true,
      message: 'Sesi kelas baru berhasil dibuat.',
      session: formatSession(session),
      teams: teams.map(formatTeam),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal membuat sesi kelas.' });
  }
}

export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const rawCode = String(req.params.roomCode || '').toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');

    const session = await db('game_sessions')
      .where({ room_code: rawCode })
      .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
      .first();

    if (!session) {
      res.status(404).json({ success: false, message: `Sesi kelas dengan kode ${rawCode} tidak ditemukan.` });
      return;
    }

    const teams = await db('teams')
      .where({ session_id: session.id })
      .orderBy('team_number', 'asc');

    const submissions = await db('lkpd_submissions')
      .where({ session_id: session.id })
      .orderBy('submitted_at', 'desc');

    const badgeClaims = await db('badge_claims')
      .where({ session_id: session.id })
      .orderBy('claimed_at', 'asc');

    res.json({
      success: true,
      session: formatSession(session),
      teams: teams.map(formatTeam),
      submissions,
      badgeClaims,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil data sesi.' });
  }
}

export async function startSession(req: Request, res: Response): Promise<void> {
  try {
    const rawCode = String(req.params.roomCode || '').toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');

    const session = await db('game_sessions')
      .where({ room_code: rawCode })
      .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
      .first();

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi kelas tidak ditemukan.' });
      return;
    }

    const [updated] = await db('game_sessions')
      .where({ id: session.id })
      .update({
        phase: 'spin',
        active_zone: 1,
      })
      .returning('*');

    res.json({
      success: true,
      message: 'Sesi kelas berhasil dimulai.',
      session: formatSession(updated),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memulai sesi kelas.' });
  }
}

export async function updatePhase(req: Request, res: Response): Promise<void> {
  try {
    const rawCode = String(req.params.roomCode || '').toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');
    const { phase, activeZone } = req.body;

    const [updated] = await db('game_sessions')
      .where({ room_code: rawCode })
      .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
      .update({
        phase: phase || undefined,
        active_zone: activeZone || undefined,
      })
      .returning('*');

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sesi kelas tidak ditemukan.' });
      return;
    }

    res.json({ success: true, session: formatSession(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui fase sesi.' });
  }
}

export async function resetSession(req: Request, res: Response): Promise<void> {
  try {
    const roomCode = String(req.params.roomCode || '').toUpperCase();

    const session = await db('game_sessions')
      .where({ room_code: roomCode })
      .first();

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi tidak ditemukan.' });
      return;
    }

    await db.transaction(async (trx) => {
      // 1. Reset posisi pion dan nilai seluruh kelompok
      await trx('teams')
        .where({ session_id: session.id })
        .update({
          current_tile: 0,
          badge_points: 0,
          total_lkpd_score: 0,
          updated_at: new Date(),
        });

      // 2. Hapus jawaban LKPD
      await trx('lkpd_submissions').where({ session_id: session.id }).delete();

      // 3. Hapus klaim lencana kecepatan
      await trx('badge_claims').where({ session_id: session.id }).delete();

      // 4. Set fase kembali ke 'lobby'
      await trx('game_sessions').where({ id: session.id }).update({ phase: 'lobby', active_zone: 1 });
    });

    res.json({ success: true, message: 'Data permainan dan nilai sesi berhasil direset.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mereset data sesi.' });
  }
}

export async function endSession(req: Request, res: Response): Promise<void> {
  try {
    const roomCode = String(req.params.roomCode || '').toUpperCase();

    const session = await db('game_sessions')
      .where({ room_code: roomCode })
      .first();

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi kelas tidak ditemukan.' });
      return;
    }

    await db.transaction(async (trx) => {
      // 1. Reset posisi pion dan nilai seluruh kelompok
      await trx('teams')
        .where({ session_id: session.id })
        .update({
          current_tile: 0,
          badge_points: 0,
          total_lkpd_score: 0,
          updated_at: new Date(),
        });

      // 2. Hapus seluruh lembar jawaban LKPD siswa
      await trx('lkpd_submissions').where({ session_id: session.id }).delete();

      // 3. Hapus seluruh data klaim lencana kecepatan
      await trx('badge_claims').where({ session_id: session.id }).delete();

      // 4. Tandai sesi sebagai telah berakhir dan nonaktif
      await trx('game_sessions')
        .where({ id: session.id })
        .update({
          phase: 'ended',
          is_active: false,
          ended_at: new Date(),
        });
    });

    res.json({
      success: true,
      message: 'Sesi kelas berhasil diakhiri. Seluruh progres dan jawaban LKPD telah dibersihkan.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengakhiri sesi kelas.' });
  }
}

export async function getTeacherSessions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.teacher?.id;
    if (!teacherId) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const sessions = await db('game_sessions')
      .where({ teacher_id: teacherId })
      .orderBy('created_at', 'desc');

    res.json({ success: true, sessions: sessions.map(formatSession) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil riwayat sesi kelas.' });
  }
}
