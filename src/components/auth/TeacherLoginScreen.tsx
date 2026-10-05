import React, { useState } from 'react';
import { LogIn, UserPlus, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TeacherLoginScreenProps {
  onLoginSuccess: (teacher: { id: string; name: string; email: string }, token: string) => void;
  onContinueDemoMode?: () => void;
}

export const TeacherLoginScreen: React.FC<TeacherLoginScreenProps> = ({
  onLoginSuccess,
  onContinueDemoMode,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (tab === 'register') {
      if (!name.trim()) {
        setErrorMsg('Nama lengkap guru wajib diisi.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password minimal 6 karakter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { email, password } : { name, email, password };

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Terjadi kesalahan saat memproses data.');
      }

      // Simpan sesi login ke localStorage
      localStorage.setItem('ecoplay_teacher_token', data.token);
      localStorage.setItem('ecoplay_teacher_profile', JSON.stringify(data.teacher));

      onLoginSuccess(data.teacher, data.token);
    } catch (err: any) {
      console.warn('Login error:', err.message);
      setErrorMsg(err.message || 'Gagal memproses data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-biology-pattern text-slate-800">
      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand & Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {tab === 'login' ? 'Masuk sebagai Guru' : 'Daftar Akun Guru'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {tab === 'login'
              ? 'Kelola ruang kelas dan aktivitas belajar siswa.'
              : 'Daftarkan akun untuk menyimpan riwayat sesi dan nilai.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === 'login' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === 'register' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Lengkap & Gelar:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap dan gelar (misal: S.Pd.)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Alamat Email:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guru@sekolah.sch.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Kata Sandi (Password):
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Konfirmasi Kata Sandi:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : tab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Kelas</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan Pendaftaran</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
