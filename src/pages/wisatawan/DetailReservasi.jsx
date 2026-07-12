import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

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
  const [r, setR] = useState(null);

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  if (!r) return <p className="p-6 text-center">Memuat...</p>;

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
        <div className="card mb-4 text-sm bg-red-50">
          <p className="font-semibold text-red-600">Catatan Penolakan</p>
          <p className="text-gray-600">{r.catatan_penolakan}</p>
        </div>
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
