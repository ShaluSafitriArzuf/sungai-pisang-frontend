import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { waLink } from '../../utils/kontak';
import { rincianBiaya, rupiah } from '../../utils/rincianBiaya';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DetailVerifikasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [r, setR] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [statusRefund, setStatusRefund] = useState('disetujui');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Bukti transfer umumnya foto/struk berorientasi potret. Kalau ditampilkan selebar kartu,
  // tingginya bisa memakan hampir satu layar penuh dan tombol Valid/Tolak jadi jauh ke bawah.
  // Jadi defaultnya ditampilkan sedang saja, dan bisa diperbesar kalau perlu diperiksa detail.
  const [buktiDiperbesar, setBuktiDiperbesar] = useState(false);

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  if (!r) return <p className="p-6 text-center">Memuat...</p>;

  async function verifikasi(status) {
    if (status === 'ditolak' && !catatan) {
      showToast('Isi catatan penolakan terlebih dahulu.', 2800, 'peringatan');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.patch(`/reservasi/${id}/verifikasi`, { status, catatan_penolakan: catatan });
      // Sebelumnya langsung navigate() tanpa pesan apa pun. Karena reservasi yang sudah
      // diproses otomatis keluar dari Dashboard (dashboard hanya menampilkan yang menunggu
      // verifikasi), Pengantar Pulau seolah dilempar ke halaman kosong dan tidak yakin
      // aksinya berhasil. Toast ini bertahan melewati perpindahan halaman karena
      // ToastProvider dipasang di root (lihat main.jsx).
      showToast(
        status === 'valid'
          ? 'Reservasi ditandai valid. Notifikasi terkirim ke wisatawan dan pengelola pulau.'
          : 'Reservasi ditolak. Wisatawan dapat mengunggah ulang bukti transfer.',
        3200,
        'sukses',
      );
      navigate('/pengantar/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status reservasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function prosesBatal(disetujui) {
    setError('');
    setLoading(true);
    try {
      await api.patch(`/reservasi/${id}/proses-batal`, {
        disetujui,
        status_pengembalian_dana: disetujui ? statusRefund : null,
      });
      // Sama alasannya dengan verifikasi() di atas. Khusus penolakan pembatalan, pesannya
      // sengaja menyebut "kembali berstatus valid" -- karena reservasinya balik ke daftar
      // valid dan TIDAK muncul di Dashboard, tanpa pesan ini layarnya terlihat seperti
      // tidak terjadi apa-apa.
      showToast(
        disetujui
          ? 'Pembatalan disetujui. Notifikasi terkirim ke wisatawan dan pengelola pulau.'
          : 'Pengajuan pembatalan ditolak. Reservasi kembali berstatus valid.',
        3200,
        'sukses',
      );
      navigate('/pengantar/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pembatalan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wadah-sempit px-4 md:px-6 pt-4 md:pt-8 pb-10">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} type="button" className="text-laut-dark">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-lg text-laut-dark">Detail Reservasi</p>
      </div>

      <div className="card mb-4 text-sm space-y-1">
        <div className="flex justify-between"><span>Wisatawan</span><span className="font-semibold">{r.wisatawan?.name}</span></div>
        {r.wisatawan?.no_hp && (
          <div className="flex justify-end">
            <a
              href={waLink(r.wisatawan.no_hp)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"
            >
              <span className="material-symbols-outlined text-[14px]">chat</span>
              Hubungi via WhatsApp
            </a>
          </div>
        )}
        <div className="flex justify-between"><span>Pulau</span><span>{r.pulau?.nama}</span></div>
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
        <div className="flex justify-between items-center pt-1"><span>Status</span><StatusBadge status={r.status} /></div>
      </div>

      {/* Rincian biaya ditampilkan juga di sini supaya Pengantar Pulau dapat mencocokkan
          nominal pada bukti transfer dengan komponen biayanya satu per satu, bukan hanya
          dengan satu angka total. */}
      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-2">Rincian Harga Pemesanan</p>
        <div className="divide-y divide-outline-variant">
          {rincianBiaya(r).map((b) => (
            <div key={b.kunci} className="py-2 flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-on-surface">{b.label}</span>
                <span className="block text-[11px] text-on-surface-variant">{b.dasar}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">{rupiah(b.jumlah)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-[#004873]">
          <span className="font-semibold">Total yang harus ditransfer</span>
          <span className="font-bold text-lg tabular-nums">{rupiah(r.total_bayar)}</span>
        </div>
      </div>

      {r.bukti_transfer && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Bukti Transfer</p>
            <button
              type="button"
              onClick={() => setBuktiDiperbesar(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#004873]"
            >
              <span className="material-symbols-outlined text-[15px]">zoom_in</span>
              Perbesar
            </button>
          </div>
          <button
            type="button"
            onClick={() => setBuktiDiperbesar(true)}
            className="block w-full bg-surface-container rounded-lg overflow-hidden"
          >
            <img
              src={r.bukti_transfer}
              alt="bukti transfer"
              className="mx-auto max-h-56 w-auto object-contain"
            />
          </button>
          <p className="text-[11px] text-on-surface-variant mt-1.5 text-center">
            Ketuk gambar untuk memeriksa lebih jelas
          </p>
        </div>
      )}

      {/* Tampilan layar penuh -- dipakai saat Pengantar Pulau perlu memastikan nominal dan
          nomor rekening pada struk benar-benar terbaca sebelum menandai valid/tolak. */}
      {buktiDiperbesar && r.bukti_transfer && (
        <div
          onClick={() => setBuktiDiperbesar(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setBuktiDiperbesar(false)}
            className="absolute top-4 right-4 text-white"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[30px]">close</span>
          </button>
          <img
            src={r.bukti_transfer}
            alt="bukti transfer diperbesar"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {r.status === 'menunggu_verifikasi' && (
        <>
          <textarea
            className="input-field mb-3"
            placeholder="Catatan penolakan (wajib jika menolak)"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
          <div className="flex gap-3">
            <button className="flex-1 bg-green-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => verifikasi('valid')}>
              Valid
            </button>
            <button className="flex-1 bg-red-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => verifikasi('ditolak')}>
              Tolak
            </button>
          </div>
        </>
      )}

      {r.status === 'pengajuan_batal' && (
        <div className="card space-y-3">
          <p className="text-sm font-semibold">Alasan Pembatalan: {r.alasan_pembatalan}</p>
          {r.keterangan_pembatalan && <p className="text-sm text-gray-600">{r.keterangan_pembatalan}</p>}
          <select className="input-field" value={statusRefund} onChange={(e) => setStatusRefund(e.target.value)}>
            <option value="disetujui">Dana Dikembalikan</option>
            <option value="ditolak">Dana Tidak Dikembalikan</option>
          </select>
          <div className="flex gap-3">
            <button className="flex-1 bg-green-500 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => prosesBatal(true)}>
              Setujui Batal
            </button>
            <button className="flex-1 bg-gray-400 text-white py-3 rounded-card font-semibold" disabled={loading} onClick={() => prosesBatal(false)}>
              Tolak Pembatalan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
