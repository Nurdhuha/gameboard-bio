import React, { useState, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { GameBoard } from './components/board/GameBoard';
import { TeamSelectionScreen } from './components/student/TeamSelectionScreen';
import { INITIAL_TEAMS, TEAM_PRESETS, BOARD_TILES, ACTIVITIES } from './data/boardData';
import { TileData, ActivityData, Team } from './types';

// Code-splitting via lazy loading: memotong initial bundle size untuk smartphone berspesifikasi rendah
const SpinWheel = lazy(() =>
  import('./components/spin/SpinWheel').then((m) => ({ default: m.SpinWheel }))
);
const ActivityModal = lazy(() =>
  import('./components/modals/ActivityModal').then((m) => ({ default: m.ActivityModal }))
);
const PrePostTestModal = lazy(() =>
  import('./components/modals/PrePostTestModal').then((m) => ({ default: m.PrePostTestModal }))
);
const LeaderboardModal = lazy(() =>
  import('./components/modals/LeaderboardModal').then((m) => ({ default: m.LeaderboardModal }))
);
const TeacherDashboardModal = lazy(() =>
  import('./components/dashboard/TeacherDashboardModal').then((m) => ({ default: m.TeacherDashboardModal }))
);
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  FastForward,
  FileQuestion,
  Sparkles,
  MapPin,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Dices,
  Sliders,
  Users,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper judul ramah pengguna untuk menyembunyikan kode dan indikator teknis
const getActivityTitle = (activity: ActivityData) => {
  if (['KE-06', 'IA-06', 'AE-06', 'JE-06'].includes(activity.code)) {
    return `Tantangan Lencana - Petak #${activity.tileNumber}`;
  }
  return activity.cardType === 'Challenge'
    ? `Tantangan Lapangan - Petak #${activity.tileNumber}`
    : `Teka-Teki Analisis - Petak #${activity.tileNumber}`;
};

export const App: React.FC = () => {
  const location = useLocation();

  // Deteksi role berdasarkan route URL: /teachers atau /teacher -> Guru, selain itu -> Murid
  const isTeacherRoute =
    location.pathname.startsWith('/teacher') ||
    location.hash.startsWith('#/teacher');

  // Status halaman murid: apakah sudah memilih kelompok atau belum
  const [hasStudentSelectedTeam, setHasStudentSelectedTeam] = useState<boolean>(false);

  // Status tampilan guru di /teachers: 'spin' (roda putar penentuan giliran) atau 'board' (papan kelas)
  const [teacherGamePhase, setTeacherGamePhase] = useState<'spin' | 'board'>('spin');

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  // Jawaban LKPD & Refleksi siswa: Record<teamId, Record<activityCode, { answer, reflection, score }>>
  const [teamAnswers, setTeamAnswers] = useState<
    Record<number, Record<string, { answer: string; reflection?: string; score?: number }>>
  >({});

  // Selected tile for inspection
  const [inspectedTileId, setInspectedTileId] = useState<number>(2); // Default ke KE-01

  // Mobile Bottom Sheet state
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState<boolean>(false);

  // Modals state
  const [activeActivity, setActiveActivity] = useState<ActivityData | null>(null);
  const [showPrePostModal, setShowPrePostModal] = useState<'pre' | 'post' | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const inspectedTile = BOARD_TILES.find((t) => t.id === inspectedTileId) || BOARD_TILES[0];
  const inspectedActivity = inspectedTile.activityCode ? ACTIVITIES[inspectedTile.activityCode] : null;

  // Handle selesai sesi spin di /teachers
  const handleSpinComplete = (orderedTeams: Team[]) => {
    setTeams(orderedTeams);
    setSelectedTeamId(orderedTeams[0].id);
    setTeacherGamePhase('board');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  // Gerakkan pion tim aktif
  const handleMovePawn = (delta: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === selectedTeamId) {
          const nextTile = Math.max(0, Math.min(50, team.currentTile + delta));

          // Cek jika tiba di petak lencana
          if ([10, 22, 38, 50].includes(nextTile) && nextTile !== team.currentTile) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
          }

          setInspectedTileId(nextTile);
          return { ...team, currentTile: nextTile };
        }
        return team;
      })
    );
  };

  // Loncat ke petak aktivitas berikutnya
  const handleJumpToNextActivity = () => {
    const current = selectedTeam.currentTile;
    const nextActivityTile = BOARD_TILES.find(
      (tile) => tile.id > current && tile.activityCode !== undefined
    );

    if (nextActivityTile) {
      handleMovePawn(nextActivityTile.id - current);
    } else {
      handleMovePawn(50 - current);
    }
  };

  const handleTileClick = (tile: TileData) => {
    setInspectedTileId(tile.id);
    setIsMobileSheetExpanded(true);
  };

  // Siswa submit LKPD
  const handleActivitySubmit = (answer: string, reflection?: string) => {
    if (!activeActivity) return;

    setCompletedActivities((prev) => [...new Set([...prev, activeActivity.code])]);

    // Simpan data jawaban tim untuk diperiksa guru di /teachers
    setTeamAnswers((prev) => ({
      ...prev,
      [selectedTeamId]: {
        ...(prev[selectedTeamId] || {}),
        [activeActivity.code]: {
          answer,
          reflection,
          score: prev[selectedTeamId]?.[activeActivity.code]?.score ?? 3,
        },
      },
    }));

    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (t.id === selectedTeamId) {
          const isBadge = [10, 22, 38, 50].includes(t.currentTile);
          return {
            ...t,
            lkpdScore: t.lkpdScore + 3,
            badgePoints: isBadge ? t.badgePoints + 3 : t.badgePoints,
            completedActivities: [...new Set([...t.completedActivities, activeActivity.code])],
          };
        }
        return t;
      })
    );

    setActiveActivity(null);
  };

  // Guru memperbarui nilai rubrik LKPD siswa (0, 1, 2, 3)
  const handleUpdateScore = (teamId: number, activityCode: string, score: number) => {
    setTeamAnswers((prev) => {
      const prevTeam = prev[teamId] || {};
      const prevAct = prevTeam[activityCode] || { answer: '' };
      const oldScore = prevAct.score ?? 0;
      const scoreDiff = score - oldScore;

      setTeams((teamsList) =>
        teamsList.map((t) => (t.id === teamId ? { ...t, lkpdScore: Math.max(0, t.lkpdScore + scoreDiff) } : t))
      );

      return {
        ...prev,
        [teamId]: {
          ...prevTeam,
          [activityCode]: {
            ...prevAct,
            score,
          },
        },
      };
    });
  };

  // Guru menetapkan peraih lencana zona (Juara 1: +3 pt, Juara 2: +2 pt, Juara 3: +1 pt)
  const handleUpdateBadge = (teamId: number, _zoneId: number, badgeRank: 1 | 2 | 3) => {
    const points = badgeRank === 1 ? 3 : badgeRank === 2 ? 2 : 1;
    setTeams((teamsList) =>
      teamsList.map((t) =>
        t.id === teamId ? { ...t, badgePoints: t.badgePoints + points } : t
      )
    );
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  // Guru mereset permainan ke awal
  const handleResetGame = () => {
    setTeams(
      INITIAL_TEAMS.map((t) => ({
        ...t,
        currentTile: 0,
        badgePoints: 0,
        lkpdScore: 0,
        completedActivities: [],
        hasFinishedPreTest: false,
        hasFinishedPostTest: false,
      }))
    );
    setTeamAnswers({});
    setCompletedActivities([]);
    setTeacherGamePhase('spin');
    setShowTeacherDashboard(false);
  };

  // Guru menambah kelompok baru
  const handleAddTeam = () => {
    setTeams((prev) => {
      const nextId = prev.length + 1;
      const preset = TEAM_PRESETS[(nextId - 1) % TEAM_PRESETS.length];
      const newTeam: Team = {
        id: nextId,
        name: `Kelompok ${nextId} (${preset.name})`,
        color: preset.color,
        badgeColor: preset.badgeColor,
        currentTile: 0,
        completedActivities: [],
        badgePoints: 0,
        lkpdScore: 0,
        avatarIcon: preset.icon,
        hasFinishedPreTest: false,
        hasFinishedPostTest: false,
      };
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      return [...prev, newTeam];
    });
  };

  // Guru menghapus kelompok
  const handleRemoveTeam = (id: number) => {
    setTeams((prev) => {
      if (prev.length <= 2) {
        alert('Minimal harus ada 2 kelompok dalam permainan.');
        return prev;
      }
      const updated = prev.filter((t) => t.id !== id);
      if (selectedTeamId === id) {
        setSelectedTeamId(updated[0].id);
      }
      return updated;
    });
  };

  // Guru mereset kelompok ke 3 kelompok default
  const handleResetToDefaultTeams = () => {
    setTeams(INITIAL_TEAMS);
    setSelectedTeamId(INITIAL_TEAMS[0].id);
  };

  return (
    <div className="h-screen w-screen bg-[#f8faf9] text-slate-800 flex flex-col font-sans select-none antialiased overflow-hidden">
      {/* 1. TOP NAVBAR (CALMING, MINIMALIST & CLEAN) */}
      <header className="h-14 sm:h-16 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Brand */}
        <div className="flex items-center">
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-emerald-800">
            Ecoplay
          </h1>
        </div>

        {/* RIGHT ACTIONS BERDASARKAN ROUTE */}
        <div className="flex items-center gap-2">
          {isTeacherRoute ? (
            /* --- KONTROL NAVIGASI GURU (/teachers) --- */
            <>
              {/* Tombol Panel Guru */}
              <button
                onClick={() => setShowTeacherDashboard(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="Buka Penilaian Rubrik & Lencana"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Penilaian</span>
              </button>

              {/* Tombol Spin Giliran (Hanya di Guru) */}
              <button
                onClick={() => setTeacherGamePhase(teacherGamePhase === 'spin' ? 'board' : 'spin')}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                title="Sesi Putar Roda Giliran Kelompok"
              >
                <Dices className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden lg:inline">{teacherGamePhase === 'spin' ? 'Ke Papan' : 'Spin Giliran'}</span>
              </button>
            </>
          ) : (
            /* --- KONTROL NAVIGASI MURID (/) --- */
            <>
              {hasStudentSelectedTeam && (
                <>
                  {/* Tombol Ganti Kelompok */}
                  <button
                    onClick={() => setHasStudentSelectedTeam(false)}
                    className="flex items-center gap-1.5 bg-stone-100/90 hover:bg-stone-200/80 border border-stone-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 transition"
                    title="Ganti Kelompok"
                  >
                    <span>{selectedTeam.avatarIcon}</span>
                    <span className="hidden sm:inline">{selectedTeam.name}</span>
                    <RefreshCw className="w-3 h-3 text-stone-400 ml-0.5" />
                  </button>

                  {/* Pre-Test & Post-Test Terpisah */}
                  <button
                    onClick={() => setShowPrePostModal('pre')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm ${
                      selectedTeam.hasFinishedPreTest
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                    }`}
                  >
                    <FileQuestion className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Pre-Test</span>
                  </button>

                  <button
                    onClick={() => setShowPrePostModal('post')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm ${
                      selectedTeam.hasFinishedPostTest
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                    }`}
                  >
                    <FileQuestion className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">Post-Test</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* Tombol Klasemen Leaderboard */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm"
            title="Klasemen Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Klasemen</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      {isTeacherRoute ? (
        /* ================= KONTEN HALAMAN GURU (/teachers) ================= */
        teacherGamePhase === 'spin' ? (
          /* Sesi Spin di Layar Guru */
          <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
            <Suspense fallback={<div className="text-stone-400 text-xs py-8">Memuat Roda Putar...</div>}>
              <SpinWheel
                teams={teams}
                onComplete={handleSpinComplete}
                onAddTeam={handleAddTeam}
                onRemoveTeam={handleRemoveTeam}
                onResetDefaultTeams={handleResetToDefaultTeams}
              />
            </Suspense>
          </main>
        ) : (
          /* Sesi Papan Overview Kelas di Layar Guru */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 flex flex-col items-center justify-center p-0 lg:p-5 overflow-hidden relative h-full bg-[#1b9cb0] lg:bg-transparent">
              <GameBoard
                teams={teams}
                selectedTeamId={selectedTeamId}
                selectedTileId={inspectedTileId}
                onTileClick={handleTileClick}
                completedActivities={completedActivities}
                isTeacher={true}
              />
            </div>

            {/* Sidebar Guru: Overview Tim di Proyektor */}
            <div className="hidden lg:flex w-96 border-l border-stone-200/80 bg-white/70 p-5 flex-col justify-between overflow-y-auto space-y-4 flex-shrink-0 h-full">
              <div className="space-y-4">
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Pantauan {teams.length} Tim di Papan:
                    </span>
                    <button
                      onClick={handleAddTeam}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
                      title="Tambah Kelompok Baru"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Tim</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {teams.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTeamId(t.id);
                          setInspectedTileId(t.currentTile);
                        }}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          t.id === selectedTeamId
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-500'
                            : 'border-stone-100 bg-stone-50/50 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{t.avatarIcon}</span>
                          <span className="font-bold text-slate-800 truncate">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-stone-500">Petak #{t.currentTile}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {t.lkpdScore} pt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowTeacherDashboard(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Buka Panel Penilaian Lengkap</span>
                  </button>
                </div>

                {/* Detail Pemantauan Tim (Monitoring Only - Guru tidak mengontrol pion) */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="font-semibold text-stone-500">Tim yang Dipantau:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{selectedTeam.avatarIcon}</span>
                      <span>{selectedTeam.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Posisi Papan:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Petak #{selectedTeam.currentTile}
                    </span>
                  </div>

                  {inspectedActivity && (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Aktivitas di Petak #{inspectedTile.id}:</span>
                        <span className="text-emerald-700">{inspectedActivity.code}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {inspectedActivity.instruction}
                      </p>
                    </div>
                  )}

                  <div className="text-[11px] text-stone-400 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center gap-1.5 leading-snug">
                    <span>👁️</span>
                    <span>Monitoring: Pion digerakkan mandiri oleh siswa pada perangkat kelompok.</span>
                  </div>

                  <button
                    onClick={() => setShowTeacherDashboard(true)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Beri Nilai LKPD Tim Ini</span>
                  </button>
                </div>
              </div>

              {/* Footer Sidebar */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Skor LKPD Terkumpul:</span>
                  <span className="font-bold text-emerald-700">{selectedTeam.lkpdScore} / 72 pt</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Poin Lencana Kecepatan:</span>
                  <span className="font-bold text-amber-700">{selectedTeam.badgePoints} pt</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-bold text-slate-800">
                  <span>Total Poin:</span>
                  <span className="text-emerald-800 font-extrabold">
                    {selectedTeam.lkpdScore + selectedTeam.badgePoints} pt
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* ================= KONTEN HALAMAN MURID (/) ================= */
        !hasStudentSelectedTeam ? (
          /* Halaman Pemilihan Kelompok Murid Sebelum Masuk Papan */
          <main className="flex-1 overflow-y-auto flex items-center justify-center">
            <TeamSelectionScreen
              teams={teams}
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                setHasStudentSelectedTeam(true);
              }}
            />
          </main>
        ) : (
          /* Papan Permainan Murid (Fokus Kelompok) */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 flex flex-col items-center justify-center p-0 lg:p-5 overflow-hidden relative h-full bg-[#1b9cb0] lg:bg-transparent">
              <GameBoard
                teams={teams}
                selectedTeamId={selectedTeamId}
                selectedTileId={inspectedTileId}
                onTileClick={handleTileClick}
                completedActivities={completedActivities}
                isTeacher={false}
              />
            </div>

            {/* Sidebar Murid */}
            <div className="hidden lg:flex w-96 border-l border-stone-200/80 bg-white/70 p-5 flex-col justify-between overflow-y-auto space-y-4 flex-shrink-0 h-full">
              <div className="space-y-4">
                {/* Identitas & Posisi Kelompok Saya */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="font-semibold text-stone-500">Kelompok Anda:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{selectedTeam.avatarIcon}</span>
                      <span>{selectedTeam.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Posisi Papan:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Petak #{selectedTeam.currentTile}
                    </span>
                  </div>

                  {/* Navigasi Pion Siswa */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleJumpToNextActivity}
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Maju ke Aktivitas Berikutnya</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleMovePawn(-1)}
                        disabled={selectedTeam.currentTile <= 0}
                        className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Mundur</span>
                      </button>
                      <button
                        onClick={() => handleMovePawn(1)}
                        disabled={selectedTeam.currentTile >= 50}
                        className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40 transition"
                      >
                        <span>+1 Maju</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Petak Terpilih */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Detail Petak Terpilih
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      #{inspectedTile.id}
                    </span>
                  </div>

                  {inspectedActivity ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                            inspectedActivity.cardType === 'Challenge'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {inspectedActivity.cardType}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-800 leading-snug">
                        {getActivityTitle(inspectedActivity)}
                      </h3>
                      <p className="text-[11px] text-stone-600 line-clamp-3 leading-relaxed">
                        {inspectedActivity.instruction}
                      </p>

                      <button
                        onClick={() => setActiveActivity(inspectedActivity)}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 mt-1"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka Lembar Kerja (LKPD)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-stone-500">
                      <MapPin className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                      <p className="font-semibold text-slate-700">Petak Langkah Transisi</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Klik petak bertanda 🌿 (Challenge) atau 🐉 (Riddle) untuk mengerjakan LKPD.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rekapitulasi Skor Murid */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Skor LKPD Terkumpul:</span>
                  <span className="font-bold text-emerald-700">{selectedTeam.lkpdScore} / 72 pt</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Poin Lencana Kecepatan:</span>
                  <span className="font-bold text-amber-700">{selectedTeam.badgePoints} pt</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-bold text-slate-800">
                  <span>Total Poin:</span>
                  <span className="text-emerald-800 font-extrabold">
                    {selectedTeam.lkpdScore + selectedTeam.badgePoints} pt
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* 3. MOBILE SLIDE-UP BOTTOM SHEET (Hanya jika sedang di Papan) */}
      {((isTeacherRoute && teacherGamePhase === 'board') || (!isTeacherRoute && hasStudentSelectedTeam)) && (
        <div className="flex lg:hidden fixed bottom-0 inset-x-0 z-20 flex-col bg-white border-t border-stone-200/90 shadow-2xl rounded-t-3xl transition-all duration-300">
          <button
            onClick={() => setIsMobileSheetExpanded((prev) => !prev)}
            className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer text-stone-400 hover:text-stone-600"
          >
            <div className="w-12 h-1 bg-stone-300 rounded-full mb-1" />
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
              <span>{selectedTeam.avatarIcon} Posisi Pion: Petak #{selectedTeam.currentTile}</span>
              {isMobileSheetExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
          </button>

          <div className="px-4 py-2 flex items-center justify-between border-b border-stone-100">
            {isTeacherRoute ? (
              /* Guru Mobile Bar: Monitoring Only */
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{selectedTeam.avatarIcon}</span>
                  <span>{selectedTeam.name}</span>
                  <span className="text-emerald-700 font-bold ml-1">(Petak #{selectedTeam.currentTile})</span>
                </span>
                <button
                  onClick={() => setShowTeacherDashboard(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Panel Penilaian</span>
                </button>
              </div>
            ) : (
              /* Murid Mobile Bar: Kontrol Pion & LKPD */
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMovePawn(-1)}
                    disabled={selectedTeam.currentTile <= 0}
                    className="p-1.5 rounded-lg bg-stone-100 text-stone-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMovePawn(1)}
                    disabled={selectedTeam.currentTile >= 50}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 text-slate-700 font-bold text-xs flex items-center gap-1"
                  >
                    <span>+1</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleJumpToNextActivity}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Lompat</span>
                  </button>
                </div>

                {inspectedActivity && (
                  <button
                    onClick={() => setActiveActivity(inspectedActivity)}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-700 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buka LKPD</span>
                  </button>
                )}
              </>
            )}
          </div>

          {isMobileSheetExpanded && (
            <div className="p-3.5 sm:p-4 space-y-2 sm:space-y-2.5 max-h-56 overflow-y-auto bg-stone-50/50">
              <div className="flex items-center justify-between text-[11px] sm:text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px] sm:text-[10px]">
                    {inspectedActivity ? inspectedActivity.cardType : 'LANGKAH'}
                  </span>
                  <span>Petak #{inspectedTile.id}</span>
                </span>
              </div>

              {inspectedActivity ? (
                <>
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">
                    {getActivityTitle(inspectedActivity)}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 leading-relaxed line-clamp-3">
                    {inspectedActivity.instruction}
                  </p>
                  <button
                    onClick={() => setActiveActivity(inspectedActivity)}
                    className="w-full py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm mt-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buka Lembar Pengerjaan (LKPD) Lengkap</span>
                  </button>
                </>
              ) : (
                <p className="text-[11px] text-stone-500 py-1">
                  Petak langkah transisi. Sentuh petak 🌿 atau 🐉 pada papan.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODALS (Lazy Loaded on Demand) */}
      <Suspense fallback={null}>
        {/* 1. Activity Modal (LKPD Siswa) */}
        {activeActivity && (
          <ActivityModal
            activity={activeActivity}
            team={selectedTeam}
            onClose={() => setActiveActivity(null)}
            onSubmit={handleActivitySubmit}
            isBadgeTile={inspectedTile?.type === 'badge'}
          />
        )}

        {/* 2. Pre-Test / Post-Test Modal */}
        {showPrePostModal && (
          <PrePostTestModal
            type={showPrePostModal}
            team={selectedTeam}
            onClose={() => setShowPrePostModal(null)}
            onComplete={(_score) => {
              setTeams((prev) =>
                prev.map((t) =>
                  t.id === selectedTeamId
                    ? {
                        ...t,
                        hasFinishedPreTest: showPrePostModal === 'pre' ? true : t.hasFinishedPreTest,
                        hasFinishedPostTest: showPrePostModal === 'post' ? true : t.hasFinishedPostTest,
                      }
                    : t
                )
              );
            }}
          />
        )}

        {/* 3. Leaderboard Modal */}
        {showLeaderboard && (
          <LeaderboardModal
            teams={teams}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* 4. Teacher Dashboard Modal (Rubrik Penilaian & Lencana) */}
        {showTeacherDashboard && (
          <TeacherDashboardModal
            teams={teams}
            onUpdateScore={handleUpdateScore}
            onUpdateBadge={handleUpdateBadge}
            onResetGame={handleResetGame}
            onAddTeam={handleAddTeam}
            onRemoveTeam={handleRemoveTeam}
            onClose={() => setShowTeacherDashboard(false)}
            teamAnswers={teamAnswers}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
