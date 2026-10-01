import React from 'react';
import { Team } from '../../types';

interface PawnMarkerProps {
  team: Team;
  x: number;
  y: number;
  offsetIndex: number;
  totalOnTile: number;
  isSelected: boolean;
  isStartTile?: boolean;
}

export const PawnMarker: React.FC<PawnMarkerProps> = React.memo(({
  team,
  x,
  y,
  offsetIndex,
  totalOnTile,
  isSelected,
  isStartTile = false,
}) => {
  let offsetX = 0;
  let offsetY = 0;

  if (isStartTile) {
    // Susun pion rapi berjejer horizontal di area hijau START
    const spacing = totalOnTile > 4 ? 36 : 46;
    offsetX = (offsetIndex - (totalOnTile - 1) / 2) * spacing;
    offsetY = 0;
  } else if (totalOnTile > 1) {
    // Pada petak biasa dengan beberapa pion: beri jarak horizontal di atas elips
    const spacing = 28;
    offsetX = (offsetIndex - (totalOnTile - 1) / 2) * spacing;
    offsetY = -14;
  } else {
    // Pion tunggal di petak biasa: sedikit ke atas agar nomor petak tetap terbaca
    offsetX = 0;
    offsetY = -14;
  }

  const finalX = x + offsetX;
  const finalY = y + offsetY;

  return (
    <g
      id={`pawn-${team.id}`}
      transform={`translate(${finalX}, ${finalY})`}
      className="cursor-pointer select-none"
      style={{
        transition: 'transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)',
      }}
    >
      <g transform="scale(1.25)">
        {/* Soft Ground Shadow */}
        <ellipse cx="0" cy="5" rx="14" ry="5" fill="rgba(15, 23, 42, 0.3)" />

        {/* Pawn Pin Body */}
        <path
          d="M 0 -30 
             C -14 -30 -18 -18 0 4 
             C 18 -18 14 -30 0 -30 Z"
          fill={team.color}
          stroke={isSelected ? '#fef08a' : '#ffffff'}
          strokeWidth={isSelected ? 3 : 2.2}
        />

        {/* Pawn Center Circle */}
        <circle
          cx="0"
          cy="-15"
          r="12"
          fill="#ffffff"
        />

        {/* Team Avatar Emoji */}
        <text
          x="0"
          y="-9.5"
          textAnchor="middle"
          fontSize="14"
          className="pointer-events-none select-none"
        >
          {team.avatarIcon}
        </text>

        {/* Tiny Team Number Badge */}
        <g transform="translate(11, -24)">
          <circle cx="0" cy="0" r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#ffffff"
            fontFamily="Lexend, sans-serif"
          >
            {team.id}
          </text>
        </g>
      </g>
    </g>
  );
});
