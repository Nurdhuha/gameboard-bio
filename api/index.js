// api/index.js
import "pg";
import express from "express";
import cors from "cors";
import path2 from "path";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "pg";
import knex from "knex";
import dotenv from "dotenv";
import jwt2 from "jsonwebtoken";
import { Router as Router2 } from "express";
import ExcelJS from "exceljs";
import multer from "multer";
import path from "path";
import fs from "fs";
dotenv.config();
var connectionString = process.env.DATABASE_URL;
var knexConfig = {
  client: "pg",
  connection: connectionString ? {
    connectionString,
    ssl: process.env.DB_SSL === "false" || connectionString.includes("sslmode=disable") ? false : process.env.NODE_ENV === "production" || connectionString.includes("supabase") || connectionString.includes("pooler") || connectionString.includes("neon.tech") || connectionString.includes("render.com") || connectionString.includes("sslmode=require") || !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1") ? { rejectUnauthorized: false } : false
  } : {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "ecoplay"
  },
  pool: {
    min: 0,
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 3e4
  }
};
var db = knex(knexConfig);
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi." });
      return;
    }
    const existingTeacher = await db("teachers").where({ email: email.toLowerCase() }).first();
    if (existingTeacher) {
      res.status(409).json({ success: false, message: "Email sudah terdaftar. Silakan gunakan email lain." });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const [teacher] = await db("teachers").insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash
    }).returning(["id", "name", "email", "created_at"]);
    const secret = process.env.JWT_SECRET || "ecoplay-default-secret-key";
    const token = jwt.sign({ id: teacher.id, email: teacher.email, name: teacher.name }, secret, {
      expiresIn: "7d"
    });
    res.status(201).json({
      success: true,
      message: "Registrasi akun pendidik berhasil.",
      token,
      teacher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal melakukan registrasi." });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
      return;
    }
    const teacher = await db("teachers").where({ email: email.toLowerCase() }).first();
    if (!teacher) {
      res.status(401).json({ success: false, message: "Email atau password tidak sesuai." });
      return;
    }
    const isMatch = await bcrypt.compare(password, teacher.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Email atau password tidak sesuai." });
      return;
    }
    const secret = process.env.JWT_SECRET || "ecoplay-default-secret-key";
    const token = jwt.sign({ id: teacher.id, email: teacher.email, name: teacher.name }, secret, {
      expiresIn: "7d"
    });
    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        created_at: teacher.created_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    const isConnError = error.message?.includes("ECONNREFUSED") || error.message?.includes("connect") || error.code === "ECONNREFUSED";
    res.status(500).json({
      success: false,
      message: isConnError ? "Gagal terhubung ke database Supabase. Pastikan Environment Variable DATABASE_URL sudah diatur di dashboard Vercel." : error.message || "Gagal melakukan login."
    });
  }
}
async function getMe(req, res) {
  try {
    if (!req.teacher) {
      res.status(401).json({ success: false, message: "Tidak terotentikasi." });
      return;
    }
    const teacher = await db("teachers").where({ id: req.teacher.id }).select(["id", "name", "email", "created_at"]).first();
    if (!teacher) {
      res.status(404).json({ success: false, message: "Data guru tidak ditemukan." });
      return;
    }
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengambil data profil." });
  }
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Akses ditolak: Token autentikasi tidak ditemukan." });
    return;
  }
  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "ecoplay-default-secret-key";
  try {
    const decoded = jwt2.verify(token, secret);
    req.teacher = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Akses ditolak: Token tidak valid atau telah kedaluwarsa." });
  }
}
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
var authRoutes_default = router;
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "ECO";
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
var INITIAL_TEAM_PRESETS = [
  { team_number: 1, name: "Kelompok 1 (Harimau)", avatar_icon: "\u{1F42F}", color_hex: "#f59e0b", badge_color: "bg-amber-500" },
  { team_number: 2, name: "Kelompok 2 (Elang)", avatar_icon: "\u{1F985}", color_hex: "#3b82f6", badge_color: "bg-blue-500" },
  { team_number: 3, name: "Kelompok 3 (Komodo)", avatar_icon: "\u{1F98E}", color_hex: "#10b981", badge_color: "bg-emerald-500" }
];
function formatSession(s) {
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
    endedAt: s.ended_at
  };
}
function formatTeam(t) {
  if (!t) return t;
  return {
    ...t,
    avatarIcon: t.avatar_icon,
    color: t.color_hex,
    badgeColor: t.badge_color,
    currentTile: t.current_tile,
    badgePoints: t.badge_points,
    lkpdScore: t.total_lkpd_score,
    teamNumber: t.team_number
  };
}
async function createSession(req, res) {
  try {
    const { className, academicYear } = req.body;
    const teacherId = req.teacher?.id || null;
    let roomCode = generateRoomCode();
    let existing = await db("game_sessions").where({ room_code: roomCode }).first();
    while (existing) {
      roomCode = generateRoomCode();
      existing = await db("game_sessions").where({ room_code: roomCode }).first();
    }
    const [session] = await db("game_sessions").insert({
      room_code: roomCode,
      teacher_id: teacherId,
      class_name: className || "Kelas X Biologi",
      academic_year: academicYear || "2026/2027",
      phase: "lobby",
      active_zone: 1,
      is_active: true
    }).returning("*");
    const teamsToInsert = INITIAL_TEAM_PRESETS.map((t) => ({
      session_id: session.id,
      team_number: t.team_number,
      name: t.name,
      avatar_icon: t.avatar_icon,
      color_hex: t.color_hex,
      badge_color: t.badge_color,
      current_tile: 0,
      badge_points: 0,
      total_lkpd_score: 0
    }));
    const teams = await db("teams").insert(teamsToInsert).returning("*");
    res.status(201).json({
      success: true,
      message: "Sesi kelas baru berhasil dibuat.",
      session: formatSession(session),
      teams: teams.map(formatTeam)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal membuat sesi kelas." });
  }
}
async function getSession(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: `Sesi kelas dengan kode ${rawCode} tidak ditemukan.` });
      return;
    }
    const teams = await db("teams").where({ session_id: session.id }).orderBy("team_number", "asc");
    const submissions = await db("lkpd_submissions").where({ session_id: session.id }).orderBy("submitted_at", "desc");
    const badgeClaims = await db("badge_claims").where({ session_id: session.id }).orderBy("claimed_at", "asc");
    res.json({
      success: true,
      session: formatSession(session),
      teams: teams.map(formatTeam),
      submissions,
      badgeClaims
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengambil data sesi." });
  }
}
async function startSession(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const [updated] = await db("game_sessions").where({ id: session.id }).update({
      phase: "spin",
      active_zone: 1
    }).returning("*");
    res.json({
      success: true,
      message: "Sesi kelas berhasil dimulai.",
      session: formatSession(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal memulai sesi kelas." });
  }
}
async function updatePhase(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const { phase, activeZone } = req.body;
    const [updated] = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).update({
      phase: phase || void 0,
      active_zone: activeZone || void 0
    }).returning("*");
    if (!updated) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    res.json({ success: true, session: formatSession(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal memperbarui fase sesi." });
  }
}
async function resetSession(req, res) {
  try {
    const roomCode = String(req.params.roomCode || "").toUpperCase();
    const session = await db("game_sessions").where({ room_code: roomCode }).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi tidak ditemukan." });
      return;
    }
    await db.transaction(async (trx) => {
      await trx("teams").where({ session_id: session.id }).update({
        current_tile: 0,
        badge_points: 0,
        total_lkpd_score: 0,
        updated_at: /* @__PURE__ */ new Date()
      });
      await trx("lkpd_submissions").where({ session_id: session.id }).delete();
      await trx("badge_claims").where({ session_id: session.id }).delete();
      await trx("game_sessions").where({ id: session.id }).update({ phase: "lobby", active_zone: 1 });
    });
    res.json({ success: true, message: "Data permainan dan nilai sesi berhasil direset." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mereset data sesi." });
  }
}
async function endSession(req, res) {
  try {
    const roomCode = String(req.params.roomCode || "").toUpperCase();
    const session = await db("game_sessions").where({ room_code: roomCode }).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    await db.transaction(async (trx) => {
      await trx("teams").where({ session_id: session.id }).update({
        current_tile: 0,
        badge_points: 0,
        total_lkpd_score: 0,
        updated_at: /* @__PURE__ */ new Date()
      });
      await trx("lkpd_submissions").where({ session_id: session.id }).delete();
      await trx("badge_claims").where({ session_id: session.id }).delete();
      await trx("game_sessions").where({ id: session.id }).update({
        phase: "ended",
        is_active: false,
        ended_at: /* @__PURE__ */ new Date()
      });
    });
    res.json({
      success: true,
      message: "Sesi kelas berhasil diakhiri. Seluruh progres dan jawaban LKPD telah dibersihkan."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengakhiri sesi kelas." });
  }
}
async function getTeacherSessions(req, res) {
  try {
    const teacherId = req.teacher?.id;
    if (!teacherId) {
      res.status(401).json({ success: false, message: "Tidak terotentikasi." });
      return;
    }
    const sessions = await db("game_sessions").where({ teacher_id: teacherId }).orderBy("created_at", "desc");
    res.json({ success: true, sessions: sessions.map(formatSession) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengambil riwayat sesi kelas." });
  }
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var EXTRA_PRESETS = [
  { name: "Badak", avatar_icon: "\u{1F98F}", color_hex: "#8b5cf6", badge_color: "bg-purple-500" },
  { name: "Cendrawasih", avatar_icon: "\u{1F99C}", color_hex: "#ec4899", badge_color: "bg-pink-500" },
  { name: "Gajah", avatar_icon: "\u{1F418}", color_hex: "#64748b", badge_color: "bg-slate-500" },
  { name: "Orangutan", avatar_icon: "\u{1F9A7}", color_hex: "#ea580c", badge_color: "bg-orange-600" },
  { name: "Penyu", avatar_icon: "\u{1F422}", color_hex: "#06b6d4", badge_color: "bg-cyan-500" }
];
async function getTeams(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const teams = await db("teams").where({ session_id: session.id }).orderBy("team_number", "asc");
    res.json({ success: true, teams: teams.map(formatTeam) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengambil data tim." });
  }
}
async function addTeam(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const currentTeams = await db("teams").where({ session_id: session.id });
    const nextNumber = currentTeams.length + 1;
    const presetIdx = (nextNumber - 4) % EXTRA_PRESETS.length;
    const preset = nextNumber <= 3 ? { name: `Tim ${nextNumber}`, avatar_icon: "\u{1F43E}", color_hex: "#6366f1", badge_color: "bg-indigo-500" } : EXTRA_PRESETS[presetIdx >= 0 ? presetIdx : 0];
    const [newTeam] = await db("teams").insert({
      session_id: session.id,
      team_number: nextNumber,
      name: `Kelompok ${nextNumber} (${preset.name})`,
      avatar_icon: preset.avatar_icon,
      color_hex: preset.color_hex,
      badge_color: preset.badge_color,
      current_tile: 0,
      badge_points: 0,
      total_lkpd_score: 0
    }).returning("*");
    res.status(201).json({ success: true, message: "Kelompok baru berhasil ditambahkan.", team: formatTeam(newTeam) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal menambahkan kelompok baru." });
  }
}
async function updatePawn(req, res) {
  try {
    const { teamId, roomCode } = req.params;
    const { targetTile } = req.body;
    if (targetTile === void 0 || targetTile < 0 || targetTile > 50) {
      res.status(400).json({ success: false, message: "Petak target harus bernilai antara 0 s.d. 50." });
      return;
    }
    let teamQuery = db("teams");
    if (UUID_REGEX.test(String(teamId))) {
      teamQuery = teamQuery.where({ id: String(teamId) });
    } else if (roomCode) {
      const rawCode = String(roomCode).toUpperCase().trim();
      const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
      const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
      if (!session) {
        res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
        return;
      }
      teamQuery = teamQuery.where({ session_id: session.id, team_number: Number(teamId) });
    } else {
      teamQuery = teamQuery.where({ team_number: Number(teamId) });
    }
    const [updatedTeam] = await teamQuery.update({
      current_tile: targetTile,
      updated_at: /* @__PURE__ */ new Date()
    }).returning("*");
    if (!updatedTeam) {
      res.status(404).json({ success: false, message: "Data tim tidak ditemukan." });
      return;
    }
    res.json({ success: true, message: "Posisi pion berhasil diperbarui.", team: formatTeam(updatedTeam) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal memperbarui posisi pion." });
  }
}
async function generateExcelReport(session, teams, submissions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Platform Pembelajaran Ecoplay";
  workbook.created = /* @__PURE__ */ new Date();
  const sheet1 = workbook.addWorksheet("Klasemen Akhir", {
    views: [{ showGridLines: true }]
  });
  sheet1.mergeCells("A1:G1");
  const title1 = sheet1.getCell("A1");
  title1.value = `REKAPITULASI KLASEMEN KELAS - ${session.class_name.toUpperCase()} (${session.academic_year})`;
  title1.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF166534" } };
  title1.alignment = { horizontal: "center", vertical: "middle" };
  sheet1.getRow(1).height = 30;
  sheet1.mergeCells("A2:G2");
  const subtitle1 = sheet1.getCell("A2");
  subtitle1.value = `Kode Sesi: ${session.room_code} | Tanggal Cetak: ${(/* @__PURE__ */ new Date()).toLocaleDateString("id-ID")}`;
  subtitle1.font = { name: "Arial", size: 10, italic: true };
  subtitle1.alignment = { horizontal: "center", vertical: "middle" };
  sheet1.getRow(4).values = [
    "Peringkat",
    "No. Tim",
    "Nama Kelompok",
    "Petak Posisi",
    "Skor Rubrik LKPD",
    "Poin Lencana Kecepatan",
    "Total Skor Akhir"
  ];
  sheet1.getRow(4).font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  sheet1.getRow(4).alignment = { horizontal: "center", vertical: "middle" };
  sheet1.getRow(4).height = 25;
  ["A4", "B4", "C4", "D4", "E4", "F4", "G4"].forEach((cell) => {
    sheet1.getCell(cell).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF059669" }
    };
  });
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
      `${t.avatar_icon || ""} ${t.name}`,
      `Petak #${t.current_tile}`,
      lkpd,
      badge,
      total
    ];
    sheet1.getRow(rowNumber).alignment = { horizontal: "center", vertical: "middle" };
    sheet1.getCell(`C${rowNumber}`).alignment = { horizontal: "left", vertical: "middle" };
  });
  sheet1.columns = [
    { width: 12 },
    { width: 10 },
    { width: 32 },
    { width: 15 },
    { width: 20 },
    { width: 24 },
    { width: 18 }
  ];
  const sheet2 = workbook.addWorksheet("Rincian LKPD", {
    views: [{ showGridLines: true }]
  });
  sheet2.mergeCells("A1:H1");
  const title2 = sheet2.getCell("A1");
  title2.value = `RINCIAN HASIL PENGERJAAN E-LKPD SISWA - ${session.class_name.toUpperCase()}`;
  title2.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF1E3A8A" } };
  title2.alignment = { horizontal: "center", vertical: "middle" };
  sheet2.getRow(1).height = 30;
  sheet2.getRow(3).values = [
    "No",
    "Kelompok",
    "Aktivitas",
    "Teks Jawaban / Observasi",
    "Tautan Bukti Foto",
    "Refleksi Diri",
    "Skor Rubrik (0-3)",
    "Catatan Guru"
  ];
  sheet2.getRow(3).font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  sheet2.getRow(3).alignment = { horizontal: "center", vertical: "middle" };
  sheet2.getRow(3).height = 24;
  ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3"].forEach((cell) => {
    sheet2.getCell(cell).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" }
    };
  });
  submissions.forEach((sub, idx) => {
    const rowNumber = 4 + idx;
    const team = teams.find((t) => t.id === sub.team_id) || { name: "Tim" };
    sheet2.getRow(rowNumber).values = [
      idx + 1,
      team.name,
      sub.activity_code,
      sub.answer_text,
      sub.photo_url || "-",
      sub.reflection_text || "-",
      sub.score ?? "-",
      sub.teacher_feedback || "-"
    ];
    sheet2.getRow(rowNumber).alignment = { vertical: "top" };
    sheet2.getCell(`A${rowNumber}`).alignment = { horizontal: "center", vertical: "top" };
    sheet2.getCell(`C${rowNumber}`).alignment = { horizontal: "center", vertical: "top" };
    sheet2.getCell(`G${rowNumber}`).alignment = { horizontal: "center", vertical: "top" };
  });
  sheet2.columns = [
    { width: 8 },
    { width: 22 },
    { width: 14 },
    { width: 45 },
    { width: 25 },
    { width: 30 },
    { width: 16 },
    { width: 35 }
  ];
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
var UUID_REGEX2 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function getSubmissions(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const submissions = await db("lkpd_submissions").where({ session_id: session.id }).orderBy("submitted_at", "desc");
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengambil jawaban LKPD." });
  }
}
async function submitLkpd(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const { teamId, activityCode, answerText, photoUrl, reflectionText } = req.body;
    if (!teamId || !activityCode || !answerText) {
      res.status(400).json({ success: false, message: "teamId, activityCode, dan answerText wajib diisi." });
      return;
    }
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const actualTeam = UUID_REGEX2.test(String(teamId)) ? await db("teams").where({ id: teamId, session_id: session.id }).first() : await db("teams").where({ session_id: session.id, team_number: Number(teamId) }).first();
    if (!actualTeam) {
      res.status(404).json({ success: false, message: "Kelompok tidak ditemukan di sesi ini." });
      return;
    }
    const resolvedTeamId = actualTeam.id;
    const existing = await db("lkpd_submissions").where({ session_id: session.id, team_id: resolvedTeamId, activity_code: activityCode }).first();
    let submission;
    if (existing) {
      [submission] = await db("lkpd_submissions").where({ id: existing.id }).update({
        answer_text: typeof answerText === "object" ? JSON.stringify(answerText) : String(answerText),
        photo_url: photoUrl !== void 0 ? photoUrl : existing.photo_url,
        reflection_text: reflectionText !== void 0 ? reflectionText : existing.reflection_text,
        submitted_at: /* @__PURE__ */ new Date()
      }).returning("*");
    } else {
      [submission] = await db("lkpd_submissions").insert({
        session_id: session.id,
        team_id: resolvedTeamId,
        activity_code: activityCode,
        answer_text: typeof answerText === "object" ? JSON.stringify(answerText) : String(answerText),
        photo_url: photoUrl || null,
        reflection_text: reflectionText || null,
        score: 3
        // Skor awal default 3 (akan divalidasi oleh guru)
      }).returning("*");
    }
    const totalScoreResult = await db("lkpd_submissions").where({ session_id: session.id, team_id: resolvedTeamId }).sum("score as total");
    const totalLkpd = Number(totalScoreResult[0]?.total) || 0;
    await db("teams").where({ id: resolvedTeamId }).update({ total_lkpd_score: totalLkpd, updated_at: /* @__PURE__ */ new Date() });
    res.json({
      success: true,
      message: "Jawaban LKPD berhasil dikirimkan ke guru.",
      submission,
      totalLkpdScore: totalLkpd
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengirimkan jawaban LKPD." });
  }
}
async function gradeSubmission(req, res) {
  try {
    const { id } = req.params;
    const { score, teacherFeedback } = req.body;
    if (score === void 0 || score < 0 || score > 3) {
      res.status(400).json({ success: false, message: "Skor rubrik harus bernilai antara 0 s.d. 3." });
      return;
    }
    const [submission] = await db("lkpd_submissions").where({ id }).update({
      score,
      teacher_feedback: teacherFeedback !== void 0 ? teacherFeedback : null,
      graded_at: /* @__PURE__ */ new Date()
    }).returning("*");
    if (!submission) {
      res.status(404).json({ success: false, message: "Jawaban LKPD tidak ditemukan." });
      return;
    }
    const totalScoreResult = await db("lkpd_submissions").where({ session_id: submission.session_id, team_id: submission.team_id }).sum("score as total");
    const totalLkpd = Number(totalScoreResult[0]?.total) || 0;
    const [updatedTeam] = await db("teams").where({ id: submission.team_id }).update({ total_lkpd_score: totalLkpd, updated_at: /* @__PURE__ */ new Date() }).returning("*");
    res.json({
      success: true,
      message: "Penilaian rubrik berhasil disimpan.",
      submission,
      team: updatedTeam
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal menyimpan penilaian." });
  }
}
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Berkas foto tidak ditemukan." });
      return;
    }
    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const photoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "Foto observasi berhasil diunggah.",
      filename: req.file.filename,
      photoUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengunggah foto." });
  }
}
async function exportExcel(req, res) {
  try {
    const rawCode = String(req.params.roomCode || "").toUpperCase().trim();
    const strippedCode = rawCode.replace(/[^A-Z0-9]/g, "");
    const session = await db("game_sessions").where({ room_code: rawCode }).orWhereRaw("UPPER(REPLACE(room_code, '-', '')) = ?", [strippedCode]).first();
    if (!session) {
      res.status(404).json({ success: false, message: "Sesi kelas tidak ditemukan." });
      return;
    }
    const teams = await db("teams").where({ session_id: session.id }).orderBy("team_number", "asc");
    const submissions = await db("lkpd_submissions").where({ session_id: session.id }).orderBy("submitted_at", "asc");
    const buffer = await generateExcelReport(session, teams, submissions);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Ecoplay-Laporan-${rawCode}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengekspor laporan Excel." });
  }
}
var uploadDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.resolve(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const roomCode = req.params.roomCode || "GENERAL";
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e4);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `foto-${roomCode}-${timestamp}-${randomSuffix}${ext}`);
  }
});
var upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // Maksimal 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format berkas tidak didukung. Harap unggah format JPG, PNG, atau WEBP."));
    }
  }
});
var router2 = Router2();
router2.post("/", authMiddleware, createSession);
router2.post("/create", authMiddleware, createSession);
router2.get("/my/list", authMiddleware, getTeacherSessions);
router2.get("/:roomCode", getSession);
router2.post("/:roomCode/start", startSession);
router2.patch("/:roomCode/phase", updatePhase);
router2.post("/:roomCode/reset", resetSession);
router2.post("/:roomCode/end", endSession);
router2.get("/:roomCode/teams", getTeams);
router2.post("/:roomCode/teams", addTeam);
router2.patch("/:roomCode/teams/:teamId/pawn", updatePawn);
router2.get("/:roomCode/submissions", getSubmissions);
router2.post("/:roomCode/submissions/lkpd", submitLkpd);
router2.patch("/submissions/:id/grade", gradeSubmission);
router2.post("/:roomCode/upload", upload.single("photo"), uploadPhoto);
router2.get("/:roomCode/export/excel", exportExcel);
var sessionRoutes_default = router2;
function errorHandler(err, _req, res, _next) {
  console.error("\u274C Server Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan internal pada server.";
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : void 0
  });
}
function createApp() {
  const app = express();
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  const uploadDir2 = process.env.VERCEL ? path2.join("/tmp", "uploads") : path2.resolve(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadDir2));
  app.get(["/api/health", "/health", "/api", "/api/index.ts"], (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "Ecoplay Backend API (Vercel Serverless & Express)",
      uptime: process.uptime(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", authRoutes_default);
  app.use("/auth", authRoutes_default);
  app.use("/api/sessions", sessionRoutes_default);
  app.use("/sessions", sessionRoutes_default);
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Rute ${req.method} ${req.url} tidak ditemukan di server API.`
    });
  });
  app.use(errorHandler);
  return app;
}
var cachedApp = null;
var initError = null;
function getApp() {
  if (!cachedApp && !initError) {
    try {
      cachedApp = createApp();
    } catch (err) {
      initError = err;
      console.error("Failed to initialize Express app in Vercel:", err);
    }
  }
  return { app: cachedApp, error: initError };
}
function handler(req, res) {
  const { app, error } = getApp();
  if (error) {
    return res.status(500).json({
      success: false,
      error: "SERVERLESS_INIT_ERROR",
      message: error?.message || "Gagal menginisialisasi server API.",
      stack: process.env.NODE_ENV === "development" ? error?.stack : void 0
    });
  }
  const query = req.query;
  if (query && query.__path) {
    req.url = "/api/" + query.__path;
  } else if (req.headers["x-matched-path"] && typeof req.headers["x-matched-path"] === "string") {
    req.url = req.headers["x-matched-path"];
  }
  return app(req, res, (err) => {
    if (err) {
      console.error("Vercel Express Unhandled Error:", err);
      return res.status(500).json({
        success: false,
        message: err?.message || "Terjadi kesalahan pada server API."
      });
    }
    return res.status(404).json({
      success: false,
      message: `Rute ${req.method} ${req.url} tidak ditemukan di server.`
    });
  });
}
export {
  handler as default
};
