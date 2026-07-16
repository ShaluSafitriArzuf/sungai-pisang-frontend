import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';

const MENU = [
  { to: '/pengelola/dashboard', label: 'Dashboard' },
  { to: '/pengelola/akomodasi', label: 'Akomodasi' },
  { to: '/pengelola/wahana', label: 'Wahana' },
  { to: '/pengelola/galeri', label: 'Galeri' },
  { to: '/pengelola/profil-pulau', label: 'Profil Pulau' },
  { to: '/pengelola/statistik', label: 'Statistik & Ulasan' },
];

const BULAN_NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function labelBulan(kunci) {
  const [tahun, bulan] = kunci.split('-');
  return `${BULAN_NAMA[Number(bulan) - 1]} ${tahun}`;
}

export default function StatistikUlasan() {
  const { user } = useAuth();
  const [tab, setTab] = useState('statistik');
  const [reservasi, setReservasi] = useState([]);
  const [ulasan, setUlasan] = useState([]);

  useEffect(() => {
    api.get('/reservasi').then((res) => setReservasi(res.data.data || res.data));
    if (user?.pulau_id) api.get(`/ulasan?pulau_id=${user.pulau_id}`).then((res) => setUlasan(res.data.data || res.data));
  }, [user]);

  // /reservasi untuk pengelola_pulau berisi SEMUA jenis (menginap & one day trip) yang valid —
  // jadi wajib dipisah per jenis di sini, jangan digabung lalu dikira "menginap" semua.
  const menginap = reservasi.filter((r) => r.jenis === 'menginap');
  const oneDayTrip = reservasi.filter((r) => r.jenis === 'one_day_trip');
  const totalMenginap = menginap.reduce((s, r) => s + r.jumlah_orang, 0);
  const totalOneDayTrip = oneDayTrip.reduce((s, r) => s + r.jumlah_orang, 0);

  // Ringkasan kunjungan per bulan, tetap dipisah per jenis biar jelas asalnya
  const perBulan = reservasi.reduce((acc, r) => {
    const bulan = r.tanggal_kunjungan?.slice(0, 7);
    if (!bulan) return acc;
    acc[bulan] = acc[bulan] || { menginap: 0, oneDayTrip: 0 };
    if (r.jenis === 'menginap') acc[bulan].menginap += r.jumlah_orang;
    else acc[bulan].oneDayTrip += r.jumlah_orang;
    return acc;
  }, {});

  const rataRata = ulasan.length ? (ulasan.reduce((s, u) => s + u.rating, 0) / ulasan.length).toFixed(1) : '-';

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <TopNav title="Statistik & Ulasan" menu={MENU} />

      <div className="flex gap-2 px-4 py-4">
        <button
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === 'statistik' ? 'bg-[#004873] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'}`}
          onClick={() => setTab('statistik')}
        >
          Statistik
        </button>
        <button
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === 'ulasan' ? 'bg-[#004873] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'}`}
          onClick={() => setTab('ulasan')}
        >
          Ulasan
        </button>
      </div>

      <div className="px-4">
        {tab === 'statistik' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white rounded-xl shadow-sm p-3.5">
                <span className="w-8 h-8 rounded-full bg-[#004873]/10 text-[#004873] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[16px]">hotel</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">Menginap (valid)</p>
                <p className="text-xl font-bold text-on-surface">{totalMenginap}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3.5">
                <span className="w-8 h-8 rounded-full bg-[#F4A261]/15 text-[#F4A261] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">One Day Trip (valid)</p>
                <p className="text-xl font-bold text-on-surface">{totalOneDayTrip}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-0.5">Kunjungan per Bulan</p>
              <div className="space-y-2">
                {Object.entries(perBulan).sort((a, b) => b[0].localeCompare(a[0])).map(([bulan, jml]) => (
                  <div key={bulan} className="bg-white rounded-xl shadow-sm p-3.5">
                    <p className="text-sm font-semibold text-on-surface mb-1.5">{labelBulan(bulan)}</p>
                    <div className="flex gap-4 text-[11px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">hotel</span>
                        {jml.menginap} orang menginap
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">wb_sunny</span>
                        {jml.oneDayTrip} orang one day trip
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(perBulan).length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-6">Belum ada data kunjungan.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-on-surface-variant">Rating Rata-rata</p>
              <p className="text-2xl font-bold text-on-surface">★ {rataRata}</p>
            </div>
            {ulasan.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm p-3.5 text-sm">
                <p className="font-semibold text-on-surface">
                  {u.wisatawan?.name} <span className="text-yellow-500">{'★'.repeat(u.rating)}</span>
                </p>
                <p className="text-on-surface-variant mt-0.5">{u.komentar}</p>
              </div>
            ))}
            {ulasan.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Belum ada ulasan.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
