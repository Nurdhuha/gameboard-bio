import { Request, Response } from 'express';
import { db } from '../config/database';
import { generateExcelReport } from '../services/exportService';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getSubmissions(req: Request, res: Response): Promise<void> {
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

    const submissions = await db('lkpd_submissions')
      .where({ session_id: session.id })
      .orderBy('submitted_at', 'desc');

    res.json({ success: true, submissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil jawaban LKPD.' });
  }
}

export async function submitLkpd(req: Request, res: Response): Promise<void> {
  try {
    const rawCode = String(req.params.roomCode || '').toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, '');
    const { teamId, activityCode, answerText, photoUrl, reflectionText } = req.body;

    if (!teamId || !activityCode || !answerText) {
      res.status(400).json({ success: false, message: 'teamId, activityCode, dan answerText wajib diisi.' });
      return;
    }

    const session = await db('game_sessions')
      .where({ room_code: rawCode })
      .orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode])
      .first();

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi kelas tidak ditemukan.' });
      return;
    }

    // Resolusi teamId baik berupa UUID maupun nomor tim (1, 2, 3)
    const actualTeam = UUID_REGEX.test(String(teamId))
      ? await db('teams').where({ id: teamId, session_id: session.id }).first()
      : await db('teams').where({ session_id: session.id, team_number: Number(teamId) }).first();

    if (!actualTeam) {
      res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan di sesi ini.' });
      return;
    }
    const resolvedTeamId = actualTeam.id;

    // Cek apakah sudah pernah mengirimkan untuk aktivitas ini
    const existing = await db('lkpd_submissions')
      .where({ session_id: session.id, team_id: resolvedTeamId, activity_code: activityCode })
      .first();

    let submission;
    if (existing) {
      // Perbarui jawaban
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
      // Masukkan jawaban baru
      [submission] = await db('lkpd_submissions')
        .insert({
          session_id: session.id,
          team_id: resolvedTeamId,
          activity_code: activityCode,
          answer_text: typeof answerText === 'object' ? JSON.stringify(answerText) : String(answerText),
          photo_url: photoUrl || null,
          reflection_text: reflectionText || null,
          score: 3, // Skor awal default 3 (akan divalidasi oleh guru)
        })
        .returning('*');
    }

    // Hitung ulang akumulasi skor LKPD tim
    const totalScoreResult = await db('lkpd_submissions')
      .where({ session_id: session.id, team_id: resolvedTeamId })
      .sum('score as total');

    const totalLkpd = Number(totalScoreResult[0]?.total) || 0;

    await db('teams')
      .where({ id: resolvedTeamId })
      .update({ total_lkpd_score: totalLkpd, updated_at: new Date() });

    res.json({
      success: true,
      message: 'Jawaban LKPD berhasil dikirimkan ke guru.',
      submission,
      totalLkpdScore: totalLkpd,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengirimkan jawaban LKPD.' });
  }
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { score, teacherFeedback } = req.body;

    if (score === undefined || score < 0 || score > 3) {
      res.status(400).json({ success: false, message: 'Skor rubrik harus bernilai antara 0 s.d. 3.' });
      return;
    }

    const [submission] = await db('lkpd_submissions')
      .where({ id })
      .update({
        score,
        teacher_feedback: teacherFeedback !== undefined ? teacherFeedback : null,
        graded_at: new Date(),
      })
      .returning('*');

    if (!submission) {
      res.status(404).json({ success: false, message: 'Jawaban LKPD tidak ditemukan.' });
      return;
    }

    // Perbarui akumulasi nilai LKPD tim
    const totalScoreResult = await db('lkpd_submissions')
      .where({ session_id: submission.session_id, team_id: submission.team_id })
      .sum('score as total');

    const totalLkpd = Number(totalScoreResult[0]?.total) || 0;

    const [updatedTeam] = await db('teams')
      .where({ id: submission.team_id })
      .update({ total_lkpd_score: totalLkpd, updated_at: new Date() })
      .returning('*');

    res.json({
      success: true,
      message: 'Penilaian rubrik berhasil disimpan.',
      submission,
      team: updatedTeam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal menyimpan penilaian.' });
  }
}

export async function uploadPhoto(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Berkas foto tidak ditemukan.' });
      return;
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const photoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Foto observasi berhasil diunggah.',
      filename: req.file.filename,
      photoUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengunggah foto.' });
  }
}

export async function exportExcel(req: Request, res: Response): Promise<void> {
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
    const submissions = await db('lkpd_submissions').where({ session_id: session.id }).orderBy('submitted_at', 'asc');

    const buffer = await generateExcelReport(session, teams, submissions);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Ecoplay-Laporan-${rawCode}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengekspor laporan Excel.' });
  }
}
