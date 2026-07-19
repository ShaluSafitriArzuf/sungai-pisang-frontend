import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Halaman ini cuma transit: backend redirect ke sini bawa ?token=xxx setelah login Google
// berhasil, tugas kita cuma simpan token itu lalu lempar ke dashboard sesuai role.
export default function GoogleCallback() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    const googleError = params.get('google_error');

    if (googleError) {
      setError(googleError);
      return;
    }

    if (!token) {
      setError('Token tidak ditemukan. Coba login Google lagi.');
      return;
    }

    loginWithToken(token)
      .then((user) => {
        showToast(`Selamat datang, ${user.name}!`, 2000);
        if (user.role === 'wisatawan') navigate('/beranda');
        else if (user.role === 'pengantar_pulau') navigate('/pengantar/dashboard');
        else navigate('/pengelola/dashboard');
      })
      .catch(() => setError('Gagal mengambil data akun. Coba login Google lagi.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container px-6 text-center">
      {error ? (
        <>
          <p className="text-red-600 font-semibold mb-3">{error}</p>
          <button onClick={() => navigate('/login')} className="text-primary font-semibold text-sm">
            Kembali ke Login
          </button>
        </>
      ) : (
        <p className="text-on-surface-variant text-sm">Menyelesaikan login Google...</p>
      )}
    </div>
  );
}
