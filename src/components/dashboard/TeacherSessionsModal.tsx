import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Check,
  Copy,
  ChevronRight,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { getBackendUrl } from '../../config/api';

export interface SessionItem {
  id?: string | number;
  roomCode: string;
  className: string;
  academicYear?: string;
  phase?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  endedAt?: string;
  ended_at?: string;
}

interface TeacherSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomCode?: string;
  onSelectSession: (session: SessionItem) => void;
  onNewSession: () => void;
  teacherName?: string;
  isDemoMode?: boolean;
}

export const TeacherSessionsModal: React.FC<TeacherSessionsModalProps> = ({
  isOpen,
  onClose,
  currentRoomCode,
  onSelectSession,
  onNewSession,
  teacherName,
  isDemoMode = false,
}) => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    // Jika mode demo / simulasi tanpa token backend
    if (isDemoMode) {
      const savedSessionRaw = localStorage.getItem('ecoplay_teacher_active_session');
      let fallbackSessions: SessionItem[] = [];
      if (savedSessionRaw) {
        try {
          const parsed = JSON.parse(savedSessionRaw);
          fallbackSessions.push({
            id: 'demo-1',
            roomCode: parsed.roomCode || 'ECO-DEMO',
            className: parsed.className || 'Kelas Simulasi Biologi',
            academicYear: parsed.academicYear || '2026/2027',
            phase: 'lobby',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        } catch {}
      }
      if (fallbackSessions.length === 0) {
        fallbackSessions = [
          {
            id: 'demo-1',
            roomCode: currentRoomCode || 'ECO-DEMO',
            className: 'Kelas Simulasi Biologi',
            academicYear: '2026/2027',
            phase: 'lobby',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      setSessions(fallbackSessions);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('ecoplay_teacher_token');
    if (!token) {
      // Fallback dari session lokal jika tidak ada token
      const savedSessionRaw = localStorage.getItem('ecoplay_teacher_active_session');
      if (savedSessionRaw) {
        try {
          const parsed = JSON.parse(savedSessionRaw);
          setSessions([
            {
              id: 'local-1',
              roomCode: parsed.roomCode,
              className: parsed.className || 'Kelas Biologi',
              academicYear: parsed.academicYear || '2026/2027',
              phase: 'lobby',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ]);
        } catch {}
      }
      setIsLoading(false);
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/sessions/my/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      } else {
        setError(data.message || 'Gagal mengambil riwayat sesi kelas.');
      }
    } catch (err: any) {
      console.warn('Gagal memuat sesi dari backend:', err);
      setError('Koneksi ke server terputus. Menampilkan data lokal.');
      const savedSessionRaw = localStorage.getItem('ecoplay_teacher_active_session');
      if (savedSessionRaw) {
        try {
          const parsed = JSON.parse(savedSessionRaw);
          setSessions([
            {
              id: 'local-1',
              roomCode: parsed.roomCode,
              className: parsed.className || 'Kelas Biologi',
              academicYear: parsed.academicYear || '2026/2027',
              phase: 'lobby',
              isActive: true,
            },
          ]);
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.className?.toLowerCase().includes(q) ||
      s.roomCode?.toLowerCase().includes(q) ||
      s.academicYear?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Semua Sesi Kelas Guru
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex-shrink-0">
                  {sessions.length} Sesi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {teacherName ? `Akun: ${teacherName} • ` : ''}Pilih sesi untuk beralih atau lihat kode kelas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & QUICK ACTION BAR */}
        <div className="p-3 sm:px-5 sm:py-3.5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kelas, tahun ajaran, atau kode ruang..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              title="Perbarui data sesi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNewSession();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
              title="Buat ruang kelas baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sesi Baru</span>
            </button>
          </div>
        </div>

        {/* SESSIONS LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-[#fcfdfd]">
          {isLoading && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-stone-600">Memuat riwayat sesi kelas...</p>
            </div>
          ) : error && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{error}</p>
              <button
                onClick={fetchSessions}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-xs"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {searchQuery ? 'Tidak ada sesi yang cocok dengan pencarian' : 'Belum Ada Riwayat Sesi'}
              </p>
              <p className="text-xs text-stone-500 max-w-sm">
                {searchQuery
                  ? 'Coba gunakan kata kunci lain untuk nama kelas atau kode ruang.'
                  : 'Klik tombol "Sesi Baru" di atas untuk membuat ruang kelas biologi pertama Anda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredSessions.map((session, idx) => {
                const isCurrent = session.roomCode === currentRoomCode;
                const dateText = formatDate(session.createdAt || session.created_at);
                const isEnded = session.phase === 'ended' || session.isActive === false || session.is_active === false;

                return (
                  <div
                    key={session.id || session.roomCode || idx}
                    onClick={() => {
                      if (!isCurrent) {
                        onSelectSession(session);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/50 shadow-xs'
                        : 'bg-white hover:bg-stone-50/90 border-stone-200/90 hover:border-emerald-300 shadow-xs cursor-pointer group'
                    }`}
                  >
                    {/* INFO UTAMA */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {session.className || 'Kelas Biologi'}
                        </h3>

                        {isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Sedang Dibuka
                          </span>
                        ) : isEnded ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            Telah Berakhir
                          </span>
                        ) : session.phase === 'board' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Papan Permainan
                          </span>
                        ) : session.phase === 'spin' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Fase Spin
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            Ruang Tunggu
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                        {session.academicYear && (
                          <span className="flex items-center gap-1 font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                            TA {session.academicYear}
                          </span>
                        )}

                        {dateText && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {dateText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* KODE RUANG & AKSI BERALIH */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Code Badge with Copy */}
                      <button
                        onClick={(e) => handleCopy(session.roomCode, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-mono text-xs font-bold transition active:scale-95"
                        title="Salin Kode Kelas"
                      >
                        <span>{session.roomCode}</span>
                        {copiedCode === session.roomCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-stone-400" />
                        )}
                      </button>

                      {/* Tombol Aksi Beralih */}
                      {isCurrent ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-100/70 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSession(session);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white group-hover:bg-emerald-700 group-hover:text-white border border-stone-300 group-hover:border-emerald-700 text-slate-700 text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95"
                        >
                          <span>Buka Sesi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 flex-shrink-0">
          <span>
            Klik <strong>"Buka Sesi"</strong> untuk berpindah mengajar ke rombongan belajar lain.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
