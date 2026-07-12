import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PulauCard from '../../components/PulauCard';
import BottomNav from '../../components/BottomNav';

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
    <div className="pb-20 bg-background min-h-screen">
      {/* Hero — nav (hamburger, logo, avatar) mengambang langsung di atas foto, tanpa bar putih */}
      <div className="relative h-[460px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        <div className="relative z-10 flex items-center justify-between px-4 pt-4">
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

        <div className="relative z-10 h-[calc(100%-56px)] flex flex-col justify-end px-5 pb-6 text-white">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full w-fit mb-3">
            <span className="material-symbols-outlined text-[14px]">explore</span>
            PULAU TERSEMBUNYI
          </span>
          <h1 className="text-2xl font-bold leading-tight">
            Jelajahi Surga Bahari<br />
            <span className="text-[#F4A261]">Sungai Pisang</span>
          </h1>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">
            5 pulau eksotis dengan pasir putih selembut sutra dan air laut sejernih kristal di pesisir Sumatera Barat.
          </p>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => document.getElementById('destinasi')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#F4A261] text-white text-sm font-semibold px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
            >
              Mulai Eksplorasi
            </button>
            <Link to="/peta" className="bg-white/15 backdrop-blur-sm border border-white/40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Lihat Peta
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 -mt-5 relative z-10">
        <input
          className="w-full bg-white rounded-xl px-4 py-3 shadow-md text-sm outline-none placeholder:text-outline/60"
          placeholder="Cari pulau..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Destinasi */}
      <div id="destinasi" className="px-4 mt-7">
        <p className="font-bold text-on-surface text-lg">Destinasi Pilihan</p>
        <p className="text-xs text-on-surface-variant mb-4">Kurasi pulau terbaik untuk liburan tak terlupakan Anda.</p>

        {loading && <p className="text-gray-400 text-sm">Memuat daftar pulau...</p>}

        {!loading && error && (
          <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 mb-2">{error}</div>
        )}

        {!loading && !error && filtered.map((p) => (
          <PulauCard key={p.id} pulau={p} />
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-400 text-sm">Tidak ada pulau ditemukan.</p>
        )}
      </div>

      {/* CTA */}
      <div className="mx-4 mt-4 mb-2 bg-[#004873] rounded-2xl px-6 py-8 text-center text-white">
        <p className="text-lg font-bold">Siap Untuk Berlibur?</p>
        <p className="text-sm text-white/80 mt-1 mb-5">
          Dapatkan pengalaman wisata bahari terbaik bersama Sungai Pisang sekarang juga.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => document.getElementById('destinasi')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#004873] text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Mulai Reservasi
          </button>
          <Link to="/peta" className="bg-white/15 border border-white/40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            Lihat Peta
          </Link>
        </div>
      </div>

      <BottomNav />

      {/* Drawer menu (dibuka dari tombol hamburger) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 max-w-md mx-auto">
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
