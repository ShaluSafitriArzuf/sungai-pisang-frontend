import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function FormUlasan() {
  const { reservasiId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      await api.post('/ulasan', { reservasi_id: reservasiId, rating, komentar });
      navigate(`/reservasi/${reservasiId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4">
      <p className="font-bold text-lg text-laut-dark mb-4">Beri Ulasan</p>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="flex justify-center gap-2 mb-4 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} onClick={() => setRating(n)} className={`cursor-pointer ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>

      <textarea
        className="input-field mb-4"
        rows={4}
        placeholder="Ceritakan pengalaman kunjungan kamu..."
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
      />

      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </div>
  );
}
