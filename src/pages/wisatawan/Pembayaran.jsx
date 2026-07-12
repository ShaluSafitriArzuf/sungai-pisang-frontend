import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

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
        bawa_tenda_sendiri: state.bawa_tenda_sendiri || false,
        tanggal_kunjungan: state.tanggal_kunjungan,
        tanggal_selesai: state.tanggal_selesai || null,
        jumlah_orang: state.jumlah_orang,
        bukti_transfer: buktiBase64,
      });
      navigate('/reservasi');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim reservasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-24 px-4 pt-4">
      <p className="font-bold text-lg text-laut-dark mb-4">Pembayaran</p>

      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-2">{state.nama_pulau}</p>
        {state.jenis === 'menginap' ? (
          <div className="flex justify-between text-on-surface-variant mb-1">
            <span>Check-in — Check-out</span>
            <span>{state.tanggal_kunjungan} s/d {state.tanggal_selesai}</span>
          </div>
        ) : (
          <div className="flex justify-between text-on-surface-variant mb-1">
            <span>Tanggal Kunjungan</span>
            <span>{state.tanggal_kunjungan}</span>
          </div>
        )}
        <div className="flex justify-between"><span>Total Bayar</span><span className="font-bold text-karang-dark">Rp{state.total_estimasi.toLocaleString('id-ID')}</span></div>
      </div>

      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-1">Transfer ke:</p>
        <p>Bank BRI — 1234-01-567890-50-1</p>
        <p>a.n. Pengelola Wisata Sungai Pisang</p>
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
