import { useEffect, useState } from 'react';
import api from '../../api/axios';
import TopNav from '../../components/TopNav';
import { useToast } from '../../context/ToastContext';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/laporan', label: 'Laporan' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Backend mengirim tanggal dalam bentuk "05-08-2026" karena bentuk itu yang dipakai di berkas
// Excel. Di layar, "5 Agu 2026" lebih cepat dibaca, jadi diubah di sini saja.
function formatTanggal(dmy) {
  if (!dmy) return '-';
  const [d, m, y] = dmy.split('-');
  const bulan = BULAN[Number(m) - 1];
  return bulan ? `${Number(d)} ${bulan} ${y}` : dmy;
}

function rupiah(nilai) {
  return `Rp${Number(nilai || 0).toLocaleString('id-ID')}`;
}

// Bulan berjalan dalam format YYYY-MM. Sengaja tidak memakai toISOString(), karena fungsi itu
// mengubah waktu ke UTC lebih dulu sehingga di Indonesia tanggal 1 pukul 00.00 bisa terbaca
// sebagai bulan sebelumnya.
function bulanIni() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function KartuAngka({ label, nilai, satuan, warna }) {
  return (
    <div className="card">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold leading-tight mt-0.5 ${warna}`}>
        {nilai}
        {satuan && <span className="text-sm font-normal text-on-surface-variant ml-1">{satuan}</span>}
      </p>
    </div>
  );
}

export default function LaporanPemasukan() {
  const [bulan, setBulan] = useState(bulanIni());
  const [data, setData] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [mengunduh, setMengunduh] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let dibatalkan = false;
    setMemuat(true);

    api
      .get('/pengantar/laporan-pemasukan', { params: { bulan } })
      .then((res) => {
        if (!dibatalkan) setData(res.data);
      })
      .catch(() => {
        if (!dibatalkan) showToast('Gagal memuat laporan. Periksa koneksi.', 2500, 'peringatan');
      })
      .finally(() => {
        if (!dibatalkan) setMemuat(false);
      });

    // Kalau bulan diganti cepat berturut-turut, jawaban permintaan lama bisa datang belakangan
    // dan menimpa data bulan yang sedang dilihat. Penanda ini membuat jawaban yang sudah basi
    // diabaikan.
    return () => {
      dibatalkan = true;
    };
  }, [bulan]);

  async function unduhExcel() {
    setMengunduh(true);
    try {
      const res = await api.get('/pengantar/laporan-pemasukan/export', {
        params: { bulan },
        // Tanpa ini axios memperlakukan isi berkas sebagai teks dan berkas Excel-nya rusak
        // saat dibuka, karena .xlsx sebenarnya berkas biner (ZIP).
        responseType: 'blob',
      });

      const tautan = document.createElement('a');
      const alamat = URL.createObjectURL(new Blob([res.data]));
      tautan.href = alamat;
      tautan.download = `Laporan-Pemasukan-Pengantar-Pulau-${bulan}.xlsx`;
      document.body.appendChild(tautan);
      tautan.click();
      document.body.removeChild(tautan);
      URL.revokeObjectURL(alamat);

      showToast('Berkas Excel berhasil diunduh.', 2000, 'sukses');
    } catch {
      showToast('Gagal mengunduh berkas Excel.', 2500, 'peringatan');
    } finally {
      setMengunduh(false);
    }
  }

  const ringkasan = data?.ringkasan;
  const rincian = data?.rincian ?? [];
  const rekap = data?.rekap_tahun ?? [];
  const tertinggi = Math.max(1, ...rekap.map((r) => r.total_ongkos_kapal));
  const bulanTerpilih = Number(bulan.split('-')[1]);

  return (
    <div className="pb-10 bg-background min-h-screen">
      <TopNav title="Laporan Pemasukan" menu={MENU} />

      <div className="wadah-lebar px-4 md:px-6 py-4 md:py-8">
        <div className="md:flex md:items-end md:justify-between md:gap-4 mb-4 md:mb-6">
          <div className="md:max-w-xs w-full">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Bulan keberangkatan
            </label>
            <input
              type="month"
              className="input-field"
              value={bulan}
              onChange={(e) => setBulan(e.target.value || bulanIni())}
            />
          </div>

          <button
            className="btn-primary md:w-auto md:px-8 mt-3 md:mt-0 shrink-0"
            onClick={unduhExcel}
            disabled={mengunduh || memuat}
          >
            {mengunduh ? 'Menyiapkan...' : 'Unduh Excel'}
          </button>
        </div>

        {/* Keterangan cakupan ditaruh di atas angka, bukan di catatan kaki. Angka pemasukan
            gampang disalahpahami sebagai seluruh uang yang masuk lewat transfer, padahal tiket
            masuk pulau dan akomodasi hanya dititipkan dan diteruskan ke Pengelola Pulau. */}
        <div className="rounded-2xl bg-[#F4A261]/12 border border-[#F4A261]/40 px-4 py-3 mb-5 flex gap-3">
          <span className="material-symbols-outlined text-[20px] text-[#8e4e14] shrink-0">info</span>
          <p className="text-xs md:text-sm text-[#7a4512] leading-relaxed">
            Laporan ini menghitung <span className="font-semibold">ongkos kapal penyeberangan</span> saja.
            Tiket masuk pulau dan akomodasi tidak ikut dijumlahkan karena merupakan hak Pengelola
            Pulau yang hanya dititipkan lewat pembayaran yang sama. Yang dihitung hanya reservasi
            berstatus valid dan selesai.
          </p>
        </div>

        {memuat ? (
          <div className="card text-center py-12 text-sm text-on-surface-variant">Memuat laporan...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-7">
              <KartuAngka
                label="Reservasi Berangkat"
                nilai={ringkasan?.jumlah_reservasi ?? 0}
                warna="text-[#004873]"
              />
              <KartuAngka
                label="Wisatawan Diantar"
                nilai={ringkasan?.jumlah_wisatawan ?? 0}
                satuan="orang"
                warna="text-[#F4A261]"
              />
              {/* Angka rupiah dibiarkan selebar dua kolom di HP supaya tidak terpotong. */}
              <div className="col-span-2 md:col-span-1">
                <KartuAngka
                  label={`Total Ongkos Kapal — ${data?.label_bulan ?? ''}`}
                  nilai={rupiah(ringkasan?.total_ongkos_kapal)}
                  warna="text-[#2a7f62]"
                />
              </div>
            </div>

            {ringkasan?.jumlah_dibatalkan > 0 && (
              <p className="text-xs text-on-surface-variant mb-5 -mt-1">
                Catatan: ada {ringkasan.jumlah_dibatalkan} reservasi dibatalkan pada bulan ini dan
                tidak ikut dihitung.
              </p>
            )}

            <h2 className="text-sm md:text-base font-bold text-on-surface mt-1 mb-2.5">
              Rincian Reservasi
            </h2>

            {rincian.length === 0 ? (
              <div className="card flex flex-col items-center text-center py-10 mb-7">
                <span className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[26px] text-outline">savings</span>
                </span>
                <p className="text-sm font-semibold text-on-surface">Belum ada pemasukan bulan ini</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Reservasi baru muncul di sini setelah diverifikasi valid.
                </p>
              </div>
            ) : (
              <>
                {/* Di HP daftar tetap berupa kartu; tabel tujuh kolom tidak terbaca di layar
                    selebar telepon. Mulai 768px berubah jadi tabel karena laporan keuangan
                    memang dibaca dengan menyusuri kolom yang sejajar. */}
                <div className="md:hidden space-y-2 mb-7">
                  {rincian.map((r, i) => (
                    <div key={r.id} className="card text-sm">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {i + 1}. {r.nama_pemesan}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {formatTanggal(r.tanggal_kunjungan)} · {r.pulau}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {r.jenis} · {r.jumlah_orang} orang
                          </p>
                        </div>
                        <p className="font-bold text-[#2a7f62] shrink-0">{rupiah(r.ongkos_kapal)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="card flex justify-between items-center bg-[#FDEBD8]">
                    <p className="text-sm font-bold text-on-surface">Total</p>
                    <p className="text-base font-bold text-[#2a7f62]">
                      {rupiah(ringkasan?.total_ongkos_kapal)}
                    </p>
                  </div>
                </div>

                <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden mb-7">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#004873] text-white text-left">
                        <th className="py-3 px-5 font-semibold w-12">No</th>
                        <th className="py-3 px-5 font-semibold">Tanggal Berangkat</th>
                        <th className="py-3 px-5 font-semibold">Nama Pemesan</th>
                        <th className="py-3 px-5 font-semibold">Pulau Tujuan</th>
                        <th className="py-3 px-5 font-semibold">Jenis</th>
                        <th className="py-3 px-5 font-semibold text-right">Orang</th>
                        <th className="py-3 px-5 font-semibold text-right">Ongkos Kapal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rincian.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-t border-outline-variant ${i % 2 === 1 ? 'bg-surface-container/40' : ''}`}
                        >
                          <td className="py-3 px-5 text-on-surface-variant">{i + 1}</td>
                          <td className="py-3 px-5 text-on-surface-variant">
                            {formatTanggal(r.tanggal_kunjungan)}
                          </td>
                          <td className="py-3 px-5 font-semibold text-on-surface">{r.nama_pemesan}</td>
                          <td className="py-3 px-5 text-on-surface-variant">{r.pulau}</td>
                          <td className="py-3 px-5 text-on-surface-variant">{r.jenis}</td>
                          <td className="py-3 px-5 text-right text-on-surface">{r.jumlah_orang}</td>
                          <td className="py-3 px-5 text-right font-semibold text-[#2a7f62]">
                            {rupiah(r.ongkos_kapal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#FDEBD8] border-t border-outline-variant">
                        <td className="py-3 px-5 font-bold text-on-surface" colSpan={5}>
                          Total {data?.label_bulan}
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-on-surface">
                          {ringkasan?.jumlah_wisatawan}
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-[#2a7f62]">
                          {rupiah(ringkasan?.total_ongkos_kapal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* Rekap setahun sengaja berupa baris bertumpuk, bukan tabel, supaya bentuknya sama
                di HP maupun laptop. Panjang batangnya membuat bulan ramai dan bulan sepi
                langsung terlihat tanpa harus membandingkan angka satu per satu. */}
            <h2 className="text-sm md:text-base font-bold text-on-surface mt-1 mb-2.5">
              Perbandingan Antarbulan {bulan.split('-')[0]}
            </h2>

            <div className="card space-y-2.5">
              {rekap.map((r) => (
                <div key={r.bulan} className="flex items-center gap-3">
                  <span
                    className={`w-9 md:w-12 text-xs shrink-0 ${
                      r.bulan === bulanTerpilih
                        ? 'font-bold text-[#004873]'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {BULAN[r.bulan - 1]}
                  </span>

                  <div className="flex-1 h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        r.bulan === bulanTerpilih ? 'bg-[#004873]' : 'bg-[#F4A261]/70'
                      }`}
                      style={{ width: `${(r.total_ongkos_kapal / tertinggi) * 100}%` }}
                    />
                  </div>

                  <span
                    className={`w-24 md:w-32 text-right text-xs shrink-0 ${
                      r.bulan === bulanTerpilih
                        ? 'font-bold text-on-surface'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {rupiah(r.total_ongkos_kapal)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
