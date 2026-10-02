import React from 'react';
import { TileData } from '../../types';

interface TileMarkerProps {
  tile: TileData;
  isActive: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: (tile: TileData) => void;
  showActivityCode?: boolean;
}

export const TileMarker: React.FC<TileMarkerProps> = React.memo(({
  tile,
  isActive,
  isSelected,
  isCompleted,
  onClick,
  showActivityCode = false,
}) => {
  const isStart = tile.id === 0;
  const isFinish = tile.id === 51;

  // Theme styling based on tile type
  const getTheme = () => {
    switch (tile.type) {
      case 'challenge':
        return {
          textColor: '#c2410c', // Orange-700
          pillBg: '#ffedd5',    // Orange-100
          pillBorder: '#fb923c', // Orange-400
          badgeText: '#9a3412',  // Orange-800
          icon: '⭐',
          glow: 'rgba(234, 88, 12, 0.25)',
        };
      case 'riddle':
        return {
          textColor: '#0369a1', // Sky-700
          pillBg: '#e0f2fe',    // Sky-100
          pillBorder: '#38bdf8', // Sky-400
          badgeText: '#075985',  // Sky-800
          icon: '🌿',
          glow: 'rgba(2, 132, 199, 0.25)',
        };
      case 'badge':
        return {
          textColor: '#b45309', // Amber-700
          pillBg: '#fef3c7',    // Amber-100
          pillBorder: '#f59e0b', // Amber-500
          badgeText: '#78350f',  // Amber-900
          icon: '🏆',
          glow: 'rgba(217, 119, 6, 0.35)',
        };
      case 'finish':
        return {
          textColor: '#0284c7',
          pillBg: '#e0f2fe',
          pillBorder: '#38bdf8',
          badgeText: '#0369a1',
          icon: '🏁',
          glow: 'rgba(2, 132, 199, 0.3)',
        };
      default: // Normal step
        return {
          textColor: '#1e293b', // Slate-800
          pillBg: '#f1f5f9',
          pillBorder: '#cbd5e1',
          badgeText: '#475569',
          icon: '',
          glow: 'rgba(15, 23, 42, 0.1)',
        };
    }
  };

  const theme = getTheme();

  // Special rendering for START (tile 0) and FINISH (tile 51)
  if (isStart || isFinish) {
    return (
      <g
        id={`tile-${tile.id}`}
        transform={`translate(${tile.x}, ${tile.y})`}
        onClick={() => onClick(tile)}
        className="cursor-pointer group select-none"
      >
        {/* Selection indicator */}
        {isSelected && (
          <ellipse
            cx="0"
            cy="0"
            rx="56"
            ry="24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        )}

        {/* Active pawn glow */}
        {isActive && (
          <ellipse
            cx="0"
            cy="0"
            rx="52"
            ry="22"
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10b981"
            strokeWidth="2.5"
          />
        )}

        {/* Clickable transparent area over text */}
        <ellipse
          cx="0"
          cy="0"
          rx="52"
          ry="20"
          fill="transparent"
          className="group-hover:fill-white/30 transition-colors"
        />
      </g>
    );
  }

  // Standard step ellipses (1 to 50)
  const rx = 58;
  const ry = 38;

  return (
    <g
      id={`tile-${tile.id}`}
      transform={`translate(${tile.x}, ${tile.y})`}
      onClick={() => onClick(tile)}
      className="cursor-pointer group select-none"
    >
      {/* Selection Outer Ring */}
      {isSelected && (
        <ellipse
          cx="0"
          cy="0"
          rx={rx + 6}
          ry={ry + 5}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3.5"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      )}

      {/* Active Aura if Selected Team Pawn is on this Tile */}
      {isActive && (
        <ellipse
          cx="0"
          cy="0"
          rx={rx + 2}
          ry={ry + 2}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#10b981"
          strokeWidth="2.5"
        />
      )}

      {/* Interactive Hover Hitbox over the background ellipse */}
      <ellipse
        cx="0"
        cy="0"
        rx={rx}
        ry={ry}
        fill="transparent"
        className="group-hover:fill-white/30 transition-all duration-200"
      />

      {/* Type Icon Indicator for Challenge / Riddle / Badge */}
      {theme.icon && (
        <text
          x="0"
          y="-20"
          textAnchor="middle"
          fontSize="13"
          className="pointer-events-none select-none"
        >
          {theme.icon}
        </text>
      )}

      {/* Big Crisp Step Number (1 to 50) */}
      <text
        x="0"
        y={showActivityCode && tile.activityCode ? '2' : '10'}
        textAnchor="middle"
        fill={theme.textColor}
        fontSize={showActivityCode && tile.activityCode ? '28' : '32'}
        fontWeight="800"
        fontFamily="Lexend, system-ui, sans-serif"
        className="pointer-events-none tracking-tight"
        style={{
          paintOrder: 'stroke fill',
          stroke: '#ffffff',
          strokeWidth: '3px',
          strokeLinejoin: 'round',
        }}
      >
        {tile.label || tile.id}
      </text>

      {/* Activity Code Sub-Pill (Hanya ditampilkan pada layar Guru) */}
      {showActivityCode && tile.activityCode && (
        <g transform="translate(0, 15)">
          <rect
            x="-26"
            y="-3"
            width="52"
            height="18"
            rx="9"
            fill={theme.pillBg}
            stroke={theme.pillBorder}
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="9.5"
            textAnchor="middle"
            fill={theme.badgeText}
            fontSize="10"
            fontWeight="700"
            fontFamily="Lexend, system-ui, sans-serif"
            className="pointer-events-none tracking-tight"
          >
            {tile.activityCode}
          </text>
        </g>
      )}

      {/* Completed Checkmark Badge */}
      {isCompleted && (
        <g transform={`translate(${rx - 15}, ${-ry + 10})`}>
          <circle
            cx="0"
            cy="0"
            r="11"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <path
            d="M -5 0 L -1 4 L 5 -3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
});
