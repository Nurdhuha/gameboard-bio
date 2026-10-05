import ExcelJS from 'exceljs';
import { db } from '../config/database';

export async function generateExcelReport(session: any, teams: any[], submissions: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Platform Pembelajaran Ecoplay';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // SHEET 1: REKAPITULASI KLASEMEN AKHIR (LEADERBOARD)
  // -------------------------------------------------------------
  const sheet1 = workbook.addWorksheet('Klasemen Akhir', {
    views: [{ showGridLines: true }],
  });

  sheet1.mergeCells('A1:G1');
  const title1 = sheet1.getCell('A1');
  title1.value = `REKAPITULASI KLASEMEN KELAS - ${session.class_name.toUpperCase()} (${session.academic_year})`;
  title1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF166534' } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 30;

  sheet1.mergeCells('A2:G2');
  const subtitle1 = sheet1.getCell('A2');
  subtitle1.value = `Kode Sesi: ${session.room_code} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`;
  subtitle1.font = { name: 'Arial', size: 10, italic: true };
  subtitle1.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet1.getRow(4).values = [
    'Peringkat',
    'No. Tim',
    'Nama Kelompok',
    'Petak Posisi',
    'Skor Rubrik LKPD',
    'Poin Lencana Kecepatan',
    'Total Skor Akhir',
  ];
  sheet1.getRow(4).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet1.getRow(4).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(4).height = 25;

  ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'].forEach((cell) => {
    sheet1.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' },
    };
  });

  // Urutkan tim berdasarkan total nilai
  const sortedTeams = [...teams].sort((a, b) => {
    const totalA = (Number(a.total_lkpd_score) || 0) + (Number(a.badge_points) || 0);
    const totalB = (Number(b.total_lkpd_score) || 0) + (Number(b.badge_points) || 0);
    return totalB - totalA;
  });

  sortedTeams.forEach((t, idx) => {
    const rowNumber = 5 + idx;
    const lkpd = Number(t.total_lkpd_score) || 0;
    const badge = Number(t.badge_points) || 0;
    const total = lkpd + badge;

    sheet1.getRow(rowNumber).values = [
      idx + 1,
      t.team_number,
      `${t.avatar_icon || ''} ${t.name}`,
      `Petak #${t.current_tile}`,
      lkpd,
      badge,
      total,
    ];
    sheet1.getRow(rowNumber).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getCell(`C${rowNumber}`).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  sheet1.columns = [
    { width: 12 },
    { width: 10 },
    { width: 32 },
    { width: 15 },
    { width: 20 },
    { width: 24 },
    { width: 18 },
  ];

  // -------------------------------------------------------------
  // SHEET 2: RINCIAN JAWABAN & PENILAIAN LKPD
  // -------------------------------------------------------------
  const sheet2 = workbook.addWorksheet('Rincian LKPD', {
    views: [{ showGridLines: true }],
  });

  sheet2.mergeCells('A1:H1');
  const title2 = sheet2.getCell('A1');
  title2.value = `RINCIAN HASIL PENGERJAAN E-LKPD SISWA - ${session.class_name.toUpperCase()}`;
  title2.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(1).height = 30;

  sheet2.getRow(3).values = [
    'No',
    'Kelompok',
    'Aktivitas',
    'Teks Jawaban / Observasi',
    'Tautan Bukti Foto',
    'Refleksi Diri',
    'Skor Rubrik (0-3)',
    'Catatan Guru',
  ];
  sheet2.getRow(3).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet2.getRow(3).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(3).height = 24;

  ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'].forEach((cell) => {
    sheet2.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
  });

  submissions.forEach((sub, idx) => {
    const rowNumber = 4 + idx;
    const team = teams.find((t) => t.id === sub.team_id) || { name: 'Tim' };

    sheet2.getRow(rowNumber).values = [
      idx + 1,
      team.name,
      sub.activity_code,
      sub.answer_text,
      sub.photo_url || '-',
      sub.reflection_text || '-',
      sub.score ?? '-',
      sub.teacher_feedback || '-',
    ];
    sheet2.getRow(rowNumber).alignment = { vertical: 'top' };
    sheet2.getCell(`A${rowNumber}`).alignment = { horizontal: 'center', vertical: 'top' };
    sheet2.getCell(`C${rowNumber}`).alignment = { horizontal: 'center', vertical: 'top' };
    sheet2.getCell(`G${rowNumber}`).alignment = { horizontal: 'center', vertical: 'top' };
  });

  sheet2.columns = [
    { width: 8 },
    { width: 22 },
    { width: 14 },
    { width: 45 },
    { width: 25 },
    { width: 30 },
    { width: 16 },
    { width: 35 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
