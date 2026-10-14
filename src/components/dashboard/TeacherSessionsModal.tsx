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
  AlertCircle,
  FolderOpen,
  LogIn,
  Trash2,
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
  onReLogin?: () => void;
  onDeleteActiveSession?: () => void;
  teacherName?: string;
  isDemoMode?: boolean;
}

export const TeacherSessionsModal: React.FC<TeacherSessionsModalProps> = ({
  isOpen,
  onClose,
  currentRoomCode,
  onSelectSession,
  onNewSession,
  onReLogin,
  onDeleteActiveSession,
  teacherName,
  isDemoMode = false,
}) => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // State untuk konfirmasi hapus sesi
  const [sessionToDelete, setSessionToDelete] = useState<SessionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    // Ambil sesi lokal yang tersimpan sebagai fallback instan
    const getLocalFallback = (): SessionItem[] => {
      const savedSessionRaw = localStorage.getItem('ecoplay_teacher_active_session');
      if (savedSessionRaw) {
        try {
          const parsed = JSON.parse(savedSessionRaw);
          return [
            {
              id: 'local-1',
              roomCode: parsed.roomCode ? String(parsed.roomCode).replace(/-/g, '') : 'ECO897',
              className: parsed.className || 'Kelas Biologi',
              academicYear: parsed.academicYear || '2026/2027',
              phase: 'lobby',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ];
        } catch {}
      }
      return [
        {
          id: 'demo-1',
          roomCode: currentRoomCode ? String(currentRoomCode).replace(/-/g, '') : 'ECODEMO',
          className: 'Kelas Simulasi Biologi',
          academicYear: '2026/2027',
          phase: 'lobby',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
    };

    // Jika mode demo / simulasi tanpa token backend
    if (isDemoMode) {
      setSessions(getLocalFallback());
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('ecoplay_teacher_token');
    if (!token) {
      setSessions(getLocalFallback());
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
        if (res.status === 401 || res.status === 403) {
          setError('Sesi autentikasi telah berakhir. Silakan login kembali untuk menyinkronkan data.');
        } else {
          setError(data.message || 'Gagal mengambil riwayat sesi kelas.');
        }
        setSessions(getLocalFallback());
      }
    } catch (err: any) {
      console.warn('Gagal memuat sesi dari backend:', err);
      setError('Koneksi ke server terputus. Menampilkan data lokal.');
      setSessions(getLocalFallback());
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
    const cleanCode = String(code).replace(/-/g, '');
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(cleanCode);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleDeleteSession = async (session: SessionItem) => {
    setIsDeleting(true);
    const cleanCode = String(session.roomCode).replace(/-/g, '');
    const token = localStorage.getItem('ecoplay_teacher_token');

    try {
      if (token && !isDemoMode) {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/sessions/${encodeURIComponent(cleanCode)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Hapus dari state daftar sesi
      const remainingSessions = sessions.filter((s) => String(s.roomCode).replace(/-/g, '') !== cleanCode);
      setSessions(remainingSessions);

      // Jika menghapus sesi maka akan otomatis membuka sesi yang terakhir dibuat
      if (remainingSessions.length > 0) {
        // Urutkan untuk memastikan sesi dengan waktu pembuatan terbaru berada di posisi pertama
        const sortedRemaining = [...remainingSessions].sort((a, b) => {
          const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
          const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
          return timeB - timeA;
        });

        const latestSession = sortedRemaining[0];
        onSelectSession({
          ...latestSession,
          roomCode: String(latestSession.roomCode).replace(/-/g, ''),
        });
      } else {
        // Jika seluruh sesi telah dihapus dan tidak ada sesi tersisa
        if (onDeleteActiveSession) {
          onDeleteActiveSession();
        }
      }

      setSessionToDelete(null);
    } catch (err) {
      console.warn('Gagal menghapus sesi:', err);
    } finally {
      setIsDeleting(false);
    }
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
      <div className="relative bg-white border border-stone-200/90 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                {teacherName ? `Akun: ${teacherName} • ` : ''}Kelola, beralih, atau hapus sesi kelas Anda
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

        {/* NOTIFIKASI ERROR / LOGIN ULANG JIKA KEDALUWARSA */}
        {error && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            {onReLogin && (
              <button
                onClick={() => {
                  onClose();
                  onReLogin();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center gap-1 flex-shrink-0 transition shadow-2xs"
              >
                <LogIn className="w-3 h-3" />
                <span>Login Ulang</span>
              </button>
            )}
          </div>
        )}

        {/* SESSIONS LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-[#fcfdfd]">
          {isLoading && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-stone-600">Memuat riwayat sesi kelas...</p>
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
                const cleanRoomCode = String(session.roomCode || '').replace(/-/g, '');
                const cleanCurrentRoomCode = String(currentRoomCode || '').replace(/-/g, '');
                const isCurrent = cleanRoomCode === cleanCurrentRoomCode;
                const dateText = formatDate(session.createdAt || session.created_at);
                const isEnded = session.phase === 'ended' || session.isActive === false || session.is_active === false;

                return (
                  <div
                    key={session.id || session.roomCode || idx}
                    onClick={() => {
                      if (!isCurrent) {
                        onSelectSession({ ...session, roomCode: cleanRoomCode });
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

                    {/* KODE RUANG, AKSI BERALIH, & TOMBOL HAPUS */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Code Badge with Copy */}
                      <button
                        onClick={(e) => handleCopy(cleanRoomCode, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-mono text-xs font-bold transition active:scale-95"
                        title="Salin Kode Kelas"
                      >
                        <span>{cleanRoomCode}</span>
                        {copiedCode === cleanRoomCode ? (
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
                            onSelectSession({ ...session, roomCode: cleanRoomCode });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white group-hover:bg-emerald-700 group-hover:text-white border border-stone-300 group-hover:border-emerald-700 text-slate-700 text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95"
                        >
                          <span>Buka Sesi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Tombol Hapus Sesi */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title="Hapus sesi kelas ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            Klik <strong>"Buka Sesi"</strong> untuk berpindah mengajar, atau ikon tempat sampah untuk menghapus sesi.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold transition"
          >
            Tutup
          </button>
        </div>

        {/* DIALOG KONFIRMASI HAPUS SESI KELAS */}
        {sessionToDelete && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm sm:max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Kode Sesi Kelas?
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus sesi <strong>{sessionToDelete.className}</strong> dengan kode <code className="font-mono font-bold text-slate-800 bg-stone-100 px-1.5 py-0.5 rounded">{String(sessionToDelete.roomCode).replace(/-/g, '')}</code>?
                </p>
                <p className="text-[11px] text-rose-600 font-medium pt-1">
                  Seluruh data kelompok, skor, dan jawaban LKPD pada sesi ini akan dihapus permanen.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteSession(sessionToDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Sesi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
