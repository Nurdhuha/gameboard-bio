import React from 'react';
import { TileData } from '../../types';

interface TileMarkerProps {
  tile: TileData;
  isActive: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: (tile: TileData) => void;
}

export const TileMarker: React.FC<TileMarkerProps> = ({
  tile,
  isActive,
  isSelected,
  isCompleted,
  onClick,
}) => {
  // Palet warna yang menenangkan (Calming Nature Palette)
  const getTheme = () => {
    switch (tile.type) {
      case 'challenge':
        return {
          bg: '#ffffff',
          border: '#059669', // Sage / Forest Emerald
          text: '#065f46',
          badgeText: '#047857',
          shadow: 'rgba(5, 150, 105, 0.15)',
        };
      case 'riddle':
        return {
          bg: '#ffffff',
          border: '#0284c7', // Serene Sky Blue
          text: '#0369a1',
          badgeText: '#0284c7',
          shadow: 'rgba(2, 132, 199, 0.15)',
        };
      case 'badge':
        return {
          bg: '#ffffff',
          border: '#d97706', // Warm Amber Honey
          text: '#b45309',
          badgeText: '#d97706',
          shadow: 'rgba(217, 119, 6, 0.2)',
        };
      case 'finish':
        return {
          bg: '#ffffff',
          border: '#7c3aed', // Calm Lavender Violet
          text: '#6d28d9',
          badgeText: '#7c3aed',
          shadow: 'rgba(124, 58, 237, 0.2)',
        };
      default:
        return {
          bg: '#ffffff',
          border: '#cbd5e1', // Soft Slate
          text: '#64748b',
          badgeText: '#94a3b8',
          shadow: 'rgba(148, 163, 184, 0.1)',
        };
    }
  };

  const theme = getTheme();
  const radius = tile.type === 'badge' ? 27 : tile.type === 'finish' ? 30 : tile.activityCode ? 24 : 17;

  return (
    <g
      id={`tile-${tile.id}`}
      transform={`translate(${tile.x}, ${tile.y})`}
      onClick={() => onClick(tile)}
      className="cursor-pointer group select-none transition-transform duration-200"
    >
      {/* Selected Indicator Ring */}
      {isSelected && (
        <circle
          cx="0"
          cy="0"
          r={radius + 8}
          fill="none"
          stroke={theme.border}
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Soft Ceramic Drop Shadow */}
      <circle
        cx="0"
        cy="2"
        r={radius + 1}
        fill={theme.shadow}
      />

      {/* Main Ceramic Token Node */}
      <circle
        cx="0"
        cy="0"
        r={radius}
        fill={theme.bg}
        stroke={isSelected ? '#0f172a' : theme.border}
        strokeWidth={isSelected ? 3 : tile.activityCode ? 2.5 : 1.5}
        className="transition-all duration-200 group-hover:filter group-hover:brightness-95"
      />

      {/* Tile Number / Label */}
      <text
        x="0"
        y={tile.activityCode ? -2 : 4}
        textAnchor="middle"
        fill={theme.text}
        fontSize={radius >= 24 ? '13' : '10.5'}
        fontWeight="700"
        fontFamily="Lexend, sans-serif"
        className="pointer-events-none"
      >
        {tile.label || tile.id}
      </text>

      {/* Clean Sub-Label for Activity Code (e.g. KE-01) */}
      {tile.activityCode && (
        <text
          x="0"
          y="11"
          textAnchor="middle"
          fill={theme.badgeText}
          fontSize="8.5"
          fontWeight="600"
          fontFamily="Lexend, sans-serif"
          className="pointer-events-none tracking-tight"
        >
          {tile.activityCode}
        </text>
      )}

      {/* Completed Minimalist Check Dot */}
      {isCompleted && (
        <circle cx={radius - 3} cy={-radius + 3} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      )}
    </g>
  );
};
