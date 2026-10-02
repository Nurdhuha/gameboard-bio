import React, { useState, useEffect } from 'react';
import { ActivityData, Team } from '../../types';
import {
  X,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityModalProps {
  activity: ActivityData;
  team: Team;
  onClose: () => void;
  onSubmit: (answer: string, reflection?: string) => void;
  isBadgeTile?: boolean;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  team,
  onClose,
  onSubmit,
  isBadgeTile = false,
}) => {
  // Hanya aktivitas akhir (KE06, IA06, AE06, JE06) yang memiliki fitur Regulasi Diri
  const cleanCode = activity.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const isSelfRegulationActivity =
    ['KE06', 'IA06', 'AE06', 'JE06'].includes(cleanCode) ||
    activity.indicator === 'Regulasi Diri';

  const [activeTab, setActiveTab] = useState<'stimulus' | 'lkpd' | 'selfReg'>('stimulus');
  const [answer, setAnswer] = useState<string>('');
  const [reflection, setReflection] = useState<string>('');
  const [showReference, setShowReference] = useState<boolean>(false);

  const isTimedChallenge = activity.instruction.includes('1 menit') || activity.instruction.includes('menit');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSubmit = () => {
    if (isBadgeTile) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    onSubmit(answer, isSelfRegulationActivity ? reflection : undefined);
  };

  const isChallenge = activity.cardType === 'Challenge';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header (Calming Soft Tint) */}
        <div
          className={`p-3.5 sm:p-5 md:p-6 border-b flex-shrink-0 ${
            isChallenge
              ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
              : 'bg-sky-50/70 border-sky-100 text-sky-950'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  isChallenge
                    ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                    : 'bg-sky-100/90 text-sky-800 border border-sky-200'
                }`}
              >
                {activity.cardType === 'Challenge' ? '🌿 Tantangan Lapangan' : '🐉 Riddle Analisis'}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs font-bold bg-white text-stone-700 border border-stone-200 px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                Petak #{activity.tileNumber}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/5 text-stone-500 hover:text-stone-800 transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 leading-snug">
            {activity.cardType === 'Challenge'
              ? `Tantangan Lapangan - Petak #${activity.tileNumber}`
              : ['KE-06', 'IA-06', 'AE-06', 'JE-06'].includes(activity.code)
              ? `Tantangan Lencana - Petak #${activity.tileNumber}`
              : `Teka-Teki Analisis - Petak #${activity.tileNumber}`}
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
            Sub-materi: <span className="font-semibold text-slate-800">{activity.zoneName}</span>
          </p>

          {isBadgeTile && (
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-800 text-[10px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
              <span>Petak Lencana! Kelompok tercepat akan memperoleh bonus poin lencana!</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 px-2 sm:px-4 pt-1 gap-1 sm:gap-2 flex-shrink-0 text-[11px] sm:text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stimulus')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 border-b-2 transition ${
              activeTab === 'stimulus'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            1. Soal & Stimulus
          </button>
          <button
            onClick={() => setActiveTab('lkpd')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 border-b-2 transition ${
              activeTab === 'lkpd'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            2. Lembar LKPD
          </button>
          {isSelfRegulationActivity && (
            <button
              onClick={() => setActiveTab('selfReg')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 border-b-2 transition ${
                activeTab === 'selfReg'
                  ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              3. Regulasi Diri
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          {/* TAB 1: SOAL & STIMULUS */}
          {activeTab === 'stimulus' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-stone-50/80 border border-stone-200/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <h4 className="text-[11px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                  Instruksi Aktivitas
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                  {activity.instruction}
                </p>
              </div>

              {activity.stimulus && (
                <div className="bg-stone-50/60 border border-stone-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2">
                  <div className="text-[11px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                    Stimulus Informasi / Fenomena
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-200 leading-relaxed">
                    "{activity.stimulus.content}"
                  </p>
                </div>
              )}

              {/* Stopwatch 60 Detik */}
              {isTimedChallenge && (
                <div className="bg-stone-50 border border-stone-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-semibold text-stone-500">Stopwatch Presentasi</div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono">
                      00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setIsTimerRunning((prev) => !prev)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition ${
                        isTimerRunning
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {isTimerRunning ? 'Jeda' : 'Mulai Hitung'}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(60);
                      }}
                      className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-stone-200/80 text-stone-700 hover:bg-stone-300 transition"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LKPD FORM */}
          {activeTab === 'lkpd' && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Jawaban / Hasil Analisis Kelompok:
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tuliskan temuan kelompokmu di sini secara lengkap dan runtut..."
                  rows={6}
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: REGULASI DIRI (Hanya untuk KE06, IA06, AE06, JE06) */}
          {isSelfRegulationActivity && activeTab === 'selfReg' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <h4 className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                  Kunci Rujukan & Validasi Konsep
                </h4>
                <p className="text-[10px] sm:text-xs text-amber-700/80 mb-2 sm:mb-3">
                  Bandingkan jawaban kelompokmu dengan rujukan biologi di bawah untuk melatih evaluasi mandiri.
                </p>

                {showReference ? (
                  <div className="bg-white border border-amber-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed shadow-sm">
                    <div className="font-bold text-amber-800 text-[11px] sm:text-xs mb-1">Rujukan Biologi:</div>
                    {activity.selfRegulationReference || 'Rujukan konsep disesuaikan dengan materi pembelajaran.'}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReference(true)}
                    className="w-full py-1.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Buka Rujukan Pengecekan
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Refleksi / Alasan Perbaikan Jawaban:
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Tuliskan: 'Apakah ada bagian yang kami perbaiki setelah melihat rujukan? Jika ada, jelaskan alasannya...'"
                  rows={3}
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white transition leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 md:p-5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] sm:text-xs text-stone-500">
            Tim: <span className="font-bold text-slate-800">{team.name}</span>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-stone-600 hover:text-slate-800 hover:bg-stone-200/60 transition"
            >
              Tutup
            </button>
            <button
              onClick={handleSubmit}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 sm:gap-2 shadow-sm transition active:scale-95"
            >
              <span>Kirim Jawaban</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
