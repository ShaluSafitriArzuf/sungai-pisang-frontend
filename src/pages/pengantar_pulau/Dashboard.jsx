import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import TopNav from '../../components/TopNav';
import StatusBadge from '../../components/StatusBadge';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/laporan', label: 'Laporan' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

// BUG: tanggal_kunjungan sebelumnya ditampilkan mentah-mentah, jadi yang muncul di layar
// "2026-08-05T00:00:00.000000Z" (format ISO bawaan API) alih-alih "5 Agu 2026". Helper ini
// disamakan persis dengan yang sudah dipakai di halaman Riwayat & Detail Verifikasi.
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

// Satu kartu reservasi, dipakai bersama oleh daftar verifikasi dan daftar pengajuan
// pembatalan supaya tampilan keduanya konsisten.
function KartuReservasi({ r, aksen }) {
  return (
    <Link
      to={`/pengantar/reservasi/${r.id}`}
      className={`card block border-l-4 ${aksen} hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{r.wisatawan?.name}</p>
          <p className="text-xs text-gray-500">
            {r.pulau?.nama} — {formatTanggal(r.tanggal_kunjungan)}
          </p>
          <p className="text-xs text-gray-500">{r.jumlah_orang} orang</p>
          {/* Alasan pembatalan ditampilkan langsung di kartu supaya Pengantar Pulau bisa
              menimbang tanpa harus membuka detailnya satu per satu. */}
          {r.alasan_pembatalan && (
            <p className="text-xs text-orange-700 mt-1.5 line-clamp-2">
              Alasan: {r.alasan_pembatalan}
            </p>
          )}
        </div>
        <StatusBadge status={r.status} />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [list, setList] = useState([]);
  // Reservasi yang wisatawannya sudah mengajukan pembatalan dan menunggu keputusan
  // Pengantar Pulau.
  const [pengajuanBatal, setPengajuanBatal] = useState([]);
  // BUG: sebelumnya tidak ada status loading -- karena list mulai dari [], pesan "Tidak ada
  // reservasi menunggu verifikasi" ikut ketampil SEKEJAP tiap kali halaman ini dibuka/dibuka
  // ulang, padahal cuma lagi nunggu API selesai (bukan beneran kosong). Ini yang bikin
  // dashboardnya kelihatan "kosong lagi" tiap kali kembali ke halaman ini.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // per_page dinaikkan -- ini antrean verifikasi Pengantar Pulau, paling kritis buat tidak
    // boleh ada yang "hilang" dari daftar cuma karena backlog-nya kebetulan lewat 20.
    //
    // Permintaan kedua (pengajuan_batal) ditambahkan karena sebelumnya dashboard ini HANYA
    // memuat status menunggu_verifikasi. Akibatnya, begitu wisatawan mengajukan pembatalan,
    // reservasinya tidak muncul di mana pun: bukan di dashboard (tersaring keluar), dan di
    // Riwayat pun tenggelam di antara puluhan baris tanpa penyaring. Padahal menyetujui atau
    // menolak pembatalan itu tugas Pengantar Pulau. Satu-satunya pemberitahuan adalah
    // notifikasi -- kalau terlewat, pengajuan itu menggantung tanpa ada yang tahu.
    Promise.all([
      api.get('/reservasi?status=menunggu_verifikasi&per_page=500'),
      api.get('/reservasi?status=pengajuan_batal&per_page=500'),
    ])
      .then(([resVerifikasi, resBatal]) => {
        setList(resVerifikasi.data.data || resVerifikasi.data);
        setPengajuanBatal(resBatal.data.data || resBatal.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-10 bg-background min-h-screen">
      <TopNav title="Dashboard Pengantar Pulau" menu={MENU} />

      <div className="wadah-sedang px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
          <div className="card">
            <p className="text-xs md:text-sm text-gray-500">Menunggu Verifikasi</p>
            <p className="text-2xl font-bold text-laut-dark leading-tight mt-0.5">
              {loading ? '—' : list.length}
            </p>
          </div>
          <div className="card">
            <p className="text-xs md:text-sm text-gray-500">Pengajuan Pembatalan</p>
            <p className="text-2xl font-bold text-orange-600 leading-tight mt-0.5">
              {loading ? '—' : pengajuanBatal.length}
            </p>
          </div>
        </div>

        {loading && <p className="text-gray-400 text-sm text-center mt-6">Memuat reservasi...</p>}

        {/* Pengajuan pembatalan diletakkan di ATAS antrean verifikasi karena sifatnya lebih
            mendesak: ada wisatawan yang sedang menunggu keputusan, dan aturan batas H-2
            membuat keputusan itu punya tenggat. */}
        {!loading && pengajuanBatal.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px] text-orange-600">
                pending_actions
              </span>
              <p className="font-bold text-laut-dark">Pengajuan Pembatalan Masuk</p>
              <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {pengajuanBatal.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Wisatawan mengajukan pembatalan dan menunggu keputusanmu. Buka detailnya untuk
              menyetujui atau menolak.
            </p>
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
              {pengajuanBatal.map((r) => (
                <KartuReservasi key={r.id} r={r} aksen="border-orange-400" />
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            <p className="font-bold text-laut-dark mb-2">Reservasi Masuk</p>
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
              {list.map((r) => (
                <KartuReservasi key={r.id} r={r} aksen="border-yellow-400" />
              ))}
            </div>
            {list.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-6">
                Tidak ada reservasi menunggu verifikasi.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
