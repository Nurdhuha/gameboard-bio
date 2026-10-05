import React, { useState, Suspense, lazy } from 'react';
import { Team } from '../../types';
import {
  Clock,
  Users,
  RefreshCw,
  BookOpen,
  Award,
  Compass,
  CheckCircle2,
} from 'lucide-react';

const GameRulesModal = lazy(() =>
  import('../modals/GameRulesModal').then((m) => ({ default: m.GameRulesModal }))
);

interface StudentWaitingLobbyProps {
  team: Team;
  roomCode?: string;
  className?: string;
  onChangeTeam: () => void;
}

export const StudentWaitingLobby: React.FC<StudentWaitingLobbyProps> = ({
  team,
  roomCode = 'ECO-CLASS',
  className = 'Kelas Biologi',
  onChangeTeam,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <div className="min-h-full w-full flex-1 flex flex-col items-center justify-between p-4 sm:p-6 bg-biology-pattern text-slate-800 select-none">
      {/* Top Header Badge */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs">
          <span>{className}</span>
          <span className="text-emerald-400">•</span>
          <span className="font-mono font-bold tracking-wider">{roomCode}</span>
        </div>

        <button
          onClick={onChangeTeam}
          className="text-xs text-stone-500 hover:text-slate-800 font-bold flex items-center gap-1 p-1.5 rounded-lg hover:bg-stone-100 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
          <span>Ganti Tim</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md my-auto py-4 space-y-4 text-center animate-in fade-in duration-200">
        {/* Selected Team Card */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-md space-y-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-stone-50 border-2 border-emerald-500 flex items-center justify-center text-4xl shadow-md mx-auto">
              {team.avatarIcon}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Kelompok Anda:
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {team.name}
            </h2>
          </div>

          {/* Animated Waiting Pulse */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5 text-left">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Menunggu Guru Memulai Permainan...</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kelompok Anda telah berhasil terhubung ke proyektor kelas. Harap perhatikan layar guru di depan. Begitu Bapak/Ibu Guru menekan tombol <strong>Mulai Permainan</strong>, layar HP ini akan <strong>otomatis terbuka</strong> ke papan permainan Ecoplay.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>Terhubung langsung ke sesi kelas Guru</span>
            </div>
          </div>
        </div>

        {/* Quick Guide Card */}
        <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-4 text-left space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              Sambil Menunggu, Cermati Alur Ini:
            </span>
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              <span>Aturan Lengkap</span>
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] sm:text-xs text-stone-600 leading-relaxed">
            <p>
              • <strong>4 Zona Belajar:</strong> Komponen Ekosistem ➔ Interaksi Makhluk Hidup ➔ Aliran Energi ➔ Jenis Ekosistem.
            </p>
            <p>
              • <strong>Perebutan Lencana:</strong> 3 kelompok tercepat di akhir setiap zona memperoleh bonus (+3, +2, +1 poin).
            </p>
            <p>
              • <strong>Skor LKPD:</strong> Setiap aktivitas akan dinilai langsung oleh Guru dengan skor rubrik 0 s.d. 3.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md text-center text-[11px] text-stone-400 pb-2">
        Tetap terhubung dan jangan tutup browser ini • Ecoplay v1.0
      </div>

      {/* Game Rules Modal */}
      {showRulesModal && (
        <Suspense fallback={null}>
          <GameRulesModal onClose={() => setShowRulesModal(false)} />
        </Suspense>
      )}
    </div>
  );
};
