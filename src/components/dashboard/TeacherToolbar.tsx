import React from 'react';
import { Team } from '../../types';
import {
  Users,
  Dices,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Trophy,
  FileQuestion,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react';

interface TeacherToolbarProps {
  teams: Team[];
  selectedTeamId: number;
  onSelectTeam: (id: number) => void;
  activeMeeting: number;
  onChangeMeeting: (meeting: number) => void;
  onMovePawn: (delta: number) => void;
  onJumpToNextActivity: () => void;
  onOpenTest: (type: 'pre' | 'post') => void;
  onOpenLeaderboard: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
}

export const TeacherToolbar: React.FC<TeacherToolbarProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  activeMeeting,
  onChangeMeeting,
  onMovePawn,
  onJumpToNextActivity,
  onOpenTest,
  onOpenLeaderboard,
  isMobilePreview,
  onToggleMobilePreview,
}) => {
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-2.5 sm:p-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Team Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:flex items-center gap-1.5 mr-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Tim:
          </div>
          <div className="flex gap-1.5">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  team.id === selectedTeamId
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{team.avatarIcon}</span>
                <span className="hidden sm:inline">Kel. {team.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Movement & Gamepad Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onMovePawn(-1)}
            disabled={selectedTeam.currentTile <= 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            title="Mundur 1 Petak"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onMovePawn(1)}
            disabled={selectedTeam.currentTile >= 50}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition"
            title="Maju 1 Petak"
          >
            <span>+1 Petak</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onJumpToNextActivity}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition active:scale-95"
            title="Loncat ke Petak Aktivitas Berikutnya (Sesuai Aturan Game)"
          >
            <FastForward className="w-4 h-4" />
            <span className="hidden sm:inline">Lompat Aktivitas</span>
          </button>
        </div>

        {/* Right: Meeting Selector & Modal Triggers */}
        <div className="flex items-center gap-2">
          {/* Meeting Selector */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
            <span className="text-[11px] font-bold text-slate-400 px-2 hidden md:inline">Sesi:</span>
            {[1, 2, 3].map((m) => (
              <button
                key={m}
                onClick={() => onChangeMeeting(m)}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
                  activeMeeting === m
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                P{m}
              </button>
            ))}
          </div>

          {/* Pre/Post Test Triggers */}
          <button
            onClick={() => onOpenTest(activeMeeting === 1 ? 'pre' : 'post')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            title="Buka Pre-Test / Post-Test"
          >
            <FileQuestion className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">{activeMeeting === 1 ? 'Pre-Test' : 'Post-Test'}</span>
          </button>

          {/* Leaderboard Trigger */}
          <button
            onClick={onOpenLeaderboard}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition"
            title="Lihat Klasemen Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Klasemen</span>
          </button>

          {/* Mobile Preview Toggle */}
          <button
            onClick={onToggleMobilePreview}
            className={`p-2 rounded-xl transition ${
              isMobilePreview
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Simulasi Tampilan Smartphone (Mobile View)"
          >
            {isMobilePreview ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
