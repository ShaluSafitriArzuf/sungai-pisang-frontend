import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function IconGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.1C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.31 14.31c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.64H1.3A11.98 11.98 0 0 0 0 12.03c0 1.93.46 3.76 1.3 5.38l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.64l4.01 3.1c.94-2.83 3.58-4.97 6.69-4.97z" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(searchParams.get('google_error') || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'wisatawan') navigate('/beranda');
      else if (user.role === 'pengantar_pulau') navigate('/pengantar/dashboard');
      else navigate('/pengelola/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pb-10 bg-surface-container">
      {/* Header foto — ganti url ini dengan foto asli Pulau Sungai Pisang kalau sudah ada */}
      <header className="relative w-full h-[320px] header-curved sea-mist-shadow">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10 z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center h-full pt-8">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-white tracking-tight drop-shadow-md">
            Jelajah Bahari
          </h1>
          <p className="font-label-md text-label-md text-white/90 tracking-widest mt-1 uppercase">
            Marine Discovery
          </p>
        </div>
      </header>

      <main className="w-full max-w-md px-container-margin -mt-10 relative z-30">
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/10 relative">
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface">Selamat Datang</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Silakan masuk untuk melanjutkan petualangan Anda.
            </p>
          </div>

          {error && <p className="text-error text-sm mb-4">{error}</p>}

          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-stack-sm">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-stack-sm">
              <div className="flex justify-between items-end px-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                  Kata Sandi
                </label>
                <Link
                  to="/lupa-password"
                  className="font-label-md text-label-md text-primary font-semibold hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#F4A261] text-white font-title-lg text-title-lg rounded-xl shadow-lg shadow-[#F4A261]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4 hover:brightness-105 disabled:opacity-70"
            >
              <span>{loading ? 'Memproses...' : 'Masuk'}</span>
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-label-md">
              <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-label-md">
                Atau masuk dengan
              </span>
            </div>
          </div>

          {/* Facebook di bawah ini masih dekoratif — belum diaktifkan, cuma Google yang
              sudah tersambung ke OAuth beneran (lihat GoogleAuthController di backend). */}
          <div className="grid grid-cols-2 gap-4">
            <a
              href="http://localhost:8000/api/auth/google/redirect"
              className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl font-label-md text-on-surface hover:bg-surface-container transition-colors"
            >
              <IconGoogle />
              <span>Google</span>
            </a>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl font-label-md text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[#1877F2]" style={{ fontVariationSettings: "'FILL' 1" }}>
                face_nod
              </span>
              <span>Facebook</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Belum punya akun?{' '}
              <Link to="/register" className="text-secondary font-bold hover:underline decoration-2 underline-offset-4">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
