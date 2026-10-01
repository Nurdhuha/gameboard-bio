import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const boardInnerRef = useRef<HTMLDivElement>(null);

  // Deteksi mode mobile / tablet
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  // Mode kamera: otomatis mengikuti pergerakan pion (aktif default di mobile)
  const [isAutoFollow, setIsAutoFollow] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : true;
  });

  // Scale awal: di layar mobile otomatis diperbesar (2.25x di smartphone) agar petak & pion tampil tajam dan besar
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2.25;
      if (window.innerWidth < 1024) return 1.8;
    }
    return 1.0;
  });

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch pinch-to-zoom & gestur layar sentuh
  const touchDistRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Auto-focus kamera cerdas ke posisi pion (Dynamic Pawn Tracking)
  const focusOnPawn = useCallback(
    (tileId: number = selectedTeam.currentTile, overrideScale?: number) => {
      const tile = BOARD_TILES.find((t) => t.id === tileId);
      if (!tile) return;

      const currentIsMobile = window.innerWidth < 1024;
      const isPhone = window.innerWidth < 640;

      // Tentukan target scale ideal
      let targetScale = overrideScale ?? scale;
      if (overrideScale === undefined) {
        if (isPhone) {
          targetScale = 2.25;
        } else if (currentIsMobile) {
          targetScale = 1.8;
        } else {
          // Desktop: jika sebelumnya fit view (1.0), zoom in ke 1.6
          targetScale = scale === 1.0 ? 1.6 : scale;
        }
      }

      // Ukuran unscaled dari elemen papan
      const boardEl = boardInnerRef.current;
      const containerEl = containerRef.current;
      const w = boardEl?.offsetWidth || Math.min(window.innerWidth - 16, window.innerHeight * 0.85);
      const h = boardEl?.offsetHeight || w;
      const containerW = containerEl?.offsetWidth || window.innerWidth;
      const containerH = containerEl?.offsetHeight || window.innerHeight;

      const cx = w / 2;
      const cy = h / 2;

      // Konversi koordinat tile dari 1600x1600 viewBox ke ukuran aktual elemen
      const relX = (tile.x / 1600) * w;
      const relY = (tile.y / 1600) * h;

      const dx = relX - cx;
      const dy = relY - cy;

      const rawPanX = -dx * targetScale;
      const rawPanY = -dy * targetScale;

      // Clamping presisi agar peta menutupi seluruh layar tanpa menyisakan celah
      const maxPanX = Math.max(0, (w * targetScale - containerW) / 2);
      const maxPanY = Math.max(0, (h * targetScale - containerH) / 2);

      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, rawPanX));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, rawPanY));

      setScale(targetScale);
      setPan({ x: clampedX, y: clampedY });
      setIsAutoFollow(true);
    },
    [selectedTeam.currentTile, scale]
  );

  // Track tile position and team switches
  const prevTileRef = useRef<number>(selectedTeam.currentTile);
  const prevTeamRef = useRef<number>(selectedTeamId);

  useEffect(() => {
    const tileChanged = prevTileRef.current !== selectedTeam.currentTile;
    const teamChanged = prevTeamRef.current !== selectedTeamId;

    prevTileRef.current = selectedTeam.currentTile;
    prevTeamRef.current = selectedTeamId;

    if (tileChanged || teamChanged) {
      // Ketika pion bergerak atau berganti tim, otomatis glide kamera ke pion
      focusOnPawn(selectedTeam.currentTile);
    }
  }, [selectedTeam.currentTile, selectedTeamId, focusOnPawn]);

  // Initial mount on mobile/tablet: langsung fokus ke pion aktif
  useEffect(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (mobile) {
      const timer = setTimeout(() => {
        focusOnPawn(selectedTeam.currentTile);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle resize & orientasi layar smartphone
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && isAutoFollow) {
        focusOnPawn(selectedTeam.currentTile);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedTeam.currentTile, isAutoFollow, focusOnPawn]);

  // Reset kamera ke seluruh peta (Fit View)
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setIsAutoFollow(false);
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(scale + delta, 0.75), 3.2);
    setScale(newScale);
    if (isAutoFollow) {
      focusOnPawn(selectedTeam.currentTile, newScale);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dist = Math.hypot(
      e.clientX - touchStartPosRef.current.x,
      e.clientY - touchStartPosRef.current.y
    );
    if (dist > 6) {
      hasMovedRef.current = true;
      setIsAutoFollow(false); // Pengguna menggeser peta secara manual
    }
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
      hasMovedRef.current = false;
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
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
      setIsAutoFollow(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dist = Math.hypot(
        e.touches[0].clientX - touchStartPosRef.current.x,
        e.touches[0].clientY - touchStartPosRef.current.y
      );
      if (dist > 8) {
        hasMovedRef.current = true;
        setIsAutoFollow(false);
      }
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
        setScale(Math.min(Math.max(initialScaleRef.current * factor, 0.75), 3.2));
        setIsAutoFollow(false);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = 0;
  };

  const handleTileClickWrapper = (tile: TileData) => {
    if (hasMovedRef.current) return; // Abaikan klik jika pengguna sedang menggeser peta
    onTileClick(tile);
  };

  // Hitung jumlah pion di setiap petak
  const pawnsOnTileCount: Record<number, number> = {};
  teams.forEach((t) => {
    pawnsOnTileCount[t.currentTile] = (pawnsOnTileCount[t.currentTile] || 0) + 1;
  });
  const pawnsOnTileTracker: Record<number, number> = {};

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden touch-none bg-[#1b9cb0] lg:bg-transparent">
      {/* Mini Mode Indicator (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-stone-200/90 px-2.5 py-1.5 rounded-2xl shadow-sm pointer-events-none select-none">
        <span className="text-xs">{selectedTeam.avatarIcon}</span>
        <span className="text-[11px] font-bold text-slate-700">
          Petak #{selectedTeam.currentTile} • {isAutoFollow ? 'Fokus Pion' : 'Bebas Geser'}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            isAutoFollow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
          }`}
        />
      </div>

      {/* Floating Camera Controls (Discreet & Minimalist) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-stone-200/90 p-1.5 rounded-2xl shadow-sm">
        <button
          onClick={() => handleZoom(0.3)}
          className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Perbesar Peta (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.3)}
          className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Perkecil Peta (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => focusOnPawn()}
          className={`p-1.5 sm:p-2 rounded-xl transition active:scale-95 border ${
            isAutoFollow
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-300'
              : 'bg-white text-stone-600 hover:text-slate-900 hover:bg-stone-100 border-stone-200'
          }`}
          title={isAutoFollow ? 'Kamera Mengikuti Pion (Aktif)' : 'Pusatkan ke Pion Saya'}
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition active:scale-95"
          title="Lihat Seluruh Peta"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Quick Recenter Button (Saat kamera digeser menjauh dari pion) */}
      {!isAutoFollow && (
        <button
          onClick={() => focusOnPawn(selectedTeam.currentTile)}
          className="absolute bottom-28 lg:bottom-4 z-20 px-3.5 py-1.5 bg-emerald-600/95 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-emerald-400/50 active:scale-95 transition-all animate-bounce"
        >
          <Target className="w-3.5 h-3.5 text-emerald-200" />
          <span>Pusatkan ke Pion {selectedTeam.avatarIcon} (#{selectedTeam.currentTile})</span>
        </button>
      )}

      {/* Main Touch / Mouse Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden bg-[#1b9cb0] lg:bg-transparent"
      >
        <div
          ref={boardInnerRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition:
              isDragging || touchDistRef.current > 0
                ? 'none'
                : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            width: 'min(100%, 85vh)',
            height: 'min(100%, 85vh)',
          }}
          className="relative aspect-square flex items-center justify-center select-none"
        >
          <svg
            viewBox="0 0 1600 1600"
            className="w-full h-full select-none rounded-none shadow-none lg:rounded-3xl lg:shadow-2xl overflow-hidden bg-[#1b9cb0]"
          >
            {/* Background Map Artwork */}
            <image
              href="/board-bg.png"
              x="0"
              y="0"
              width="1600"
              height="1600"
              preserveAspectRatio="xMidYMid slice"
            />

            {/* 52 TILE NODES (START, 50 Steps, FINISH) */}
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
                  onClick={handleTileClickWrapper}
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
                  isStartTile={team.currentTile === 0}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
