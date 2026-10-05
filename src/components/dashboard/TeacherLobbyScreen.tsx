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
  Clock,
  ShieldCheck,
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
    <div className="min-h-full w-full flex-1 flex flex-col justify-between p-4 sm:p-8 bg-biology-pattern text-slate-800">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-sm">
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{className}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {academicYear}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              {teacherName ? `Pendidik: ${teacherName}` : 'Panel Proyektor Ruang Kelas'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 text-emerald-800 hover:border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Buat sesi atau ganti rombongan belajar baru"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ganti Kelas / Sesi Baru</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Keluar dari sesi"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Projector Body */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6 sm:py-8 space-y-6 sm:space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Giant Class Code Box */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
            Kode Ruang Kelas
          </div>

          <div>
            <div className="text-6xl sm:text-7xl font-black tracking-widest text-emerald-950 font-mono select-all py-1">
              {roomCode}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
              Siswa membuka website Ecoplay di gawai masing-masing lalu memasukkan kode di atas.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95"
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
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Kelompok Terhubung ({teams.length} Kelompok Siap)</span>
            </div>
            <button
              onClick={() => {
                onAddTeam();
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition shadow-xs hover:bg-emerald-50"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tambah Kelompok</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className="bg-white/95 border border-stone-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between text-left transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl shadow-inner">
                    {team.avatarIcon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                      {team.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Siap di Ruang Tunggu</span>
                    </div>
                  </div>
                </div>

                {teams.length > 3 && (
                  <button
                    onClick={() => onRemoveTeam(team.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus kelompok"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-4">
          <button
            onClick={() => {
              confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
              onStartGame();
            }}
            className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2.5 mx-auto"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Mulai Permainan Kelas</span>
          </button>
          <p className="text-xs text-stone-400 mt-2">
            Papan permainan akan otomatis dibuka di seluruh gawai siswa yang terhubung.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs text-stone-400 border-t border-stone-200/80 pt-3">
        Ecoplay • Papan Permainan Ekosistem & E-LKPD Sains
      </div>
    </div>
  );
};
