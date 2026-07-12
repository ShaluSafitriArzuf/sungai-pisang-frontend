// Foto sementara (stok Unsplash) dipakai selama Pengelola Pulau belum upload foto asli
// lewat halaman "Kelola Profil Pulau". Begitu foto_utama terisi di database, foto asli
// otomatis dipakai — fallback ini cuma jaga-jaga supaya kartu tidak kosong/abu-abu.
const FALLBACK = {
  pasumpahan: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=700&q=80',
  sirandah: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=700&q=80',
  'ujung kapuri': 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=700&q=80',
  pagang: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=700&q=80',
  pamutusan: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80',
};

const GENERIC = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80';

export function fotoPulauFallback(namaPulau = '') {
  const key = Object.keys(FALLBACK).find((k) => namaPulau.toLowerCase().includes(k));
  return key ? FALLBACK[key] : GENERIC;
}
