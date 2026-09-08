import KerangkaLegal, { Bagian } from './KerangkaLegal';

export default function SyaratKetentuan() {
  return (
    <KerangkaLegal judul="Syarat &amp; Ketentuan" berlaku="8 September 2026">
      <p className="mb-5 text-on-surface-variant">
        Dengan mendaftar dan menggunakan layanan ini, Anda menyatakan telah membaca,
        memahami, dan menyetujui ketentuan di bawah ini.
      </p>

      <Bagian nomor="1" judul="Akun pengguna">
        <p>
          Pendaftaran akun mewajibkan nama, alamat surel aktif, dan nomor telepon yang
          benar. Alamat surel harus diverifikasi melalui tautan yang dikirim sistem
          sebelum akun dapat digunakan.
        </p>
        <p>
          Anda bertanggung jawab menjaga kerahasiaan kata sandi. Segala aktivitas yang
          terjadi melalui akun Anda dianggap dilakukan oleh Anda sendiri.
        </p>
      </Bagian>

      <Bagian nomor="2" judul="Pemesanan kunjungan">
        <p>
          Pemesanan diajukan paling lambat satu hari sebelum tanggal kunjungan. Pemesanan
          untuk hari yang sama tidak dilayani, karena bukti pembayaran perlu diperiksa dan
          daftar penumpang perlu disusun terlebih dahulu.
        </p>
        <p>
          Setiap pemesanan wajib mencantumkan identitas seluruh peserta. Nomor identitas
          wajib diisi bagi peserta berusia tujuh belas tahun ke atas; bagi peserta di bawah
          usia tersebut nomor identitas boleh dikosongkan, sedangkan nama, jenis kelamin,
          dan usia tetap wajib. Data ini digunakan untuk menyusun manifes penumpang.
        </p>
      </Bagian>

      <Bagian nomor="3" judul="Pembayaran">
        <p>
          Pembayaran dilakukan penuh di muka melalui transfer bank, kemudian bukti
          transfernya diunggah melalui sistem. Layanan ini tidak menggunakan payment
          gateway dan tidak pernah meminta Anda memasukkan nomor kartu, PIN, OTP, maupun
          kata sandi perbankan.
        </p>
        <p>
          Transfer hanya sah apabila ditujukan ke rekening yang tercantum pada halaman
          Pembayaran di dalam sistem ini. Penyelenggara tidak bertanggung jawab atas
          transfer ke rekening lain yang diperoleh dari sumber di luar sistem.
        </p>
        <p>
          Pemesanan berstatus menunggu verifikasi sampai bukti transfer diperiksa oleh
          Pengantar Pulau. Apabila bukti ditolak, alasannya disampaikan melalui sistem dan
          Anda dapat mengunggah ulang bukti yang benar.
        </p>
      </Bagian>

      <Bagian nomor="4" judul="Dokumen dan bukti keberangkatan">
        <p>
          Setelah pemesanan diverifikasi, sistem menerbitkan invoice, kuitansi, dan tiket
          dalam format PDF. Tiket memuat kode pemesanan yang dicocokkan dengan manifes
          penumpang yang dipegang Pengantar Pulau pada hari keberangkatan.
        </p>
        <p>
          Dokumen tersebut diterbitkan otomatis oleh sistem, tanpa tanda tangan elektronik
          tersertifikasi. Keabsahannya diperiksa melalui pencocokan kode pemesanan.
        </p>
      </Bagian>

      <Bagian nomor="5" judul="Pembatalan dan pengembalian dana">
        <p>
          Pengajuan pembatalan hanya dapat dilakukan atas pemesanan berstatus valid dan
          paling lambat dua hari sebelum tanggal kunjungan. Pemesanan yang tanggal
          kunjungannya kurang dari dua hari lagi tidak dapat diajukan pembatalan.
        </p>
        <p>
          Pengajuan pembatalan disertai alasan, kemudian disetujui atau ditolak oleh
          Pengantar Pulau. Keputusan mengenai pengembalian dana ditetapkan oleh Pengantar
          Pulau dan tercatat di dalam sistem. Sistem ini mencatat keputusan tersebut, tetapi
          tidak melakukan pemindahan dana secara otomatis.
        </p>
      </Bagian>

      <Bagian nomor="6" judul="Keberangkatan">
        <p>
          Peserta wajib hadir di titik penjemputan sebelum jadwal keberangkatan dan
          mengikuti seluruh arahan keselamatan dari Pengantar Pulau selama penyeberangan.
        </p>
        <p>
          Jam keberangkatan tidak dijadwalkan oleh sistem. Penyeberangan bergantung pada
          kondisi cuaca dan laut, sehingga pengaturan jam serta armada kapal dilakukan oleh
          Pengantar Pulau di luar sistem. Perubahan atau penundaan karena cuaca bukan
          merupakan kelalaian penyelenggara.
        </p>
      </Bagian>

      <Bagian nomor="7" judul="Konten pulau dan ulasan">
        <p>
          Informasi profil pulau, akomodasi, wahana, tarif, dan galeri foto dikelola oleh
          masing-masing Pengelola Pulau. Ulasan dan penilaian hanya dapat ditulis oleh
          wisatawan yang kunjungannya telah selesai.
        </p>
        <p>
          Ulasan yang memuat penghinaan, ujaran kebencian, atau data pribadi orang lain
          dapat dihapus oleh pengelola.
        </p>
      </Bagian>

      <Bagian nomor="8" judul="Batasan tanggung jawab">
        <p>
          Sistem ini berperan sebagai sarana pencatatan pemesanan, pembayaran, dan dokumen
          perjalanan. Pelaksanaan penyeberangan dan pelayanan di pulau merupakan tanggung
          jawab Pengantar Pulau dan Pengelola Pulau masing-masing.
        </p>
        <p>
          Sebagian fitur bergantung pada layanan pihak ketiga yang memerlukan koneksi
          internet, yaitu peta dasar, layanan pencarian rute, dan layanan verifikasi
          keamanan. Fitur tersebut tidak tersedia dalam kondisi luring.
        </p>
      </Bagian>

      <Bagian nomor="9" judul="Perubahan ketentuan">
        <p>
          Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal berlaku yang tercantum di
          bagian atas halaman menunjukkan versi yang sedang digunakan.
        </p>
      </Bagian>
    </KerangkaLegal>
  );
}
