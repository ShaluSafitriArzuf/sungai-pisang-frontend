import KerangkaLegal, { Bagian } from './KerangkaLegal';

export default function KebijakanPrivasi() {
  return (
    <KerangkaLegal judul="Kebijakan Privasi" berlaku="8 September 2026">
      <p className="mb-5 text-on-surface-variant">
        Halaman ini menjelaskan data apa saja yang dikumpulkan sistem, untuk apa data
        tersebut dipakai, dan siapa saja yang dapat melihatnya.
      </p>

      <Bagian nomor="1" judul="Data yang dikumpulkan">
        <p>
          <b>Data akun:</b> nama, alamat surel, nomor telepon, kata sandi, dan foto profil
          apabila diunggah. Bagi yang masuk menggunakan akun Google, sistem menerima nama
          dan alamat surel dari Google.
        </p>
        <p>
          <b>Data pemesanan:</b> pulau tujuan, tanggal kunjungan, jenis kunjungan, pilihan
          akomodasi, jumlah peserta, dan rincian biaya.
        </p>
        <p>
          <b>Data peserta:</b> nama, jenis kelamin, usia, nomor telepon, serta nomor
          identitas bagi peserta berusia tujuh belas tahun ke atas.
        </p>
        <p>
          <b>Bukti pembayaran:</b> gambar struk atau tangkapan layar transfer yang Anda
          unggah sendiri.
        </p>
      </Bagian>

      <Bagian nomor="2" judul="Untuk apa data dipakai">
        <p>
          Data akun dipakai untuk masuk ke sistem, mengirim pemberitahuan, dan menghubungi
          Anda bila ada hal yang perlu dikonfirmasi mengenai pemesanan.
        </p>
        <p>
          Data peserta dipakai untuk menyusun manifes penumpang. Manifes diperlukan agar
          identitas seluruh penumpang diketahui apabila terjadi keadaan darurat di laut,
          bukan hanya nama pemesannya saja.
        </p>
        <p>
          Bukti pembayaran dipakai semata-mata untuk memeriksa kebenaran transfer, dan
          dokumen invoice, kuitansi, serta tiket diterbitkan dari data pemesanan Anda.
        </p>
      </Bagian>

      <Bagian nomor="3" judul="Siapa yang dapat melihat data Anda">
        <p>
          <b>Pengantar Pulau</b> dapat melihat data pemesanan, data peserta, dan bukti
          pembayaran, karena dialah yang memverifikasi pembayaran dan membawa manifes
          penumpang saat berlayar.
        </p>
        <p>
          <b>Pengelola Pulau</b> hanya dapat melihat pemesanan yang ditujukan ke pulaunya
          sendiri, dan tidak dapat melihat data pulau lain.
        </p>
        <p>
          Data Anda tidak diperjualbelikan dan tidak dibagikan kepada pihak lain di luar
          keperluan penyelenggaraan kunjungan.
        </p>
      </Bagian>

      <Bagian nomor="4" judul="Data lokasi">
        <p>
          Halaman peta dapat meminta izin mengakses posisi perangkat Anda. Izin ini bersifat
          sukarela dan hanya dipakai untuk menampilkan posisi Anda di peta serta menghitung
          rute jalan darat menuju titik penjemputan.
        </p>
        <p>
          Posisi tersebut diproses di peramban Anda dan dikirim ke layanan pencarian rute
          untuk menghitung jalurnya. Sistem ini tidak menyimpan riwayat lokasi Anda dan
          tidak melakukan pelacakan posisi.
        </p>
      </Bagian>

      <Bagian nomor="5" judul="Layanan pihak ketiga">
        <p>
          Sistem menggunakan peta dasar dari OpenStreetMap dan Esri, layanan pencarian rute
          OSRM, layanan verifikasi keamanan Google reCAPTCHA pada halaman masuk dan daftar,
          serta layanan masuk dengan akun Google. Penggunaan layanan tersebut tunduk pada
          kebijakan masing-masing penyedianya.
        </p>
      </Bagian>

      <Bagian nomor="6" judul="Keamanan dan penyimpanan">
        <p>
          Kata sandi disimpan dalam bentuk teracak dan tidak dapat dibaca kembali, termasuk
          oleh pengelola sistem. Pertukaran data berlangsung melalui koneksi terenkripsi,
          dan halaman masuk serta daftar dilindungi verifikasi keamanan untuk mencegah
          percobaan masuk secara otomatis.
        </p>
        <p>
          Data pemesanan disimpan selama diperlukan sebagai catatan transaksi dan bahan
          penyusunan laporan pemasukan.
        </p>
      </Bagian>

      <Bagian nomor="7" judul="Hak Anda atas data">
        <p>
          Anda dapat mengubah nama, nomor telepon, dan foto profil melalui halaman Profil,
          serta mengganti kata sandi kapan saja.
        </p>
        <p>
          Permintaan penghapusan akun dapat disampaikan melalui narahubung yang tercantum di
          bawah. Data pemesanan yang sudah terbit dokumennya tetap disimpan sebagai catatan
          transaksi, terpisah dari data akun.
        </p>
      </Bagian>
    </KerangkaLegal>
  );
}
