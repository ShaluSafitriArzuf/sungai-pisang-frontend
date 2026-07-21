import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJumlahNotifBelumDibaca } from '../hooks/useJumlahNotifBelumDibaca';

const IKON_MENU = {
  Dashboard: 'grid_view',
  Akomodasi: 'hotel',
  Wahana: 'kayaking',
  Galeri: 'photo_library',
  'Profil Pulau': 'landscape',
  'Statistik & Ulasan': 'insights',
  Manifest: 'checklist',
  Lokasi: 'location_on',
};

export default function TopNav({ title, menu = [] }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const aktifRef = useRef(null);
  const belumDibaca = useJumlahNotifBelumDibaca();

  // Tiap pindah halaman, komponen ini dimuat ulang jadi posisi geser menu baliak ke paling kiri
  // (walau menu yang aktif ada di sebelah kanan, misal menu ke-6). Ini betulin itu — begitu
  // halaman berganti, otomatis digeser supaya menu yang aktif kelihatan.
  useEffect(() => {
    aktifRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [location.pathname]);

  return (
    <header className="relative bg-[#004873] text-white sticky top-0 z-20 overflow-hidden">
      <div className="absolute -right-8 -top-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -left-10 top-2 w-20 h-20 rounded-full bg-[#F4A261]/15 pointer-events-none" />

      <div className="relative px-4 pt-4 pb-3 flex justify-between items-center gap-2">
        <div className="min-w-0">
          <p className="font-bold text-lg leading-tight truncate">{title}</p>
          <p className="text-xs text-white/70 truncate">{user?.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/notifikasi"
            className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Notifikasi"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {belumDibaca > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] rounded-full bg-[#F4A261] text-white text-[9px] font-bold flex items-center justify-center leading-none border border-[#004873]">
                {belumDibaca > 9 ? '9+' : belumDibaca}
              </span>
            )}
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

      <div className="relative">
        <nav className="relative flex gap-2 px-4 pb-3.5 overflow-x-auto no-scrollbar">
          {menu.map((m) => {
            const aktif = location.pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                ref={aktif ? aktifRef : null}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  aktif ? 'bg-white text-[#004873]' : 'bg-white/12 text-white/85'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{IKON_MENU[m.label] || 'circle'}</span>
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Petunjuk visual kalau menu-nya bisa digeser ke samping (ada lebih banyak menu di
            kanan yang belum kelihatan) — tanpa ini, orang yang baru pertama kali pakai bisa
            ngira menu cuma sebanyak yang keliatan doang. */}
        {menu.length > 4 && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-3.5 w-10 bg-gradient-to-l from-[#004873] to-transparent" />
        )}
      </div>
    </header>
  );
}
