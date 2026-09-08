import { formatRupiah } from './harga';

/**
 * Menyusun rincian biaya sebuah reservasi beserta dasar perhitungannya.
 *
 * Latar belakangnya: halaman detail sebelumnya hanya menampilkan satu angka "Total Bayar",
 * padahal angka itu gabungan tiga komponen — ongkos kapal penyeberangan, tiket masuk pulau,
 * dan biaya akomodasi. Wisatawan tidak punya cara memeriksa dari mana angkanya berasal.
 *
 * Ketiga komponennya sudah lama tersimpan di basis data (kolom biaya_penyeberangan,
 * biaya_tiket_masuk, biaya_akomodasi), jadi yang dikerjakan di sini hanya menyusunnya
 * kembali menjadi baris-baris yang bisa dibaca. Tidak ada perhitungan ulang: angka yang
 * ditampilkan tetap angka yang tersimpan, supaya tidak mungkin berbeda dengan total.
 *
 * Yang dihitung hanyalah DASAR perhitungannya, dan itu pun diturunkan dari tarif yang
 * tersimpan pada pulau serta akomodasinya, BUKAN dengan membagi total dengan jumlah orang.
 * Pembagian seperti itu keliru untuk akomodasi bertanda "tiket termasuk": pada kasus itu
 * backend hanya menagih tiket masuk untuk orang yang melebihi kapasitas unit yang dipesan,
 * sehingga hasil bagi terhadap seluruh rombongan akan memunculkan tarif yang tidak pernah
 * ada. Kalau tarifnya tidak cocok dengan angka tersimpan — misalnya karena tarif pulau
 * pernah diubah setelah reservasi dibuat — dasarnya tidak ditampilkan sama sekali, supaya
 * tidak ada angka yang menyesatkan.
 */

export const rupiah = formatRupiah;

// Jumlah malam menginap, dihitung dari selisih tanggal check-in dan check-out.
export function jumlahMalam(reservasi) {
  if (reservasi?.jenis !== 'menginap' || !reservasi?.tanggal_selesai) return 0;
  const masuk = new Date(reservasi.tanggal_kunjungan);
  const keluar = new Date(reservasi.tanggal_selesai);
  if (Number.isNaN(masuk.getTime()) || Number.isNaN(keluar.getTime())) return 0;
  const selisih = Math.round((keluar - masuk) / 86400000);
  return Math.max(1, selisih);
}

export function rincianBiaya(reservasi) {
  if (!reservasi) return [];

  const orang = Number(reservasi.jumlah_orang) || 0;
  const unit = Number(reservasi.jumlah_unit_dipesan) || 0;
  const malam = jumlahMalam(reservasi);
  const menginap = reservasi.jenis === 'menginap';

  const kapal = Number(reservasi.biaya_penyeberangan) || 0;
  const tiket = Number(reservasi.biaya_tiket_masuk) || 0;
  const akomodasi = Number(reservasi.biaya_akomodasi) || 0;

  const tarifKapal = Number(reservasi.pulau?.harga_penyeberangan) || 0;
  const tarifTiket = Number(
    menginap ? reservasi.pulau?.harga_tiket_masuk_menginap : reservasi.pulau?.harga_tiket_masuk_one_day
  ) || 0;
  const tarifAkomodasi = Number(reservasi.akomodasi?.harga_per_malam) || 0;

  // --- Ongkos kapal penyeberangan ---
  let dasarKapal = `${orang} orang`;
  if (tarifKapal > 0 && Math.round(tarifKapal * orang) === Math.round(kapal)) {
    dasarKapal = `${orang} orang × ${rupiah(tarifKapal)}`;
  }

  // --- Tiket masuk pulau ---
  // Banyaknya orang yang benar-benar ditagih diturunkan dari tarif tersimpan, bukan diasumsikan
  // sama dengan jumlah rombongan.
  let dasarTiket = `${orang} orang`;
  if (tiket === 0) {
    dasarTiket = reservasi.akomodasi?.tiket_termasuk
      ? 'Sudah termasuk paket akomodasi'
      : 'Tidak dikenakan biaya';
  } else if (tarifTiket > 0) {
    const orangBayar = tiket / tarifTiket;
    if (Number.isInteger(orangBayar) && orangBayar > 0) {
      dasarTiket = `${orangBayar} orang × ${rupiah(tarifTiket)}`;
      if (orangBayar < orang) {
        dasarTiket += ` · ${orang - orangBayar} orang sudah termasuk paket akomodasi`;
      }
    }
  }

  // --- Akomodasi ---
  let dasarAkomodasi;
  if (reservasi.bawa_tenda_sendiri) {
    dasarAkomodasi = 'Membawa tenda sendiri';
  } else if (!menginap || !reservasi.akomodasi) {
    dasarAkomodasi = 'Tidak memakai akomodasi';
  } else if (tarifAkomodasi > 0 && malam > 0
      && Math.round(tarifAkomodasi * unit * malam) === Math.round(akomodasi)) {
    dasarAkomodasi = `${unit} unit × ${malam} malam × ${rupiah(tarifAkomodasi)}`;
  } else if (malam > 0) {
    dasarAkomodasi = `${unit} unit × ${malam} malam`;
  } else {
    dasarAkomodasi = 'Tidak memakai akomodasi';
  }

  return [
    {
      kunci: 'penyeberangan',
      label: 'Ongkos kapal penyeberangan',
      dasar: dasarKapal,
      jumlah: kapal,
    },
    {
      kunci: 'tiket',
      label: 'Tiket masuk pulau',
      dasar: dasarTiket,
      jumlah: tiket,
    },
    {
      kunci: 'akomodasi',
      label: reservasi.akomodasi?.nama ? `Akomodasi — ${reservasi.akomodasi.nama}` : 'Akomodasi',
      dasar: dasarAkomodasi,
      jumlah: akomodasi,
    },
  ];
}
