import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DetailVerifikasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [r, setR] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [statusRefund, setStatusRefund] = useState('disetujui');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  if (!r) return <p className="p-6 text-center">Memuat...</p>;

  async function verifikasi(status) {
    if (status === 'ditolak' && !catatan) {
      showToast('Isi catatan penolakan terlebih dahulu.', 2800, 'peringatan');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.patch(`/reservasi/${id}/verifikasi`, { status, catatan_penolakan: catatan });
      navigate('/pengantar/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status reservasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function prosesBatal(disetujui) {
    setError('');
    setLoading(true);
    try {
      await api.patch(`/reservasi/${id}/proses-batal`, {
        disetujui,
        status_pengembalian_dana: disetujui ? statusRefund : null,
      });
      navigate('/pengantar/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pembatalan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-10">
      <p className="font-bold text-lg text-laut-dark mb-4">Detail Reservasi</p>

      <div className="card mb-4 text-sm space-y-1">
        <div className="flex justify-between"><span>Wisatawan</span><span className="font-semibold">{r.wisatawan?.name}</span></div>
        <div className="flex justify-between"><span>Pulau</span><span>{r.pulau?.nama}</span></div>
        <div className="flex justify-between"><span>Jenis</span><span>{r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'}</span></div>
        {r.akomodasi && <div className="flex justify-between"><span>Akomodasi</span><span>{r.akomodasi.nama}</span></div>}
        {r.jenis === 'menginap' && r.bawa_tenda_sendiri && (
          <div className="flex justify-between"><span>Akomodasi</span><span>Bawa Tenda Sendiri</span></div>
        )}
        {r.jenis === 'menginap' && r.tanggal_selesai ? (
          <>
            <div className="flex justify-between"><span>Check-in</span><span>{formatTanggal(r.tanggal_kunjungan)}</span></div>
            <div className="flex justify-between"><span>Check-out</span><span>{formatTanggal(r.tanggal_selesai)}</span></div>
          </>
        ) : (
          <div className="flex justify-between"><span>Tanggal</span><span>{formatTanggal(r.tanggal_kunjungan)}</span></div>
        )}
        <div className="flex justify-between"><span>Jumlah Orang</span><span>{r.jumlah_orang}</span></div>
        <div className="flex justify-between"><span>Total</span><span className="font-bold">Rp{Number(r.total_bayar).toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between items-center pt-1"><span>Status</span><StatusBadge status={r.status} /></div>
      </div>

      {r.bukti_transfer && (
        <div className="card mb-4">
          <p className="text-sm font-semibold mb-2">Bukti Transfer</p>
          <img src={r.bukti_transfer} alt="bukti transfer" className="w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {r.status === 'menunggu_verifikasi' && (
        <>
          <textarea
            className="input-field mb-3"
            placeholder="Catatan penolakan (wajib jika menolak)"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
          <div className="flex gap-3">
            <button className="flex-1 bg-green-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => verifikasi('valid')}>
              Valid
            </button>
            <button className="flex-1 bg-red-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => verifikasi('ditolak')}>
              Tolak
            </button>
          </div>
        </>
      )}

      {r.status === 'pengajuan_batal' && (
        <div className="card space-y-3">
          <p className="text-sm font-semibold">Alasan Pembatalan: {r.alasan_pembatalan}</p>
          {r.keterangan_pembatalan && <p className="text-sm text-gray-600">{r.keterangan_pembatalan}</p>}
          <select className="input-field" value={statusRefund} onChange={(e) => setStatusRefund(e.target.value)}>
            <option value="disetujui">Dana Dikembalikan</option>
            <option value="ditolak">Dana Tidak Dikembalikan</option>
          </select>
          <div className="flex gap-3">
            <button className="flex-1 bg-green-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => prosesBatal(true)}>
              Setujui Batal
            </button>
            <button className="flex-1 bg-gray-400 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => prosesBatal(false)}>
              Tolak Pembatalan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
