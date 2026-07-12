import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ALASAN = [
  { value: 'cuaca_buruk', label: 'Cuaca Buruk' },
  { value: 'sakit_mendadak', label: 'Sakit Mendadak' },
  { value: 'perubahan_jadwal', label: 'Perubahan Jadwal' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function FormPembatalan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alasan, setAlasan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!alasan) {
      setError('Pilih alasan pembatalan.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/reservasi/${id}/ajukan-batal`, {
        alasan_pembatalan: alasan,
        keterangan_pembatalan: keterangan,
      });
      navigate(`/reservasi/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan pembatalan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4">
      <p className="font-bold text-lg text-laut-dark mb-4">Ajukan Pembatalan</p>

      <div className="card mb-4 bg-yellow-50 text-sm text-yellow-700">
        Pembatalan hanya bisa diajukan minimal H-2 sebelum tanggal kunjungan.
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <p className="text-sm font-semibold mb-2">Alasan Pembatalan</p>
      <select className="input-field mb-4" value={alasan} onChange={(e) => setAlasan(e.target.value)}>
        <option value="">Pilih alasan...</option>
        {ALASAN.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      {alasan === 'lainnya' && (
        <textarea
          className="input-field mb-4"
          placeholder="Jelaskan alasan pembatalan..."
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
        />
      )}

      <button className="btn-outline-danger" onClick={submit} disabled={loading}>
        {loading ? 'Mengirim...' : 'Ajukan Pembatalan'}
      </button>
    </div>
  );
}
