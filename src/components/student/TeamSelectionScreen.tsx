import React, { useState } from 'react';
import { Team } from '../../types';
import { ArrowRight, KeyRound, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface TeamSelectionScreenProps {
  teams: Team[];
  roomCode?: string | null;
  className?: string | null;
  onJoinRoomCode: (code: string) => Promise<boolean | void>;
  onSelectTeam: (teamId: number) => void;
  onChangeRoomCode?: () => void;
  onUseDemoMode?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({
  teams,
  roomCode,
  className,
  onJoinRoomCode,
  onSelectTeam,
  onChangeRoomCode,
  onUseDemoMode,
  isLoading = false,
  error = null,
}) => {
  const [inputCode, setInputCode] = useState('');

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    await onJoinRoomCode(inputCode.trim().toUpperCase());
  };

  // 1. TAMPILAN JIKA BELUM MEMASUKKAN KODE KELAS
  if (!roomCode) {
    return (
      <div className="min-h-full w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-biology-pattern text-slate-800">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Masukkan Kode Kelas
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              Ketik kode kelas yang ditampilkan guru di layar proyektor.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form Input Kode Kelas */}
          <form onSubmit={handleApplyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                Kode Ruang Kelas:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: ECO-729"
                  maxLength={12}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-stone-300 text-center font-mono font-black text-xl sm:text-2xl tracking-widest uppercase focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition shadow-inner placeholder:text-stone-300 placeholder:font-normal placeholder:text-base placeholder:tracking-normal"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputCode.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Kode Kelas...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk ke Kelas</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Opsi Offline / Simulasi */}
          {onUseDemoMode && (
            <div className="pt-2 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={onUseDemoMode}
                className="text-xs text-stone-400 hover:text-stone-600 font-medium hover:underline transition"
              >
                Masuk Mode Simulasi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. TAMPILAN PILIH KELOMPOK (SETELAH KODE VALID)
  return (
    <div className="min-h-full w-full flex-1 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 pt-6 sm:pt-8 pb-12 bg-biology-pattern text-slate-800">
      <div className="w-full max-w-3xl space-y-6 text-center animate-fade-in">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pilih Kelompok Anda
          </h2>

          {/* Active Class Code & Class Name Badge */}
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white border border-stone-200 shadow-xs text-xs font-bold text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kode Kelas:</span>
              <span className="font-mono text-emerald-800 tracking-wider font-black">{roomCode}</span>
            </div>

            {onChangeRoomCode && (
              <button
                type="button"
                onClick={onChangeRoomCode}
                className="px-3 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-slate-900 text-xs font-bold transition shadow-2xs flex items-center gap-1"
                title="Ganti kode kelas"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ganti Kode</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Silakan pilih identitas kelompokmu sebelum bergabung ke papan permainan dan mulai menyelesaikan aktivitas tantangan.
          </p>
        </div>

        {/* Team Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2 text-left">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="group bg-white border border-stone-200/90 hover:border-emerald-600 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-0.5 active:scale-98"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner">
                  {team.avatarIcon}
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
                  Giliran #{idx + 1}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                  {team.name}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Posisi saat ini: <span className="font-semibold text-stone-700">Petak #{team.currentTile}</span>
                </p>
              </div>

              <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Pilih Kelompok</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer info note */}
        <p className="text-xs text-stone-500">
          Pastikan perangkat kelompokmu memilih nama hewan yang sesuai dengan kesepakatan pembagian kelompok kelas.
        </p>
      </div>
    </div>
  );
};
