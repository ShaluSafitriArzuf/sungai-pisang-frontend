import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function DetailReservasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [r, setR] = useState(null);

  // Upload ulang bukti transfer — dipakai kalau reservasi ditolak gara-gara bukti kurang
  // jelas/salah upload, supaya wisatawan tidak perlu bikin reservasi baru dari nol.
  const [previewBaru, setPreviewBaru] = useState(null);
  const [buktiBaru, setBuktiBaru] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  if (!r) return <p className="p-6 text-center">Memuat...</p>;

  function handleFileBaru(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewBaru(reader.result);
      setBuktiBaru(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function uploadUlang() {
    if (!buktiBaru) {
      setUploadError('Pilih foto bukti transfer terlebih dahulu.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');
    try {
      const res = await api.post(`/reservasi/${id}/upload-ulang-bukti`, { bukti_transfer: buktiBaru });
      setR(res.data.data);
      setPreviewBaru(null);
      setBuktiBaru('');
      showToast('Bukti transfer berhasil diunggah ulang, menunggu verifikasi.', 2800, 'sukses');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah ulang bukti transfer.');
    } finally {
      setUploadLoading(false);
    }
  }

  // bisa_ajukan_batal dihitung backend (aturan H-2), bukan cuma cek status='valid' di sini —
  // supaya tombol ini selalu sinkron dengan aturan yang benar-benar dipakai saat submit.
  const bisaBatal = r.status === 'valid' && r.bisa_ajukan_batal;
  const lewatBatasBatal = r.status === 'valid' && !r.bisa_ajukan_batal;

  return (
    <div className="max-w-md mx-auto pb-24 px-4 pt-4">
      <p className="font-bold text-lg text-laut-dark mb-4">Detail Reservasi</p>

      <div className="card mb-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Pulau</span><span className="font-semibold">{r.pulau?.nama}</span></div>
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
        <div className="flex justify-between"><span>Total Bayar</span><span className="font-bold text-karang-dark">Rp{Number(r.total_bayar).toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between items-center pt-2"><span>Status</span><StatusBadge status={r.status} /></div>
      </div>

      {r.status === 'ditolak' && (
        <>
          <div className="card mb-4 text-sm bg-red-50">
            <p className="font-semibold text-red-600">Catatan Penolakan</p>
            <p className="text-gray-600">{r.catatan_penolakan}</p>
          </div>

          <div className="card mb-4 text-sm">
            <p className="font-semibold mb-1">Unggah Ulang Bukti Transfer</p>
            <p className="text-gray-500 text-xs mb-3">
              Kalau alasannya cuma soal bukti kurang jelas atau salah upload, tidak perlu bikin reservasi baru —
              cukup unggah ulang foto bukti transfer di sini, reservasi ini akan diverifikasi ulang.
            </p>

            {uploadError && <p className="text-red-500 text-xs mb-2">{uploadError}</p>}

            <label className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-xl py-6 cursor-pointer mb-3">
              {previewBaru ? (
                <img src={previewBaru} alt="preview bukti baru" className="max-h-40 rounded-lg" />
              ) : (
                <span className="text-gray-400 text-sm">Tap untuk upload bukti transfer baru</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileBaru} />
            </label>

            <button className="btn-primary" onClick={uploadUlang} disabled={uploadLoading}>
              {uploadLoading ? 'Mengunggah...' : 'Kirim Bukti Baru'}
            </button>
          </div>
        </>
      )}

      {r.status === 'pengajuan_batal' && (
        <div className="card mb-4 text-sm bg-orange-50">
          <p className="font-semibold text-orange-600">Pengajuan pembatalan sedang diproses</p>
        </div>
      )}

      {lewatBatasBatal && (
        <div className="card mb-4 text-sm bg-gray-50">
          <p className="text-gray-500">
            Pengajuan pembatalan sudah tidak bisa dilakukan — batas waktunya minimal H-2 sebelum tanggal kunjungan.
          </p>
        </div>
      )}

      {bisaBatal && (
        <button className="btn-outline-danger" onClick={() => navigate(`/reservasi/${r.id}/batal`)}>
          Ajukan Pembatalan
        </button>
      )}

      {r.status === 'selesai' && !r.ulasan && (
        <Link to={`/ulasan/${r.id}`} className="btn-primary block text-center mt-3">
          Beri Ulasan
        </Link>
      )}
    </div>
  );
}
