// Ubah nomor HP lokal (mis. "081234567890") jadi link WhatsApp click-to-chat (format "62...").
// Dipakai di semua tempat yang butuh tombol "Hubungi via WhatsApp" — Pengelola Pulau & Pengantar
// Pulau menghubungi wisatawan, dan wisatawan menghubungi Pengantar Pulau.
export function waLink(noHp) {
  if (!noHp) return null;
  const bersih = noHp.replace(/\D/g, ''); // buang spasi/strip/dsb, sisain angka saja
  const internasional = bersih.replace(/^0/, '62');
  return `https://wa.me/${internasional}`;
}
