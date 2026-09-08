import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJumlahNotifBelumDibaca } from '../hooks/useJumlahNotifBelumDibaca';
import Logo from './Logo';

const IKON_MENU = {
  Dashboard: 'grid_view',
  Akomodasi: 'hotel',
  Wahana: 'kayaking',
  Galeri: 'photo_library',
  'Profil Pulau': 'landscape',
  'Statistik & Ulasan': 'insights',
  Laporan: 'payments',
  Manifest: 'checklist',
  Lokasi: 'location_on',
};

export default function TopNav({ title, menu = [] }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const aktifRef = useRef(null);
  const belumDibaca = useJumlahNotifBelumDibaca();

  // Halaman Notifikasi, Edit Profil, dan Ganti Password dipakai bersama ketiga peran sehingga
  // tidak punya butir sendiri di deretan menu — kalau salah satunya sedang dibuka, tidak ada
  // satu pun pil menu yang menyala dan header ini terbaca seolah tidak sedang di halaman mana
  // pun. Dua tombol bundar di pojok kanan inilah pintu ke halaman-halaman itu, jadi tombolnya
  // yang diberi tanda aktif: latar putih, sama seperti pil menu yang sedang terpilih.
  const diNotifikasi = location.pathname === '/notifikasi';
  const diAkun = location.pathname.startsWith('/profil');

  // Tiap pindah halaman, komponen ini dimuat ulang jadi posisi geser menu baliak ke paling kiri
  // (walau menu yang aktif ada di sebelah kanan, misal menu ke-6). Ini betulin itu — begitu
  // halaman berganti, otomatis digeser supaya menu yang aktif kelihatan.
  //
  // Dulu dikerjakan dengan scrollIntoView. Masalahnya, scrollIntoView menggeser SEMUA induk
  // yang bisa digeser, bukan cuma baris menunya. Header ini ber-overflow-hidden -- dan elemen
  // overflow-hidden tetap bisa digeser lewat kode, cuma batang penggesernya saja yang tidak
  // kelihatan. Akibatnya, di halaman yang menu aktifnya paling kanan (mis. Lokasi, menu ke-4),
  // geserannya cukup jauh sampai ikut menyeret seluruh isi header ke kiri -- judul halaman dan
  // nama pengguna jadi terpotong di tepi kiri layar HP.
  //
  // Sekarang yang digeser hanya elemen <nav> itu sendiri lewat scrollTo, jadi tidak mungkin
  // merembet ke induknya.
  useEffect(() => {
    const butir = aktifRef.current;
    const baris = butir?.parentElement;
    if (!butir || !baris) return;
    const tengah = butir.offsetLeft - (baris.clientWidth - butir.clientWidth) / 2;
    baris.scrollTo({ left: Math.max(0, tengah), behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <header className="relative bg-[#004873] text-white sticky top-0 z-20 overflow-hidden">
      <div className="absolute -right-8 -top-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -left-10 top-2 w-20 h-20 rounded-full bg-[#F4A261]/15 pointer-events-none" />

      <div className="wadah-lebar relative px-4 md:px-6 pt-4 pb-3 md:pt-5 md:pb-4 flex justify-between items-center gap-2">
        <div className="min-w-0 flex items-center gap-3">
          {/* Logo hanya muncul di layar lebar. Di HP ruangnya tidak cukup dan judul halaman
              lebih berguna, tapi di laptop tanpa logo header ini kelihatan seperti bilah
              aplikasi, bukan kepala sebuah situs. */}
          <span className="hidden md:flex w-10 h-10 rounded-xl bg-white/15 items-center justify-center shrink-0">
            <Logo ukuran={26} varian="latarGelap" />
          </span>
          <span className="min-w-0">
            <p className="font-bold text-lg md:text-xl leading-tight truncate">{title}</p>
            <p className="text-xs text-white/70 truncate">{user?.name}</p>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/notifikasi"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform ${
              diNotifikasi ? 'bg-white text-[#004873]' : 'bg-white/15'
            }`}
            aria-label="Notifikasi"
            aria-current={diNotifikasi ? 'page' : undefined}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: `'FILL' ${diNotifikasi ? 1 : 0}` }}
            >
              notifications
            </span>
            {belumDibaca > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] rounded-full bg-[#F4A261] text-white text-[9px] font-bold flex items-center justify-center leading-none border border-[#004873]">
                {belumDibaca > 9 ? '9+' : belumDibaca}
              </span>
            )}
          </Link>
          {/* Pengelola/Pengantar Pulau tidak punya halaman hub "/profil" kayak wisatawan, jadi
              satu-satunya jalan masuk ke Edit Profil & Ganti Password mereka lewat sini. */}
          <Link
            to="/profil/edit"
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform ${
              diAkun ? 'bg-white text-[#004873]' : 'bg-white/15'
            }`}
            aria-label="Akun Saya"
            aria-current={diAkun ? 'page' : undefined}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: `'FILL' ${diAkun ? 1 : 0}` }}
            >
              account_circle
            </span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs font-semibold bg-white/15 px-3 py-2 rounded-full active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Keluar
          </button>
        </div>
      </div>

      <div className="relative wadah-lebar">
        {/* md:flex-wrap + md:overflow-visible -- di HP menu ini digeser ke samping karena
            layarnya sempit, tapi di laptop lebarnya cukup untuk memuat semua menu sekaligus.
            Menu yang harus digeser padahal ruang masih kosong adalah ciri khas tampilan HP
            yang dipaksakan ke layar besar. */}
        <nav className="relative flex gap-2 px-4 md:px-6 pb-3.5 md:pb-4 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
          {menu.map((m) => {
            const aktif = location.pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                ref={aktif ? aktifRef : null}
                className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3.5 md:px-4 py-2 md:py-2.5 rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  aktif ? 'bg-white text-[#004873]' : 'bg-white/12 text-white/85 md:hover:bg-white/25'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] md:text-[17px]">{IKON_MENU[m.label] || 'circle'}</span>
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Petunjuk visual kalau menu-nya bisa digeser ke samping (ada lebih banyak menu di
            kanan yang belum kelihatan) — tanpa ini, orang yang baru pertama kali pakai bisa
            ngira menu cuma sebanyak yang keliatan doang. Di layar lebar tidak diperlukan lagi
            karena seluruh menu sudah tampil sekaligus, jadi disembunyikan dengan md:hidden. */}
        {menu.length > 4 && (
          <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-3.5 w-10 bg-gradient-to-l from-[#004873] to-transparent" />
        )}
      </div>
    </header>
  );
}
