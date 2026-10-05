import { Request, Response } from 'express';
import { db } from '../config/database';
import { formatTeam } from './sessionController';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXTRA_PRESETS = [
  { name: 'Badak', avatar_icon: '🦏', color_hex: '#8b5cf6', badge_color: 'bg-purple-500' },
  { name: 'Cendrawasih', avatar_icon: '🦜', color_hex: '#ec4899', badge_color: 'bg-pink-500' },
  { name: 'Gajah', avatar_icon: '🐘', color_hex: '#64748b', badge_color: 'bg-slate-500' },
  { name: 'Orangutan', avatar_icon: '🦧', color_hex: '#ea580c', badge_color: 'bg-orange-600' },
  { name: 'Penyu', avatar_icon: '🐢', color_hex: '#06b6d4', badge_color: 'bg-cyan-500' },
];

export async function getTeams(req: Request, res: Response): Promise<void> {
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

    const teams = await db('teams').where({ session_id: session.id }).orderBy('team_number', 'asc');
    res.json({ success: true, teams: teams.map(formatTeam) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil data tim.' });
  }
}

export async function addTeam(req: Request, res: Response): Promise<void> {
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

    const currentTeams = await db('teams').where({ session_id: session.id });
    const nextNumber = currentTeams.length + 1;

    const presetIdx = (nextNumber - 4) % EXTRA_PRESETS.length;
    const preset = nextNumber <= 3
      ? { name: `Tim ${nextNumber}`, avatar_icon: '🐾', color_hex: '#6366f1', badge_color: 'bg-indigo-500' }
      : EXTRA_PRESETS[presetIdx >= 0 ? presetIdx : 0];

    const [newTeam] = await db('teams')
      .insert({
        session_id: session.id,
        team_number: nextNumber,
        name: `Kelompok ${nextNumber} (${preset.name})`,
        avatar_icon: preset.avatar_icon,
        color_hex: preset.color_hex,
        badge_color: preset.badge_color,
        current_tile: 0,
        badge_points: 0,
        total_lkpd_score: 0,
      })
      .returning('*');

    res.status(201).json({ success: true, message: 'Kelompok baru berhasil ditambahkan.', team: formatTeam(newTeam) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal menambahkan kelompok baru.' });
  }
}

export async function updatePawn(req: Request, res: Response): Promise<void> {
  try {
    const { teamId, roomCode } = req.params;
    const { targetTile } = req.body;

    if (targetTile === undefined || targetTile < 0 || targetTile > 50) {
      res.status(400).json({ success: false, message: 'Petak target harus bernilai antara 0 s.d. 50.' });
      return;
    }

    let teamQuery = db('teams');
    if (UUID_REGEX.test(String(teamId))) {
      teamQuery = teamQuery.where({ id: String(teamId) });
    } else if (roomCode) {
      const rawCode = String(roomCode).toUpperCase().trim();
      const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');
      const session = await db('game_sessions')
        .where({ room_code: rawCode })
        .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
        .first();
      if (!session) {
        res.status(404).json({ success: false, message: 'Sesi kelas tidak ditemukan.' });
        return;
      }
      teamQuery = teamQuery.where({ session_id: session.id, team_number: Number(teamId) });
    } else {
      teamQuery = teamQuery.where({ team_number: Number(teamId) });
    }

    const [updatedTeam] = await teamQuery
      .update({
        current_tile: targetTile,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updatedTeam) {
      res.status(404).json({ success: false, message: 'Data tim tidak ditemukan.' });
      return;
    }

    res.json({ success: true, message: 'Posisi pion berhasil diperbarui.', team: formatTeam(updatedTeam) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui posisi pion.' });
  }
}
