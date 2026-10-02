import React, { useState } from 'react';
import { ActivityData, Team } from '../../types';
import { ACTIVITIES } from '../../data/boardData';
import {
  X,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Video,
  FolderUp,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityModalProps {
  activity: ActivityData;
  team: Team;
  onClose: () => void;
  onSubmit: (answer: string, reflection?: string) => void;
  isBadgeTile?: boolean;
  previousAnswers?: Record<string, { answer: string; reflection?: string; score?: number }>;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  team,
  onClose,
  onSubmit,
  isBadgeTile = false,
  previousAnswers = {},
}) => {
  const cleanCode = activity.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const isKE01 = cleanCode === 'KE01';
  const isKE05 = cleanCode === 'KE05';
  const isSelfRegulationFocus =
    ['KE06', 'IA06', 'AE06', 'JE06'].includes(cleanCode) ||
    activity.indicator === 'Regulasi Diri';

  const existingRecord = previousAnswers[activity.code];

  // Tab aktif default: Jika fokus regulasi diri (KE06 dsb), langsung buka tab regulasi diri
  const [activeTab, setActiveTab] = useState<'stimulus' | 'lkpd' | 'selfReg'>(
    isSelfRegulationFocus ? 'selfReg' : 'stimulus'
  );

  const [answer, setAnswer] = useState<string>(existingRecord?.answer || '');
  const [reflection, setReflection] = useState<string>(
    existingRecord?.reflection || (isSelfRegulationFocus ? existingRecord?.answer || '' : '')
  );
  const [showReference, setShowReference] = useState<boolean>(false);

  // Helper parser & state tabel 2 kolom khusus KE-01
  const parseKE01Data = (savedText?: string) => {
    const defaultRows = [
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
    ];
    if (!savedText) return { rows: defaultRows, explanation: '' };

    const rows: Array<{ biotik: string; abiotik: string }> = [];
    let explanation = '';
    const lines = savedText.split('\n');
    let inExplanation = false;

    for (const line of lines) {
      if (line.includes('[Penjelasan Perbedaan]:')) {
        inExplanation = true;
        continue;
      }
      if (inExplanation) {
        explanation += (explanation ? '\n' : '') + line;
        continue;
      }
      const match = line.match(/^\d+\.\s*Biotik:\s*(.*?)\s*\|\s*Abiotik:\s*(.*?)$/i);
      if (match) {
        rows.push({
          biotik: match[1] === '-' ? '' : match[1],
          abiotik: match[2] === '-' ? '' : match[2],
        });
      }
    }

    return {
      rows: rows.length > 0 ? rows : defaultRows,
      explanation: inExplanation ? explanation.trim() : (rows.length === 0 ? savedText : ''),
    };
  };

  const initialKE01 = parseKE01Data(existingRecord?.answer);
  const [tableRows, setTableRows] = useState<Array<{ biotik: string; abiotik: string }>>(initialKE01.rows);
  const [explanation, setExplanation] = useState<string>(initialKE01.explanation);

  const handleAddRow = () => {
    setTableRows((prev) => [...prev, { biotik: '', abiotik: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (tableRows.length <= 1) return;
    setTableRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: 'biotik' | 'abiotik', value: string) => {
    setTableRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Helper mencari aktivitas sebelumnya dalam 1 zona (untuk KE-06 menampilkan KE-01 s/d KE-05)
  const getPreviousActivityCodes = (code: string) => {
    const prefix = code.split('-')[0];
    const num = parseInt(code.split('-')[1] || '0', 10);
    const codes: string[] = [];
    for (let i = 1; i < num; i++) {
      codes.push(`${prefix}-0${i}`);
    }
    return codes;
  };
  const previousActivityCodes = getPreviousActivityCodes(activity.code);

  const handleSubmit = () => {
    if (isBadgeTile) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    if (isKE01) {
      const rowsText = tableRows
        .map((r, i) => `${i + 1}. Biotik: ${r.biotik.trim() || '-'} | Abiotik: ${r.abiotik.trim() || '-'}`)
        .join('\n');
      const finalAnswer = `[Tabel Komponen Ekosistem]\n${rowsText}\n\n[Penjelasan Perbedaan]:\n${explanation.trim()}`;
      onSubmit(finalAnswer, undefined);
    } else if (isSelfRegulationFocus) {
      // Pada KE-06, refleksi merupakan jawaban utama
      onSubmit(reflection, reflection);
    } else {
      onSubmit(answer, undefined);
    }
  };

  const isChallenge = activity.cardType === 'Challenge';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
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
            {['KE-06', 'IA-06', 'AE-06', 'JE-06'].includes(activity.code)
              ? `Tantangan Lencana - Petak #${activity.tileNumber}`
              : activity.cardType === 'Challenge'
              ? `Tantangan Lapangan - Petak #${activity.tileNumber}`
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
            1. Soal & Petunjuk
          </button>

          {/* Tab LKPD biasa: Dihilangkan khusus aktivitas Regulasi Diri (KE-06) */}
          {!isSelfRegulationFocus && (
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
          )}

          {/* Tab Regulasi Diri: Khusus aktivitas akhir (KE06, IA06, AE06, JE06) */}
          {isSelfRegulationFocus && (
            <button
              onClick={() => setActiveTab('selfReg')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 border-b-2 transition ${
                activeTab === 'selfReg'
                  ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              2. Regulasi Diri & Refleksi
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          {/* TAB 1: SOAL & PETUNJUK */}
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

              {/* Tautan Khusus Pengumpulan Video untuk KE-05 */}
              {isKE05 && (
                <div className="bg-sky-50 border border-sky-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-[11px] sm:text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
                    Pengumpulan Video Presentasi Lapangan
                  </div>
                  <p className="text-xs text-sky-900 leading-relaxed">
                    Unggah rekaman video presentasi kelompokmu ke folder Google Drive resmi berikut:
                  </p>
                  <a
                    href="https://drive.google.com/drive/folders/1F9hWxZnuCJmvJ83QPdlQ8nKRwiQRY-c7?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>Buka Google Drive Pengumpulan Video ↗</span>
                  </a>
                </div>
              )}

              {/* Tautan Khusus Dokumen Rujukan Regulasi Diri untuk KE-06 */}
              {cleanCode === 'KE06' && (
                <div className="bg-amber-50/80 border border-amber-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                    Dokumen Rujukan Regulasi Diri (Google Drive)
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Akses dokumen rujukan biologi resmi untuk memvalidasi dan merefleksikan jawaban kelompokmu:
                  </p>
                  <a
                    href="https://drive.google.com/file/d/1_lJuOVjOoIzU0SRawg7cZp9z44kbmL0b/view?usp=drive_tautan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>Buka Dokumen Rujukan di Google Drive ↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LKPD FORM (Untuk aktivitas biasa / bukan KE-06) */}
          {!isSelfRegulationFocus && activeTab === 'lkpd' && (
            <div className="space-y-3 sm:space-y-4">
              {/* KHUSUS KE-01: Format Tabel 2 Kolom (Biotik & Abiotik) */}
              {isKE01 ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] sm:text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Tabel Pengamatan (Kolom 1: Biotik | Kolom 2: Abiotik)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-extrabold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3">Komponen Biotik</th>
                            <th className="py-2.5 px-3">Komponen Abiotik</th>
                            {tableRows.length > 4 && (
                              <th className="py-2.5 px-2 w-10 text-center">Hapus</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {tableRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 text-center font-bold text-stone-400 text-xs">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.biotik}
                                  onChange={(e) => handleRowChange(idx, 'biotik', e.target.value)}
                                  placeholder="Contoh: Rumput, Semut..."
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.abiotik}
                                  onChange={(e) => handleRowChange(idx, 'abiotik', e.target.value)}
                                  placeholder="Contoh: Tanah, Air, Batu..."
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              {tableRows.length > 4 && (
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Kolom Jawaban Ketik di Bawah Tabel: Penjelasan Perbedaan Biotik & Abiotik */}
                  <div className="bg-stone-50/80 border border-stone-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>Kolom Jawaban: Penjelasan Perbedaan Biotik dan Abiotik</span>
                    </label>
                    <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                      Berdasarkan data temuan kelompokmu pada tabel pengamatan di atas, jelaskan apa perbedaan mendasar antara komponen biotik dan abiotik:
                    </p>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Tuliskan penjelasan perbedaan antara komponen biotik dan abiotik di sini secara lengkap dan runtut..."
                      rows={4}
                      className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                    />
                  </div>
                </div>
              ) : isKE05 ? (
                /* KHUSUS KE-05: Pengumpulan Video Drive + Konfirmasi LKPD */
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-sky-50 border border-sky-200 p-3 sm:p-4 rounded-xl space-y-2">
                    <div className="text-[11px] sm:text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
                      Tautan Pengumpulan Video Google Drive
                    </div>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      Unggah file video presentasi kelompok ke tautan Google Drive resmi di bawah ini:
                    </p>
                    <a
                      href="https://drive.google.com/drive/folders/1F9hWxZnuCJmvJ83QPdlQ8nKRwiQRY-c7?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                    >
                      <FolderUp className="w-4 h-4" />
                      <span>Buka Google Drive Pengumpulan Video ↗</span>
                    </a>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Konfirmasi Pengumpulan Video & Catatan Presentasi:
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Contoh: 'Video presentasi kelompok telah diunggah dengan nama file: Video_Kelompok 1_KE05.mp4'. Tuliskan juga ringkasan temuan dan poin presentasi kalian di sini..."
                      rows={5}
                      className="w-full bg-stone-50/50 border border-stone-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* KE-02, KE-03, KE-04, DLL: Jawaban Ketik Standar */
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
              )}
            </div>
          )}

          {/* TAB 3: REGULASI DIRI & REFLEKSI (Khusus KE-06 dsb, menggantikan Lembar LKPD) */}
          {isSelfRegulationFocus && activeTab === 'selfReg' && (
            <div className="space-y-3 sm:space-y-4">
              {/* 1. Kunci Rujukan & Validasi Konsep */}
              <div className="bg-amber-50/70 border border-amber-200/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-2.5">
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                    Kunci Rujukan & Validasi Konsep
                  </h4>
                  <p className="text-[10px] sm:text-xs text-amber-700/80">
                    Bandingkan jawaban kelompokmu dengan rujukan biologi di bawah untuk melatih evaluasi mandiri.
                  </p>
                </div>

                {cleanCode === 'KE06' && (
                  <a
                    href="https://drive.google.com/file/d/1_lJuOVjOoIzU0SRawg7cZp9z44kbmL0b/view?usp=drive_tautan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>Buka Dokumen Rujukan Regulasi Diri (Google Drive) ↗</span>
                  </a>
                )}

                {showReference ? (
                  <div className="bg-white border border-amber-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed shadow-sm">
                    <div className="font-bold text-amber-800 text-[11px] sm:text-xs mb-1">Ringkasan Rujukan Biologi:</div>
                    <div className="whitespace-pre-line text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {activity.selfRegulationReference || 'Rujukan konsep disesuaikan dengan materi pembelajaran.'}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReference(true)}
                    className="w-full py-1.5 sm:py-2 bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                    <span>Lihat Ringkasan Rujukan di Sini</span>
                  </button>
                )}
              </div>

              {/* 2. Riwayat Jawaban Kelompok dari Aktivitas Sebelumnya (KE-01 s/d KE-05) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-stone-500" />
                    Riwayat Jawaban Kelompok ({previousActivityCodes[0]} s/d {previousActivityCodes[previousActivityCodes.length - 1]}):
                  </h5>
                  <span className="text-[10px] text-stone-400 font-medium">Bandingkan dengan rujukan</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {previousActivityCodes.map((code) => {
                    const act = ACTIVITIES[code];
                    const prevData = previousAnswers[code];
                    return (
                      <div key={code} className="p-2.5 sm:p-3 rounded-xl border border-stone-200/90 bg-white shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            Petak #{act?.tileNumber || '?'}: {act ? (act.cardType === 'Challenge' ? 'Tantangan Lapangan' : 'Teka-Teki Analisis') : code}
                          </span>
                          <span
                            className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              prevData?.answer
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {prevData?.answer ? '✓ Ada Jawaban' : 'Belum Dikerjakan'}
                          </span>
                        </div>
                        {prevData?.answer ? (
                          <p className="text-xs text-stone-700 whitespace-pre-line bg-stone-50 p-2 rounded-lg border border-stone-100 leading-relaxed">
                            {prevData.answer}
                          </p>
                        ) : (
                          <p className="text-[11px] text-stone-400 italic py-0.5">
                            Kelompok belum menyimpan jawaban untuk aktivitas ini.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Satu Kolom Jawaban Ketik: Refleksi & Perbaikan Jawaban */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Refleksi & Perbaikan Jawaban Kelompok:
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Periksa kembali jawaban kelompokmu di atas dengan membandingkannya terhadap kunci rujukan. Tuliskan jika ada bagian yang diperbaiki atau alasan mempertahankan jawaban..."
                  rows={4}
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
