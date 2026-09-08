import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJumlahNotifBelumDibaca } from '../hooks/useJumlahNotifBelumDibaca';
import {
  menuUntukPeran, LABEL_ROLE, BERANDA_PER_ROLE, PROFIL_PER_ROLE,
  JALUR_BERSAMA, pakaiTopNav,
} from '../utils/menuPeran';
import Logo from './Logo';

// Navbar mendatar untuk layar lebar (laptop/desktop), pendamping BottomNav yang dipakai di HP.
// Muncul mulai lebar 768px (md); di bawah itu BottomNav yang bertugas, jadi tampilan di HP
// tidak berubah sama sekali. Dirender sekali dari App.jsx supaya semua halaman kebagian.
//
// Isi menunya mengikuti PERAN yang sedang login, diambil dari src/utils/menuPeran.js:
//
//   Wisatawan / belum login : Beranda, Peta, Reservasi, Notifikasi
//   Pengantar Pulau         : Dashboard, Manifest, Riwayat, Lokasi, Notifikasi
//   Pengelola Pulau         : Dashboard, Akomodasi, Wahana, Galeri, Profil Pulau,
//                             Statistik, Notifikasi
//
// Versi sebelumnya memberi menu Wisatawan (Beranda, Peta) kepada Pengantar/Pengelola Pulau
// juga. Akibatnya, saat mereka membuka halaman bersama seperti Notifikasi, yang tampil di
// navbar justru menu wisata yang tidak ada hubungannya dengan pekerjaan mereka, sementara
// menu pekerjaannya sendiri — Akomodasi, Wahana, Galeri, dan seterusnya — tidak ada satu pun.

function inisialNama(nama) {
  if (!nama) return '?';
  const bagian = nama.trim().split(' ');
  return bagian.length > 1
    ? (bagian[0][0] + bagian[1][0]).toUpperCase()
    : bagian[0].slice(0, 2).toUpperCase();
}

export default function NavbarDesktop() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const belumDibaca = useJumlahNotifBelumDibaca();

  // Navbar ini disembunyikan hanya di halaman yang sudah punya navigasinya sendiri: halaman
  // Login/Register (tampilannya memenuhi layar) dan halaman internal Pengantar/Pengelola
  // Pulau (sudah punya TopNav biru). Penentuannya memakai ALAMAT HALAMAN, bukan peran
  // pengguna — kalau memakai peran, Pengantar/Pengelola yang membuka halaman publik atau
  // halaman bersama jadi tidak punya navigasi sama sekali.
  const JALUR_TANPA_NAVBAR = [
    '/login', '/register', '/lupa-password', '/reset-password', '/auth',
    '/pengantar', '/pengelola',
  ];
  if (JALUR_TANPA_NAVBAR.some((jalur) => location.pathname.startsWith(jalur))) return null;

  // Halaman bersama — Notifikasi, Edit Profil, Ganti Password — sekarang memasang TopNav biru
  // sendiri lewat komponen HeaderBersama kalau yang membukanya Pengantar/Pengelola Pulau.
  // Tanpa baris ini navbar putih ikut tampil di atas TopNav itu: dua bilah navigasi
  // bertumpuk dengan dua gaya berbeda, persis yang terlihat di halaman Notifikasi. Wisatawan
  // tidak terpengaruh — bagi mereka navbar putih inilah navigasinya.
  if (pakaiTopNav(user?.role) && JALUR_BERSAMA.some((jalur) => location.pathname.startsWith(jalur))) {
    return null;
  }

  const menu = menuUntukPeran(user?.role);

  // Menu Pengelola Pulau berisi tujuh butir — dua lebih banyak daripada peran lain. Dengan
  // jarak dan padding yang sama seperti menu lima butir, bilahnya meluber begitu labelnya
  // ditampilkan, dan itu memunculkan scrollbar mendatar di seluruh halaman. Untuk menu
  // sepanjang itu tata letaknya dirapatkan.
  const padat = menu.length > 5;
  const kelasLabel = padat ? 'hidden xl:inline' : 'hidden lg:inline';

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-outline-variant/60">
      <div className="wadah-lebar px-6 h-[76px] flex items-center justify-between gap-5">
        {/* Logo. Tujuannya halaman utama sesuai peran, bukan selalu Beranda wisata — supaya
            Pengelola Pulau yang mengkliknya kembali ke dashboard-nya sendiri. */}
        <Link
          to={BERANDA_PER_ROLE[user?.role] || '/beranda'}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity">
            <Logo ukuran={40} />
          </span>
          {/* Nama situs di sebelah logo tidak ditampilkan sama sekali untuk menu tujuh butir
              (Pengelola Pulau). Sebelumnya masih dimunculkan pada layar sangat lebar, dan di
              1600px justru itu yang membuat bilahnya meluber — karena lebar isi dibatasi 1280px,
              layar yang lebih besar tidak menambah ruang sedikit pun. Logo kotaknya tetap ada. */}
          <span className={`${padat ? 'hidden' : 'hidden lg:block'} leading-tight`}>
            <span className="block font-bold text-[15px] text-[#004873]">Jelajah Bahari</span>
            <span className="block text-[11px] text-on-surface-variant">Sungai Pisang</span>
          </span>
        </Link>

        {/* Menu utama. Di lebar sempit hanya ikonnya yang tampil; atribut title tetap diisi
            supaya nama menu muncul saat kursor diarahkan ke ikon. */}
        <nav className={`flex items-stretch self-stretch ${padat ? 'gap-0' : 'gap-0.5'}`}>
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              title={m.label}
              className={({ isActive }) =>
                // Penanda halaman aktif memakai garis bawah, bukan pil biru terisi seperti
                // sebelumnya. Pil terisi berukuran besar membuat satu menu jadi bongkahan
                // gelap yang menarik perhatian melebihi logo dan isi halamannya sendiri;
                // garis bawah tetap tegas tapi tidak mendominasi. Garisnya sengaja oranye
                // (warna aksen sistem) supaya warna itu ikut terpakai di navigasi.
                `group relative flex items-center gap-2.5 ${padat ? 'px-3' : 'px-4'} text-sm transition-colors ${
                  isActive
                    ? 'text-[#004873] font-semibold'
                    : 'text-on-surface-variant font-medium hover:text-[#004873]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative inline-flex shrink-0">
                    <span
                      className="material-symbols-outlined text-[21px]"
                      style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                    >
                      {m.icon}
                    </span>
                    {m.to === '/notifikasi' && belumDibaca > 0 && (
                      <span className="absolute -top-1.5 -right-1 min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none border-2 border-white">
                        {belumDibaca > 9 ? '9+' : belumDibaca}
                      </span>
                    )}
                  </span>
                  <span className={`${kelasLabel} whitespace-nowrap`}>{m.label}</span>

                  {/* Latar hover tipis, hanya muncul saat kursor lewat. */}
                  <span className="absolute inset-x-1.5 inset-y-3 rounded-xl bg-[#004873]/0 group-hover:bg-[#004873]/6 transition-colors -z-10" />

                  {/* Garis penanda halaman aktif, menempel di dasar bilah. */}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full transition-colors ${
                      isActive ? 'bg-[#F4A261]' : 'bg-transparent'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Identitas akun. Avatar berinisial tampil sejak 768px supaya pertanyaan "ini sedang
            login sebagai siapa?" selalu bisa dijawab tanpa membuka halaman Profil dulu. */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Garis pemisah. Tanpa ini kelompok akun terbaca sebagai bagian dari menu, padahal
              fungsinya berbeda: yang kiri untuk berpindah halaman, yang kanan soal akun. */}
          <span className="w-px h-9 bg-outline-variant/70" />

          {user ? (
            <>
              {/* Kartu nama ini SEKALIGUS tombol Profil. Sebelumnya ia cuma hiasan pasif,
                  sementara di deretan menu kiri ada butir "Profil" yang tujuannya sama persis
                  -- dua pintu ke halaman yang sama, memakan ruang dua kali. Butir menunya
                  dihapus, fungsinya dipindah ke sini. */}
              <NavLink
                to={PROFIL_PER_ROLE[user.role] || '/profil'}
                title={`${user.name} — ${LABEL_ROLE[user.role] || user.role}`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 pl-1 pr-1 xl:pr-3 py-1 rounded-full transition-colors ${
                    isActive ? 'bg-[#004873]/10' : 'hover:bg-[#004873]/6'
                  }`
                }
              >
                <span className="w-9 h-9 rounded-full bg-[#F4A261] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {inisialNama(user.name)}
                </span>
                <span className="hidden xl:block leading-tight min-w-0">
                  <span className="block text-[13px] font-semibold text-on-surface max-w-[130px] truncate">
                    {user.name}
                  </span>
                  {/* Baris ini dulu ditulis tetap "Wisatawan" apa pun peran yang sedang login,
                      sehingga akun Pengelola Pulau pun tertulis Wisatawan di navbar. */}
                  <span className="block text-[10px] text-on-surface-variant">
                    {LABEL_ROLE[user.role] || user.role}
                  </span>
                </span>
              </NavLink>

              <button
                onClick={logout}
                type="button"
                className={`flex items-center justify-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-red-600 hover:border-red-200 hover:bg-red-50 border border-outline-variant ${padat ? 'w-10 h-10' : 'px-3.5 py-2'} rounded-xl transition-colors`}
                title="Keluar dari akun"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className={padat ? 'hidden' : 'hidden xl:inline'}>Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-[#004873] hover:bg-[#004873]/8 px-3 lg:px-4 py-2.5 rounded-full transition-colors whitespace-nowrap"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-[#F4A261] hover:bg-[#E08B3F] text-white text-sm font-semibold px-4 lg:px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
