import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { PENYELENGGARA, REKENING } from '../../config/penyelenggara';
import { waLink } from '../../utils/kontak';

// Tanggal dari form reservasi masih berformat mentah "2026-08-13" (nilai asli input date).
// Kalau langsung ditampilkan, halaman terakhir checkout jadi satu-satunya layar yang
// memperlihatkan tanggal gaya database, padahal halaman lain sudah pakai "13 Agu 2026".
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Pembayaran() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [buktiBase64, setBuktiBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state) {
    navigate('/beranda');
    return null;
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setBuktiBase64(reader.result); // dikirim sebagai string ke backend (lihat catatan README)
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!buktiBase64) {
      setError('Upload bukti transfer terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/reservasi', {
        pulau_id: state.pulau_id,
        jenis: state.jenis,
        akomodasi_id: state.akomodasi_id,
        // BUG: field ini ke-skip sebelumnya, jadi backend selalu default ke 1 unit walau
        // FormReservasi sudah menghitung & menampilkan N unit ke wisatawan (mis. rombongan
        // 8 orang pesan 2 unit cottage kapasitas 4). Akibatnya biaya_akomodasi kesimpan
        // salah (dihitung cuma 1 unit) DAN unit yang "terpakai" di sisaUnitPadaTanggal()
        // ikut kehitung cuma 1 -- unit ke-2 dst tetap kelihatan kosong dan bisa double-booked
        // wisatawan lain. Wajib ikut dikirim persis seperti yang sudah dihitung di FormReservasi.
        jumlah_unit_dipesan: state.jumlah_unit_dipesan || 1,
        bawa_tenda_sendiri: state.bawa_tenda_sendiri || false,
        tanggal_kunjungan: state.tanggal_kunjungan,
        tanggal_selesai: state.tanggal_selesai || null,
        jumlah_orang: state.jumlah_orang,
        // Identitas peserta ikut dikirim dan disimpan bersama reservasi — jumlah barisnya
        // harus sama dengan jumlah_orang, kalau tidak backend menolak.
        peserta: state.peserta || [],
        bukti_transfer: buktiBase64,
      });
      navigate('/reservasi');
    } catch (err) {
      // Backend mengirim {message} untuk penolakan aturan bisnis, tetapi {errors} untuk
      // kegagalan validasi. Tanpa cabang kedua, kesalahan pengisian data peserta hanya
      // tampil sebagai "Gagal mengirim reservasi" tanpa memberi tahu apa yang salah.
      const daftarError = err.response?.data?.errors;
      setError(
        err.response?.data?.message
          || (daftarError ? Object.values(daftarError).flat().join(' ') : '')
          || 'Gagal mengirim reservasi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wadah-sempit pb-24 md:pb-10 px-4 md:px-6 pt-4 md:pt-8">
      {/* Halaman ini sebelumnya tidak punya tombol kembali sama sekali. Padahal ini langkah
          terakhir reservasi -- wisatawan yang mau mengoreksi tanggal / jumlah orang di form
          sebelumnya jadi buntu dan terpaksa pakai tombol back browser. navigate(-1) balik ke
          Form Reservasi. */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} type="button" className="text-laut-dark shrink-0">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-lg text-laut-dark">Pembayaran</p>
      </div>

      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-2">{state.nama_pulau}</p>
        {state.jenis === 'menginap' ? (
          <div className="flex justify-between text-on-surface-variant mb-1">
            <span>Check-in — Check-out</span>
            <span>{formatTanggal(state.tanggal_kunjungan)} s/d {formatTanggal(state.tanggal_selesai)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-on-surface-variant mb-1">
            <span>Tanggal Kunjungan</span>
            <span>{formatTanggal(state.tanggal_kunjungan)}</span>
          </div>
        )}
        <div className="flex justify-between"><span>Total Bayar</span><span className="font-bold text-karang-dark">Rp{state.total_estimasi.toLocaleString('id-ID')}</span></div>
      </div>

      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-2">Transfer ke rekening berikut</p>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 mb-3">
          <p className="text-on-surface-variant text-xs">{REKENING.bank}</p>
          <p className="font-bold text-lg text-laut-dark tracking-wide">{REKENING.nomor}</p>
          <p className="text-on-surface-variant">a.n. {REKENING.atasNama}</p>
        </div>

        <p className="text-on-surface-variant">
          Transfer sejumlah{' '}
          <b className="text-karang-dark">Rp{state.total_estimasi.toLocaleString('id-ID')}</b>,
          lalu unggah bukti transfernya di bawah ini.
        </p>

        {/* Peringatan penipuan. Wisatawan diminta membayar penuh di muka sebelum bertemu
            siapa pun, jadi halaman ini perlu menegaskan ke mana uangnya boleh dikirim dan
            apa yang tidak akan pernah diminta sistem. */}
        <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 p-3 text-xs leading-relaxed">
          Transfer hanya ke rekening yang tertera di halaman ini. Sistem tidak pernah meminta
          PIN, OTP, atau kata sandi perbankan Anda. Perlu konfirmasi? Hubungi{' '}
          {PENYELENGGARA.narahubung} di{' '}
          <a href={waLink(PENYELENGGARA.noHp)} target="_blank" rel="noreferrer" className="font-semibold underline">
            {PENYELENGGARA.noHp}
          </a>.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <label className="card mb-4 flex flex-col items-center justify-center border-dashed border-2 border-gray-300 py-6 cursor-pointer">
        {preview ? (
          <img src={preview} alt="preview" className="max-h-40 rounded-lg" />
        ) : (
          <span className="text-gray-400 text-sm">Tap untuk upload bukti transfer</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>

      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
      </button>
    </div>
  );
}
