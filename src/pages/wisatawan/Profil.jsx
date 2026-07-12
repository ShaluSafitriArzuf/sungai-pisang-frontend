import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

function inisialNama(nama) {
  if (!nama) return '?';
  const bagian = nama.trim().split(' ');
  return bagian.length > 1 ? (bagian[0][0] + bagian[1][0]).toUpperCase() : bagian[0].slice(0, 2).toUpperCase();
}

const MENU_ITEMS = [
  { to: '/reservasi', label: 'Riwayat Reservasi', desc: 'Lihat semua reservasi kamu', icon: 'confirmation_number' },
  { to: '/profil/edit', label: 'Edit Profil', desc: 'Ubah nama, email, & nomor HP', icon: 'edit' },
  { to: '/profil/password', label: 'Ganti Password', desc: 'Perbarui kata sandi akun', icon: 'lock' },
];

export default function Profil() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md mx-auto pb-20 bg-background min-h-screen">
      {/* Header profil */}
      <div className="relative bg-[#004873] text-white px-4 pt-8 pb-10 flex flex-col items-center rounded-b-[32px] overflow-hidden">
        <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 w-28 h-28 rounded-full bg-[#F4A261]/15" />

        <div className="relative w-20 h-20 rounded-full bg-[#F4A261] flex items-center justify-center text-2xl font-bold mb-3 shadow-lg ring-4 ring-white/20">
          {inisialNama(user?.name)}
        </div>
        <p className="relative font-bold text-lg">{user?.name}</p>
        <p className="relative text-xs text-white/75">{user?.email}</p>
        <span className="relative inline-block mt-2 text-[10px] font-semibold bg-white/15 px-3 py-1 rounded-full capitalize">
          Wisatawan
        </span>
      </div>

      {/* Menu */}
      <div className="px-4 -mt-5 relative space-y-2.5">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 px-4 py-3.5"
          >
            <span className="w-10 h-10 rounded-full bg-[#004873]/10 text-[#004873] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">{item.label}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{item.desc}</p>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </Link>
        ))}

        <button
          onClick={logout}
          className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-500">Keluar</p>
            <p className="text-[11px] text-on-surface-variant">Keluar dari akun ini</p>
          </div>
        </button>

        <p className="text-center text-[10px] text-outline pt-4">Jelajah Bahari Sungai Pisang</p>
      </div>

      <BottomNav />
    </div>
  );
}
