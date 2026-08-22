import axios from 'axios';

// Alamat backend TIDAK boleh ditulis tetap (hardcode) di sini. Saat aplikasi di-hosting,
// "localhost" akan menunjuk ke komputer pengunjung, bukan ke server — sehingga seluruh
// permintaan data gagal.
//
// Nilainya diambil dari variabel lingkungan VITE_API_URL yang diatur lewat berkas .env:
//   - Saat pengembangan  : .env.development  -> http://jelajahbahari.my.id/api
//   - Saat hosting       : .env.production   -> https://api.domainmu.com/api
//
// Nilai cadangan localhost tetap disediakan supaya aplikasi tidak langsung rusak kalau
// berkas .env belum dibuat saat pengembangan di komputer sendiri.
const baseURL = import.meta.env.VITE_API_URL || '"https://jelajahbahari.my.id/api"';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 dipakai untuk dua hal berbeda:
    //  1. Token kedaluwarsa/tidak valid saat sedang memakai aplikasi -> user harus dilempar
    //     balik ke halaman login.
    //  2. Kredensial salah saat MENCOBA login -> ini kegagalan biasa yang pesannya harus
    //     ditampilkan di form, BUKAN alasan untuk memuat ulang halaman.
    // Kalau endpoint auth publik ikut di-redirect, halaman ter-reload dan pesan errornya
    // hilang sebelum sempat terbaca. Karena itu endpoint di bawah ini dikecualikan.
    const url = error.config?.url || '';
    const endpointAuthPublik = ['/login', '/register', '/lupa-password', '/reset-password', '/verifikasi-email'];
    const dariHalamanAuth = endpointAuthPublik.some((e) => url.includes(e));

    if (error.response && error.response.status === 401 && !dariHalamanAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
