import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PulauCard from '../../components/PulauCard';
import BottomNav from '../../components/BottomNav';
import heroPulau from '../../assets/hero-pulau.jpg';

const MENU_ITEMS = [
  { to: '/beranda', label: 'Beranda', icon: 'home' },
  { to: '/peta', label: 'Peta Interaktif', icon: 'map' },
  { to: '/reservasi', label: 'Riwayat Reservasi', icon: 'confirmation_number' },
  { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications' },
  { to: '/profil', label: 'Profil Saya', icon: 'person' },
];

function inisialNama(nama) {
  if (!nama) return '?';
  const bagian = nama.trim().split(' ');
  return bagian.length > 1 ? (bagian[0][0] + bagian[1][0]).toUpperCase() : bagian[0].slice(0, 2).toUpperCase();
}

export default function Beranda() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pulau, setPulau] = useState([]);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/pulau')
      .then((res) => setPulau(res.data))
      .catch((err) => {
        console.error('Gagal memuat daftar pulau:', err);
        setError(
          err.response
            ? `Server merespons error (${err.response.status}).`
            : 'Tidak bisa terhubung ke server. Pastikan backend Laravel sedang berjalan (php artisan serve).'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = pulau.filter((p) => p.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pb-20 md:pb-0 bg-background min-h-screen">
      {/* Hero — nav (hamburger, logo, avatar) mengambang langsung di atas foto, tanpa bar putih */}
      <div className="relative h-[460px] md:h-[560px] lg:h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroPulau})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        {/* md:hidden -- baris hamburger/judul/avatar ini adalah navigasi khas aplikasi HP yang
            mengambang di atas foto. Di layar lebar tugasnya sudah diambil alih NavbarDesktop
            yang tampil sebagai bilah menu di paling atas halaman. */}
        <div className="md:hidden relative z-10 flex items-center justify-between px-4 pt-4">
          <button className="text-white" type="button" onClick={() => setMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <p className="font-bold text-white text-lg drop-shadow">Jelajah Bahari</p>
          <Link to={user ? '/profil' : '/login'} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">
              {user ? 'account_circle' : 'login'}
            </span>
          </Link>
        </div>

        {/* Isi hero. Di HP teksnya menempel ke bawah foto (justify-end) seperti sekarang; di
            layar lebar dipindah ke tengah secara vertikal dan dibatasi lebarnya supaya kalimat
            tidak melebar sampai ke ujung layar dan jadi sulit dibaca. */}
        <div className="relative z-10 h-[calc(100%-56px)] md:h-full wadah-lebar flex flex-col justify-end md:justify-center px-5 md:px-6 pb-6 md:pb-0 text-white">
          <div className="md:max-w-2xl">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-[11px] md:text-xs font-semibold tracking-wide px-3 py-1 md:px-4 md:py-1.5 rounded-full w-fit mb-3 md:mb-5">
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">explore</span>
              5 PULAU EKSOTIS
            </span>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Jelajahi Pesona Bahari<br />
              <span className="text-[#F4A261]">Sungai Pisang</span>
            </h1>
            <p className="text-sm md:text-lg text-white/85 mt-2 md:mt-5 leading-relaxed">
              Dari trekking bukit, snorkeling, hingga wahana jetski — 5 pulau eksotis di pesisir Sumatera Barat menanti dijelajahi.
            </p>

            <div className="flex gap-3 md:gap-4 mt-4 md:mt-8">
              <button
                type="button"
                onClick={() => document.getElementById('destinasi')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F4A261] md:hover:bg-[#E08B3F] text-white text-sm md:text-base font-semibold px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl active:scale-95 transition-all"
              >
                Mulai Eksplorasi
              </button>
              <Link
                to="/peta"
                className="bg-white/15 md:hover:bg-white/25 backdrop-blur-sm border border-white/40 text-white text-sm md:text-base font-semibold px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl transition-colors"
              >
                Lihat Peta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search — di HP kotaknya selebar layar dan menumpuk sedikit ke atas foto. Di layar
          lebar dibatasi supaya tidak jadi kotak isian raksasa selebar 1200px. */}
      <div className="wadah-lebar px-4 md:px-6 -mt-5 md:-mt-8 relative z-10">
        <div className="md:max-w-xl md:mx-auto relative">
          <span className="hidden md:flex material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            search
          </span>
          <input
            className="w-full bg-white rounded-xl md:rounded-2xl px-4 md:pl-12 py-3 md:py-4 shadow-md md:shadow-lg text-sm md:text-base outline-none placeholder:text-outline/60 focus:ring-2 focus:ring-[#004873]/30"
            placeholder="Cari pulau..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Destinasi */}
      <div id="destinasi" className="wadah-lebar px-4 md:px-6 mt-7 md:mt-16">
        <div className="md:text-center md:mb-10">
          <p className="font-bold text-on-surface text-lg md:text-3xl">Destinasi Pilihan</p>
          <p className="text-xs md:text-base text-on-surface-variant mb-4 md:mb-0 md:mt-2">
            Kurasi pulau terbaik untuk liburan tak terlupakan Anda.
          </p>
        </div>

        {loading && <p className="text-gray-400 text-sm md:text-center">Memuat daftar pulau...</p>}

        {!loading && error && (
          <div className="bg-red-50 text-red-600 text-xs md:text-sm rounded-xl p-3 md:p-4 mb-2">{error}</div>
        )}

        {/* Di HP kartu pulau tetap ditumpuk satu kolom ke bawah seperti sebelumnya. Mulai lebar
            768px disusun dua kolom, dan 1024px ke atas tiga kolom — inilah yang membuat halaman
            ini terbaca sebagai katalog website, bukan daftar panjang aplikasi HP. */}
        {!loading && !error && filtered.length > 0 && (
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {filtered.map((p) => (
              <PulauCard key={p.id} pulau={p} />
            ))}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-400 text-sm md:text-center">Tidak ada pulau ditemukan.</p>
        )}
      </div>

      {/* CTA */}
      <div className="wadah-lebar px-4 md:px-6 mt-4 md:mt-16 mb-2 md:mb-16">
        <div className="bg-[#004873] rounded-2xl md:rounded-3xl px-6 md:px-10 py-8 md:py-14 text-center text-white">
          <p className="text-lg md:text-3xl font-bold">Siap Untuk Berlibur?</p>
          <p className="text-sm md:text-lg text-white/80 mt-1 md:mt-3 mb-5 md:mb-8 md:max-w-xl md:mx-auto">
            Dapatkan pengalaman wisata bahari terbaik bersama Sungai Pisang sekarang juga.
          </p>
          <div className="flex gap-3 md:gap-4 justify-center">
            <button
              type="button"
              onClick={() => document.getElementById('destinasi')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white md:hover:bg-white/90 text-[#004873] text-sm md:text-base font-semibold px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl transition-colors"
            >
              Mulai Reservasi
            </button>
            <Link
              to="/peta"
              className="bg-white/15 md:hover:bg-white/25 border border-white/40 text-white text-sm md:text-base font-semibold px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl transition-colors"
            >
              Lihat Peta
            </Link>
          </div>
        </div>
      </div>

      {/* Footer — hanya di layar lebar. Website yang berakhir mendadak tanpa footer adalah
          salah satu penanda paling kentara bahwa halamannya dirancang untuk layar HP. */}
      <footer className="hidden md:block bg-[#00375A] text-white/70 mt-4">
        {/* Garis aksen tipis di bibir atas footer -- pemisah yang lebih halus daripada
            perubahan warna mendadak dari isi halaman ke blok gelap. */}
        <div className="h-1 bg-gradient-to-r from-[#F4A261] via-[#F4A261]/40 to-transparent" />

        {/* Susunan sebelumnya cuma dua blok yang saling menjauh di kiri dan kanan, menyisakan
            lubang kosong selebar layar di tengahnya. Sekarang dibagi tiga kolom dengan lebar
            yang sengaja tidak sama: blok identitas paling lebar karena isinya paragraf, dua
            kolom tautan lebih sempit karena isinya daftar pendek. */}
        <div className="wadah-lebar px-6 py-12 grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Identitas */}
          <div className="col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">sailing</span>
              </span>
              <span className="leading-tight">
                <span className="block font-bold text-white text-base">Jelajah Bahari</span>
                <span className="block text-sm text-white/60">Sungai Pisang</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Sistem informasi reservasi wisata dan pemetaan lokasi objek wisata bahari
              Sungai Pisang — menghubungkan Wisatawan, Pengantar Pulau, dan Pengelola Pulau
              dalam satu platform terpadu.
            </p>
            <p className="flex items-start gap-2 text-sm mt-4">
              <span className="material-symbols-outlined text-[18px] text-[#F4A261] shrink-0 mt-0.5">
                location_on
              </span>
              Kelurahan Sungai Pisang, Kecamatan Bungus Teluk Kabung,
              <br />
              Kota Padang, Sumatera Barat
            </p>
          </div>

          {/* Navigasi */}
          <div className="lg:col-span-3">
            <p className="font-semibold text-white text-sm uppercase tracking-wider mb-1">Navigasi</p>
            <span className="block w-8 h-0.5 bg-[#F4A261] rounded-full mb-4" />
            <div className="flex flex-col gap-2.5 text-sm">
              {MENU_ITEMS.slice(0, 4).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 hover:text-white transition-colors w-fit"
                >
                  <span className="material-symbols-outlined text-[17px] text-white/40">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Daftar pulau diambil dari data yang sudah dimuat halaman ini, bukan ditulis tetap --
              kalau nanti ada pulau ditambah atau namanya diubah lewat CMS, footer ikut berubah
              sendiri tanpa perlu menyentuh kode. */}
          <div className="lg:col-span-4">
            <p className="font-semibold text-white text-sm uppercase tracking-wider mb-1">
              Pulau Wisata
            </p>
            <span className="block w-8 h-0.5 bg-[#F4A261] rounded-full mb-4" />
            {pulau.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {pulau.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    to={`/pulau/${p.id}`}
                    className="hover:text-white transition-colors truncate"
                    title={p.nama}
                  >
                    {p.nama}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">Daftar pulau sedang dimuat…</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="wadah-lebar px-6 py-5 flex items-center justify-between gap-6 text-xs">
            <p>© {new Date().getFullYear()} Wisata Bahari Sungai Pisang.</p>
            <p className="text-white/45 text-right">
              Tugas Akhir D3 Manajemen Informatika, Jurusan Teknologi Informasi,
              Politeknik Negeri Padang
            </p>
          </div>
        </div>
      </footer>

      <BottomNav />

      {/* Drawer menu (dibuka dari tombol hamburger).
          md:hidden -- tombol hamburger yang membukanya sudah disembunyikan di layar lebar,
          jadi drawer ini pun tidak akan pernah terpanggil di sana. Kelas max-w-md juga dilepas:
          dulu itu perlu supaya drawer ikut terkurung di dalam "layar HP" selebar 448px; sekarang
          halamannya selebar layar, jadi lapisan gelapnya harus menutup seluruh layar. */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            {/* Header profil */}
            <div className="relative bg-[#004873] text-white px-5 pt-5 pb-6 overflow-hidden">
              <div className="absolute -right-6 -top-10 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-[#F4A261]/20" />

              <button
                className="relative mb-5 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition-transform"
                type="button"
                onClick={() => setMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F4A261] flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {user ? inisialNama(user.name) : (
                    <span className="material-symbols-outlined text-[22px]">person</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight truncate">{user ? user.name : 'Tamu'}</p>
                  <p className="text-xs text-white/70 truncate">{user ? user.email : 'Belum masuk'}</p>
                  {user?.role && (
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <nav className="flex-1 py-3 px-2 overflow-y-auto">
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-outline uppercase tracking-wider">Menu</p>
              {MENU_ITEMS.map((item) => {
                const aktif = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${
                      aktif ? 'bg-[#004873]/10 text-[#004873] font-semibold' : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        aktif ? 'bg-[#004873] text-white' : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer aksi akun */}
            <div className="p-4 border-t border-outline-variant">
              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 text-sm font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Keluar
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-white bg-[#F4A261] text-sm font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Masuk
                </Link>
              )}
              <p className="text-center text-[10px] text-outline mt-3">Jelajah Bahari Sungai Pisang</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
