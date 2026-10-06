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
import confetti from 'canvas-confetti';

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
      {/* Top Header Bar: Bersih, hanya nama guru dan aksi */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-stone-200/80 pb-3 gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs flex-shrink-0">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {teacherName || 'Ruang Tunggu Guru'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Buat sesi baru"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sesi Baru</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
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
              <span>Kelompok Terhubung ({teams.length})</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white/95 border border-stone-200/90 rounded-xl sm:rounded-2xl p-3 shadow-xs flex items-center justify-between text-left transition hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                    {team.avatarIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {team.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Siap</span>
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
        <div className="pt-2 sm:pt-3">
          <button
            onClick={() => {
              confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
              onStartGame();
            }}
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
