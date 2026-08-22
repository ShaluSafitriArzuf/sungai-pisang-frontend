import { useAuth } from '../context/AuthContext';
import TopNav from './TopNav';
import { menuTopNavUntukPeran, pakaiTopNav } from '../utils/menuPeran';

// Header untuk HALAMAN BERSAMA — Notifikasi, Edit Profil, dan Ganti Password — yang dibuka
// oleh ketiga peran sekaligus.
//
// Masalah yang diperbaiki: halaman-halaman ini tidak punya TopNav sendiri (tidak ada const
// MENU di dalamnya seperti halaman Riwayat atau Manifest), sehingga yang tampil di atasnya
// adalah NavbarDesktop putih milik wisatawan. Akibatnya Pengantar Pulau yang membuka
// Notifikasi melihat dua bilah navigasi bertumpuk — navbar putih di paling atas, lalu
// header biru halaman itu sendiri di bawahnya — padahal di semua halaman kerjanya yang lain
// hanya ada satu header biru.
//
// Komponen ini menutup celah itu: untuk Pengantar/Pengelola Pulau ia menampilkan TopNav biru
// dengan deretan menu yang sama persis seperti halaman kerja mereka, sehingga Notifikasi
// terlihat sebagai bagian dari sistem yang sama, bukan halaman nyasar. Untuk wisatawan ia
// tidak menampilkan apa pun — navbar putih memang chrome mereka — jadi tampilan wisatawan
// tidak berubah sedikit pun.
export default function HeaderBersama({ title }) {
  const { user } = useAuth();
  if (!pakaiTopNav(user?.role)) return null;
  return <TopNav title={title} menu={menuTopNavUntukPeran(user.role)} />;
}
