import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { waLink } from '../../utils/kontak';

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

function Baris({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-outline-variant last:border-b-0">
      <span className="text-xs text-on-surface-variant shrink-0">{label}</span>
      <span className="text-sm font-semibold text-on-surface text-right">{value}</span>
    </div>
  );
}

// Detail reservasi khusus Pengelola Pulau — READ ONLY. Sengaja TIDAK menampilkan bukti transfer
// (itu ranah Pengantar Pulau yang tugasnya verifikasi pembayaran) dan tidak ada tombol
// valid/tolak (itu juga wewenang Pengantar Pulau). Pengelola cuma butuh tahu SIAPA yang
// berkunjung dan detail kunjungannya, buat keperluan koordinasi/persiapan di lapangan.
export default function DetailReservasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  if (!r) return <p className="p-6 text-center text-sm text-on-surface-variant">Memuat...</p>;

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-outline-variant sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-on-surface" type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-on-surface">Detail Reservasi</p>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#004873]/10 text-[#004873] font-bold flex items-center justify-center shrink-0">
            {inisial(r.wisatawan?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface truncate">{r.wisatawan?.name}</p>
            {r.wisatawan?.no_hp && (
              <a
                href={waLink(r.wisatawan.no_hp)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#004873] font-semibold flex items-center gap-1 mt-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">chat</span>
                Hubungi via WhatsApp
              </a>
            )}
          </div>
          <StatusBadge status={r.status} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1 px-0.5">Detail Kunjungan</p>
          <Baris label="Jenis" value={r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'} />
          {r.akomodasi && <Baris label="Akomodasi" value={r.akomodasi.nama} />}
          {r.jenis === 'menginap' && r.bawa_tenda_sendiri && <Baris label="Akomodasi" value="Bawa Tenda Sendiri" />}
          {r.jenis === 'menginap' && r.tanggal_selesai ? (
            <>
              <Baris label="Check-in" value={formatTanggal(r.tanggal_kunjungan)} />
              <Baris label="Check-out" value={formatTanggal(r.tanggal_selesai)} />
            </>
          ) : (
            <Baris label="Tanggal Kunjungan" value={formatTanggal(r.tanggal_kunjungan)} />
          )}
          <Baris label="Jumlah Wisatawan" value={`${r.jumlah_orang} orang`} />
        </div>

        {r.status === 'pengajuan_batal' && (
          <div className="bg-orange-50 text-orange-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Wisatawan mengajukan pembatalan — sedang diproses Pengantar Pulau.
          </div>
        )}
      </div>
    </div>
  );
}
