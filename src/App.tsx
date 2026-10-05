import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
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
const GameRulesModal = lazy(() =>
  import('./components/modals/GameRulesModal').then((m) => ({ default: m.GameRulesModal }))
);
const LeaderboardModal = lazy(() =>
  import('./components/modals/LeaderboardModal').then((m) => ({ default: m.LeaderboardModal }))
);
const TeacherDashboardModal = lazy(() =>
  import('./components/dashboard/TeacherDashboardModal').then((m) => ({ default: m.TeacherDashboardModal }))
);
import { TeacherLoginScreen } from './components/auth/TeacherLoginScreen';
import { TeacherLobbyScreen } from './components/dashboard/TeacherLobbyScreen';
import { TeacherSessionCreator } from './components/dashboard/TeacherSessionCreator';
import { StudentWaitingLobby } from './components/student/StudentWaitingLobby';
import { getBackendUrl } from './config/api';
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  FastForward,
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
  Monitor,
  LogOut,
  LayoutDashboard,
  Loader2,
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

  // Status Autentikasi Guru (localStorage check)
  const [teacherAuth, setTeacherAuth] = useState<{ id: string; name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('ecoplay_teacher_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTeacherDemoMode, setIsTeacherDemoMode] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [showSessionCreator, setShowSessionCreator] = useState<boolean>(false);

  // Sesi Ruang Kelas Aktif
  const [activeSession, setActiveSession] = useState<{
    roomCode: string;
    className: string;
    academicYear: string;
  } | null>(() => {
    if (isTeacherRoute) {
      try {
        const saved = localStorage.getItem('ecoplay_teacher_active_session');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    try {
      const saved = sessionStorage.getItem('ecoplay_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // State untuk siswa bergabung ke ruang kelas
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);
  const [joinRoomError, setJoinRoomError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Status tampilan guru di /teachers: 'lobby' (ruang tunggu) | 'spin' (roda putar) | 'board' (papan kelas)
  const [teacherGamePhase, setTeacherGamePhase] = useState<'lobby' | 'spin' | 'board'>('lobby');

  // Status tampilan murid di /: 'lobby' (ruang tunggu siswa) | 'board' (papan kelas)
  const [studentGamePhase, setStudentGamePhase] = useState<'lobby' | 'board'>('lobby');

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
  const [showGameRules, setShowGameRules] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const inspectedTile = BOARD_TILES.find((t) => t.id === inspectedTileId) || BOARD_TILES[0];
  const inspectedActivity = inspectedTile.activityCode ? ACTIVITIES[inspectedTile.activityCode] : null;

  // Real-time WebSocket Synchronization via Socket.io
  useEffect(() => {
    if (!activeSession?.roomCode) return;

    const backendUrl = getBackendUrl();
    const socket: Socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.emit('session:join', {
      roomCode: activeSession.roomCode,
      role: isTeacherRoute ? 'teacher' : 'student',
      teamId: selectedTeamId ? String(selectedTeamId) : undefined,
    });

    socket.on('session:sync_state', ({ session, teams: serverTeams }) => {
      if (serverTeams && serverTeams.length > 0) {
        setTeams(serverTeams);
      }
      if (session?.phase && session.phase !== 'lobby') {
        setStudentGamePhase('board');
        setTeacherGamePhase(session.phase as any);
      }
    });

    // Otomatis buka papan permainan siswa saat guru menekan Mulai Permainan
    socket.on('game:started', ({ phase }) => {
      setStudentGamePhase('board');
      setTeacherGamePhase((phase as any) || 'spin');
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    });

    socket.on('phase:updated', ({ phase }) => {
      if (phase && phase !== 'lobby') {
        setStudentGamePhase('board');
      }
      setTeacherGamePhase(phase as any);
    });

    socket.on('pawn:moved', ({ teamId, targetTile }) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (String(t.id) === String(teamId) || String(t.teamNumber) === String(teamId)) {
            return { ...t, currentTile: targetTile };
          }
          return t;
        })
      );
    });

    socket.on('class:ended', ({ message }) => {
      alert(message || 'Sesi kelas telah diakhiri oleh Bapak/Ibu Guru.');
      setStudentGamePhase('lobby');
      setTeacherGamePhase('lobby');
      setHasStudentSelectedTeam(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeSession?.roomCode, isTeacherRoute, selectedTeamId]);

  // Polling Fallback: Memastikan siswa otomatis masuk ke papan meskipun WebSocket terputus
  useEffect(() => {
    if (isTeacherRoute || !activeSession?.roomCode || studentGamePhase !== 'lobby') return;
    const backendUrl = getBackendUrl();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/sessions/${encodeURIComponent(activeSession.roomCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.session) {
            if (data.session.phase && data.session.phase !== 'lobby') {
              setStudentGamePhase('board');
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
            if (data.teams && data.teams.length > 0) {
              setTeams(data.teams);
            }
          }
        }
      } catch {
        // silent fallback
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isTeacherRoute, activeSession?.roomCode, studentGamePhase]);

  // Siswa memasukkan kode kelas dan memvalidasi ke server backend
  const handleStudentJoinRoom = async (code: string) => {
    setJoinRoomError(null);
    setIsJoiningRoom(true);
    try {
      const backendUrl = getBackendUrl();
      const cleanCode = code.trim().toUpperCase();
      const res = await fetch(`${backendUrl}/api/sessions/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (res.ok && data.success && data.session) {
        const sessionData = {
          roomCode: data.session.roomCode || data.session.room_code || cleanCode,
          className: data.session.className || data.session.class_name || 'Kelas Ecoplay',
          academicYear: data.session.academicYear || data.session.academic_year || '2026/2027',
        };
        setActiveSession(sessionData);
        sessionStorage.setItem('ecoplay_student_session', JSON.stringify(sessionData));
        if (data.teams && data.teams.length > 0) {
          setTeams(data.teams);
        }
        if (data.session.phase && data.session.phase !== 'lobby') {
          setStudentGamePhase('board');
        } else {
          setStudentGamePhase('lobby');
        }
        return true;
      } else {
        setJoinRoomError(
          data.message || `Kode kelas "${cleanCode}" tidak ditemukan. Pastikan kode sesuai dengan yang ada di proyektor guru.`
        );
        return false;
      }
    } catch (err: any) {
      console.warn('Backend server unreachable during room join:', err);
      setJoinRoomError('Gagal menghubungi server backend. Pastikan server backend sudah aktif, atau pilih Mode Simulasi.');
      return false;
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Siswa memilih mode simulasi mandiri / offline
  const handleStudentDemoMode = () => {
    const demoSession = {
      roomCode: 'ECO-DEMO',
      className: 'Kelas Simulasi Standalone',
      academicYear: '2026/2027',
    };
    setActiveSession(demoSession);
    setJoinRoomError(null);
  };

  // Siswa mengganti kode kelas
  const handleChangeRoomCode = () => {
    setActiveSession(null);
    setHasStudentSelectedTeam(false);
    setStudentGamePhase('lobby');
    sessionStorage.removeItem('ecoplay_student_session');
  };

  // Handle selesai sesi spin di /teachers
  const handleSpinComplete = (orderedTeams: Team[]) => {
    setTeams(orderedTeams);
    setSelectedTeamId(orderedTeams[0].id);
    setTeacherGamePhase('board');
    setStudentGamePhase('board');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  // Guru memulai permainan dari ruang tunggu proyektor
  const handleTeacherStartGame = async () => {
    if (socketRef.current && activeSession?.roomCode) {
      socketRef.current.emit('game:start', { roomCode: activeSession.roomCode, initialPhase: 'spin' });
    }

    const token = localStorage.getItem('ecoplay_teacher_token');
    if (token && activeSession?.roomCode) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/sessions/${activeSession.roomCode}/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Backend start session request skipped or failed:', err);
      }
    }
    setTeacherGamePhase('spin');
    setStudentGamePhase('board');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  // Guru otomatis mengambil sesi aktif atau membuat sesi baru jika belum ada
  const fetchOrCreateTeacherSession = async (token?: string | null) => {
    const authToken = token || localStorage.getItem('ecoplay_teacher_token');
    if (!authToken) return;

    setIsLoadingSession(true);
    const backendUrl = getBackendUrl();

    try {
      // 1. Ambil daftar riwayat sesi kelas milik guru di Supabase
      const res = await fetch(`${backendUrl}/api/sessions/my/list`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      let currentSession: any = null;
      if (res.ok && data.success && Array.isArray(data.sessions)) {
        // Cari sesi yang statusnya masih aktif
        currentSession = data.sessions.find(
          (s: any) => s.isActive !== false && s.is_active !== false && s.phase !== 'ended'
        );
      }

      // 2. Jika belum ada sesi aktif, otomatis buatkan sesi baru di database Supabase!
      if (!currentSession) {
        const createRes = await fetch(`${backendUrl}/api/sessions/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            className: 'Kelas X Biologi & Sains',
            academicYear: '2026/2027',
          }),
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.success && createData.session) {
          currentSession = createData.session;
          if (createData.teams && createData.teams.length > 0) {
            setTeams(createData.teams);
          }
        }
      }

      // 3. Pasang sesi aktif ke state dan simpan agar siswa bisa bergabung
      if (currentSession) {
        const formatted = {
          roomCode: currentSession.roomCode || currentSession.room_code,
          className: currentSession.className || currentSession.class_name || 'Kelas X Biologi & Sains',
          academicYear: currentSession.academicYear || currentSession.academic_year || '2026/2027',
        };
        setActiveSession(formatted);
        localStorage.setItem('ecoplay_teacher_active_session', JSON.stringify(formatted));

        // Sinkronisasi data kelompok dari database Supabase
        try {
          const teamsRes = await fetch(`${backendUrl}/api/sessions/${encodeURIComponent(formatted.roomCode)}/teams`);
          const teamsData = await teamsRes.json();
          if (teamsRes.ok && teamsData.success && Array.isArray(teamsData.teams)) {
            setTeams(teamsData.teams);
          }
        } catch {
          // toleransi jika gagal ambil tim
        }

        setTeacherGamePhase('lobby');
        setShowSessionCreator(false);
      }
    } catch (err) {
      console.warn('Gagal memuat sesi aktif dari server:', err);
      if (!activeSession) {
        const fallbackSession = {
          roomCode: `ECO-${Math.floor(100 + Math.random() * 900)}`,
          className: 'Kelas X Biologi',
          academicYear: '2026/2027',
        };
        setActiveSession(fallbackSession);
        localStorage.setItem('ecoplay_teacher_active_session', JSON.stringify(fallbackSession));
        setTeacherGamePhase('lobby');
      }
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Otomatis sinkronisasi sesi kelas aktif saat halaman guru dibuka
  useEffect(() => {
    if (isTeacherRoute && teacherAuth && !isTeacherDemoMode) {
      fetchOrCreateTeacherSession();
    }
  }, [isTeacherRoute, teacherAuth?.id]);

  // Sinkronisasi data nama guru terkini langsung dari database Supabase
  useEffect(() => {
    if (!isTeacherRoute || isTeacherDemoMode) return;
    const token = localStorage.getItem('ecoplay_teacher_token');
    if (!token) return;

    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.teacher?.name) {
          setTeacherAuth(data.teacher);
          localStorage.setItem('ecoplay_teacher_profile', JSON.stringify(data.teacher));
        }
      })
      .catch((err) => console.warn('Gagal sinkronisasi data guru dari database:', err));
  }, [isTeacherRoute, isTeacherDemoMode]);

  // Guru membuat sesi kelas baru secara eksplisit
  const handleCreateSession = async (className: string, academicYear: string) => {
    let roomCode = `ECO-${Math.floor(100 + Math.random() * 900)}`;
    const token = localStorage.getItem('ecoplay_teacher_token');
    if (token) {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/sessions/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ className, academicYear }),
        });
        const data = await res.json();
        if (res.ok && data.success && (data.session?.roomCode || data.session?.room_code)) {
          roomCode = data.session.roomCode || data.session.room_code;
          if (data.teams && data.teams.length > 0) {
            setTeams(data.teams);
          }
        }
      } catch (err) {
        console.warn('Backend server not reachable, using local roomCode:', roomCode);
      }
    }
    const newSession = {
      roomCode,
      className,
      academicYear,
    };
    setActiveSession(newSession);
    localStorage.setItem('ecoplay_teacher_active_session', JSON.stringify(newSession));
    setShowSessionCreator(false);
    setTeacherGamePhase('lobby');
  };

  // Guru keluar dari akun / sesi kelas
  const handleTeacherLogout = () => {
    localStorage.removeItem('ecoplay_teacher_token');
    localStorage.removeItem('ecoplay_teacher_profile');
    localStorage.removeItem('ecoplay_teacher_active_session');
    setTeacherAuth(null);
    setIsTeacherDemoMode(false);
    setActiveSession(null);
    setShowSessionCreator(false);
    setTeacherGamePhase('lobby');
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

          if (socketRef.current && activeSession?.roomCode) {
            socketRef.current.emit('pawn:move', {
              roomCode: activeSession.roomCode,
              teamId: String(selectedTeamId),
              targetTile: nextTile,
              delta,
            });
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

  // Guru mereset permainan ke awal / mengakhiri kelas
  const handleResetGame = () => {
    setTeams(
      INITIAL_TEAMS.map((t) => ({
        ...t,
        currentTile: 0,
        badgePoints: 0,
        lkpdScore: 0,
        completedActivities: [],
      }))
    );
    setTeamAnswers({});
    setCompletedActivities([]);
    setTeacherGamePhase('lobby');
    setStudentGamePhase('lobby');
    setHasStudentSelectedTeam(false);
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

  // Kunci window scroll agar navbar atas di mobile tidak pernah terdorong keluar layar
  useEffect(() => {
    const handleScrollReset = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleScrollReset, { passive: true });
    window.addEventListener('focusout', handleScrollReset);
    return () => {
      window.removeEventListener('scroll', handleScrollReset);
      window.removeEventListener('focusout', handleScrollReset);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] bg-[#f8faf9] text-slate-800 flex flex-col font-sans select-none antialiased overflow-hidden">
      {/* 1. TOP NAVBAR (CALMING, MINIMALIST & CLEAN) */}
      <header className="sticky top-0 w-full h-14 sm:h-16 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-40 select-none">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-emerald-800">
            Ecoplay
          </h1>
          {isTeacherRoute && (
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Guru {activeSession ? `• ${activeSession.roomCode}` : ''}
            </span>
          )}
        </div>

        {/* RIGHT ACTIONS BERDASARKAN ROUTE */}
        <div className="flex items-center gap-2">
          {isTeacherRoute ? (
            /* --- KONTROL NAVIGASI GURU (/teachers) --- */
            <>
              {(!teacherAuth && !isTeacherDemoMode) || !activeSession ? (
                /* Di Layar Login / Buat Sesi: navbar minimalis */
                null
              ) : teacherGamePhase === 'lobby' ? (
                /* Di Layar Lobby Guru */
                <>
                  <button
                    onClick={handleTeacherLogout}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                    title="Keluar dari akun/sesi"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </>
              ) : (
                /* Di Sesi Papan / Spin Guru */
                <>
                  {/* Tombol Balik ke Lobby Kelas */}
                  <button
                    onClick={() => setTeacherGamePhase('lobby')}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                    title="Kembali ke Ruang Tunggu / Kode Kelas"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden lg:inline">Lobby ({activeSession?.roomCode})</span>
                  </button>

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
              )}
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
                </>
              )}
            </>
          )}

          {/* Tombol Aturan Permainan */}
          <button
            onClick={() => setShowGameRules(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm"
            title="Aturan Permainan"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Aturan</span>
          </button>

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
        !teacherAuth && !isTeacherDemoMode ? (
          /* 1. Layar Login & Registrasi Guru */
          <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
            <TeacherLoginScreen
              onLoginSuccess={(profile, token) => {
                setTeacherAuth(profile);
                setIsTeacherDemoMode(false);
                fetchOrCreateTeacherSession(token);
              }}
            />
          </main>
        ) : isLoadingSession ? (
          /* Layar Loading Pengambilan / Pembuatan Kode Kelas */
          <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 space-y-2">
            <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
            <p className="text-xs font-semibold text-stone-500">Menyiapkan ruang kelas...</p>
          </main>
        ) : showSessionCreator ? (
          /* 2. Layar Pembuatan Sesi Ruang Kelas Baru (jika guru ingin ganti kelas) */
          <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
            <TeacherSessionCreator
              teacherName={teacherAuth?.name}
              onCreateSession={handleCreateSession}
              onLogout={handleTeacherLogout}
              onCancel={activeSession ? () => setShowSessionCreator(false) : undefined}
            />
          </main>
        ) : activeSession && teacherGamePhase === 'lobby' ? (
          /* 3. Layar Ruang Tunggu Guru (Proyektor) - KODE KELAS TAMPIL LANGSUNG! */
          <main className="flex-1 overflow-y-auto flex flex-col">
            <TeacherLobbyScreen
              roomCode={activeSession.roomCode}
              className={activeSession.className}
              academicYear={activeSession.academicYear}
              teacherName={teacherAuth?.name}
              teams={teams}
              onStartGame={handleTeacherStartGame}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
              onLogout={handleTeacherLogout}
              onNewSession={() => setShowSessionCreator(true)}
            />
          </main>
        ) : !activeSession ? (
          /* Fallback jika belum ada sesi dan tidak sedang loading */
          <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
            <TeacherSessionCreator
              teacherName={teacherAuth?.name}
              onCreateSession={handleCreateSession}
              onLogout={handleTeacherLogout}
            />
          </main>
        ) : teacherGamePhase === 'spin' ? (
          /* 4. Sesi Spin Roda Giliran di Layar Guru */
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
          /* 5. Sesi Papan Overview Kelas di Layar Guru */
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
          /* 1. Halaman Input Kode Kelas & Pemilihan Kelompok Murid */
          <main className="flex-1 overflow-y-auto flex flex-col">
            <TeamSelectionScreen
              teams={teams}
              roomCode={activeSession?.roomCode}
              className={activeSession?.className}
              onJoinRoomCode={handleStudentJoinRoom}
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                setHasStudentSelectedTeam(true);
              }}
              onChangeRoomCode={handleChangeRoomCode}
              onUseDemoMode={handleStudentDemoMode}
              isLoading={isJoiningRoom}
              error={joinRoomError}
            />
          </main>
        ) : studentGamePhase === 'lobby' ? (
          /* 2. Ruang Tunggu Siswa Menunggu Guru Memulai Sesi */
          <main className="flex-1 overflow-y-auto flex flex-col">
            <StudentWaitingLobby
              team={selectedTeam}
              roomCode={activeSession?.roomCode || 'ECO-729'}
              className={activeSession?.className || 'Kelas Biologi'}
              onChangeTeam={() => setHasStudentSelectedTeam(false)}
            />
          </main>
        ) : (
          /* 3. Papan Permainan Murid (Fokus Kelompok) */
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
            className="w-full pt-3 pb-1.5 flex flex-col items-center justify-center cursor-pointer text-stone-400 hover:text-stone-600"
          >
            <div className="w-12 h-1 bg-stone-300 rounded-full mb-1.5" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600">
              <span>{selectedTeam.avatarIcon} Posisi Pion: Petak #{selectedTeam.currentTile}</span>
              {isMobileSheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </button>

          <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-100">
            {isTeacherRoute ? (
              /* Guru Mobile Bar: Monitoring Only */
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{selectedTeam.avatarIcon}</span>
                  <span>{selectedTeam.name}</span>
                  <span className="text-emerald-700 font-bold ml-1">(Petak #{selectedTeam.currentTile})</span>
                </span>
                <button
                  onClick={() => setShowTeacherDashboard(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Panel Penilaian</span>
                </button>
              </div>
            ) : (
              /* Murid Mobile Bar: Kontrol Pion & LKPD */
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMovePawn(-1)}
                    disabled={selectedTeam.currentTile <= 0}
                    className="p-2 rounded-xl bg-stone-100 text-stone-600 disabled:opacity-40"
                    title="Mundur 1 Petak"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMovePawn(1)}
                    disabled={selectedTeam.currentTile >= 50}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1 transition"
                  >
                    <span>+1</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleJumpToNextActivity}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-1 transition"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Lompat</span>
                  </button>
                </div>

                {inspectedActivity && (
                  <button
                    onClick={() => setActiveActivity(inspectedActivity)}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buka LKPD</span>
                  </button>
                )}
              </>
            )}
          </div>

          {isMobileSheetExpanded && (
            <div className="p-4 space-y-2.5 max-h-60 overflow-y-auto bg-stone-50/50">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] sm:text-xs">
                    {inspectedActivity ? inspectedActivity.cardType : 'LANGKAH'}
                  </span>
                  <span>Petak #{inspectedTile.id}</span>
                </span>
              </div>

              {inspectedActivity ? (
                <>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {getActivityTitle(inspectedActivity)}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {inspectedActivity.instruction}
                  </p>
                  <button
                    onClick={() => setActiveActivity(inspectedActivity)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm mt-1.5 active:scale-95 transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buka Lembar Pengerjaan (LKPD) Lengkap</span>
                  </button>
                </>
              ) : (
                <p className="text-xs sm:text-sm text-stone-500 py-1">
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
            previousAnswers={teamAnswers[selectedTeamId] || {}}
          />
        )}

        {/* 2. Modal Aturan Permainan */}
        {showGameRules && (
          <GameRulesModal onClose={() => setShowGameRules(false)} />
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
