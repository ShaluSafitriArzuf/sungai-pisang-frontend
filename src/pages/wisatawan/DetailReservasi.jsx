import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { rincianBiaya, rupiah } from '../../utils/rincianBiaya';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DetailReservasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [r, setR] = useState(null);

  // Upload ulang bukti transfer — dipakai kalau reservasi ditolak gara-gara bukti kurang
  // jelas/salah upload, supaya wisatawan tidak perlu bikin reservasi baru dari nol.
  const [previewBaru, setPreviewBaru] = useState(null);
  const [buktiBaru, setBuktiBaru] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [unduh, setUnduh] = useState('');

  useEffect(() => {
    api.get(`/reservasi/${id}`).then((res) => setR(res.data));
  }, [id]);

  // Berkas PDF diambil lewat axios, bukan tautan biasa, karena rutenya terlindungi token
  // Sanctum — tautan <a> tidak membawa header Authorization sehingga akan ditolak 401.
  async function unduhDokumen(jenisDokumen) {
    setUnduh(jenisDokumen);
    try {
      const res = await api.get(`/reservasi/${id}/${jenisDokumen}`, { responseType: 'blob' });
      const nama = { invoice: 'Invoice', kuitansi: 'Kuitansi', tiket: 'Tiket' }[jenisDokumen] || 'Dokumen';
      const berkas = `${nama}-${r?.kode_booking || id}.pdf`;

      const alamat = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const tautan = document.createElement('a');
      tautan.href = alamat;
      tautan.download = berkas;
      document.body.appendChild(tautan);
      tautan.click();
      tautan.remove();
      // Dilepas belakangan: sebagian peramban membatalkan unduhan kalau alamat blob-nya
      // dicabut tepat setelah klik.
      setTimeout(() => window.URL.revokeObjectURL(alamat), 1500);
    } catch (err) {
      // Respons error ikut berbentuk blob karena responseType di atas, jadi pesannya dibaca dulu.
      let pesan = 'Gagal mengunduh dokumen.';
      try {
        const teks = await err.response?.data?.text?.();
        if (teks) pesan = JSON.parse(teks).message || pesan;
      } catch (abaikan) {
        // biarkan pesan bawaan
      }
      showToast(pesan, 3200, 'peringatan');
    } finally {
      setUnduh('');
    }
  }

  if (!r) return <p className="p-6 text-center">Memuat...</p>;

  function handleFileBaru(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewBaru(reader.result);
      setBuktiBaru(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function uploadUlang() {
    if (!buktiBaru) {
      setUploadError('Pilih foto bukti transfer terlebih dahulu.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');
    try {
      const res = await api.post(`/reservasi/${id}/upload-ulang-bukti`, { bukti_transfer: buktiBaru });
      setR(res.data.data);
      setPreviewBaru(null);
      setBuktiBaru('');
      showToast('Bukti transfer berhasil diunggah ulang, menunggu verifikasi.', 2800, 'sukses');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah ulang bukti transfer.');
    } finally {
      setUploadLoading(false);
    }
  }

  // bisa_ajukan_batal dihitung backend (aturan H-2), bukan cuma cek status='valid' di sini —
  // supaya tombol ini selalu sinkron dengan aturan yang benar-benar dipakai saat submit.
  const bisaBatal = r.status === 'valid' && r.bisa_ajukan_batal;
  const lewatBatasBatal = r.status === 'valid' && !r.bisa_ajukan_batal;

  const rincian = rincianBiaya(r);
  const sudahDiverifikasi = ['valid', 'selesai'].includes(r.status);

  // Alasan tombol kuitansi dan tiket tidak aktif berbeda-beda menurut statusnya. Kalau
  // pesannya disamaratakan menjadi "belum diverifikasi", reservasi yang justru sudah
  // diverifikasi lalu dibatalkan akan diberi keterangan yang keliru.
  const alasanDokumenTerkunci = {
    menunggu_verifikasi: 'Kuitansi dan tiket terbit setelah Pengantar Pulau memverifikasi bukti pembayaran.',
    ditolak: 'Bukti pembayaran reservasi ini ditolak, sehingga kuitansi dan tiket belum dapat diterbitkan. Unggah ulang bukti transfer terlebih dahulu.',
    pengajuan_batal: 'Pengajuan pembatalan reservasi ini sedang diproses, sehingga tiket untuk sementara tidak dapat diunduh.',
    dibatalkan: 'Reservasi ini sudah dibatalkan, sehingga kuitansi dan tiketnya tidak lagi diterbitkan. Untuk keperluan pengembalian dana, hubungi Pengantar Pulau.',
  }[r.status] || 'Kuitansi dan tiket belum dapat diunduh untuk status reservasi ini.';

  // Sisa hari kalender menuju tanggal kunjungan, dikirim backend. Dipakai untuk MENJELASKAN
  // kenapa pembatalan tidak tersedia, bukan sekadar menghilangkan tombolnya tanpa alasan —
  // ini yang dulu membuat aturan H-1 dan H-2 terasa bertentangan bagi wisatawan.
  const sisaHari = typeof r.sisa_hari_kunjungan === 'number' ? r.sisa_hari_kunjungan : null;
  const keteranganBatas = sisaHari === null
    ? 'Pengajuan pembatalan hanya dapat diajukan paling lambat dua hari sebelum tanggal kunjungan.'
    : sisaHari < 0
      ? 'Tanggal kunjungan sudah lewat, sehingga pembatalan tidak lagi dapat diajukan.'
      : sisaHari === 0
        ? 'Tanggal kunjungan adalah hari ini, sehingga pembatalan tidak lagi dapat diajukan.'
        : `Tanggal kunjungan tinggal ${sisaHari} hari lagi, sedangkan pengajuan pembatalan `
          + 'harus diajukan paling lambat dua hari sebelum tanggal kunjungan.';

  return (
    <div className="wadah-sempit pb-24 md:pb-10 px-4 md:px-6 pt-4 md:pt-8">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} type="button" className="text-laut-dark">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-lg text-laut-dark">Detail Reservasi</p>
      </div>

      <div className="card mb-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Pulau</span><span className="font-semibold">{r.pulau?.nama}</span></div>
        <div className="flex justify-between"><span>Jenis</span><span>{r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'}</span></div>
        {r.akomodasi && (
          <div className="flex justify-between">
            <span>Akomodasi</span>
            <span className="text-right">
              {r.akomodasi.nama}
              {r.jumlah_unit_dipesan > 1 && (
                <span className="block text-xs text-on-surface-variant">
                  {r.jumlah_unit_dipesan} unit
                </span>
              )}
            </span>
          </div>
        )}
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
        {r.kode_booking && (
          <div className="flex justify-between"><span>Kode Pemesanan</span><span className="font-mono font-semibold">{r.kode_booking}</span></div>
        )}
        <div className="flex justify-between items-center pt-2"><span>Status</span><StatusBadge status={r.status} /></div>
      </div>

      {/* ── Rincian harga pemesanan ──
          Sebelumnya halaman ini hanya menampilkan satu angka Total Bayar, padahal angka itu
          gabungan tiga komponen. Rinciannya ditampilkan supaya wisatawan bisa memeriksa
          sendiri dari mana totalnya berasal. */}
      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-1">Rincian Harga Pemesanan</p>
        <p className="text-gray-500 text-xs mb-3">
          Seluruh biaya dibayarkan sekaligus melalui satu kali transfer.
        </p>
        <div className="divide-y divide-outline-variant">
          {rincian.map((b) => (
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
          <span className="font-semibold">Total Bayar</span>
          <span className="font-bold text-lg text-karang-dark tabular-nums">{rupiah(r.total_bayar)}</span>
        </div>
      </div>

      {/* ── Dokumen ── */}
      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-1">Dokumen</p>
        <p className="text-gray-500 text-xs mb-3">
          Invoice adalah tagihan, sehingga dapat diunduh sejak reservasi dibuat. Kuitansi
          adalah bukti uang sudah diterima, dan tiket adalah bukti hak keberangkatan —
          keduanya terbit setelah pembayaran diverifikasi.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => unduhDokumen('invoice')}
            disabled={unduh !== ''}
            className="flex items-center justify-center gap-1.5 border border-outline-variant text-[#004873] font-semibold py-2.5 rounded-xl text-xs disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            {unduh === 'invoice' ? 'Menyiapkan...' : 'Unduh Invoice'}
          </button>
          <button
            type="button"
            onClick={() => unduhDokumen('kuitansi')}
            disabled={unduh !== '' || !sudahDiverifikasi}
            className="flex items-center justify-center gap-1.5 border border-outline-variant text-[#004873] font-semibold py-2.5 rounded-xl text-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">request_quote</span>
            {unduh === 'kuitansi' ? 'Menyiapkan...' : 'Unduh Kuitansi'}
          </button>
          <button
            type="button"
            onClick={() => unduhDokumen('tiket')}
            disabled={unduh !== '' || !sudahDiverifikasi}
            className="col-span-2 flex items-center justify-center gap-1.5 bg-[#004873] text-white font-semibold py-2.5 rounded-xl text-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
            {unduh === 'tiket' ? 'Menyiapkan...' : 'Unduh Tiket'}
          </button>
        </div>
        {!sudahDiverifikasi && (
          <p className="text-[11px] text-on-surface-variant mt-2 leading-snug">
            {alasanDokumenTerkunci}
          </p>
        )}
      </div>

      {/* ── Daftar peserta ── */}
      <div className="card mb-4 text-sm">
        <p className="font-semibold mb-1">Daftar Peserta</p>
        {r.peserta?.length ? (
          <div className="divide-y divide-outline-variant">
            {r.peserta.map((orang, i) => (
              <div key={orang.id ?? i} className="py-2.5 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#004873] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{orang.nama}</p>
                  <p className="text-xs text-on-surface-variant">
                    {orang.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'} &middot; {orang.usia} tahun
                    {orang.no_identitas ? <> &middot; {orang.no_identitas}</> : null}
                  </p>
                  {orang.no_hp && <p className="text-xs text-on-surface-variant">{orang.no_hp}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs leading-snug">
            Reservasi ini dibuat sebelum pencatatan identitas peserta diberlakukan, sehingga
            daftar pesertanya belum tersedia.
          </p>
        )}
      </div>

      {r.status === 'ditolak' && (
        <>
          <div className="card mb-4 text-sm bg-red-50">
            <p className="font-semibold text-red-600">Catatan Penolakan</p>
            <p className="text-gray-600">{r.catatan_penolakan}</p>
          </div>

          <div className="card mb-4 text-sm">
            <p className="font-semibold mb-1">Unggah Ulang Bukti Transfer</p>
            <p className="text-gray-500 text-xs mb-3">
              Kalau alasannya cuma soal bukti kurang jelas atau salah upload, tidak perlu bikin reservasi baru —
              cukup unggah ulang foto bukti transfer di sini, reservasi ini akan diverifikasi ulang.
            </p>

            {uploadError && <p className="text-red-500 text-xs mb-2">{uploadError}</p>}

            <label className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-xl py-6 cursor-pointer mb-3">
              {previewBaru ? (
                <img src={previewBaru} alt="preview bukti baru" className="max-h-40 rounded-lg" />
              ) : (
                <span className="text-gray-400 text-sm">Tap untuk upload bukti transfer baru</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileBaru} />
            </label>

            <button className="btn-primary" onClick={uploadUlang} disabled={uploadLoading}>
              {uploadLoading ? 'Mengunggah...' : 'Kirim Bukti Baru'}
            </button>
          </div>
        </>
      )}

      {r.status === 'pengajuan_batal' && (
        <div className="card mb-4 text-sm bg-orange-50">
          <p className="font-semibold text-orange-600">Pengajuan pembatalan sedang diproses</p>
        </div>
      )}

      {lewatBatasBatal && (
        <div className="card mb-4 text-sm bg-gray-50">
          <p className="font-semibold text-on-surface mb-1">Pembatalan tidak tersedia</p>
          <p className="text-gray-500 leading-relaxed">{keteranganBatas}</p>
          <p className="text-gray-500 leading-relaxed mt-2">
            Aturan ini berlaku karena Pengantar Pulau memerlukan waktu untuk menyusun manifest
            keberangkatan. Reservasi yang dibuat kurang dari dua hari sebelum tanggal kunjungan
            memang tidak dapat dibatalkan sejak awal.
          </p>
        </div>
      )}

      {bisaBatal && (
        <button className="btn-outline-danger" onClick={() => navigate(`/reservasi/${r.id}/batal`)}>
          Ajukan Pembatalan
        </button>
      )}

      {r.status === 'selesai' && !r.ulasan && (
        <Link to={`/ulasan/${r.id}`} className="btn-primary block text-center mt-3">
          Beri Ulasan
        </Link>
      )}

      {/* Kalau reservasi ini sudah diulas, tombolnya diganti tampilan ulasan yang sudah
          dikirim. Satu reservasi hanya boleh satu ulasan, jadi tidak ada tombol ulang di sini. */}
      {r.status === 'selesai' && r.ulasan && (
        <div className="card mt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-on-surface">Ulasan Kamu</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Sudah diulas
            </span>
          </div>
          <p className="text-yellow-400 text-lg leading-none mb-1">
            {'★'.repeat(r.ulasan.rating)}
            <span className="text-gray-300">{'★'.repeat(5 - r.ulasan.rating)}</span>
          </p>
          {r.ulasan.komentar && (
            <p className="text-sm text-on-surface-variant leading-relaxed">{r.ulasan.komentar}</p>
          )}
          <p className="text-[11px] text-outline mt-2">
            Terima kasih atas penilaian kamu. Setiap reservasi hanya bisa diulas satu kali.
          </p>
        </div>
      )}
    </div>
  );
}
