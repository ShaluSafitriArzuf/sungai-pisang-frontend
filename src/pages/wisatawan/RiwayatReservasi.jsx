import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import BottomNav from '../../components/BottomNav';
import { fotoPulauFallback } from '../../utils/fotoPulau';

const TABS = [
  { key: '', label: 'Semua' },
  { key: 'menunggu_verifikasi', label: 'Menunggu' },
  { key: 'valid', label: 'Valid' },
  { key: 'ditolak', label: 'Ditolak' },
  { key: 'selesai', label: 'Selesai' },
];

const AKSEN_STATUS = {
  menunggu_verifikasi: 'border-l-yellow-400',
  valid: 'border-l-green-500',
  ditolak: 'border-l-red-400',
  pengajuan_batal: 'border-l-orange-400',
  dibatalkan: 'border-l-gray-300',
  selesai: 'border-l-blue-400',
};

const STATUS_AKTIF = ['menunggu_verifikasi', 'valid', 'pengajuan_batal'];

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function KartuReservasi({ r }) {
  return (
    <Link
      to={`/reservasi/${r.id}`}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex gap-3 p-2.5 border-l-4 ${
        AKSEN_STATUS[r.status] || 'border-l-gray-200'
      }`}
    >
      <img
        src={r.pulau?.foto_utama || fotoPulauFallback(r.pulau?.nama)}
        alt={r.pulau?.nama}
        className="w-[68px] h-[68px] rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-on-surface truncate">{r.pulau?.nama}</p>
          <StatusBadge status={r.status} compact />
        </div>

        <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
          <span className="material-symbols-outlined text-[12px]">
            {r.jenis === 'menginap' ? 'hotel' : 'wb_sunny'}
          </span>
          {r.jenis === 'menginap' ? 'Menginap' : 'One Day Trip'}
        </span>

        <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">event</span>
          {formatTanggal(r.tanggal_kunjungan)}
          {r.tanggal_selesai ? ` – ${formatTanggal(r.tanggal_selesai)}` : ''}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          <p className="text-sm font-bold text-[#004873]">Rp{Number(r.total_bayar).toLocaleString('id-ID')}</p>
          <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
        </div>
      </div>
    </Link>
  );
}

export default function RiwayatReservasi() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reservasi')
      .then((res) => setList(res.data.data || res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab ? list.filter((r) => r.status === tab) : list;
  const aktif = filtered.filter((r) => STATUS_AKTIF.includes(r.status));
  const riwayat = filtered.filter((r) => !STATUS_AKTIF.includes(r.status));
  const menungguCount = list.filter((r) => r.status === 'menunggu_verifikasi').length;

  return (
    <div className="max-w-md mx-auto pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="relative bg-[#004873] text-white px-4 pt-5 pb-7 rounded-b-3xl overflow-hidden">
        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 w-24 h-24 rounded-full bg-[#F4A261]/15" />

        <div className="relative flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
          </span>
          <div>
            <p className="font-bold text-lg leading-tight">Riwayat Reservasi</p>
            <p className="text-xs text-white/70">{list.length} reservasi tercatat</p>
          </div>
        </div>

        {menungguCount > 0 && (
          <div className="relative mt-4 bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-yellow-300">hourglass_top</span>
            <p className="text-xs">
              <span className="font-semibold">{menungguCount} reservasi</span> sedang menunggu verifikasi
            </p>
          </div>
        )}
      </div>

      {/* Tabs filter */}
      <div className="flex gap-2 px-4 py-3.5 overflow-x-auto -mt-2">
        {TABS.map((t) => {
          const jumlah = t.key ? list.filter((r) => r.status === t.key).length : list.length;
          const aktifTab = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap shadow-sm transition-colors ${
                aktifTab ? 'bg-[#004873] text-white' : 'bg-white text-on-surface-variant border border-outline-variant'
              }`}
            >
              {t.label}
              {jumlah > 0 && <span className={aktifTab ? 'text-white/70' : 'text-outline'}> ({jumlah})</span>}
            </button>
          );
        })}
      </div>

      {/* Daftar reservasi */}
      <div className="px-4">
        {loading && (
          <p className="text-center text-sm text-on-surface-variant mt-6">Memuat riwayat reservasi...</p>
        )}

        {!loading && aktif.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-0.5">
              Perlu Perhatian / Aktif
            </p>
            <div className="space-y-2.5">
              {aktif.map((r) => <KartuReservasi key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {!loading && riwayat.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-0.5">Riwayat</p>
            <div className="space-y-2.5">
              {riwayat.map((r) => <KartuReservasi key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center text-center pt-12 pb-4">
            <span className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px] text-outline">confirmation_number</span>
            </span>
            <p className="text-sm font-semibold text-on-surface">Belum ada reservasi</p>
            <p className="text-xs text-on-surface-variant mt-1 mb-4 max-w-[220px]">
              Reservasi yang kamu buat akan muncul di sini.
            </p>
            <Link
              to="/beranda"
              className="bg-[#F4A261] text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
            >
              Mulai Eksplorasi
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
