-- =========================================================================
-- DDL SCHEMA DATABASE ECOPLAY (SUPABASE / POSTGRESQL)
-- Salin dan jalankan seluruh kode SQL ini di SQL Editor Supabase Anda
-- =========================================================================

-- Aktifkan ekstensi pgcrypto untuk pembangkitan UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL PENDIDIK / GURU (TEACHERS)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL SESI KELAS (GAME SESSIONS)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(16) UNIQUE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    class_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2026/2027',
    phase VARCHAR(30) DEFAULT 'spin',
    active_zone INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 3. TABEL KELOMPOK SISWA (TEAMS)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_icon VARCHAR(30) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    badge_color VARCHAR(50) DEFAULT 'bg-amber-500',
    current_tile INT DEFAULT 0 CHECK (current_tile >= 0 AND current_tile <= 50),
    badge_points INT DEFAULT 0,
    total_lkpd_score INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_per_session UNIQUE(session_id, team_number)
);

-- 4. TABEL JAWABAN LKPD SISWA & PENILAIAN RUBRIK
CREATE TABLE IF NOT EXISTS lkpd_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    activity_code VARCHAR(20) NOT NULL,
    answer_text TEXT NOT NULL,
    photo_url TEXT,
    reflection_text TEXT,
    score INT DEFAULT 3 CHECK (score >= 0 AND score <= 3),
    teacher_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_team_activity UNIQUE(session_id, team_id, activity_code)
);

-- 5. TABEL PEREBUTAN LENCANA KECEPATAN (SPEED RACE 1, 2, 3)
CREATE TABLE IF NOT EXISTS badge_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tile_number INT NOT NULL CHECK (tile_number IN (10, 22, 38, 50)),
    rank INT NOT NULL CHECK (rank BETWEEN 1 AND 3),
    points_awarded INT NOT NULL CHECK (points_awarded BETWEEN 1 AND 3),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_tile_claim UNIQUE(session_id, team_id, tile_number),
    CONSTRAINT unique_rank_per_tile UNIQUE(session_id, tile_number, rank)
);

-- INDEKS PERFORMA AKSES CEPAT
CREATE INDEX IF NOT EXISTS idx_sessions_room ON game_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_teams_session ON teams(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON lkpd_submissions(session_id, team_id);
CREATE INDEX IF NOT EXISTS idx_badge_claims ON badge_claims(session_id, tile_number);
