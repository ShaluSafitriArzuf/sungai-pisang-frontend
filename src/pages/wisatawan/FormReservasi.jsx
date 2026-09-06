import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { fotoPulauFallback } from '../../utils/fotoPulau';
import { ikonFasilitasAkomodasi, labelFasilitasAkomodasi } from '../../utils/tampilanFasilitasAkomodasi';
import { kapasitasAngkaMaksimal } from '../../utils/kapasitas';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormPeserta from '../../components/FormPeserta';

export default function FormReservasi() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pulauId = params.get('pulau_id');

  const [pulau, setPulau] = useState(null);
  const [jenis, setJenis] = useState('one_day_trip');
  const [akomodasiId, setAkomodasiId] = useState('');
  const [jumlahUnit, setJumlahUnit] = useState(1);
  const [bawaTendaSendiri, setBawaTendaSendiri] = useState(false);
  const [tanggal, setTanggal] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jumlahOrang, setJumlahOrang] = useState(1);
  const [peserta, setPeserta] = useState([]);
  const [ketersediaan, setKetersediaan] = useState(null); // { jumlah_unit, sisa_unit, tersedia }
  const [cekLoading, setCekLoading] = useState(false);

  useEffect(() => {
    if (pulauId) api.get(`/pulau/${pulauId}`).then((res) => setPulau(res.data));
  }, [pulauId]);

  // Cek sisa unit akomodasi setiap kali akomodasi/tanggal check-in/check-out lengkap dipilih —
  // supaya wisatawan langsung tahu sisa kuota SEBELUM kirim reservasi, bukan cuma tebak-tebakan.
  useEffect(() => {
    if (jenis !== 'menginap' || bawaTendaSendiri || !akomodasiId || !tanggal || !tanggalSelesai || tanggalSelesai <= tanggal) {
      setKetersediaan(null);
      return;
    }
    let batal = false;
    setCekLoading(true);
    api
      .get(`/akomodasi/${akomodasiId}/ketersediaan`, { params: { checkin: tanggal, checkout: tanggalSelesai } })
      .then((res) => { if (!batal) setKetersediaan(res.data); })
      .catch(() => { if (!batal) setKetersediaan(null); })
      .finally(() => { if (!batal) setCekLoading(false); });
    return () => { batal = true; };
  }, [jenis, bawaTendaSendiri, akomodasiId, tanggal, tanggalSelesai]);

  // jumlahOrang bisa sementara kosong ('') selagi user lagi ngetik ulang di input-nya,
  // jadi kalkulasi biaya pakai versi "aman" ini (minimal 1) supaya tidak muncul NaN.
  const jumlahOrangAman = Math.max(1, parseInt(jumlahOrang, 10) || 0);
  const jumlahUnitAman = Math.max(1, parseInt(jumlahUnit, 10) || 0);

  // Jumlah baris identitas selalu mengikuti jumlah wisatawan. Baris pertama diisikan
  // otomatis dari profil pemesan supaya tidak perlu mengetik ulang data dirinya sendiri.
  useEffect(() => {
    setPeserta((lama) => {
      const baru = [...lama];
      while (baru.length < jumlahOrangAman) {
        baru.push({ nama: '', no_identitas: '', jenis_kelamin: 'L', usia: '', no_hp: '' });
      }
      const dipotong = baru.slice(0, jumlahOrangAman);
      if (dipotong.length && user && !dipotong[0].nama && !dipotong[0].no_hp) {
        dipotong[0] = { ...dipotong[0], nama: user.name || '', no_hp: user.no_hp || '' };
      }
      return dipotong;
    });
  }, [jumlahOrangAman, user]);

  // PENTING: seluruh hook di atas WAJIB berada sebelum baris-baris "return" awal di bawah.
  // React menuntut jumlah dan urutan hook sama di setiap render; kalau sebuah useEffect
  // diletakkan setelah early return, render pertama (saat data pulau masih dimuat)
  // mendaftarkan lebih sedikit hook daripada render berikutnya dan halaman langsung rusak.
  if (!pulau) return <p className="p-6 text-center">Memuat...</p>;

  // Nomor HP wajib diisi dulu sebelum reservasi — supaya Pengantar/Pengelola Pulau punya cara
  // menghubungi wisatawan. Dicek juga di backend (ReservasiController@store), ini cuma supaya
  // wisatawan tidak capek isi form dulu baru gagal pas submit di halaman Pembayaran.
  if (!user?.no_hp) {
    return (
      <div className="wadah-sedang bg-background min-h-screen">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-outline-variant sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="text-on-surface" type="button">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <p className="font-semibold text-on-surface">Buat Reservasi</p>
        </div>

        <div className="px-6 pt-16">
          <div className="bg-white rounded-2xl shadow-md p-7 flex flex-col items-center text-center">
            <span className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[30px]">contact_phone</span>
            </span>
            <p className="font-bold text-lg text-on-surface mb-2">Lengkapi Nomor HP Dulu</p>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Sebelum membuat reservasi, isi dulu nomor HP kamu di halaman Edit Profil — supaya
              Pengantar Pulau bisa menghubungimu soal jadwal kunjungan.
            </p>
            <Link to="/profil/edit" className="btn-primary w-full text-center">
              Lengkapi Profil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tarif penyeberangan dan tiket masuk diambil per pulau dari backend. Tiket masuk berbeda
  // antara One Day Trip dan Menginap, jadi ikut berubah begitu jenis kunjungan diganti.
  // Angka di sini estimasi tampilan saja — perhitungan final tetap dilakukan backend.
  const tarifPenyeberangan = Number(pulau.harga_penyeberangan) || 0;
  const tarifTiketMasuk =
    jenis === 'menginap'
      ? Number(pulau.harga_tiket_masuk_menginap) || 0
      : Number(pulau.harga_tiket_masuk_one_day) || 0;
  const akomodasiTerpilih = pulau.akomodasi?.find((a) => String(a.id) === String(akomodasiId));

  // Batas tanggal buat date picker — samain sama validasi backend supaya wisatawan nggak bisa
  // pilih tanggal yang bakal ditolak backend.
  //
  // JANGAN pakai toISOString(): fungsi itu mengubah waktu ke UTC dulu, sehingga di Indonesia
  // (WIB, UTC+7) tanggal yang dihasilkan masih tanggal kemarin sampai pukul 07.00 pagi.
  // Akibatnya tanggal yang sudah lewat masih bisa dipilih.
  const tglLokal = (d) => {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  // Reservasi paling cepat untuk BESOK (H-1), bukan hari ini. Pengantar Pulau butuh waktu
  // memverifikasi bukti transfer dan menyusun manifest keberangkatan; kalau dipesan di hari
  // yang sama, verifikasi bisa saja baru dilakukan setelah jam keberangkatan lewat.
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const tanggalMinimal = tglLokal(besok);

  const checkoutMin = tanggal
    ? tglLokal(new Date(new Date(tanggal).getTime() + 86400000))
    : tanggalMinimal;

  const jumlahMalam =
    jenis === 'menginap' && tanggal && tanggalSelesai
      ? Math.max(1, Math.round((new Date(tanggalSelesai) - new Date(tanggal)) / 86400000))
      : 0;

  // Kapasitas boleh diisi rentang (mis. "4-6") — dipakai sebagai angka lewat angka terbesar
  // yang ditemukan dalam teksnya, konsisten dengan perhitungan final di backend.
  const kapasitasPerUnit = kapasitasAngkaMaksimal(akomodasiTerpilih?.kapasitas);

  // Saran jumlah unit = jumlah orang dibagi kapasitas per unit, dibulatkan ke atas.
  // Ditampilkan sebagai anjuran, bukan paksaan — wisatawan tetap boleh memesan lebih sedikit
  // unit, misalnya sebagian anggota rombongan membawa tenda sendiri.
  const unitDisarankan = kapasitasPerUnit ? Math.ceil(jumlahOrangAman / kapasitasPerUnit) : 1;

  // Akomodasi yang sudah menandai "tiket_termasuk" membebaskan tiket masuk untuk wisatawan
  // yang tertampung kapasitas unit yang dipesan — sisanya (kalau rombongan melebihi kapasitas)
  // tetap kena tiket masuk penuh. Ini cuma ESTIMASI tampilan, perhitungan final tetap di backend.
  const orangDitanggungTiket =
    jenis === 'menginap' && !bawaTendaSendiri && akomodasiTerpilih?.tiket_termasuk
      ? Math.min(jumlahOrangAman, kapasitasPerUnit * jumlahUnitAman)
      : 0;
  const orangBayarTiket = Math.max(0, jumlahOrangAman - orangDitanggungTiket);

  const biayaPenyeberangan = tarifPenyeberangan * jumlahOrangAman;
  const biayaTiket = tarifTiketMasuk * orangBayarTiket;
  const biayaAkomodasi =
    jenis === 'menginap' && !bawaTendaSendiri && akomodasiTerpilih
      ? Number(akomodasiTerpilih.harga_per_malam) * jumlahMalam * jumlahUnitAman
      : 0;
  const total = biayaPenyeberangan + biayaTiket + biayaAkomodasi;

  function lanjut() {
    if (jenis === 'menginap' && !bawaTendaSendiri && !akomodasiId) {
      showToast('Pilih akomodasi, atau centang "Bawa Tenda Sendiri" kalau tidak perlu akomodasi.', 2800, 'peringatan');
      return;
    }
    if (!tanggal) {
      showToast('Pilih tanggal kunjungan.', 2800, 'peringatan');
      return;
    }
    if (jenis === 'menginap' && !tanggalSelesai) {
      showToast('Pilih tanggal selesai (check-out).', 2800, 'peringatan');
      return;
    }
    if (jenis === 'menginap' && tanggalSelesai <= tanggal) {
      showToast('Tanggal selesai harus setelah tanggal kunjungan.', 2800, 'peringatan');
      return;
    }
    if (jenis === 'menginap' && !bawaTendaSendiri && ketersediaan && !ketersediaan.tersedia) {
      showToast('Akomodasi ini sudah penuh untuk tanggal yang dipilih. Pilih tanggal atau akomodasi lain.', 2800, 'peringatan');
      return;
    }

    for (let i = 0; i < peserta.length; i += 1) {
      const orang = peserta[i];
      if (!String(orang.nama || '').trim()) {
        showToast(`Nama peserta ke-${i + 1} belum diisi.`, 2800, 'peringatan');
        return;
      }
      if (String(orang.usia ?? '').trim() === '' || Number.isNaN(Number(orang.usia))) {
        showToast(`Usia peserta ke-${i + 1} belum diisi.`, 2800, 'peringatan');
        return;
      }
      if (Number(orang.usia) >= 17 && !String(orang.no_identitas || '').trim()) {
        showToast(
          `Nomor identitas peserta ke-${i + 1} wajib diisi karena usianya 17 tahun ke atas.`,
          3200,
          'peringatan'
        );
        return;
      }
    }

    navigate('/reservasi/pembayaran', {
      state: {
        pulau_id: pulau.id,
        jenis,
        akomodasi_id: jenis === 'menginap' && !bawaTendaSendiri ? akomodasiId : null,
        jumlah_unit_dipesan: jenis === 'menginap' && !bawaTendaSendiri ? jumlahUnitAman : 1,
        bawa_tenda_sendiri: jenis === 'menginap' ? bawaTendaSendiri : false,
        tanggal_kunjungan: tanggal,
        tanggal_selesai: jenis === 'menginap' ? tanggalSelesai : null,
        jumlah_orang: jumlahOrangAman,
        peserta: peserta.map((orang) => ({
          nama: String(orang.nama).trim(),
          no_identitas: String(orang.no_identitas || '').trim() || null,
          jenis_kelamin: orang.jenis_kelamin || 'L',
          usia: Number(orang.usia),
          no_hp: String(orang.no_hp || '').trim() || null,
        })),
        total_estimasi: total,
        nama_pulau: pulau.nama,
      },
    });
  }

  return (
    <div className="wadah-sedang pb-24 md:pb-10 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-outline-variant sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-on-surface" type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-on-surface">Reservasi Wisata</p>
      </div>

      <div className="px-4 pt-4">
        {/* Foto pulau */}
        <div className="relative h-40 rounded-2xl overflow-hidden mb-5">
          <img
            src={pulau.foto_utama || fotoPulauFallback(pulau.nama)}
            alt={pulau.nama}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-semibold text-on-surface px-2.5 py-1 rounded-full">
            Destinasi Pilihan
          </span>
          <p className="absolute bottom-3 left-4 text-white text-xl font-bold drop-shadow">{pulau.nama}</p>
        </div>

        <p className="text-xs font-semibold text-[#F4A261] mb-2">Jenis Reservasi</p>
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              jenis === 'one_day_trip' ? 'bg-[#004873] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'
            }`}
            onClick={() => setJenis('one_day_trip')}
          >
            One Day Trip
          </button>
          <button
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              jenis === 'menginap' ? 'bg-[#004873] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'
            }`}
            onClick={() => setJenis('menginap')}
          >
            Menginap
          </button>
        </div>

        {jenis === 'menginap' && (
          <>
            <select
              className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 mb-2.5 text-sm outline-none disabled:bg-surface-container disabled:text-on-surface-variant"
              value={akomodasiId}
              disabled={bawaTendaSendiri}
              onChange={(e) => {
                setAkomodasiId(e.target.value);
                setJumlahUnit(1); // reset ke 1 setiap ganti akomodasi, kapasitasnya beda-beda
              }}
            >
              <option value="">Pilih Akomodasi</option>
              {pulau.akomodasi?.map((a) => (
                <option key={a.id} value={a.id}>{a.nama} — Rp{Number(a.harga_per_malam).toLocaleString('id-ID')}/malam</option>
              ))}
            </select>

            {/* Ringkasan akomodasi terpilih — supaya wisatawan tahu persis apa yang dia pesan
                (muat berapa orang, ber-AC atau berkipas) tanpa harus kembali ke Detail Pulau. */}
            {akomodasiTerpilih && !bawaTendaSendiri && (
              <div className="bg-white border border-outline-variant rounded-xl px-4 py-3 mb-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-on-surface-variant capitalize">{akomodasiTerpilih.tipe}</span>
                  {akomodasiTerpilih.kapasitas && (
                    <span className="flex items-center gap-0.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      Muat {akomodasiTerpilih.kapasitas} orang
                    </span>
                  )}
                </div>

                {akomodasiTerpilih.tiket_termasuk && (
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
                    Harga sudah termasuk tiket masuk pulau (untuk tamu sesuai kapasitas unit)
                  </p>
                )}

                {akomodasiTerpilih.fasilitas?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {akomodasiTerpilih.fasilitas.map((f) => (
                      <span
                        key={f}
                        className="flex items-center gap-0.5 bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-md"
                      >
                        <span className="material-symbols-outlined text-[12px] text-primary">
                          {ikonFasilitasAkomodasi(f)}
                        </span>
                        {labelFasilitasAkomodasi(f)}
                      </span>
                    ))}
                  </div>
                )}

                {akomodasiTerpilih.deskripsi && (
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1.5">
                    {akomodasiTerpilih.deskripsi}
                  </p>
                )}

                {akomodasiTerpilih.kapasitas && (
                  <div className="mt-2.5 pt-2.5 border-t border-outline-variant">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Jumlah Unit Dipesan</p>
                        <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                          Muat total {kapasitasPerUnit * jumlahUnitAman} orang
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setJumlahUnit(Math.max(1, jumlahUnitAman - 1))}
                          className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface disabled:opacity-40"
                          disabled={jumlahUnitAman <= 1}
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-on-surface">
                          {jumlahUnitAman}
                        </span>
                        <button
                          type="button"
                          onClick={() => setJumlahUnit(jumlahUnitAman + 1)}
                          className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>

                    {jumlahUnitAman < unitDisarankan && (
                      <p className="flex items-start gap-1.5 text-[11px] text-[#B45309] leading-relaxed mt-2">
                        <span className="material-symbols-outlined text-[14px] leading-none mt-px">info</span>
                        <span>
                          Rombonganmu {jumlahOrangAman} orang. Untuk semuanya tertampung,
                          disarankan memesan {unitDisarankan} unit.{' '}
                          <button
                            type="button"
                            onClick={() => setJumlahUnit(unitDisarankan)}
                            className="font-semibold underline"
                          >
                            Jadikan {unitDisarankan} unit
                          </button>
                          . Kalau sebagian anggota membawa tenda sendiri, jumlah sekarang sudah cukup.
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <label className="flex items-start gap-2.5 bg-white border border-outline-variant rounded-xl px-4 py-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-[#004873]"
                checked={bawaTendaSendiri}
                onChange={(e) => {
                  setBawaTendaSendiri(e.target.checked);
                  if (e.target.checked) setAkomodasiId('');
                }}
              />
              <span className="text-xs text-on-surface">
                <span className="font-semibold">Bawa Tenda Sendiri</span>
                <span className="block text-on-surface-variant mt-0.5">
                  Gratis, tidak perlu pilih akomodasi — cocok kalau kamu sudah bawa tenda dan perlengkapan sendiri.
                </span>
              </span>
            </label>
          </>
        )}

        <p className="text-xs font-semibold text-[#F4A261] mb-1.5">
          {jenis === 'menginap' ? 'Tanggal Check-in' : 'Tanggal Kunjungan'}
        </p>
        {/* Aturan H-1 disampaikan sebelum wisatawan membuka kalender, bukan setelah gagal
            memilih tanggal — supaya tidak ada yang mengira bisa berangkat di hari yang sama. */}
        <p className="flex items-start gap-1.5 text-[11px] text-on-surface-variant leading-relaxed mb-2">
          <span className="material-symbols-outlined text-[14px] leading-none mt-px">schedule</span>
          <span>
            Kunjungan paling cepat dijadwalkan <span className="font-semibold text-on-surface">besok</span>.
            Reservasi untuk hari yang sama tidak dapat dilayani karena Pengantar Pulau perlu waktu
            memverifikasi bukti transfer dan menyusun manifest keberangkatan.
          </span>
        </p>
        <input
          type="date"
          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 mb-4 text-sm outline-none"
          value={tanggal}
          min={tanggalMinimal}
          onChange={(e) => {
            setTanggal(e.target.value);
            if (tanggalSelesai && tanggalSelesai <= e.target.value) setTanggalSelesai('');
          }}
        />

        {jenis === 'menginap' && (
          <>
            <p className="text-xs font-semibold text-[#F4A261] mb-1.5">Tanggal Check-out</p>
            <input
              type="date"
              className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 mb-4 text-sm outline-none"
              value={tanggalSelesai}
              min={checkoutMin}
              onChange={(e) => setTanggalSelesai(e.target.value)}
            />
            {jumlahMalam > 0 && (
              <p className="text-[11px] text-on-surface-variant -mt-2.5 mb-2">{jumlahMalam} malam menginap</p>
            )}

            {cekLoading && (
              <p className="text-xs text-on-surface-variant mb-4">Mengecek sisa unit...</p>
            )}
            {!cekLoading && ketersediaan && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 mb-4 text-xs font-semibold ${
                  ketersediaan.tersedia ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {ketersediaan.tersedia ? 'check_circle' : 'cancel'}
                </span>
                {ketersediaan.tersedia
                  ? `Tersedia — sisa ${ketersediaan.sisa_unit} dari ${ketersediaan.jumlah_unit} unit untuk tanggal ini`
                  : `Penuh — 0 dari ${ketersediaan.jumlah_unit} unit tersisa untuk tanggal ini`}
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-outline-variant p-4">
          <div>
            <p className="text-xs font-semibold text-[#F4A261]">Jumlah Wisatawan</p>
            <p className="text-[11px] text-on-surface-variant">Min. 1 orang</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 bg-surface-container rounded-full text-on-surface"
              onClick={() => setJumlahOrang(Math.max(1, jumlahOrangAman - 1))}
              type="button"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              className="w-12 text-center font-semibold text-on-surface bg-transparent outline-none border-b border-transparent focus:border-[#004873]"
              value={jumlahOrang}
              onChange={(e) => {
                const val = e.target.value;
                // Boleh sementara kosong (misal user select-all lalu ngetik ulang) —
                // dijaga aman lewat jumlahOrangAman di atas, dirapikan lagi saat blur.
                if (val === '') { setJumlahOrang(''); return; }
                const n = parseInt(val, 10);
                if (!Number.isNaN(n)) setJumlahOrang(Math.max(1, n));
              }}
              onBlur={() => setJumlahOrang(jumlahOrangAman)}
            />
            <button
              className="w-8 h-8 bg-[#004873] text-white rounded-full"
              onClick={() => setJumlahOrang(jumlahOrangAman + 1)}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        {/* ── Identitas peserta ── */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#F4A261] mb-1.5">Data Peserta</p>
          <p className="text-[11px] text-on-surface-variant mb-3 leading-snug">
            Identitas setiap peserta wajib diisi karena menjadi dasar manifest penumpang kapal.
            Bila terjadi keadaan darurat di laut, data inilah yang dipakai untuk mengetahui
            siapa saja yang berada di atas kapal.
          </p>
          <FormPeserta daftar={peserta} onChange={setPeserta} />
        </div>

        <div className="bg-white rounded-xl border border-outline-variant p-4 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between text-on-surface-variant"><span>Penyeberangan</span><span>Rp{biayaPenyeberangan.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-on-surface-variant">
            <span>
              Tiket Masuk
              {orangDitanggungTiket > 0 && (
                <span className="block text-[10px] text-green-700">
                  {orangBayarTiket} dari {jumlahOrangAman} orang — {orangDitanggungTiket} sudah termasuk akomodasi
                </span>
              )}
            </span>
            <span>Rp{biayaTiket.toLocaleString('id-ID')}</span>
          </div>
          {jenis === 'menginap' && (
            <div className="flex justify-between text-on-surface-variant">
              <span>
                {bawaTendaSendiri ? 'Akomodasi (bawa tenda sendiri)' : `Akomodasi ${jumlahMalam > 0 ? `(${jumlahMalam} malam)` : ''}`}
              </span>
              <span>{bawaTendaSendiri ? 'Gratis' : `Rp${biayaAkomodasi.toLocaleString('id-ID')}`}</span>
            </div>
          )}
          <hr className="border-outline-variant" />
          <div className="flex justify-between font-bold text-on-surface"><span>Total</span><span>Rp{total.toLocaleString('id-ID')}</span></div>
        </div>

        <button
          className="w-full bg-[#F4A261] text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
          onClick={lanjut}
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
}
