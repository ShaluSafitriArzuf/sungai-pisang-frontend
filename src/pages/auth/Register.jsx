import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', no_hp: '', password: '', password_confirmation: '' });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Akun baru sekarang wajib klik link verifikasi di email dulu sebelum bisa login (lihat
  // AuthContext.register() & backend AuthController@register) — jadi setelah daftar, bukan
  // langsung masuk ke Beranda, tapi tampilkan layar "cek email kamu" ini.
  const [berhasilDaftar, setBerhasilDaftar] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!agree) {
      setError('Kamu harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setBerhasilDaftar(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(', ') : 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  }

  if (berhasilDaftar) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-container-margin">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-black/10 p-8 flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[30px]">mark_email_read</span>
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Cek Email Kamu</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-1">
            Kami sudah kirim link verifikasi ke
          </p>
          <p className="font-semibold text-on-surface mb-4">{form.email}</p>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            Klik link di email itu dulu supaya akunnya aktif — baru setelah itu kamu bisa login.
          </p>
          <Link to="/login" className="btn-primary w-full text-center">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
      {/* Header foto — ganti url ini dengan foto asli Pulau Sungai Pisang kalau sudah ada */}
      <div className="w-full relative overflow-hidden curved-header">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        <div className="absolute top-12 left-0 right-0 flex flex-col items-center justify-center text-white z-10 px-container-margin">
          <h1 className="font-display-lg-mobile text-display-lg-mobile tracking-tight">Jelajah Bahari</h1>
          <p className="font-label-md text-label-md opacity-90 tracking-widest uppercase mt-1">Eksplorasi Nusantara</p>
        </div>
      </div>

      <main className="w-full max-w-md -mt-24 px-container-margin mb-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/10 p-8 flex flex-col">
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Buat Akun Baru</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Mulailah petualangan bahari Anda di Indonesia hari ini.
            </p>
          </div>

          {error && <p className="text-error text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-md text-body-md transition-all"
                />
              </div>
            </div>

            {/* Alamat Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-md text-body-md transition-all"
                />
              </div>
            </div>

            {/* Nomor HP */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="phone">
                Nomor HP
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  phone_iphone
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0812xxxx"
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-md text-body-md transition-all"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-md text-body-md transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="confirm_password">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  verified_user
                </span>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi"
                  required
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-md text-body-md transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-body-md text-on-surface-variant" htmlFor="terms">
                  Saya menyetujui <span className="text-primary font-semibold">Syarat &amp; Ketentuan</span> serta{' '}
                  <span className="text-primary font-semibold">Kebijakan Privasi</span>.
                </label>
              </div>
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F4A261] text-white py-4 rounded-xl font-headline-md text-headline-md flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all hover:brightness-105 mt-4 disabled:opacity-70"
            >
              <span>{loading ? 'Memproses...' : 'Daftar'}</span>
              {!loading && <span className="material-symbols-outlined text-[24px]">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                Masuk
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center opacity-40">
          <p className="font-label-md text-label-md text-outline">© 2024 Jelajah Bahari Indonesia</p>
          <div className="flex justify-center space-x-4 mt-2">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
        </div>
      </main>
    </div>
  );
}
