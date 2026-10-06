import React, { useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Users,
  LogOut,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface EndClassConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomCode?: string;
  isProcessing?: boolean;
}

export const EndClassConfirmationModal: React.FC<EndClassConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  roomCode,
  isProcessing = false,
}) => {
  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isProcessing) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white border border-rose-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Gradient Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm flex-shrink-0">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Konfirmasi Guru</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Akhiri Sesi Kelas Ini?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Kode Kelas:{' '}
                <span className="font-mono font-bold text-slate-900 bg-stone-100 px-1.5 py-0.5 rounded">
                  {roomCode || 'Sesi Aktif'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition disabled:opacity-40"
            title="Batal dan tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Information Points */}
        <div className="px-5 sm:px-6 py-2 space-y-3">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 space-y-2.5">
            <div className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Berikut konsekuensi tindakan ini:</span>
            </div>

            <ul className="space-y-2 text-xs text-rose-900/90 leading-relaxed pl-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Sesi permainan ditutup:</strong> Seluruh aktivitas belajar dan kompetisi kelas saat ini resmi selesai.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Data permainan dibersihkan:</strong> Posisi seluruh pion akan dikembalikan ke petak awal (START), skor & lencana direset agar ruang kelas kembali siap untuk pertemuan berikutnya.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Siswa serentak kembali ke Ruang Tunggu:</strong> Seluruh gawai siswa di kelas akan dialihkan kembali ke tampilan Lobby.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1 font-medium">
            <Users className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span>Guru akan langsung diarahkan kembali ke Langkah 1: Ruang Tunggu (Lobby).</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200/90 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 mt-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-700 font-bold text-xs sm:text-sm border border-stone-200 transition active:scale-95 disabled:opacity-40"
          >
            Batal / Lanjutkan Kelas
          </button>

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-900/15 transition active:scale-95 disabled:opacity-60"
          >
            {isProcessing ? (
              <span>Mengakhiri Kelas...</span>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Ya, Akhiri Sesi Kelas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
