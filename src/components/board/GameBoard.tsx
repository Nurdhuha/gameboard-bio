import React, { useState, useRef, useEffect } from 'react';
import { TileData, Team } from '../../types';
import { BOARD_TILES } from '../../data/boardData';
import { TileMarker } from './TileMarker';
import { PawnMarker } from './PawnMarker';
import { ZoomIn, ZoomOut, RotateCcw, Target } from 'lucide-react';

interface GameBoardProps {
  teams: Team[];
  selectedTeamId: number;
  selectedTileId: number | null;
  onTileClick: (tile: TileData) => void;
  completedActivities: string[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  teams,
  selectedTeamId,
  selectedTileId,
  onTileClick,
  completedActivities,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch pinch-to-zoom state
  const touchDistRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Auto-focus kamera cerdas (Smart Camera Tracking ke petak aktif)
  const focusOnPawn = (tileId: number = selectedTeam.currentTile) => {
    const tile = BOARD_TILES.find((t) => t.id === tileId);
    if (!tile || !containerRef.current) return;

    const targetScale = 1.7; // Zoom nyaman di mobile
    const container = containerRef.current.getBoundingClientRect();
    const cx = container.width / 2;
    const cy = container.height / 2;

    const factorX = container.width / 1200;
    const factorY = container.height / 860;
    const factor = Math.min(factorX, factorY);

    const targetX = cx - tile.x * factor * targetScale;
    const targetY = cy - tile.y * factor * targetScale;

    setScale(targetScale);
    setPan({ x: targetX, y: targetY });
  };

  // Reset kamera ke seluruh peta (Fit View)
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.75), 3.0));
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch gestures (Pinch-to-zoom & Drag-to-pan di Smartphone)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      // Mulai pinch-to-zoom
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      if (touchDistRef.current > 0) {
        const factor = currentDist / touchDistRef.current;
        setScale(Math.min(Math.max(initialScaleRef.current * factor, 0.75), 3.0));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = 0;
  };

  // Hitung jumlah pion di setiap petak
  const pawnsOnTileCount: Record<number, number> = {};
  teams.forEach((t) => {
    pawnsOnTileCount[t.currentTile] = (pawnsOnTileCount[t.currentTile] || 0) + 1;
  });
  const pawnsOnTileTracker: Record<number, number> = {};

  const pathD = BOARD_TILES.reduce((acc, tile, index) => {
    return index === 0 ? `M ${tile.x} ${tile.y}` : `${acc} L ${tile.x} ${tile.y}`;
  }, '');

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Floating Camera Controls (Discreet & Minimalist) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-stone-200/90 p-1.5 rounded-2xl shadow-sm">
        <button
          onClick={() => handleZoom(0.3)}
          className="p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Perbesar Peta (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.3)}
          className="p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Perkecil Peta (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => focusOnPawn()}
          className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 border border-emerald-200/80"
          title="Fokus ke Pion Saya"
        >
          <Target className="w-4 h-4 text-emerald-700" />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Lihat Seluruh Peta"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Touch / Mouse Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging || touchDistRef.current > 0 ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)',
          }}
          className="relative w-full max-w-5xl aspect-[1200/860] bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm shadow-stone-200/50"
        >
          <svg
            viewBox="0 0 1200 860"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* 4 ZONE LANES (WARNA LEMBUT & MENENANGKAN) */}
            {/* Lane 1: Zona 1 */}
            <rect x="30" y="65" width="1140" height="130" rx="22" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <text x="52" y="96" fill="#166534" fontSize="13" fontWeight="700" fontFamily="Lexend">
              🌿 Zona 1: Komponen Ekosistem
            </text>

            {/* Lane 2: Zona 2 */}
            <rect x="30" y="265" width="1140" height="130" rx="22" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1.2" />
            <text x="1148" y="296" textAnchor="end" fill="#0369a1" fontSize="13" fontWeight="700" fontFamily="Lexend">
              🐉 Zona 2: Interaksi Antarmakhluk Hidup
            </text>

            {/* Lane 3: Zona 3 */}
            <rect x="30" y="475" width="1140" height="130" rx="22" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.2" />
            <text x="52" y="506" fill="#92400e" fontSize="13" fontWeight="700" fontFamily="Lexend">
              ⚡ Zona 3: Aliran Energi
            </text>

            {/* Lane 4: Zona 4 */}
            <rect x="30" y="685" width="1140" height="130" rx="22" fill="#faf5ff" stroke="#e9d5ff" strokeWidth="1.2" />
            <text x="1148" y="716" textAnchor="end" fill="#6b21a8" fontSize="13" fontWeight="700" fontFamily="Lexend">
              🌍 Zona 4: Jenis-Jenis Ekosistem
            </text>

            {/* TRACK PATH RIBBON */}
            <path
              d={pathD}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 52 TILE NODES */}
            {BOARD_TILES.map((tile) => {
              const isTileActive = selectedTeam.currentTile === tile.id;
              const isSelected = selectedTileId === tile.id;
              const isCompleted = tile.activityCode
                ? completedActivities.includes(tile.activityCode)
                : false;

              return (
                <TileMarker
                  key={tile.id}
                  tile={tile}
                  isActive={isTileActive}
                  isSelected={isSelected}
                  isCompleted={isCompleted}
                  onClick={onTileClick}
                />
              );
            })}

            {/* TEAM PAWNS */}
            {teams.map((team) => {
              const tile = BOARD_TILES.find((t) => t.id === team.currentTile) || BOARD_TILES[0];
              const totalOnThisTile = pawnsOnTileCount[team.currentTile] || 1;
              const currentOffset = pawnsOnTileTracker[team.currentTile] || 0;
              pawnsOnTileTracker[team.currentTile] = currentOffset + 1;

              return (
                <PawnMarker
                  key={team.id}
                  team={team}
                  x={tile.x}
                  y={tile.y}
                  offsetIndex={currentOffset}
                  totalOnTile={totalOnThisTile}
                  isSelected={team.id === selectedTeamId}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
