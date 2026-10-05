import { db } from '../config/database';

export interface BadgeClaimResult {
  success: boolean;
  message?: string;
  rank?: number;
  points?: number;
  claim?: any;
}

/**
 * Atomic Speed Badge Race Service
 * Menangani perebutan lencana kecepatan secara aman tanpa bentrok (race condition)
 * Petak target lencana: 10, 22, 38, dan 50.
 */
export async function claimSpeedBadge(
  sessionId: string,
  teamId: string,
  tileNumber: number
): Promise<BadgeClaimResult> {
  // Hanya petak batas zona yang memiliki lencana
  const validBadgeTiles = [10, 22, 38, 50];
  if (!validBadgeTiles.includes(tileNumber)) {
    return { success: false, message: `Petak #${tileNumber} bukan merupakan petak lencana kecepatan zona.` };
  }

  return await db.transaction(async (trx) => {
    // 0. Resolusi teamId jika berupa angka (1, 2, 3) atau UUID
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const actualTeam = UUID_REGEX.test(String(teamId))
      ? await trx('teams').where({ id: teamId, session_id: sessionId }).first()
      : await trx('teams').where({ session_id: sessionId, team_number: Number(teamId) }).first();

    if (!actualTeam) {
      return { success: false, message: 'Kelompok tidak ditemukan di sesi ini.' };
    }
    const resolvedTeamId = actualTeam.id;

    // 1. Cek apakah tim sudah pernah mengklaim lencana di petak ini sebelumnya
    const existingClaim = await trx('badge_claims')
      .where({ session_id: sessionId, team_id: resolvedTeamId, tile_number: tileNumber })
      .first();

    if (existingClaim) {
      return {
        success: false,
        message: 'Lencana pada petak ini sudah pernah diklaim oleh tim Anda.',
        rank: existingClaim.rank,
        points: existingClaim.points_awarded,
      };
    }

    // 2. Kunci baris petak dan hitung berapa tim yang sudah berhasil klaim
    const currentClaims = await trx('badge_claims')
      .where({ session_id: sessionId, tile_number: tileNumber })
      .forUpdate();

    const nextRank = currentClaims.length + 1;

    // Hanya 3 tim tercepat yang memperoleh poin lencana
    let points = 0;
    if (nextRank === 1) points = 3;      // Juara 1: Lencana Emas (+3 pt)
    else if (nextRank === 2) points = 2; // Juara 2: Lencana Perak (+2 pt)
    else if (nextRank === 3) points = 1; // Juara 3: Lencana Perunggu (+1 pt)
    else {
      return {
        success: false,
        message: 'Kuota 3 besar lencana kecepatan pada zona ini sudah terpenuhi oleh kelompok lain.',
      };
    }

    // 3. Masukkan catatan klaim ke database
    const [claim] = await trx('badge_claims')
      .insert({
        session_id: sessionId,
        team_id: resolvedTeamId,
        tile_number: tileNumber,
        rank: nextRank,
        points_awarded: points,
        claimed_at: new Date(),
      })
      .returning('*');

    // 4. Perbarui total badge_points pada tabel tim
    await trx('teams')
      .where({ id: resolvedTeamId })
      .increment('badge_points', points);

    return {
      success: true,
      message: `Selamat! Kelompok Anda meraih Juara ${nextRank} Kecepatan Zona dan memperoleh bonus +${points} poin!`,
      rank: nextRank,
      points,
      claim,
    };
  });
}
