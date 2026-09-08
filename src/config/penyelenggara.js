// Identitas penyelenggara dan tujuan transfer.
//
// Dikumpulkan di satu berkas supaya nomor rekening tidak tersebar di banyak halaman.
// Kalau rekening atau nomor kontak berubah, cukup berkas ini yang disunting.
//
// Catatan: nilai di sini ikut terkirim ke repositori dan ikut terbaca di berkas hasil
// build, sama seperti teks lain di halaman. Isinya memang informasi yang sengaja
// ditampilkan kepada publik agar wisatawan tahu ke mana harus mentransfer.

export const PENYELENGGARA = {
  nama: 'Jelajah Bahari',
  keterangan: 'Wisata Bahari Sungai Pisang — Kecamatan Bungus Teluk Kabung, Kota Padang',
  narahubung: 'Shalu Safitri Arzuf',
  noHp: '082381810015',
  email: 'shaluarzuf@gmail.com',
};

// Rekening tujuan adalah rekening Pengantar Pulau, sejalan dengan laporan yang menyatakan
// ongkos kapal penyeberangan merupakan pemasukan Pengantar Pulau. Tiket masuk dan biaya
// akomodasi yang menjadi hak Pengelola Pulau dititipkan melalui pembayaran yang sama.
export const REKENING = {
  bank: 'Bank BRI',
  nomor: '5467 0101 0925 532',
  atasNama: 'JACKY HERMAN R',
};

// Nomor rekening tanpa spasi, untuk tombol salin.
export const REKENING_POLOS = REKENING.nomor.replace(/\s/g, '');
