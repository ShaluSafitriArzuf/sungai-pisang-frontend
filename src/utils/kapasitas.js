// Kolom kapasitas akomodasi disimpan bebas sebagai teks (mis. "4" atau rentang "4-6") supaya
// Pengelola Pulau bisa isi muatan yang fleksibel. Dipakai di mana pun kapasitas perlu dihitung
// sebagai angka (saran jumlah unit, total muat, potongan tiket masuk kalau akomodasi sudah
// termasuk tiket) — diambil angka TERBESAR yang ditemukan (rentang "4-6" -> 6), konsisten
// dengan Akomodasi::kapasitasAngkaMaksimal() di backend.
export function kapasitasAngkaMaksimal(kapasitas) {
  if (!kapasitas) return 0;
  const angka = String(kapasitas).match(/\d+/g);
  if (!angka) return 0;
  return Math.max(...angka.map(Number));
}
