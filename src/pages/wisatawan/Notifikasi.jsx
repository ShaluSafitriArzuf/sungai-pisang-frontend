import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';

const IKON = {
  verifikasi_valid: { icon: 'check_circle', warna: 'bg-green-100 text-green-600' },
  verifikasi_ditolak: { icon: 'cancel', warna: 'bg-red-100 text-red-600' },
  pembatalan_disetujui: { icon: 'undo', warna: 'bg-blue-100 text-blue-600' },
  pembatalan_ditolak: { icon: 'warning', warna: 'bg-orange-100 text-orange-600' },
  pengingat: { icon: 'schedule', warna: 'bg-yellow-100 text-yellow-700' },
  reservasi_baru: { icon: 'notifications_active', warna: 'bg-[#004873]/10 text-[#004873]' },
  reservasi_menginap_baru: { icon: 'hotel', warna: 'bg-[#F4A261]/15 text-[#F4A261]' },
  reservasi_one_day_baru: { icon: 'wb_sunny', warna: 'bg-[#F4A261]/15 text-[#F4A261]' },
  reservasi_selesai: { icon: 'task_alt', warna: 'bg-blue-100 text-blue-600' },
};
const IKON_DEFAULT = { icon: 'notifications', warna: 'bg-gray-100 text-gray-500' };

function waktuRelatif(iso) {
  const detik = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (detik < 60) return 'Baru saja';
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Notifikasi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifikasi')
      .then((res) => setList(res.data.data || res.data))
      .finally(() => setLoading(false));
  }, []);

  function tandaiDibaca(id) {
    api.patch(`/notifikasi/${id}/baca`).then(() => {
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    });
  }

  // Notifikasi yang terkait 1 reservasi (mis. "Reservasi Anda Ditolak") bisa diklik langsung
  // ke halaman detail reservasi itu — supaya wisatawan bisa langsung unggah ulang bukti
  // transfer kalau ditolak, tanpa harus cari-cari sendiri di Riwayat Reservasi.
  function bukaNotifikasi(n) {
    if (!n.is_read) tandaiDibaca(n.id);
    if (!n.reservasi_id) return;
    navigate(user?.role === 'pengantar_pulau' ? `/pengantar/reservasi/${n.reservasi_id}` : `/reservasi/${n.reservasi_id}`);
  }

  function tandaiSemuaDibaca() {
    const belumDibaca = list.filter((n) => !n.is_read);
    setList((prev) => prev.map((n) => ({ ...n, is_read: true })));
    belumDibaca.forEach((n) => api.patch(`/notifikasi/${n.id}/baca`).catch(() => {}));
  }

  const isWisatawan = user?.role === 'wisatawan';
  const jumlahBelumDibaca = list.filter((n) => !n.is_read).length;

  return (
    <div className={`max-w-md mx-auto bg-background min-h-screen ${isWisatawan ? 'pb-20' : 'pb-10'}`}>
      {/* Header */}
      <div className="relative bg-[#004873] text-white px-4 pt-5 pb-6 rounded-b-3xl overflow-hidden">
        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 w-24 h-24 rounded-full bg-[#F4A261]/15" />

        <div className="relative flex items-center gap-3">
          {!isWisatawan && (
            <button onClick={() => navigate(-1)} type="button" className="text-white shrink-0">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </span>
          <div className="min-w-0">
            <p className="font-bold text-lg leading-tight">Notifikasi</p>
            <p className="text-xs text-white/70">
              {jumlahBelumDibaca > 0 ? `${jumlahBelumDibaca} belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5">
        {!loading && jumlahBelumDibaca > 0 && (
          <button
            onClick={tandaiSemuaDibaca}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#004873] mb-3 ml-auto"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            Tandai semua dibaca
          </button>
        )}

        {loading && (
          <p className="text-center text-sm text-on-surface-variant mt-6">Memuat notifikasi...</p>
        )}

        <div className="space-y-2">
          {!loading && list.map((n) => {
            const { icon, warna } = IKON[n.tipe] || IKON_DEFAULT;
            return (
              <div
                key={n.id}
                onClick={() => bukaNotifikasi(n)}
                className={`bg-white rounded-xl shadow-sm flex gap-3 p-3 cursor-pointer transition-colors ${
                  !n.is_read ? 'border-l-4 border-[#F4A261]' : 'border-l-4 border-transparent opacity-75'
                }`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${warna}`}>
                  <span className="material-symbols-outlined text-[19px]">{icon}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm text-on-surface ${!n.is_read ? 'font-bold' : 'font-semibold'}`}>{n.judul}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#F4A261] mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.pesan}</p>
                  <p className="text-[10px] text-outline mt-1.5">{waktuRelatif(n.created_at)}</p>
                </div>
                {n.reservasi_id && (
                  <span className="material-symbols-outlined text-[18px] text-outline self-center shrink-0">chevron_right</span>
                )}
              </div>
            );
          })}
        </div>

        {!loading && list.length === 0 && (
          <div className="flex flex-col items-center text-center pt-12 pb-4">
            <span className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px] text-outline">notifications_off</span>
            </span>
            <p className="text-sm font-semibold text-on-surface">Belum ada notifikasi</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-[220px]">
              Update reservasi dan info penting akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {isWisatawan && <BottomNav />}
    </div>
  );
}
