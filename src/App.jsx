import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import NavbarDesktop from './components/NavbarDesktop';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LupaPassword from './pages/auth/LupaPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';

import Beranda from './pages/wisatawan/Beranda';
import DetailPulau from './pages/wisatawan/DetailPulau';
import Peta from './pages/wisatawan/Peta';

import SyaratKetentuan from './pages/legal/SyaratKetentuan';
import KebijakanPrivasi from './pages/legal/KebijakanPrivasi';
import FormReservasi from './pages/wisatawan/FormReservasi';
import Pembayaran from './pages/wisatawan/Pembayaran';
import RiwayatReservasi from './pages/wisatawan/RiwayatReservasi';
import DetailReservasi from './pages/wisatawan/DetailReservasi';
import FormPembatalan from './pages/wisatawan/FormPembatalan';
import Notifikasi from './pages/wisatawan/Notifikasi';
import Profil from './pages/wisatawan/Profil';
import EditProfil from './pages/wisatawan/EditProfil';
import GantiPassword from './pages/wisatawan/GantiPassword';
import FormUlasan from './pages/wisatawan/FormUlasan';

import DashboardPengantar from './pages/pengantar_pulau/Dashboard';
import DetailVerifikasi from './pages/pengantar_pulau/DetailVerifikasi';
import ManifestPage from './pages/pengantar_pulau/Manifest';
import PengaturanLokasi from './pages/pengantar_pulau/PengaturanLokasi';
import RiwayatPengantar from './pages/pengantar_pulau/Riwayat';
import LaporanPemasukan from './pages/pengantar_pulau/LaporanPemasukan';

import DashboardPengelola from './pages/pengelola_pulau/Dashboard';
import DetailReservasiPengelola from './pages/pengelola_pulau/DetailReservasi';
import KelolaAkomodasi from './pages/pengelola_pulau/KelolaAkomodasi';
import KelolaWahana from './pages/pengelola_pulau/KelolaWahana';
import KelolaGaleri from './pages/pengelola_pulau/KelolaGaleri';
import KelolaProfilPulau from './pages/pengelola_pulau/KelolaProfilPulau';
import StatistikUlasan from './pages/pengelola_pulau/StatistikUlasan';

function W(Component) {
  return (
    <ProtectedRoute allowedRoles={['wisatawan']}>
      <Component />
    </ProtectedRoute>
  );
}

function PP(Component) {
  return (
    <ProtectedRoute allowedRoles={['pengantar_pulau']}>
      <Component />
    </ProtectedRoute>
  );
}

function PG(Component) {
  return (
    <ProtectedRoute allowedRoles={['pengelola_pulau']}>
      <Component />
    </ProtectedRoute>
  );
}

// Notifikasi dipakai 3 role sekaligus (data difilter per-user di backend, lihat NotifikasiController)
function AnyRole(Component) {
  return (
    <ProtectedRoute allowedRoles={['wisatawan', 'pengantar_pulau', 'pengelola_pulau']}>
      <Component />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      {/* Navbar mendatar khusus layar lebar. Dirender di sini (bukan di tiap halaman) supaya
          semua halaman Wisatawan dan halaman publik otomatis punya menu atas saat dibuka di
          laptop. Komponennya sendiri yang memutuskan kapan tidak usah tampil — misalnya di
          halaman Login/Register, dan di halaman Pengantar/Pengelola Pulau yang sudah punya
          TopNav biru sendiri. Di layar HP komponen ini tidak pernah muncul (hidden md:block). */}
      <NavbarDesktop />

      <Routes>
      <Route path="/" element={<Navigate to="/beranda" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lupa-password" element={<LupaPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* ── Halaman publik: bisa dilihat semua orang TANPA login ── */}
      <Route path="/beranda" element={<Beranda />} />
      <Route path="/pulau/:id" element={<DetailPulau />} />
      <Route path="/peta" element={<Peta />} />

      {/* Dua halaman ini wajib bisa dibuka tanpa login, karena tautannya ada di halaman
          Daftar — orang harus bisa membacanya sebelum menyetujuinya. */}
      <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
      <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />

      {/* ── Wisatawan: wajib login (baru diminta saat mau reservasi/dsb) ── */}
      <Route path="/reservasi/baru" element={W(FormReservasi)} />
      <Route path="/reservasi/pembayaran" element={W(Pembayaran)} />
      <Route path="/reservasi" element={W(RiwayatReservasi)} />
      <Route path="/reservasi/:id" element={W(DetailReservasi)} />
      <Route path="/reservasi/:id/batal" element={W(FormPembatalan)} />
      <Route path="/notifikasi" element={AnyRole(Notifikasi)} />
      <Route path="/profil" element={W(Profil)} />
      {/* Edit Profil & Ganti Password dibuka buat 3 role (bukan cuma wisatawan) -- endpoint
          backend-nya (PUT /user, PUT /user/password) sudah generic untuk semua role, cuma
          sebelumnya belum ada jalan masuk di frontend buat Pengelola/Pengantar Pulau. Berguna
          terutama kalau akun pulau/pengantar pindah tangan ke orang lain, tinggal ganti
          password sendiri tanpa perlu reset manual lewat database. */}
      <Route path="/profil/edit" element={AnyRole(EditProfil)} />
      <Route path="/profil/password" element={AnyRole(GantiPassword)} />
      <Route path="/ulasan/:reservasiId" element={W(FormUlasan)} />

      {/* ── Pengantar Pulau (4 halaman) ── */}
      <Route path="/pengantar/dashboard" element={PP(DashboardPengantar)} />
      <Route path="/pengantar/reservasi/:id" element={PP(DetailVerifikasi)} />
      <Route path="/pengantar/manifest" element={PP(ManifestPage)} />
      <Route path="/pengantar/riwayat" element={PP(RiwayatPengantar)} />
      <Route path="/pengantar/laporan" element={PP(LaporanPemasukan)} />
      <Route path="/pengantar/lokasi" element={PP(PengaturanLokasi)} />

      {/* ── Pengelola Pulau (6 halaman) ── */}
      <Route path="/pengelola/dashboard" element={PG(DashboardPengelola)} />
      <Route path="/pengelola/reservasi/:id" element={PG(DetailReservasiPengelola)} />
      <Route path="/pengelola/akomodasi" element={PG(KelolaAkomodasi)} />
      <Route path="/pengelola/wahana" element={PG(KelolaWahana)} />
      <Route path="/pengelola/galeri" element={PG(KelolaGaleri)} />
      <Route path="/pengelola/profil-pulau" element={PG(KelolaProfilPulau)} />
      <Route path="/pengelola/statistik" element={PG(StatistikUlasan)} />

      <Route path="*" element={<Navigate to="/beranda" replace />} />
      </Routes>
    </>
  );
}
