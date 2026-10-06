import React, { useState } from 'react';
import { Play, LogOut, GraduationCap } from 'lucide-react';

interface TeacherSessionCreatorProps {
  teacherName?: string;
  onCreateSession: (className: string, academicYear: string) => void;
  onLogout: () => void;
  onCancel?: () => void;
}

export const TeacherSessionCreator: React.FC<TeacherSessionCreatorProps> = ({
  teacherName,
  onCreateSession,
  onLogout,
  onCancel,
}) => {
  const [className, setClassName] = useState('Kelas Biologi');
  const [academicYear, setAcademicYear] = useState('2026/2027');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    onCreateSession(className.trim(), academicYear.trim());
  };

  return (
    <div className="min-h-full w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-biology-pattern text-slate-800">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 truncate max-w-[160px] xs:max-w-[200px] sm:max-w-none">
                {teacherName || 'Pendidik'}
              </h2>
              <p className="text-xs text-stone-500">Pendidik</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-semibold text-stone-500 hover:text-rose-600 flex items-center gap-1 p-2 rounded-xl hover:bg-stone-50 transition"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        {/* Title & Info */}
        <div className="text-center space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buat Ruang Kelas Baru
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Tentukan nama kelas dan tahun ajaran untuk menerbitkan kode ruang kelas siswa.
          </p>
        </div>

        {/* Form Creation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nama Kelas / Rombongan Belajar:
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Contoh: Kelas Biologi"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tahun Ajaran / Semester:
            </label>
            <input
              type="text"
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026/2027"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-1/3 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Buat Ruang Kelas</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-stone-400 text-center pt-2">
          Kode sesi kelas akan otomatis dibuat dan siap dibagikan ke siswa di ruang tunggu.
        </p>
      </div>
    </div>
  );
};
