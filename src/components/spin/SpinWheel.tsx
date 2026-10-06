import React, { useState, useEffect } from 'react';
import { Team } from '../../types';
import { Play, RotateCcw, ArrowRight, Trophy, Sparkles, Shuffle, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelProps {
  teams: Team[];
  onComplete: (turnOrder: Team[]) => void;
  onAddTeam?: () => void;
  onRemoveTeam?: (id: number) => void;
  onResetDefaultTeams?: () => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  teams,
  onComplete,
  onAddTeam,
  onRemoveTeam,
  onResetDefaultTeams,
}) => {
  const [remainingTeams, setRemainingTeams] = useState<Team[]>([...teams]);
  const [turnOrder, setTurnOrder] = useState<Team[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedWinner, setSelectedWinner] = useState<Team | null>(null);

  // Sinkronisasi saat jumlah kelompok berubah dari luar
  useEffect(() => {
    if (turnOrder.length === 0) {
      setRemainingTeams([...teams]);
    }
  }, [teams, turnOrder.length]);

  const numSlices = remainingTeams.length;
  const sliceAngle = numSlices > 0 ? 360 / numSlices : 360;

  // Helper untuk SVG Arc
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const rad = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const createPieSlice = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'Z',
    ].join(' ');
  };

  // Fungsi Spin Roda
  const handleSpin = () => {
    if (isSpinning || remainingTeams.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    // Pilih pemenang secara acak dari tim yang tersisa
    const randomIndex = Math.floor(Math.random() * remainingTeams.length);
    const winningTeam = remainingTeams[randomIndex];

    // Hitung sudut agar juring pemenang mendarat tepat di jarum penunjuk atas (12 o'clock)
    const sliceCenterAngle = randomIndex * sliceAngle + sliceAngle / 2;
    const targetBase = (360 - sliceCenterAngle) % 360;

    // Tambahkan 5 hingga 7 putaran penuh untuk sensasi putaran yang seru
    const fullSpins = 360 * 6;
    const currentModulo = rotation % 360;
    const diff = (targetBase - currentModulo + 360) % 360;
    const newRotation = rotation + fullSpins + diff;

    setRotation(newRotation);

    // Durasi animasi 4 detik
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedWinner(winningTeam);

      // Selebrasi konfeti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update urutan giliran & tim yang tersisa
      setTurnOrder((prev) => [...prev, winningTeam]);
      setRemainingTeams((prev) =>
        prev.filter((t) =>
          t.teamNumber && winningTeam.teamNumber
            ? t.teamNumber !== winningTeam.teamNumber
            : t.id !== winningTeam.id
        )
      );
    }, 4100);
  };

  // Acak otomatis semua sekaligus (Fitur Fast-Track untuk Guru)
  const handleQuickShuffle = () => {
    if (isSpinning) return;
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    setTurnOrder(shuffled);
    setRemainingTeams([]);
    setSelectedWinner(shuffled[shuffled.length - 1]);
    confetti({ particleCount: 90, spread: 80 });
  };

  // Reset sesi spin
  const handleReset = () => {
    setRemainingTeams([...teams]);
    setTurnOrder([]);
    setSelectedWinner(null);
    setRotation(0);
  };

  const isAllDetermined = turnOrder.length === teams.length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sesi Pra-Permainan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Penentuan Urutan Giliran Kelompok
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Putar roda keberuntungan untuk menentukan urutan kelompok yang melangkah terlebih dahulu di papan permainan!
        </p>
      </div>

      {/* Main Container (Split: Wheel on Left, Turn List on Right) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* LEFT: THE SPINNING WHEEL */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Wheel Container */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Pointer / Jarum Penunjuk (Atas 12 o'clock) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center filter drop-shadow-md pointer-events-none">
              <div className="w-6 h-7 bg-amber-500 clip-arrow shadow-md" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
            </div>

            {/* SVG Wheel Disc */}
            <div
              className="w-full h-full rounded-full shadow-lg border-4 border-stone-100 overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {numSlices > 0 ? (
                  remainingTeams.map((team, idx) => {
                    const startA = idx * sliceAngle;
                    const endA = (idx + 1) * sliceAngle;
                    const midA = startA + sliceAngle / 2;
                    const textPos = polarToCartesian(200, 200, 120, midA);

                    // Warna pastel cerah & solid untuk setiap kelompok (tidak akan pernah hitam)
                    const sliceColors = [
                      '#fee2e2', // Soft Red (Harimau)
                      '#dbeafe', // Soft Blue (Elang)
                      '#dcfce7', // Soft Emerald (Komodo)
                      '#fef3c7', // Soft Amber
                      '#f3e8ff', // Soft Purple
                      '#cffafe', // Soft Cyan
                      '#ffedd5', // Soft Orange
                      '#fce7f3', // Soft Pink
                    ];
                    const sliceBorders = [
                      '#f87171',
                      '#60a5fa',
                      '#4ade80',
                      '#fbbf24',
                      '#c084fc',
                      '#22d3ee',
                      '#fb923c',
                      '#f472b6',
                    ];

                    const teamNum = Number(team.teamNumber) || (typeof team.id === 'number' ? team.id : idx + 1);
                    const colorIdx = Math.abs((teamNum - 1) % sliceColors.length);
                    const fillColor = sliceColors[colorIdx] || '#dcfce7';
                    const strokeColor = sliceBorders[colorIdx] || '#4ade80';
                    const animalName = team.name?.match(/\(([^)]+)\)/)?.[1] || '';

                    return (
                      <g key={team.id || `wheel-team-${teamNum}`}>
                        {/* Slice */}
                        <path
                          d={createPieSlice(200, 200, 195, startA, endA)}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="2.5"
                        />
                        {/* Team Avatar & Name in Slice */}
                        <g transform={`translate(${textPos.x}, ${textPos.y}) rotate(${midA})`}>
                          <text
                            x="0"
                            y="-8"
                            textAnchor="middle"
                            fontSize="22"
                            className="pointer-events-none"
                          >
                            {team.avatarIcon || '🐾'}
                          </text>
                          <text
                            x="0"
                            y="11"
                            textAnchor="middle"
                            fill="#0f172a"
                            fontSize="11"
                            fontWeight="800"
                            fontFamily="Lexend, sans-serif"
                            className="pointer-events-none"
                          >
                            Kel. {teamNum}
                          </text>
                          {animalName && (
                            <text
                              x="0"
                              y="23"
                              textAnchor="middle"
                              fill="#475569"
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="Lexend, sans-serif"
                              className="pointer-events-none"
                            >
                              {animalName}
                            </text>
                          )}
                        </g>
                      </g>
                    );
                  })
                ) : (
                  /* Wheel when all teams picked */
                  <circle cx="200" cy="200" r="195" fill="#f0fdf4" stroke="#86efac" strokeWidth="3" />
                )}

                {/* Outer Ring */}
                <circle cx="200" cy="200" r="196" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              </svg>
            </div>

            {/* Center Hub / Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || isAllDetermined}
              className="absolute z-10 w-20 h-20 rounded-full bg-white border-4 border-stone-200 shadow-md flex flex-col items-center justify-center text-slate-800 font-bold hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <Play className="w-5 h-5 text-emerald-700 fill-emerald-700 ml-0.5" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-stone-600 mt-0.5">
                {isSpinning ? '...' : 'Putar'}
              </span>
            </button>
          </div>

          {/* Quick Actions below wheel */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={handleSpin}
              disabled={isSpinning || isAllDetermined}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Putar Giliran Ke-{turnOrder.length + 1}</span>
            </button>

            <button
              onClick={handleQuickShuffle}
              disabled={isSpinning || isAllDetermined}
              className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40"
              title="Acak semua sekaligus"
            >
              <Shuffle className="w-4 h-4 text-stone-500" />
              <span>Acak Semua</span>
            </button>

            {turnOrder.length > 0 && (
              <button
                onClick={handleReset}
                disabled={isSpinning}
                className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                title="Reset Sesi Putar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: TURN ORDER LIST */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">Urutan Melangkah</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">
                {turnOrder.length} dari {teams.length} Kelompok
              </span>
              {teams.length !== 3 && onResetDefaultTeams && turnOrder.length === 0 && (
                <button
                  onClick={onResetDefaultTeams}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                  title="Kembalikan ke 3 Kelompok Default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 3 Kelompok</span>
                </button>
              )}
              {onAddTeam && turnOrder.length === 0 && (
                <button
                  onClick={onAddTeam}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                  title="Tambah Kelompok Baru"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah</span>
                </button>
              )}
            </div>
          </div>

          {/* Turn Slots Dinamis berdasarkan teams.length */}
          <div className="space-y-2">
            {teams.map((t, idx) => {
              const team = turnOrder[idx];
              const isCurrentNew =
                team &&
                selectedWinner &&
                (team.teamNumber && selectedWinner.teamNumber
                  ? team.teamNumber === selectedWinner.teamNumber
                  : team.id === selectedWinner.id);

              return (
                <div
                  key={t.id || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    team
                      ? isCurrentNew
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm animate-in zoom-in-95 duration-200'
                        : 'bg-white border-stone-200'
                      : 'bg-stone-50/60 border-dashed border-stone-200 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        team
                          ? idx === 0
                            ? 'bg-amber-500 text-white shadow-sm'
                            : idx === 1
                            ? 'bg-stone-400 text-white'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-100 text-stone-700 border border-stone-300'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {team ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{team.avatarIcon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{team.name}</div>
                          <div className="text-[10px] text-stone-500">Giliran #{idx + 1}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-base opacity-50">{t.avatarIcon}</span>
                        <span className="text-xs font-medium italic text-stone-400">
                          {t.name} (Menunggu giliran ke-{idx + 1}...)
                        </span>
                      </div>
                    )}
                  </div>

                  {team ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    onRemoveTeam && turnOrder.length === 0 && teams.length > 2 && idx >= 3 && (
                      <button
                        onClick={() => onRemoveTeam(t.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                        title={`Hapus ${t.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Action Button: Enter the Board */}
          {isAllDetermined ? (
            <button
              onClick={() => onComplete(turnOrder)}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition active:scale-95 animate-in slide-in-from-bottom duration-200"
            >
              <span>Mulai Board Game dengan Urutan Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <p className="text-[11px] text-stone-500 text-center pt-2">
              Putar roda hingga seluruh kelompok mendapatkan urutan giliran.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
