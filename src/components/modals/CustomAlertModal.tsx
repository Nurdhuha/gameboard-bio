import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface CustomAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: AlertType;
  title: string;
  badge?: string;
  message: string;
  highlightText?: string;
  subMessage?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  badge,
  message,
  highlightText,
  subMessage,
  confirmText = 'Mengerti',
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        if (onConfirm) onConfirm();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          barGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
          iconBox: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          icon: <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />,
          badgeBg: 'bg-emerald-100/90 border-emerald-200 text-emerald-800',
          defaultBadge: 'BERHASIL',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20',
          calloutBg: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
        };
      case 'error':
        return {
          barGradient: 'from-amber-500 via-rose-500 to-rose-600',
          iconBox: 'bg-rose-50 border-rose-200 text-rose-600',
          icon: <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
          badgeBg: 'bg-rose-100/90 border-rose-200 text-rose-800',
          defaultBadge: 'TERJADI KESALAHAN',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-700/20',
          calloutBg: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
        };
      case 'warning':
        return {
          barGradient: 'from-amber-400 via-amber-500 to-orange-500',
          iconBox: 'bg-amber-50 border-amber-200 text-amber-600',
          icon: <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />,
          badgeBg: 'bg-amber-100/90 border-amber-200 text-amber-800',
          defaultBadge: 'PERHATIAN',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-700/20',
          calloutBg: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
        };
      case 'info':
      default:
        return {
          barGradient: 'from-teal-400 via-blue-500 to-indigo-600',
          iconBox: 'bg-blue-50 border-blue-200 text-blue-600',
          icon: <Info className="w-6 h-6 sm:w-7 sm:h-7" />,
          badgeBg: 'bg-blue-100/90 border-blue-200 text-blue-800',
          defaultBadge: 'INFORMASI',
          btnBg: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
          calloutBg: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleAction} />

      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Gradient Accent Bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${theme.barGradient}`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shadow-sm flex-shrink-0 ${theme.iconBox}`}
            >
              {theme.icon}
            </div>

            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${theme.badgeBg}`}
              >
                <span>{badge || theme.defaultBadge}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleAction}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Information Callout */}
        <div className="px-5 sm:px-6 py-2 space-y-3">
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 ${theme.calloutBg}`}>
            <p className="font-medium whitespace-pre-line">{message}</p>
            {highlightText && (
              <div className="pt-1">
                <span className="font-mono font-bold bg-white/90 px-2.5 py-1 rounded-lg border border-stone-200 text-slate-900 inline-block shadow-xs text-xs sm:text-sm">
                  {highlightText}
                </span>
              </div>
            )}
            {subMessage && (
              <p className="text-[11px] opacity-85 pt-1.5 border-t border-black/5 whitespace-pre-line">
                {subMessage}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 sm:p-6 pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAction}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 flex items-center justify-center gap-2 ${theme.btnBg}`}
          >
            <span>{confirmText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
