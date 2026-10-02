import React, { useRef } from 'react';
import { TileData, Team } from '../../types';
import { BOARD_TILES, ACTIVITIES } from '../../data/boardData';
import { Sparkles, Trophy, Flag, BookOpen } from 'lucide-react';

interface MobileBoardProps {
  teams: Team[];
  selectedTeamId: number;
  selectedTileId: number | null;
  onTileClick: (tile: TileData) => void;
  completedActivities: string[];
  activeMeeting: number;
}

export const MobileBoard: React.FC<MobileBoardProps> = ({
  teams,
  selectedTeamId,
  selectedTileId,
  onTileClick,
  completedActivities,
  activeMeeting,
}) => {
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const zoneRefs = {
    1: useRef<HTMLDivElement>(null),
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
    4: useRef<HTMLDivElement>(null),
  };

  const scrollToZone = (zoneId: 1 | 2 | 3 | 4) => {
    zoneRefs[zoneId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Kelompokkan petak per zona
  const zones = [
    {
      id: 1 as const,
      name: 'Zona 1: Komponen Ekosistem',
      meeting: 'Pertemuan 1',
      tiles: BOARD_TILES.filter((t) => t.id >= 0 && t.id <= 10),
      theme: {
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200/90',
        headerText: 'text-emerald-900',
        badgeBg: 'bg-emerald-100 text-emerald-800',
      },
    },
    {
      id: 2 as const,
      name: 'Zona 2: Interaksi Antarmakhluk Hidup',
      meeting: 'Pertemuan 2',
      tiles: BOARD_TILES.filter((t) => t.id >= 11 && t.id <= 22),
      theme: {
        bg: 'bg-sky-50/70',
        border: 'border-sky-200/90',
        headerText: 'text-sky-900',
        badgeBg: 'bg-sky-100 text-sky-800',
      },
    },
    {
      id: 3 as const,
      name: 'Zona 3: Aliran Energi',
      meeting: 'Pertemuan 2',
      tiles: BOARD_TILES.filter((t) => t.id >= 23 && t.id <= 38),
      theme: {
        bg: 'bg-amber-50/70',
        border: 'border-amber-200/90',
        headerText: 'text-amber-900',
        badgeBg: 'bg-amber-100 text-amber-800',
      },
    },
    {
      id: 4 as const,
      name: 'Zona 4: Jenis-Jenis Ekosistem',
      meeting: 'Pertemuan 3',
      tiles: BOARD_TILES.filter((t) => t.id >= 39 && t.id <= 51),
      theme: {
        bg: 'bg-purple-50/70',
        border: 'border-purple-200/90',
        headerText: 'text-purple-900',
        badgeBg: 'bg-purple-100 text-purple-800',
      },
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col space-y-4 pb-28 px-3">
      {/* Quick Jump Zone Pills */}
      <div className="sticky top-16 z-10 bg-[#f8faf9]/95 backdrop-blur-md py-2.5 flex items-center justify-between gap-2 border-b border-stone-200/60 overflow-x-auto text-xs sm:text-sm font-bold">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => scrollToZone(z.id)}
            className={`px-3 py-1.5 rounded-xl border transition flex-shrink-0 flex items-center gap-1 active:scale-95 ${
              z.theme.badgeBg
            } ${z.id === 1 ? 'border-emerald-300' : z.id === 2 ? 'border-sky-300' : z.id === 3 ? 'border-amber-300' : 'border-purple-300'}`}
          >
            <span>{z.id === 1 ? '🌿' : z.id === 2 ? '🐉' : z.id === 3 ? '⚡' : '🌍'}</span>
            <span>Z{z.id}</span>
          </button>
        ))}
      </div>

      {/* 4 ZONE SECTIONS */}
      {zones.map((zone) => (
        <div
          key={zone.id}
          ref={zoneRefs[zone.id]}
          className={`rounded-3xl border p-4 sm:p-5 shadow-sm space-y-4 ${zone.theme.bg} ${zone.theme.border}`}
        >
          {/* Zone Header */}
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
            <h3 className={`text-sm sm:text-base font-bold ${zone.theme.headerText}`}>{zone.name}</h3>
          </div>

          {/* Grid of Tap-friendly Tiles */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {zone.tiles.map((tile) => {
              const isSelected = selectedTileId === tile.id;
              const isPawnHere = selectedTeam.currentTile === tile.id;
              const pawnsOnTile = teams.filter((t) => t.currentTile === tile.id);
              const isCompleted = tile.activityCode ? completedActivities.includes(tile.activityCode) : false;

              // Node Theme
              const isChallenge = tile.type === 'challenge';
              const isRiddle = tile.type === 'riddle';
              const isBadge = tile.type === 'badge';
              const isFinish = tile.type === 'finish';
              const isStart = tile.id === 0;

              return (
                <div
                  key={tile.id}
                  onClick={() => onTileClick(tile)}
                  className={`relative cursor-pointer select-none rounded-2xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900'
                      : isPawnHere
                      ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-400'
                      : 'bg-white/90 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Pawn Avatar Overlays */}
                  {pawnsOnTile.length > 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center -space-x-1.5 z-10">
                      {pawnsOnTile.map((p) => (
                        <span
                          key={p.id}
                          className="w-7 h-7 rounded-full bg-white shadow-md border-2 flex items-center justify-center text-xs animate-bounce"
                          style={{ borderColor: p.color }}
                          title={p.name}
                        >
                          {p.avatarIcon}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tile Number / Label */}
                  <div className="flex items-center gap-1 mt-1">
                    {isBadge ? (
                      <span className="text-amber-500 font-extrabold text-base">🌟</span>
                    ) : isFinish ? (
                      <span className="text-purple-600 font-extrabold text-base">🏆</span>
                    ) : isStart ? (
                      <span className="text-emerald-600 font-extrabold text-sm">🏁</span>
                    ) : null}
                    <span className="text-sm sm:text-base font-bold text-slate-800">
                      {tile.label || `#${tile.id}`}
                    </span>
                  </div>

                  {/* Activity Code Badge */}
                  {tile.activityCode ? (
                    <div
                      className={`mt-1.5 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-tight ${
                        isChallenge
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRiddle
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tile.activityCode}
                    </div>
                  ) : (
                    <div className="mt-1.5 text-xs text-stone-400 font-medium">Langkah</div>
                  )}

                  {/* Completed Checkmark */}
                  {isCompleted && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
