# Catatan Perubahan — Frontend

Ringkasan perubahan pada antarmuka sistem informasi reservasi wisata bahari Sungai Pisang.
Berkas ini dipakai sebagai rujukan saat memperbarui laporan Tugas Akhir.

---

## 8 Agustus 2026

### Perbaikan penting untuk hosting

**`src/api/axios.js`** — alamat backend tidak lagi ditulis tetap sebagai
`"https://jelajahbahari.my.id/api"`. Alamat kini diambil dari `VITE_API_URL` pada berkas `.env`,
karena "localhost" pada aplikasi yang di-hosting menunjuk ke komputer pengunjung sehingga
seluruh permintaan data akan gagal.

Berkas baru:
- `.env.development` — dipakai saat `npm run dev`
- `.env.production` — dipakai saat `npm run build`; **wajib diisi domain backend sebenarnya**

### Perbaikan tampilan dan informasi

**Beranda (`components/PulauCard.jsx`)**
Harga "Mulai dari" kini berupa biaya minimum per orang (kapal + tiket masuk One Day Trip),
bukan harga akomodasi termurah. Sebelumnya harga akomodasi per unit ditampilkan dengan
satuan "/pax" sehingga menyesatkan.

**Detail Pulau (`pages/wisatawan/DetailPulau.jsx`)**
- Bagian baru **Rincian Biaya per Orang** — memerinci tarif kapal, tiket masuk One Day Trip,
  dan tiket masuk Menginap secara terbuka.
- Kartu akomodasi menampilkan kapasitas dan daftar fasilitas unit.
- Foto titik kumpul Pengantar Pulau dapat diperbesar, seperti foto akomodasi dan galeri.

**Form Reservasi (`pages/wisatawan/FormReservasi.jsx`)**
- Ringkasan akomodasi terpilih: kapasitas, fasilitas, dan deskripsi.
- Pemilih **jumlah unit** beserta saran otomatis berdasarkan jumlah rombongan.
- Keterangan aturan reservasi minimal H-1 sebelum kalender dibuka.
- Perbaikan bug tanggal: `toISOString()` diganti perhitungan tanggal lokal, karena fungsi
  tersebut mengubah waktu ke UTC sehingga tanggal yang sudah lewat masih dapat dipilih
  sampai pukul 07.00 WIB.
- Biaya menyesuaikan jenis kunjungan, tarif per pulau, dan jumlah unit.

**Detail Reservasi (`pages/wisatawan/DetailReservasi.jsx`)**
Menampilkan jumlah unit akomodasi bila lebih dari satu.

**Login (`pages/auth/Login.jsx`)**
Pesan galat dibedakan menurut situasi: kredensial salah, terlalu banyak percobaan (beserta
sisa waktu tunggu), server tidak terjangkau, dan galat validasi. Tampilan diubah menjadi
kotak peringatan beserta ikon.

Perbaikan pada `axios.js`: respons 401 dari endpoint autentikasi publik tidak lagi memicu
pemuatan ulang halaman, sehingga pesan galat tidak hilang sebelum sempat terbaca.

**Pengaturan Lokasi (`pages/pengantar_pulau/PengaturanLokasi.jsx`)**
- Tampilan **citra satelit** sebagai lapisan bawaan, agar atap rumah dan dermaga terlihat
  jelas. Peta jalan tetap tersedia melalui pemilih lapisan.
- Tombol **Lokasi Saya** memakai koordinat perangkat.
- **Pencarian alamat** memakai layanan Nominatim OpenStreetMap.
- Tautan **Cek di Google Maps** untuk memastikan letak titik.

**Kelola Akomodasi (`pages/pengelola_pulau/KelolaAkomodasi.jsx`)**
Ditambah input kapasitas per unit dan pilihan fasilitas unit.

**Kelola Profil Pulau (`pages/pengelola_pulau/KelolaProfilPulau.jsx`)**
Satu input harga tiket masuk dipecah menjadi tiga: tiket One Day Trip, tiket Menginap, dan
tarif kapal penyeberangan.

### Berkas utilitas baru

- `utils/harga.js` — seluruh aturan tampilan harga dikumpulkan di satu tempat.
- `utils/tampilanFasilitasAkomodasi.js` — daftar fasilitas unit akomodasi beserta ikonnya.

---

## Perintah setelah menarik perubahan ini

```bash
npm install
npm run dev
```

## Perintah saat deploy ke hosting

```bash
# Isi dulu VITE_API_URL pada .env.production
npm run build
# Unggah isi folder dist/ ke hosting
```
