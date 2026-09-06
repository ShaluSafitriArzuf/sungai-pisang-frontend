import { useEffect, useState } from 'react';
import api from '../../api/axios';
import TopNav from '../../components/TopNav';

// Tanggal hari ini menurut waktu setempat. toISOString() memakai UTC, sehingga sebelum
// pukul 07.00 WIB halaman ini akan membuka manifest tanggal KEMARIN.
function tanggalLokalHariIni() {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/laporan', label: 'Laporan' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

export default function Manifest() {
  const [tanggal, setTanggal] = useState(tanggalLokalHariIni());
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
    <div className="pb-10 bg-background min-h-screen">
      <TopNav title="Manifest Harian" menu={MENU} />

      <div className="wadah-lebar px-4 md:px-6 py-4 md:py-8">
        {/* Baris alat: pemilih tanggal di kiri, tombol ekspor di kanan. Sebelumnya tombol ekspor
            terdampar sendirian di dasar halaman, jauh di bawah daftar -- di layar laptop yang
            daftarnya cuma satu-dua baris, tombol itu jadi tergantung di ruang kosong. */}
        <div className="md:flex md:items-end md:justify-between md:gap-4 mb-4 md:mb-6">
          <div className="md:max-w-xs w-full">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Tanggal keberangkatan
            </label>
            <input
              type="date"
              className="input-field"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>

          <button
            className="btn-primary md:w-auto md:px-8 mt-3 md:mt-0 shrink-0"
            onClick={eksporPdf}
            disabled={loading || data.reservasi.length === 0}
          >
            {loading ? 'Memproses...' : 'Ekspor PDF'}
          </button>
        </div>

        {/* Ringkasan angka. Dulu jumlah wisatawan cuma satu baris teks biasa terselip di antara
            daftar dan tombol, padahal itu angka yang paling dicari Pengantar Pulau sebelum
            berangkat -- untuk memastikan kapasitas kapal cukup. */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
          <div className="card">
            <p className="text-xs text-on-surface-variant">Jumlah Reservasi</p>
            <p className="text-2xl font-bold text-[#004873] leading-tight mt-0.5">
              {data.reservasi.length}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-on-surface-variant">Total Wisatawan</p>
            <p className="text-2xl font-bold text-[#F4A261] leading-tight mt-0.5">
              {data.jumlah_wisatawan} <span className="text-sm font-normal text-on-surface-variant">orang</span>
            </p>
          </div>
        </div>

        {data.reservasi.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-10">
            <span className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[26px] text-outline">event_busy</span>
            </span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada kunjungan tanggal ini</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Manifest hanya memuat reservasi yang sudah berstatus valid.
            </p>
          </div>
        ) : (
          <>
            {/* Di HP tetap berupa kartu bertumpuk seperti sebelumnya, karena tabel tidak
                terbaca di layar sempit. Mulai 768px berubah jadi tabel: manifest penumpang
                pada dasarnya memang daftar berkolom, dan kolom yang sejajar jauh lebih cepat
                dibaca saat Pengantar Pulau mencocokkan nama satu per satu sebelum berangkat. */}
            <div className="md:hidden space-y-2">
              {data.reservasi.map((r) => (
                <div key={r.id} className="card text-sm flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.wisatawan?.name}</p>
                    <p className="text-xs text-gray-500">
                      {r.pulau?.nama} — {r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'}
                    </p>
                  </div>
                  <p className="text-sm shrink-0">{r.jumlah_orang} org</p>
                </div>
              ))}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#004873] text-white text-left">
                    <th className="py-3 px-5 font-semibold w-12">No</th>
                    <th className="py-3 px-5 font-semibold">Nama Wisatawan</th>
                    <th className="py-3 px-5 font-semibold">Pulau Tujuan</th>
                    <th className="py-3 px-5 font-semibold">Jenis Kunjungan</th>
                    <th className="py-3 px-5 font-semibold text-right">Jumlah Orang</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reservasi.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-t border-outline-variant ${i % 2 === 1 ? 'bg-surface-container/40' : ''}`}
                    >
                      <td className="py-3 px-5 text-on-surface-variant">{i + 1}</td>
                      <td className="py-3 px-5 font-semibold text-on-surface">
                        {r.wisatawan?.name}
                      </td>
                      <td className="py-3 px-5 text-on-surface-variant">{r.pulau?.nama}</td>
                      <td className="py-3 px-5 text-on-surface-variant">
                        {r.jenis === 'one_day_trip' ? 'One Day Trip' : 'Menginap'}
                      </td>
                      <td className="py-3 px-5 text-right font-semibold text-on-surface">
                        {r.jumlah_orang} orang
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#004873]/20 bg-surface-container/70">
                    <td className="py-3 px-5 font-bold text-on-surface" colSpan={4}>
                      Total
                    </td>
                    <td className="py-3 px-5 text-right font-bold text-[#004873]">
                      {data.jumlah_wisatawan} orang
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Identitas penumpang per orang ──
                Tabel di atas berisi rombongan; bagian ini memecahnya menjadi daftar orang
                per orang. Inilah manifest yang sesungguhnya dipakai kalau terjadi keadaan
                darurat di laut, karena memuat identitas seluruh penumpang, bukan hanya
                nama pemesannya. */}
            {(() => {
              const penumpang = data.reservasi.flatMap((r) =>
                (r.peserta || []).map((orang) => ({ ...orang, reservasi: r }))
              );

              return (
                <div className="mt-6">
                  <p className="font-bold text-on-surface mb-1">Daftar Penumpang</p>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Identitas setiap orang yang menyeberang &mdash; tercatat {penumpang.length} dari{' '}
                    {data.jumlah_wisatawan} orang.
                  </p>

                  {penumpang.length === 0 ? (
                    <div className="card text-sm text-on-surface-variant">
                      Belum ada identitas peserta yang tercatat untuk tanggal ini. Reservasi yang
                      dibuat sebelum pencatatan identitas diberlakukan tidak memiliki data ini,
                      sehingga identitasnya perlu ditanyakan langsung sebelum keberangkatan.
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead>
                          <tr className="bg-[#004873] text-white text-left">
                            <th className="py-3 px-4 font-semibold w-12">No</th>
                            <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                            <th className="py-3 px-4 font-semibold">No. Identitas</th>
                            <th className="py-3 px-4 font-semibold">L/P</th>
                            <th className="py-3 px-4 font-semibold">Usia</th>
                            <th className="py-3 px-4 font-semibold">No. HP</th>
                            <th className="py-3 px-4 font-semibold">Kode Pemesanan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {penumpang.map((orang, i) => (
                            <tr
                              key={`${orang.reservasi.id}-${orang.id ?? i}`}
                              className={`border-t border-outline-variant ${i % 2 === 1 ? 'bg-surface-container/40' : ''}`}
                            >
                              <td className="py-2.5 px-4 text-on-surface-variant">{i + 1}</td>
                              <td className="py-2.5 px-4 font-semibold text-on-surface">{orang.nama}</td>
                              <td className="py-2.5 px-4 text-on-surface-variant">{orang.no_identitas || '-'}</td>
                              <td className="py-2.5 px-4 text-on-surface-variant">{orang.jenis_kelamin}</td>
                              <td className="py-2.5 px-4 text-on-surface-variant">{orang.usia}</td>
                              <td className="py-2.5 px-4 text-on-surface-variant">{orang.no_hp || '-'}</td>
                              <td className="py-2.5 px-4 font-mono text-xs text-on-surface-variant">
                                {orang.reservasi.kode_booking || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}