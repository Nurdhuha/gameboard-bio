import React, { useState } from 'react';
import { Team } from '../../types';
import {
  Play,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  LogOut,
  Monitor,
} from 'lucide-react';

interface TeacherLobbyScreenProps {
  roomCode: string;
  className?: string;
  academicYear?: string;
  teacherName?: string;
  teams: Team[];
  onStartGame: () => void;
  onAddTeam: () => void;
  onRemoveTeam: (id: number) => void;
  onLogout: () => void;
  onNewSession?: () => void;
}

export const TeacherLobbyScreen: React.FC<TeacherLobbyScreenProps> = ({
  roomCode,
  teacherName,
  teams,
  onStartGame,
  onAddTeam,
  onRemoveTeam,
  onLogout,
  onNewSession,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full w-full flex-1 flex flex-col justify-start p-3 sm:p-6 lg:p-8 bg-biology-pattern text-slate-800 space-y-4 sm:space-y-6">
      {/* Sub-Header Ringkas: Identitas Guru & Aksi Cepat (Terintegrasi rapi dengan Navbar Utama) */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-1 gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-700 text-white rounded-lg shadow-xs flex-shrink-0">
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-stone-600 truncate">
            Ruang Kelas: <strong className="text-slate-900 font-bold">{teacherName || 'Bapak/Ibu Guru'}</strong>
          </span>
        </div>

        {/* Action Buttons Cepat */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Buat sesi ruang kelas baru"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sesi Baru</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Keluar dari akun guru"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full max-w-3xl mx-auto py-2 sm:py-4 space-y-4 sm:space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Giant Class Code Box: Fokus utama */}
        <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm space-y-2 sm:space-y-3">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
            Kode Kelas
          </div>

          <div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider sm:tracking-widest text-emerald-950 font-mono select-all py-1 break-all">
            {roomCode}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Kode Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Team Roster Grid */}
        <div className="space-y-2.5 text-left">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-800">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                Kelompok Terhubung ({teams.filter((t) => t.isReady).length}/{teams.length} Siap)
              </span>
            </div>
            <button
              onClick={onAddTeam}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-emerald-800 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition shadow-xs hover:bg-emerald-50"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>+ Tim</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {teams.map((team, idx) => {
              const teamNum = Number(team.teamNumber) || (typeof team.id === 'number' ? team.id : idx + 1);
              const isReady = Boolean(team.isReady);

              return (
                <div
                  key={team.id || `lobby-team-${teamNum}`}
                  className={`bg-white/95 border rounded-xl sm:rounded-2xl p-3 shadow-xs flex items-center justify-between text-left transition hover:shadow-sm ${
                    isReady ? 'border-emerald-400/90 ring-1 ring-emerald-200/80' : 'border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                      {team.avatarIcon || '🐾'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {team.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5">
                        {isReady ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-700 font-bold">Siap</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-stone-300 inline-block" />
                            <span className="text-stone-400 font-medium">Menunggu Siswa</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {teams.length > 3 && (
                    <button
                      onClick={() => onRemoveTeam(team.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition ml-2 flex-shrink-0"
                      title="Hapus kelompok"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-2 sm:pt-3">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto min-w-[240px] px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Mulai Permainan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
