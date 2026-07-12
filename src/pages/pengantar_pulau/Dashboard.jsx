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

export default function Dashboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/reservasi?status=menunggu_verifikasi').then((res) => setList(res.data.data || res.data));
  }, []);

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopNav title="Dashboard Pengantar Pulau" menu={MENU} />

      <div className="px-4 py-4">
        <div className="card mb-4">
          <p className="text-sm text-gray-500">Menunggu Verifikasi Hari Ini</p>
          <p className="text-2xl font-bold text-laut-dark">{list.length}</p>
        </div>

        <p className="font-bold text-laut-dark mb-2">Reservasi Masuk</p>
        <div className="space-y-3">
          {list.map((r) => (
            <Link to={`/pengantar/reservasi/${r.id}`} key={r.id} className="card block">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{r.wisatawan?.name}</p>
                  <p className="text-xs text-gray-500">{r.pulau?.nama} — {r.tanggal_kunjungan}</p>
                  <p className="text-xs text-gray-500">{r.jumlah_orang} orang</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
          {list.length === 0 && <p className="text-gray-400 text-sm text-center mt-6">Tidak ada reservasi menunggu verifikasi.</p>}
        </div>
      </div>
    </div>
  );
}
