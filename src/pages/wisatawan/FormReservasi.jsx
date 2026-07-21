import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { fotoPulauFallback } from '../../utils/fotoPulau';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function FormReservasi() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pulauId = params.get('pulau_id');

  const [pulau, setPulau] = useState(null);
  const [jenis, setJenis] = useState('one_day_trip');
  const [akomodasiId, setAkomodasiId] = useState('');
  const [bawaTendaSendiri, setBawaTendaSendiri] = useState(false);
  const [tanggal, setTanggal] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jumlahOrang, setJumlahOrang] = useState(1);
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

  if (!pulau) return <p className="p-6 text-center">Memuat...</p>;

  // Nomor HP wajib diisi dulu sebelum reservasi — supaya Pengantar/Pengelola Pulau punya cara
  // menghubungi wisatawan. Dicek juga di backend (ReservasiController@store), ini cuma supaya
  // wisatawan tidak capek isi form dulu baru gagal pas submit di halaman Pembayaran.
  if (!user?.no_hp) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
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

  const tarifPenyeberangan = 50000; // ditampilkan estimasi saja, perhitungan final di backend
  const akomodasiTerpilih = pulau.akomodasi?.find((a) => String(a.id) === String(akomodasiId));

  // Batas tanggal buat date picker — samain sama validasi backend (after_or_equal:today
  // untuk tanggal kunjungan/check-in, after:tanggal_kunjungan untuk check-out) supaya
  // wisatawan nggak bisa pilih tanggal yang bakal ditolak backend.
  const hariIni = new Date().toISOString().slice(0, 10);
  const checkoutMin = tanggal
    ? new Date(new Date(tanggal).getTime() + 86400000).toISOString().slice(0, 10)
    : hariIni;

  const jumlahMalam =
    jenis === 'menginap' && tanggal && tanggalSelesai
      ? Math.max(1, Math.round((new Date(tanggalSelesai) - new Date(tanggal)) / 86400000))
      : 0;

  const biayaPenyeberangan = tarifPenyeberangan * jumlahOrang;
  const biayaTiket = Number(pulau.harga_tiket_masuk) * jumlahOrang;
  const biayaAkomodasi =
    jenis === 'menginap' && !bawaTendaSendiri && akomodasiTerpilih ? Number(akomodasiTerpilih.harga_per_malam) * jumlahMalam : 0;
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

    navigate('/reservasi/pembayaran', {
      state: {
        pulau_id: pulau.id,
        jenis,
        akomodasi_id: jenis === 'menginap' && !bawaTendaSendiri ? akomodasiId : null,
        bawa_tenda_sendiri: jenis === 'menginap' ? bawaTendaSendiri : false,
        tanggal_kunjungan: tanggal,
        tanggal_selesai: jenis === 'menginap' ? tanggalSelesai : null,
        jumlah_orang: jumlahOrang,
        total_estimasi: total,
        nama_pulau: pulau.nama,
      },
    });
  }

  return (
    <div className="max-w-md mx-auto pb-24 bg-background min-h-screen">
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
              onChange={(e) => setAkomodasiId(e.target.value)}
            >
              <option value="">Pilih Akomodasi</option>
              {pulau.akomodasi?.map((a) => (
                <option key={a.id} value={a.id}>{a.nama} — Rp{Number(a.harga_per_malam).toLocaleString('id-ID')}/malam</option>
              ))}
            </select>

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
        <input
          type="date"
          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 mb-4 text-sm outline-none"
          value={tanggal}
          min={hariIni}
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
              onClick={() => setJumlahOrang((n) => Math.max(1, n - 1))}
              type="button"
            >
              -
            </button>
            <span className="font-semibold text-on-surface">{jumlahOrang}</span>
            <button
              className="w-8 h-8 bg-[#004873] text-white rounded-full"
              onClick={() => setJumlahOrang((n) => n + 1)}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant p-4 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between text-on-surface-variant"><span>Penyeberangan</span><span>Rp{biayaPenyeberangan.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-on-surface-variant"><span>Tiket Masuk</span><span>Rp{biayaTiket.toLocaleString('id-ID')}</span></div>
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
