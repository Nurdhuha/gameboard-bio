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
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeacherLobbyScreenProps {
  roomCode: string;
  className: string;
  academicYear: string;
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
  className,
  academicYear,
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
    <div className="min-h-full w-full flex-1 flex flex-col justify-start sm:justify-between p-3 sm:p-6 lg:p-8 bg-biology-pattern text-slate-800 space-y-4 sm:space-y-6">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 pb-3 sm:pb-4 gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-2.5 bg-emerald-700 text-white rounded-xl sm:rounded-2xl shadow-xs flex-shrink-0">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                {className}
              </h1>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex-shrink-0">
                {academicYear}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-medium truncate mt-0.5">
              {teacherName ? `Pendidik: ${teacherName}` : 'Panel Proyektor Ruang Kelas'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 text-emerald-800 hover:border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Ganti sesi kelas baru"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ganti Sesi</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Keluar dari sesi"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Projector Body */}
      <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 space-y-4 sm:space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Giant Class Code Box */}
        <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm space-y-2.5 sm:space-y-3">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
            Kode Ruang Kelas
          </div>

          <div>
            <div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider sm:tracking-widest text-emerald-950 font-mono select-all py-1 break-all">
              {roomCode}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 sm:mt-2 max-w-md mx-auto leading-relaxed">
              Siswa membuka website Ecoplay di gawai masing-masing lalu memasukkan kode di atas.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition active:scale-95 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Kode Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Salin Kode Kelas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Team Roster Grid */}
        <div className="space-y-2.5 sm:space-y-3 text-left">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-800">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
              <span>Kelompok Terhubung ({teams.length} Siap)</span>
            </div>
            <button
              onClick={() => {
                onAddTeam();
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
              }}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-emerald-800 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition shadow-xs hover:bg-emerald-50"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>+ Tim</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white/95 border border-stone-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between text-left transition hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-xl sm:text-2xl shadow-inner flex-shrink-0">
                    {team.avatarIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {team.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Siap di Ruang Tunggu</span>
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
            ))}
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-2 sm:pt-4">
          <button
            onClick={() => {
              confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
              onStartGame();
            }}
            className="w-full sm:w-auto min-w-[260px] sm:min-w-[280px] px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span>Mulai Permainan Kelas</span>
          </button>
          <p className="text-[11px] sm:text-xs text-stone-500 mt-1.5">
            Papan permainan akan otomatis dibuka di seluruh gawai siswa.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-[10px] sm:text-xs text-stone-400 border-t border-stone-200/80 pt-2 sm:pt-3 pb-4 sm:pb-0">
        Ecoplay • Papan Permainan Ekosistem & E-LKPD Sains
      </div>
    </div>
  );
};
