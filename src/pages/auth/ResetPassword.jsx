import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [berhasil, setBerhasil] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Link reset ini tidak lengkap. Coba minta link baru lewat halaman Lupa Password.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: konfirmasi,
      });
      setBerhasil(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        (errs && Object.values(errs).flat().join(' ')) ||
          err.response?.data?.message ||
          'Gagal reset password. Coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <p className="text-xl font-bold text-on-surface mb-1">Reset Password</p>
        <p className="text-sm text-on-surface-variant mb-5">
          Buat password baru untuk <span className="font-semibold">{email || 'akunmu'}</span>.
        </p>

        {berhasil ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-3">
            Password berhasil direset. Mengalihkan ke halaman login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Password Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full mt-1 px-4 py-3 bg-white border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full mt-1 px-4 py-3 bg-white border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl disabled:opacity-70"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center text-sm text-primary font-semibold mt-5">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
