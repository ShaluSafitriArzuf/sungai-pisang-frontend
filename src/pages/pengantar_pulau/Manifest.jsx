import { useEffect, useState } from 'react';
import api from '../../api/axios';
import TopNav from '../../components/TopNav';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

export default function Manifest() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState({ reservasi: [], jumlah_wisatawan: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/manifest?tanggal=${tanggal}`).then((res) => setData(res.data));
  }, [tanggal]);

  async function eksporPdf() {
    setLoading(true);
    try {
      const res = await api.post('/manifest/export', { tanggal });
      window.open(res.data.url, '_blank');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopNav title="Manifest Harian" menu={MENU} />

      <div className="px-4 py-4">
        <input type="date" className="input-field mb-4" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />

        <div className="space-y-2 mb-4">
          {data.reservasi.map((r) => (
            <div key={r.id} className="card text-sm flex justify-between">
              <div>
                <p className="font-semibold">{r.wisatawan?.name}</p>
                <p className="text-xs text-gray-500">{r.pulau?.nama} — {r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'}</p>
              </div>
              <p className="text-sm">{r.jumlah_orang} org</p>
            </div>
          ))}
          {data.reservasi.length === 0 && <p className="text-gray-400 text-sm text-center">Tidak ada kunjungan tanggal ini.</p>}
        </div>

        <p className="text-sm mb-4">Total wisatawan: <strong>{data.jumlah_wisatawan}</strong> orang</p>

        <button className="btn-primary" onClick={eksporPdf} disabled={loading}>
          {loading ? 'Memproses...' : 'Ekspor PDF'}
        </button>
      </div>
    </div>
  );
}
