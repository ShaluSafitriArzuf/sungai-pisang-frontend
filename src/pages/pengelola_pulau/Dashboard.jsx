import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';
import { fotoPulauFallback } from '../../utils/fotoPulau';

const MENU = [
  { to: '/pengelola/dashboard', label: 'Dashboard' },
  { to: '/pengelola/akomodasi', label: 'Akomodasi' },
  { to: '/pengelola/wahana', label: 'Wahana' },
  { to: '/pengelola/galeri', label: 'Galeri' },
  { to: '/pengelola/profil-pulau', label: 'Profil Pulau' },
  { to: '/pengelola/statistik', label: 'Statistik & Ulasan' },
];

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function inisial(nama = '') {
  return nama.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase();
}

function KartuTamu({ r, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#004873]/10 text-[#004873] text-xs font-bold flex items-center justify-center shrink-0">
        {inisial(r.wisatawan?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{r.wisatawan?.name}</p>
        <p className="text-[11px] text-on-surface-variant truncate">{subtitle}</p>
      </div>
      <span className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
        {r.jumlah_orang} org
      </span>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-2">
        <span className="material-symbols-outlined text-[22px] text-outline">{icon}</span>
      </span>
      <p className="text-xs text-on-surface-variant">{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reservasi, setReservasi] = useState([]);
  const [pulau, setPulau] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend sekarang mengembalikan reservasi valid + selesai (one day trip & menginap) khusus
    // pulau ini. Di dashboard ini kita cuma mau yang MASIH BERJALAN, jadi disaring lagi status
    // === 'valid' di bawah — yang sudah "selesai" tetap kehitung di Statistik & Ulasan.
    api.get('/reservasi').then((res) => setReservasi(res.data.data || res.data)).finally(() => setLoading(false));
    if (user?.pulau_id) api.get(`/pulau/${user.pulau_id}`).then((res) => setPulau(res.data));
  }, [user]);

  const menginap = reservasi.filter((r) => r.jenis === 'menginap' && r.status === 'valid');
  const oneDay = reservasi.filter((r) => r.jenis === 'one_day_trip' && r.status === 'valid');

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <TopNav title={pulau?.nama || 'Dashboard Pengelola'} menu={MENU} />

      {/* Kartu profil pulau ringkas */}
      {pulau && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden flex items-center gap-3 p-3">
            <img
              src={pulau.foto_utama || fotoPulauFallback(pulau.nama)}
              alt={pulau.nama}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface truncate">{pulau.nama}</p>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {pulau.rating_rata_rata ?? 0} rating rata-rata
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="px-4 pt-3 grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl shadow-sm p-3.5">
          <span className="w-8 h-8 rounded-full bg-[#004873]/10 text-[#004873] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[16px]">hotel</span>
          </span>
          <p className="text-[11px] text-on-surface-variant">Menginap Valid</p>
          <p className="text-xl font-bold text-on-surface">{loading ? '–' : menginap.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3.5">
          <span className="w-8 h-8 rounded-full bg-[#F4A261]/15 text-[#F4A261] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
          </span>
          <p className="text-[11px] text-on-surface-variant">One Day Trip Valid</p>
          <p className="text-xl font-bold text-on-surface">{loading ? '–' : oneDay.length}</p>
        </div>
      </div>

      {/* Reservasi Menginap */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#004873]">hotel</span>
            Reservasi Menginap Masuk
          </p>
          {menginap.length > 0 && (
            <span className="text-[11px] font-semibold text-on-surface-variant">{menginap.length} tamu</span>
          )}
        </div>
        <div className="space-y-2">
          {!loading && menginap.map((r) => (
            <KartuTamu
              key={r.id}
              r={r}
              subtitle={`${r.akomodasi?.nama || (r.bawa_tenda_sendiri ? 'Bawa Tenda Sendiri' : '-')} · ${formatTanggal(r.tanggal_kunjungan)}${r.tanggal_selesai ? ` – ${formatTanggal(r.tanggal_selesai)}` : ''}`}
            />
          ))}
          {!loading && menginap.length === 0 && (
            <EmptyState icon="hotel" text="Belum ada reservasi menginap valid." />
          )}
        </div>
      </div>

      {/* Kunjungan One Day Trip */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#F4A261]">wb_sunny</span>
            Kunjungan One Day Trip
          </p>
          {oneDay.length > 0 && (
            <span className="text-[11px] font-semibold text-on-surface-variant">{oneDay.length} tamu</span>
          )}
        </div>
        <div className="space-y-2">
          {!loading && oneDay.map((r) => (
            <KartuTamu key={r.id} r={r} subtitle={`Kunjungan · ${formatTanggal(r.tanggal_kunjungan)}`} />
          ))}
          {!loading && oneDay.length === 0 && (
            <EmptyState icon="wb_sunny" text="Belum ada kunjungan one day trip valid." />
          )}
        </div>
      </div>
    </div>
  );
}
