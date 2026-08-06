// Aturan tampilan harga dikumpulkan di satu berkas supaya angka yang muncul di Beranda,
// Detail Pulau, dan Form Reservasi selalu memakai dasar perhitungan yang sama. Kalau aturan
// harga berubah, cukup ubah di sini.

export function formatRupiah(nilai) {
  return 'Rp' + Number(nilai || 0).toLocaleString('id-ID');
}

// Biaya minimum yang HARUS dibayar seorang wisatawan untuk bisa menginjak sebuah pulau,
// yaitu ongkos kapal penyeberangan ditambah tiket masuk One Day Trip.
//
// Sengaja TIDAK memakai harga akomodasi termurah seperti sebelumnya, karena:
//   1. Harga akomodasi dihitung per unit per malam, bukan per orang — menampilkannya
//      dengan satuan "/orang" menyesatkan.
//   2. Wisatawan One Day Trip tidak membayar akomodasi sama sekali, jadi angka itu
//      tidak relevan sebagai "harga mulai dari".
//   3. Angka ini cocok dengan yang nanti muncul di rincian biaya Form Reservasi,
//      sehingga wisatawan tidak kaget saat melihat total.
export function hargaMulaiPerOrang(pulau) {
  const kapal = Number(pulau?.harga_penyeberangan) || 0;
  const tiket = Number(pulau?.harga_tiket_masuk_one_day) || 0;
  return kapal + tiket;
}

// Biaya minimum per orang untuk kunjungan menginap (belum termasuk akomodasi, karena
// akomodasi dihitung per unit dan wisatawan bisa memilih membawa tenda sendiri).
export function hargaMenginapPerOrang(pulau) {
  const kapal = Number(pulau?.harga_penyeberangan) || 0;
  const tiket = Number(pulau?.harga_tiket_masuk_menginap) || 0;
  return kapal + tiket;
}

// Harga akomodasi termurah di sebuah pulau, dipakai sebagai informasi tambahan
// ("menginap mulai dari ...") bukan sebagai harga utama.
export function akomodasiTermurah(pulau) {
  const daftar = pulau?.akomodasi || [];
  if (!daftar.length) return null;
  return Math.min(...daftar.map((a) => Number(a.harga_per_malam) || 0));
}
