import sirandahImg from '../assets/pulau/sirandah.jpg';
import ujungKapuriImg from '../assets/pulau/ujung-kapuri.jpg';
import pagangImg from '../assets/pulau/pagang.jpg';
import pamutusanImg from '../assets/pulau/pamutusan.jpg';

// Foto lokal (bukan lagi stok online dari Unsplash) dipakai selama Pengelola Pulau belum
// upload foto asli lewat halaman "Kelola Profil Pulau". Begitu foto_utama terisi di
// database, foto asli otomatis dipakai — fallback ini cuma jaga-jaga supaya kartu tidak
// kosong/abu-abu.
//
// Pasumpahan & Pagang sudah punya foto_utama asli di database (diupload manual), jadi
// fallback di bawah ini praktis sudah tidak kepakai untuk keduanya — tapi tetap disiapkan
// sebagai jaga-jaga kalau suatu saat foto_utama kosong lagi.
const FALLBACK = {
  sirandah: sirandahImg,
  'ujung kapuri': ujungKapuriImg,
  pagang: pagangImg,
  pamutusan: pamutusanImg,
};

// TODO: ganti ke foto Pasumpahan begitu tersedia. Sementara pakai foto Pagang sebagai
// cadangan umum (generic) kalau nama pulau tidak cocok dengan daftar di atas.
const GENERIC = pagangImg;

export function fotoPulauFallback(namaPulau = '') {
  const key = Object.keys(FALLBACK).find((k) => namaPulau.toLowerCase().includes(k));
  return key ? FALLBACK[key] : GENERIC;
}
