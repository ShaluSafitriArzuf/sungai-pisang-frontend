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
  // Ditampilkan sesudah ulasan tersimpan. Sengaja berupa popup, bukan toast sekilas, supaya
  // wisatawan yakin penilaiannya benar-benar terkirim dan tahu bahwa ulasan hanya bisa
  // dikirim satu kali untuk satu reservasi.
  const [sukses, setSukses] = useState(false);

  async function submit() {
    setLoading(true);
    setError('');
    try {
      await api.post('/ulasan', { reservasi_id: reservasiId, rating, komentar });
      setSukses(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setLoading(false);
    }
  }

  function selesai() {
    setSukses(false);
    navigate(`/reservasi/${reservasiId}`);
  }

  return (
    <div className="wadah-sempit px-4 md:px-6 pt-4 md:pt-8 md:pb-10">
      {/* Sama seperti halaman Pembayaran & Ajukan Pembatalan: halaman ini juga tidak punya
          jalan keluar sama sekali kalau wisatawan batal menulis ulasan. */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} type="button" className="text-laut-dark shrink-0">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-lg text-laut-dark">Beri Ulasan</p>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <p className="text-sm text-on-surface-variant text-center mb-2">
        Seberapa puas kamu dengan kunjungan ini?
      </p>

      <div className="flex justify-center gap-2 mb-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            className={`cursor-pointer ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-on-surface-variant mb-4">{rating} dari 5 bintang</p>

      <textarea
        className="input-field mb-4"
        rows={4}
        placeholder="Ceritakan pengalaman kunjungan kamu..."
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
      />

      <p className="text-[11px] text-on-surface-variant mb-3 text-center">
        Ulasan hanya bisa dikirim satu kali untuk setiap reservasi.
      </p>

      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>

      {/* Popup terima kasih */}
      {sukses && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-xs px-5 py-6 text-center shadow-xl">
            <span className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[34px]">check_circle</span>
            </span>
            <p className="font-bold text-lg text-on-surface mb-1">Terima Kasih!</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Terima kasih atas penilaian Anda. Ulasan kamu membantu wisatawan lain dan pengelola
              pulau dalam meningkatkan pelayanan.
            </p>
            <div className="text-yellow-400 text-xl mt-3">{'★'.repeat(rating)}</div>
            <button onClick={selesai} className="btn-primary w-full mt-4">
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
