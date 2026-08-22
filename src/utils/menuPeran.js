// Daftar menu navigasi per peran, dikumpulkan di satu berkas supaya tidak ada dua tempat yang
// harus diingat setiap kali menu berubah.
//
// Sebelumnya daftar menu Pengantar/Pengelola Pulau ditulis ulang di setiap halaman mereka
// (const MENU di Dashboard.jsx, Manifest.jsx, KelolaAkomodasi.jsx, dan seterusnya) lalu
// dioper ke TopNav. Itu masih berjalan dan tidak diubah. Berkas ini dipakai NavbarDesktop
// untuk halaman-halaman BERSAMA yang dipakai ketiga peran sekaligus — Notifikasi, Edit
// Profil, dan Ganti Password — yang tidak punya TopNav sendiri sehingga navigasinya harus
// disusun dari sini.

// Catatan: daftar ini SENGAJA tidak memuat "Profil", berbeda dari BottomNav di HP yang
// memuatnya. Di layar lebar, kartu nama pengguna di ujung kanan navbar sudah menjadi tautan
// ke halaman Profil — menaruh menu Profil lagi di deretan kiri berarti dua pintu menuju
// halaman yang sama, memakan ruang dua kali. Di HP kartu nama itu tidak ada karena tidak
// muat, jadi di sana Profil tetap perlu jadi tab tersendiri.
export const MENU_WISATAWAN = [
  { to: '/beranda', label: 'Beranda', icon: 'home' },
  { to: '/peta', label: 'Peta', icon: 'map' },
  { to: '/reservasi', label: 'Reservasi', icon: 'confirmation_number' },
  { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications' },
];

export const MENU_PENGANTAR = [
  { to: '/pengantar/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/pengantar/manifest', label: 'Manifest', icon: 'checklist' },
  { to: '/pengantar/riwayat', label: 'Riwayat', icon: 'history' },
  { to: '/pengantar/laporan', label: 'Laporan', icon: 'payments' },
  { to: '/pengantar/lokasi', label: 'Lokasi', icon: 'location_on' },
  { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications' },
];

export const MENU_PENGELOLA = [
  { to: '/pengelola/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/pengelola/akomodasi', label: 'Akomodasi', icon: 'hotel' },
  { to: '/pengelola/wahana', label: 'Wahana', icon: 'kayaking' },
  { to: '/pengelola/galeri', label: 'Galeri', icon: 'photo_library' },
  { to: '/pengelola/profil-pulau', label: 'Profil Pulau', icon: 'landscape' },
  { to: '/pengelola/statistik', label: 'Statistik', icon: 'insights' },
  { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications' },
];

export const LABEL_ROLE = {
  wisatawan: 'Wisatawan',
  pengantar_pulau: 'Pengantar Pulau',
  pengelola_pulau: 'Pengelola Pulau',
};

// Halaman akun masing-masing peran, dipakai sebagai tujuan klik kartu nama di navbar.
// Wisatawan punya halaman Profil lengkap berisi beberapa menu; Pengantar dan Pengelola Pulau
// tidak punya halaman itu, jadi mereka langsung diarahkan ke Edit Profil.
export const PROFIL_PER_ROLE = {
  wisatawan: '/profil',
  pengantar_pulau: '/profil/edit',
  pengelola_pulau: '/profil/edit',
};

// Halaman utama masing-masing peran, dipakai sebagai tujuan klik logo.
export const BERANDA_PER_ROLE = {
  wisatawan: '/beranda',
  pengantar_pulau: '/pengantar/dashboard',
  pengelola_pulau: '/pengelola/dashboard',
};

export function menuUntukPeran(role) {
  if (role === 'pengantar_pulau') return MENU_PENGANTAR;
  if (role === 'pengelola_pulau') return MENU_PENGELOLA;
  // Pengunjung yang belum login diperlakukan sebagai calon Wisatawan: menunya sama, dan
  // halaman yang butuh login akan mengarahkan mereka ke Login saat diklik.
  return MENU_WISATAWAN;
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu untuk TopNav biru (halaman kerja Pengantar & Pengelola Pulau)
// ─────────────────────────────────────────────────────────────────────────────
// Isinya SAMA PERSIS dengan const MENU yang ditulis di tiap halaman mereka — urutan dan
// tulisan labelnya harus sama, karena kalau berbeda satu huruf saja, deretan menu di halaman
// Notifikasi akan terlihat lain daripada di halaman Riwayat atau Manifest, padahal itu
// header yang sama. Label di sini tidak memakai ikon karena TopNav punya peta ikonnya
// sendiri (IKON_MENU di src/components/TopNav.jsx).
export const MENU_TOPNAV_PENGANTAR = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/laporan', label: 'Laporan' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

export const MENU_TOPNAV_PENGELOLA = [
  { to: '/pengelola/dashboard', label: 'Dashboard' },
  { to: '/pengelola/akomodasi', label: 'Akomodasi' },
  { to: '/pengelola/wahana', label: 'Wahana' },
  { to: '/pengelola/galeri', label: 'Galeri' },
  { to: '/pengelola/profil-pulau', label: 'Profil Pulau' },
  { to: '/pengelola/statistik', label: 'Statistik & Ulasan' },
];

// Halaman yang dipakai bersama ketiga peran. Halaman-halaman inilah yang dulu tidak punya
// header sendiri, sehingga Pengantar/Pengelola Pulau yang membukanya mendapat navbar putih
// gaya wisatawan — berbeda sendiri dari seluruh halaman kerjanya yang berheader biru.
export const JALUR_BERSAMA = ['/notifikasi', '/profil/edit', '/profil/password'];

// Peran yang seluruh halaman kerjanya memakai TopNav biru.
export const PERAN_TOPNAV = ['pengantar_pulau', 'pengelola_pulau'];

export function pakaiTopNav(role) {
  return PERAN_TOPNAV.includes(role);
}

export function menuTopNavUntukPeran(role) {
  if (role === 'pengantar_pulau') return MENU_TOPNAV_PENGANTAR;
  if (role === 'pengelola_pulau') return MENU_TOPNAV_PENGELOLA;
  return [];
}
