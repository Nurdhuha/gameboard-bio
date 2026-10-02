import React, { useState } from 'react';
import { TestQuestion, Team } from '../../types';
import { PRE_POST_QUESTIONS } from '../../data/boardData';
import { X, Award, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PrePostTestModalProps {
  type: 'pre' | 'post';
  team: Team;
  onClose: () => void;
  onComplete: (score: number) => void;
}

export const PrePostTestModal: React.FC<PrePostTestModalProps> = ({
  type,
  team,
  onClose,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const questions: TestQuestion[] = PRE_POST_QUESTIONS;
  const currentQ = questions[currentIndex];

  const handleSelectOption = (qId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleFinish = () => {
    setIsFinished(true);
    confetti({ particleCount: 70, spread: 60 });
    const score = calculateScore();
    onComplete(score);
  };

  const score = isFinished ? calculateScore() : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-stone-200/90 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[88vh] text-slate-800">
        {/* Header (Calming Green/Purple) */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${
            type === 'pre'
              ? 'bg-emerald-50/80 border-emerald-100 text-emerald-950'
              : 'bg-purple-50/80 border-purple-100 text-purple-950'
          }`}
        >
          <div>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-500">
              Evaluasi Berpikir Kritis
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              {type === 'pre' ? '📝 Pre-Test Kemampuan Awal' : '🎯 Post-Test Evaluasi Akhir'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">Kelompok: {team.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-stone-500 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isFinished ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 font-bold mb-1">
                <span>Soal {currentIndex + 1} dari {questions.length}</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/80 text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                {currentQ.question}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl text-sm sm:text-base font-medium border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                          : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-500 border border-stone-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex p-3.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Award className="w-10 h-10" />
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">Tes Berhasil Diselesaikan!</h4>
              <p className="text-sm sm:text-base text-stone-600">
                Skor Anda:{' '}
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                  {score} / 100
                </span>
              </p>
              <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-600 text-left space-y-1.5 leading-relaxed">
                <div className="font-bold text-slate-800">Catatan:</div>
                <p>
                  Hasil tes telah disimpan. Keterampilan berpikir kritis kelompokmu akan terus diasah pada setiap petak aktivitas di papan gameboard!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
          {!isFinished ? (
            <>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-stone-600 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                Sebelumnya
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  onClick={handleFinish}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm active:scale-95"
                >
                  Selesai & Kumpulkan
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-sm active:scale-95"
            >
              Kembali ke Papan Permainan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
