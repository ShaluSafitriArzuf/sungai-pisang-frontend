// Ikon & warna untuk kartu Wahana/Aktivitas — dipetakan dari nama kegiatan karena
// tabel wahana_kegiatan tidak (dan sengaja tidak) punya kolom ikon sendiri di database.
const POLA = [
  { kata: ['snorkel'], icon: 'scuba_diving', warna: 'bg-blue-100 text-blue-600' },
  { kata: ['diving', 'selam'], icon: 'water', warna: 'bg-green-100 text-green-600' },
  { kata: ['donat', 'donut'], icon: 'trip_origin', warna: 'bg-pink-100 text-pink-600' },
  { kata: ['banana', 'boat', 'perahu'], icon: 'sailing', warna: 'bg-orange-100 text-orange-600' },
  { kata: ['mancing', 'fishing'], icon: 'phishing', warna: 'bg-teal-100 text-teal-600' },
  { kata: ['camping', 'kemah'], icon: 'cabin', warna: 'bg-amber-100 text-amber-600' },
  { kata: ['puncak', 'bukit', 'trekking', 'hiking', 'nanjak'], icon: 'landscape', warna: 'bg-emerald-100 text-emerald-600' },
];

export function ikonWahana(nama = '') {
  const lower = nama.toLowerCase();
  const match = POLA.find((p) => p.kata.some((k) => lower.includes(k)));
  return match || { icon: 'kayaking', warna: 'bg-sky-100 text-sky-600' };
}

// Foto sementara (stok Unsplash) per tipe akomodasi — dipakai selama Pengelola Pulau
// belum upload foto asli lewat CMS.
const FOTO_AKOMODASI = {
  cottage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80',
  gazebo: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&q=80',
  tenda: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&q=80',
};

export function fotoAkomodasiFallback(tipe = '') {
  return FOTO_AKOMODASI[tipe] || FOTO_AKOMODASI.cottage;
}
