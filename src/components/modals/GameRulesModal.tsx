import React from 'react';
import { X, BookOpen, Trophy, Users, Compass, Award, HelpCircle, CheckCircle2 } from 'lucide-react';

interface GameRulesModalProps {
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">Aturan Permainan Ecoplay</h3>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                Petunjuk alur bermain dan mekanisme kompetisi kelompok
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-stone-500 hover:text-stone-800 transition"
            aria-label="Tutup Aturan Permainan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs sm:text-sm leading-relaxed">
          {/* Card 1: Aturan Dasar Permainan */}
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base border-b border-stone-200/70 pb-2">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>Petunjuk Alur Permainan</span>
            </div>

            <ul className="space-y-2.5 text-stone-700">
              <li className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Kerja Sama Tim:</strong> Buat kelompok sesuai arahan guru. Semua anggota wajib berdiskusi aktif dan berpartisipasi, hindari hanya satu orang yang bekerja.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Permainan Tanpa Dadu:</strong> Cukup ikuti urutan petak aktivitas yang muncul pada gawai kelompok kalian.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pengerjaan E-LKPD:</strong> Selesaikan tugas bersama kelompok, lalu ketik jawaban pada kolom atau tabel yang disediakan. Setelah terkirim, lanjutkan ke aktivitas berikutnya.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Jelajahi 4 Zona Ekologis:</strong>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-semibold text-[11px] sm:text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">1. Komponen Ekosistem</span>
                    <span className="text-stone-400">➔</span>
                    <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800">2. Interaksi Makhluk Hidup</span>
                    <span className="text-stone-400">➔</span>
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800">3. Aliran Energi</span>
                    <span className="text-stone-400">➔</span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800">4. Jenis Ekosistem</span>
                  </div>
                  <p className="mt-1 text-stone-500 text-[11px]">Selesaikan seluruh aktivitas hingga mencapai petak Finish.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Observasi Lapangan:</strong> Sebagian aktivitas meminta pengamatan langsung di halaman sekolah. Jika objek sulit ditemukan, gunakan tautan rujukan yang disediakan di modul.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Konsultasi Guru:</strong> Jika ada instruksi atau materi yang belum dipahami, jangan ragu untuk bertanya langsung kepada guru pendamping.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Sistem Kompetisi & Penilaian */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base border-b border-amber-200/60 pb-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              <span>Yuk, Berkompetisi! (Penilaian & Lencana)</span>
            </div>

            <div className="space-y-3 text-stone-700">
              <div>
                <p className="font-semibold text-amber-950 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Perebutan Lencana Kecepatan di Tiap Zona:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/90 border border-amber-200 rounded-xl p-2 shadow-xs">
                    <span className="text-base">🥇</span>
                    <div className="font-bold text-amber-950">Lencana 1</div>
                    <div className="text-emerald-700 font-extrabold">+3 Poin</div>
                  </div>
                  <div className="bg-white/90 border border-amber-200 rounded-xl p-2 shadow-xs">
                    <span className="text-base">🥈</span>
                    <div className="font-bold text-amber-950">Lencana 2</div>
                    <div className="text-blue-700 font-extrabold">+2 Poin</div>
                  </div>
                  <div className="bg-white/90 border border-amber-200 rounded-xl p-2 shadow-xs">
                    <span className="text-base">🥉</span>
                    <div className="font-bold text-amber-950">Lencana 3</div>
                    <div className="text-stone-700 font-extrabold">+1 Poin</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-200/50 pt-2 space-y-1.5">
                <p>
                  <strong>Penilaian Kualitas Jawaban:</strong> Jawaban E-LKPD kelompok akan dinilai oleh Bapak/Ibu Guru dengan skor rubrik <strong>0 s.d. 3</strong>.
                </p>
                <p>
                  <strong>Penentuan Juara:</strong> Juara ditentukan dari <strong>gabungan skor kualitas LKPD dan poin lencana kecepatan</strong>.
                </p>
                <p className="text-amber-900 font-medium italic text-[11px] sm:text-xs">
                  Hasil skor diumumkan pada klasemen kelas, jadi tetap semangat dan berikan analisis terbaik kalian sampai akhir!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-stone-500 font-medium">Selamat bermain sambil belajar! 🌿</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
