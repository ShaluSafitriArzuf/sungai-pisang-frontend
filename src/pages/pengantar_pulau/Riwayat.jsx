import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import TopNav from '../../components/TopNav';
import StatusBadge from '../../components/StatusBadge';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

const TABS = [
  { key: '', label: 'Semua' },
  { key: 'valid', label: 'Valid' },
  { key: 'ditolak', label: 'Ditolak' },
];

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Riwayat() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reservasi')
      .then((res) => setList(res.data.data || res.data))
      .finally(() => setLoading(false));
  }, []);

  // Riwayat cuma nampilin yang sudah pernah diproses (bukan yang masih menunggu — itu tugas Dashboard).
  const sudahDiproses = list.filter((r) => r.status !== 'menunggu_verifikasi');
  const filtered = tab ? sudahDiproses.filter((r) => r.status === tab) : sudahDiproses;

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopNav title="Riwayat Verifikasi" menu={MENU} />

      <div className="px-4 py-4">
        <p className="text-xs text-gray-500 mb-3">
          Semua reservasi dari seluruh pulau yang pernah kamu verifikasi. Ini beda dari Manifest —
          Manifest cuma nampilin kunjungan valid di tanggal tertentu, ini nampilin semuanya.
        </p>

        <div className="flex gap-2 mb-4">
          {TABS.map((t) => {
            const jumlah = t.key ? sudahDiproses.filter((r) => r.status === t.key).length : sudahDiproses.length;
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

        {loading && <p className="text-center text-sm text-on-surface-variant mt-6">Memuat riwayat...</p>}

        {!loading && (
          <div className="space-y-2.5">
            {filtered.map((r) => (
              <Link
                to={`/pengantar/reservasi/${r.id}`}
                key={r.id}
                className="bg-white rounded-xl shadow-sm p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
              >
                <span className="w-10 h-10 rounded-full bg-[#004873]/10 text-[#004873] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    {r.jenis === 'menginap' ? 'hotel' : 'wb_sunny'}
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-on-surface truncate">{r.wisatawan?.name}</p>
                    <StatusBadge status={r.status} compact />
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {r.pulau?.nama} · {r.jenis === 'menginap' ? 'Menginap' : 'One Day Trip'}
                  </p>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">event</span>
                    {formatTanggal(r.tanggal_kunjungan)}
                    {r.tanggal_selesai ? ` – ${formatTanggal(r.tanggal_selesai)}` : ''}
                  </p>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada reservasi yang diproses.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
