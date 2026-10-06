import React, { useState } from 'react';
import { Team, ActivityData } from '../../types';
import { ACTIVITIES } from '../../data/boardData';
import {
  X,
  Award,
  CheckCircle,
  ClipboardList,
  Sparkles,
  Layers,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Calendar,
  Eye,
  Sliders,
  UserPlus,
  Trash2,
  Users,
} from 'lucide-react';

interface TeacherDashboardModalProps {
  teams: Team[];
  onUpdateScore: (teamId: number, activityCode: string, score: number) => void;
  onUpdateBadge: (teamId: number, zoneId: number, badgeRank: 1 | 2 | 3) => void;
  onResetGame: () => void;
  onAddTeam?: () => void;
  onRemoveTeam?: (id: number) => void;
  onClose: () => void;
  teamAnswers: Record<number, Record<string, { answer: string; reflection?: string; score?: number }>>;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  teams,
  onUpdateScore,
  onUpdateBadge,
  onResetGame,
  onAddTeam,
  onRemoveTeam,
  onClose,
  teamAnswers,
}) => {
  const [activeTab, setActiveTab] = useState<'rubric' | 'badges' | 'session'>('rubric');
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [selectedActivityCode, setSelectedActivityCode] = useState<string>('KE-01');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const selectedActivity: ActivityData = ACTIVITIES[selectedActivityCode] || Object.values(ACTIVITIES)[0];
  const currentSubmission = teamAnswers[selectedTeamId]?.[selectedActivityCode];

  // Activities filtered by zone
  const zoneActivities = Object.values(ACTIVITIES).filter((a) => a.zoneId === selectedZone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Panel Penilaian Guru
                </h2>
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex-shrink-0">
                  Mode Pendidik
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                Penilaian Rubrik LKPD & Pencatatan Lencana Kecepatan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 sm:px-6 gap-1 sm:gap-3 flex-shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'border-emerald-700 text-emerald-800 bg-white px-3 -mb-[1px] rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-slate-800 px-2'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">1. Rubrik LKPD</span>
            <span className="hidden sm:inline">1. Penilaian Rubrik LKPD (0–3 Poin)</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
              activeTab === 'badges'
                ? 'border-amber-600 text-amber-800 bg-white px-3 -mb-[1px] rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-slate-800 px-2'
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">2. Lencana</span>
            <span className="hidden sm:inline">2. Pencatatan Lencana Kecepatan Zona</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
              activeTab === 'session'
                ? 'border-indigo-600 text-indigo-800 bg-white px-3 -mb-[1px] rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-slate-800 px-2'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">3. Tim & Reset</span>
            <span className="hidden sm:inline">3. Manajemen Tim & Reset</span>
          </button>
        </div>

        {/* BODY TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#fcfdfd]">
          {/* ================= TAB 1: PENILAIAN RUBRIK LKPD ================= */}
          {activeTab === 'rubric' && (
            <div className="space-y-5">
              {/* Row 1: Pilih Kelompok */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Pilih Kelompok Siswa:
                  </label>
                  {onAddTeam && (
                    <button
                      onClick={onAddTeam}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition shadow-sm active:scale-95"
                      title="Tambah Kelompok Baru"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Tambah Kelompok</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2 ${
                        t.id === selectedTeamId
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-500'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-lg">{t.avatarIcon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">Kel. {t.id}</div>
                        <div className="text-[10px] text-stone-500 font-medium truncate">
                          Skor: <span className="font-bold text-emerald-700">{t.lkpdScore}</span> pt
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Filter Zona & Aktivitas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Pilih Aktivitas LKPD:
                  </label>
                  <div className="flex gap-1 text-[11px] font-bold">
                    {[1, 2, 3, 4].map((z) => (
                      <button
                        key={z}
                        onClick={() => {
                          setSelectedZone(z);
                          const firstAct = Object.values(ACTIVITIES).find((a) => a.zoneId === z);
                          if (firstAct) setSelectedActivityCode(firstAct.code);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          selectedZone === z
                            ? 'bg-slate-800 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Zona {z}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {zoneActivities.map((act) => {
                    const isGraded = teamAnswers[selectedTeamId]?.[act.code]?.score !== undefined;
                    const isSelected = act.code === selectedActivityCode;
                    return (
                      <button
                        key={act.code}
                        onClick={() => setSelectedActivityCode(act.code)}
                        className={`p-2 rounded-xl border text-center transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                            : isGraded
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{act.code}</div>
                        <div className="text-[10px] opacity-80">{act.indicator}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail Aktivitas & Jawaban Siswa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri: Instruksi & Kunci Rujukan Dokumen Word */}
                <div className="bg-white border border-stone-200 p-4 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      {selectedActivity.code}: {selectedActivity.indicator} ({selectedActivity.level})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      Petak #{selectedActivity.tileNumber}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-stone-500 uppercase">Instruksi Soal:</div>
                    <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                      {selectedActivity.instruction}
                    </p>
                  </div>

                  {selectedActivity.expectedResult && (
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Rujukan Jawaban Resmi (Kisi-kisi):
                      </div>
                      <p className="text-xs text-amber-950 mt-1 whitespace-pre-line leading-relaxed">
                        {selectedActivity.expectedResult}
                      </p>
                    </div>
                  )}
                </div>

                {/* Kolom Kanan: Jawaban Siswa & Input Rubrik */}
                <div className="bg-white border border-stone-200 p-4 rounded-2xl space-y-3 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-sky-600" />
                        Jawaban Kelompok {selectedTeam.id} ({selectedTeam.name})
                      </span>
                    </div>

                    <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 min-h-[90px] text-xs text-slate-800">
                      {currentSubmission?.answer ? (
                        <>
                          <p className="whitespace-pre-line leading-relaxed">
                            {currentSubmission.answer.replace(/\[Foto Bukti Lapangan\]:\s*data:image\/[^\s]+/g, '').trim()}
                          </p>
                          {currentSubmission.answer.includes('[Foto Bukti Lapangan]:') && (
                            <div className="mt-2.5 pt-2.5 border-t border-stone-200">
                              <span className="text-[11px] font-bold text-emerald-800 block mb-1.5 flex items-center gap-1">
                                📷 Bukti Foto Lapangan Siswa:
                              </span>
                              {(() => {
                                const photoMatch = currentSubmission.answer.match(/\[Foto Bukti Lapangan\]:\s*(data:image\/[^\s]+)/);
                                return photoMatch ? (
                                  <img
                                    src={photoMatch[1]}
                                    alt="Foto Lapangan Siswa"
                                    className="max-h-48 rounded-xl border border-stone-300 object-cover shadow-sm"
                                  />
                                ) : null;
                              })()}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-stone-400 italic">
                          Belum ada teks jawaban tersimpan dari kelompok ini. Guru dapat tetap memberi skor rubrik berdasarkan pengamatan langsung di kelas.
                        </p>
                      )}
                    </div>

                    {currentSubmission?.reflection && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                        <span className="font-bold text-amber-800 text-[11px]">Refleksi Regulasi Diri: </span>
                        <span className="text-amber-950">{currentSubmission.reflection}</span>
                      </div>
                    )}
                  </div>

                  {/* Rubrik Penilaian 0 - 3 Sesuai Bagian H */}
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                        Beri Skor Rubrik LKPD (Bagian H):
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        Skor Saat Ini: {currentSubmission?.score !== undefined ? `${currentSubmission.score} / 3` : 'Belum dinilai'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { score: 3, label: '3 (Lengkap & Tepat)', desc: 'Lengkap, tepat, didukung bukti data' },
                        { score: 2, label: '2 (Cukup Lengkap)', desc: 'Cukup lengkap, bukti kurang mendalam' },
                        { score: 1, label: '1 (Kurang Lengkap)', desc: 'Belum lengkap, bukti minim' },
                        { score: 0, label: '0 (Tidak Relevan)', desc: 'Tidak dikerjakan / tidak relevan' },
                      ].map((item) => (
                        <button
                          key={item.score}
                          onClick={() => onUpdateScore(selectedTeamId, selectedActivityCode, item.score)}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            currentSubmission?.score === item.score
                              ? 'border-emerald-600 bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300'
                              : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <div className="text-sm font-extrabold">{item.score}</div>
                          <div className="text-[10px] leading-tight line-clamp-1 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PENCATATAN LENCANA ZONA ================= */}
          {activeTab === 'badges' && (
            <div className="space-y-5">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4 text-amber-700" />
                  Aturan Lencana Kecepatan (Bagian C Dokumen Kisi-kisi):
                </div>
                Tiga kelompok pertama yang tiba di petak lencana pada tiap zona memperoleh poin:
                <br />
                • <strong>Juara 1:</strong> 3 Poin &nbsp;|&nbsp; • <strong>Juara 2:</strong> 2 Poin &nbsp;|&nbsp; • <strong>Juara 3:</strong> 1 Poin.
                <br />
                Guru mencatat urutan tiba kelompok dan mengonfirmasi lencana di panel ini.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { zone: 1, title: 'Zona 1: Komponen Ekosistem', tile: 10 },
                  { zone: 2, title: 'Zona 2: Interaksi Makhluk Hidup', tile: 22 },
                  { zone: 3, title: 'Zona 3: Aliran Energi', tile: 38 },
                  { zone: 4, title: 'Zona 4: Jenis Ekosistem', tile: 50 },
                ].map((z) => (
                  <div key={z.zone} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">{z.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Petak #{z.tile}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center justify-between text-xs gap-2">
                          <span className="font-semibold text-stone-600 flex items-center gap-1 w-24">
                            <span>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} Juara {rank}:</span>
                            <span className="text-[10px] text-amber-700 font-bold">
                              (+{rank === 1 ? 3 : rank === 2 ? 2 : 1} pt)
                            </span>
                          </span>

                          <select
                            onChange={(e) => {
                              const tid = Number(e.target.value);
                              if (tid > 0) onUpdateBadge(tid, z.zone, rank as 1 | 2 | 3);
                            }}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                            defaultValue=""
                          >
                            <option value="" disabled>-- Pilih Tim Penerima --</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.avatarIcon} {t.name} (Poin Lencana: {t.badgePoints})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MANAJEMEN TIM & RESET ================= */}
          {activeTab === 'session' && (
            <div className="space-y-5">
              {/* Manajemen Kelompok Kelas */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      Manajemen Kelompok Kelas ({teams.length} Kelompok):
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tambah atau kelola kelompok siswa yang bertanding di papan permainan.
                    </p>
                  </div>
                  {onAddTeam && (
                    <button
                      onClick={onAddTeam}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Tambah Kelompok</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {teams.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.avatarIcon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{t.name}</div>
                          <div className="text-[10px] text-stone-500">
                            Petak #{t.currentTile} • LKPD: {t.lkpdScore} pt
                          </div>
                        </div>
                      </div>
                      {onRemoveTeam && teams.length > 2 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus ${t.name}?`)) {
                              onRemoveTeam(t.id);
                            }
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                          title={`Hapus ${t.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Akhiri Sesi Kelas & Bersihkan Data */}
              <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Fitur Akhiri Sesi Kelas:</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Gunakan tombol ini setelah proses pembelajaran selesai. Tindakan ini akan <strong>menghapus seluruh jawaban LKPD siswa</strong>, mengembalikan seluruh pion ke petak START, dan mereset perolehan skor agar website kembali bersih dan siap digunakan untuk kelas berikutnya.
                </p>

                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      '⚠️ KONFIRMASI AKHIRI KELAS:\n\nApakah Anda yakin ingin mengakhiri sesi kelas ini?\n\nSeluruh progres permainan, posisi pion kelompok, dan jawaban LKPD yang ada di website ini akan dihapus dan dikosongkan kembali.'
                    );
                    if (confirmed) {
                      onResetGame();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🛑 Akhiri Kelas & Hapus Seluruh Progres</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-stone-500">
            Total 24 Aktivitas LKPD • Maksimal Skor LKPD: 72 pt • Lencana: 12 pt
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            Tutup Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
