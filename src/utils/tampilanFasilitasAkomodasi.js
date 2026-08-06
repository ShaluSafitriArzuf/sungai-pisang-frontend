// Daftar fasilitas unit akomodasi yang bisa dicentang Pengelola Pulau (Kelola Akomodasi)
// dan ditampilkan di Detail Pulau. Key inilah yang disimpan di kolom akomodasi.fasilitas
// (array JSON) — polanya sama dengan FASILITAS_OPSI untuk fasilitas pulau.
//
// Dibuat terstruktur (bukan sekadar kalimat deskripsi) supaya wisatawan bisa membandingkan
// antar unit dengan cepat: mana yang ber-AC, mana yang cuma kipas, mana yang pondok terbuka.
export const FASILITAS_AKOMODASI_OPSI = [
  { key: 'ac', label: 'AC', icon: 'ac_unit' },
  { key: 'kipas_angin', label: 'Kipas Angin', icon: 'mode_fan' },
  { key: 'kamar_mandi_dalam', label: 'Kamar Mandi Dalam', icon: 'shower' },
  { key: 'kamar_mandi_luar', label: 'Kamar Mandi Luar', icon: 'wc' },
  { key: 'kasur', label: 'Kasur / Springbed', icon: 'bed' },
  { key: 'matras', label: 'Karpet / Alas Tidur', icon: 'airline_seat_flat' },
  { key: 'listrik', label: 'Colokan Listrik', icon: 'power' },
  { key: 'air_tawar', label: 'Air Tawar', icon: 'water_drop' },
  { key: 'teras', label: 'Teras', icon: 'deck' },
  { key: 'kelambu', label: 'Kelambu', icon: 'bedroom_parent' },
];

export function labelFasilitasAkomodasi(key) {
  return FASILITAS_AKOMODASI_OPSI.find((f) => f.key === key)?.label || key;
}

export function ikonFasilitasAkomodasi(key) {
  return FASILITAS_AKOMODASI_OPSI.find((f) => f.key === key)?.icon || 'check_circle';
}
