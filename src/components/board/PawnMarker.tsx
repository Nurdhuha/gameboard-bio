import React from 'react';
import { Team } from '../../types';

interface PawnMarkerProps {
  team: Team;
  x: number;
  y: number;
  offsetIndex: number;
  totalOnTile: number;
  isSelected: boolean;
}

export const PawnMarker: React.FC<PawnMarkerProps> = ({
  team,
  x,
  y,
  offsetIndex,
  totalOnTile,
  isSelected,
}) => {
  let offsetX = 0;
  let offsetY = -30;

  if (totalOnTile > 1) {
    const angle = (offsetIndex / totalOnTile) * Math.PI * 2;
    const distance = 26;
    offsetX = Math.cos(angle) * distance;
    offsetY = Math.sin(angle) * distance - 20;
  }

  const finalX = x + offsetX;
  const finalY = y + offsetY;

  return (
    <g
      id={`pawn-${team.id}`}
      style={{
        transform: `translate(${finalX}px, ${finalY}px)`,
        transition: 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)',
      }}
      className="cursor-pointer select-none filter drop-shadow-md"
    >
      {/* Soft Ground Shadow */}
      <ellipse cx="0" cy="8" rx="13" ry="5" fill="rgba(15, 23, 42, 0.15)" />

      {/* Pawn Pin Body */}
      <path
        d="M 0 -28 
           C -13 -28 -16 -16 0 4 
           C 16 -16 13 -28 0 -28 Z"
        fill={team.color}
        stroke="#ffffff"
        strokeWidth="2"
      />

      {/* Pawn Center Circle */}
      <circle
        cx="0"
        cy="-14"
        r="11"
        fill="#ffffff"
      />

      {/* Team Avatar Emoji */}
      <text
        x="0"
        y="-9"
        textAnchor="middle"
        fontSize="13"
        className="pointer-events-none"
      >
        {team.avatarIcon}
      </text>

      {/* Tiny Team Number Badge */}
      <g transform="translate(10, -22)">
        <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
        <text
          x="0"
          y="3"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="Lexend, sans-serif"
        >
          {team.id}
        </text>
      </g>
    </g>
  );
};
