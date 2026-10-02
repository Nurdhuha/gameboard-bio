import React from 'react';
import { Team } from '../../types';
import { ArrowRight, Users, Sparkles } from 'lucide-react';

interface TeamSelectionScreenProps {
  teams: Team[];
  onSelectTeam: (teamId: number) => void;
}

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({
  teams,
  onSelectTeam,
}) => {
  return (
    <div className="min-h-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#f8faf9] text-slate-800">
      <div className="w-full max-w-3xl space-y-6 text-center animate-fade-in">
        {/* Welcome Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Petualangan Ekosistem Ecoplay</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pilih Kelompok Anda
          </h2>
          <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto leading-relaxed">
            Silakan pilih identitas kelompokmu sebelum bergabung ke papan permainan dan mulai menyelesaikan aktivitas tantangan.
          </p>
        </div>

        {/* 6 Team Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2 text-left">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="group bg-white border border-stone-200/90 hover:border-emerald-600 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
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
          Urutan giliran telah ditentukan oleh guru melalui putaran spin. Pastikan perangkat kelompokmu memilih nama yang sesuai.
        </p>
      </div>
    </div>
  );
};
