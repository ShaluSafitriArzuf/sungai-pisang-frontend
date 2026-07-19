import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function LupaPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [terkirim, setTerkirim] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/lupa-password', { email });
      setTerkirim(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim link reset. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <p className="text-xl font-bold text-on-surface mb-1">Lupa Password</p>
        <p className="text-sm text-on-surface-variant mb-5">
          Masukkan email akunmu, nanti kami kirim link buat bikin password baru.
        </p>

        {terkirim ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-3">
            Kalau email itu terdaftar, link reset sudah dikirim. Cek email kamu (atau minta bantuan
            admin kalau sistem belum terhubung ke email asli).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full mt-1 px-4 py-3 bg-white border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl disabled:opacity-70"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
