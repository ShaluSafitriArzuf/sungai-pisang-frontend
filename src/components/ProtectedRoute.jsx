import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Halaman utama masing-masing role. Dipakai saat pengguna yang SUDAH login mencoba membuka
// halaman milik role lain (mis. wisatawan mengetik /pengantar/dashboard di address bar).
//
// Sebelumnya kasus itu ikut dilempar ke /login, sama seperti pengunjung yang belum login.
// Akibatnya pengguna yang sesinya masih aktif tiba-tiba melihat halaman Login dan mengira
// dirinya ter-logout, lalu login ulang tanpa perlu. Sekarang dikembalikan ke halaman utama
// sesuai perannya sendiri, jadi jelas bahwa yang ditolak cuma halamannya, bukan sesinya.
const BERANDA_PER_ROLE = {
  wisatawan: '/beranda',
  pengantar_pulau: '/pengantar/dashboard',
  pengelola_pulau: '/pengelola/dashboard',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Belum login sama sekali -- ini memang kasus yang benar untuk diarahkan ke Login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Fallback ke /login hanya kalau role-nya tidak dikenali sama sekali (mis. data rusak),
    // supaya tidak ada kemungkinan pengalihan berputar tanpa henti.
    return <Navigate to={BERANDA_PER_ROLE[user.role] || '/login'} replace />;
  }

  return children;
}
