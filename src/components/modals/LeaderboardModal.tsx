import React from 'react';
import { Team } from '../../types';
import { X, Trophy } from 'lucide-react';

interface LeaderboardModalProps {
  teams: Team[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ teams, onClose }) => {
  const sortedTeams = [...teams].sort((a, b) => {
    const totalA = a.lkpdScore + a.badgePoints;
    const totalB = b.lkpdScore + b.badgePoints;
    return totalB - totalA;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-stone-200/90 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[88vh] text-slate-800">
        {/* Header (Calming Warm Amber) */}
        <div className="p-4 sm:p-5 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100/80 text-amber-700 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-amber-950">🏆 Klasemen Kelas</h3>
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                Peringkat Total (Skor LKPD + Poin Lencana)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-stone-500 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Teams */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
          {sortedTeams.map((team, index) => {
            const totalScore = team.lkpdScore + team.badgePoints;
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={team.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isFirst
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                    : isSecond
                    ? 'bg-stone-50/80 border-stone-200'
                    : isThird
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-white border-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm ${
                      isFirst
                        ? 'bg-amber-500 text-white shadow-sm'
                        : isSecond
                        ? 'bg-stone-400 text-white'
                        : isThird
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${index + 1}`}
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{team.avatarIcon}</span>
                      <span>{team.name}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-stone-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                      <span>Petak #{team.currentTile}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">Lencana: +{team.badgePoints}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">LKPD: {team.lkpdScore}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg sm:text-xl font-extrabold text-slate-800 font-mono">
                    {totalScore}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase font-bold text-stone-400">Total Poin</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between flex-shrink-0 text-xs sm:text-sm text-stone-600">
          <span>Maks: 72 LKPD + 12 Lencana = 84 Poin</span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl transition shadow-sm active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
