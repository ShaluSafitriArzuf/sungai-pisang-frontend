/*
  Pengisian identitas setiap orang yang ikut dalam satu reservasi.

  Sebelumnya sistem hanya menyimpan ANGKA jumlah wisatawan, sehingga manifest penumpang
  hanya memuat nama pemesan. Untuk angkutan penumpang laut hal itu tidak memadai: bila
  terjadi kecelakaan, identitas peserta selain pemesan tidak diketahui. Karena itu setiap
  peserta diisi satu per satu, sama seperti pada pemesanan tiket perjalanan pada umumnya.

  Nomor identitas diwajibkan bagi peserta berusia 17 tahun ke atas — pada usia itu KTP
  sudah wajib dimiliki. Anak di bawahnya boleh dikosongkan.
*/

const inputCls =
  'w-full border border-outline-variant rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30 bg-white';

export default function FormPeserta({ daftar = [], onChange }) {
  const ubah = (indeks, kolom, nilai) =>
    onChange(daftar.map((p, i) => (i === indeks ? { ...p, [kolom]: nilai } : p)));

  return (
    <div className="space-y-3">
      {daftar.map((p, i) => {
        const wajibIdentitas = Number(p.usia) >= 17;

        return (
          <div key={i} className="bg-white rounded-xl border border-outline-variant p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#004873] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm font-bold text-on-surface">
                {i === 0 ? 'Peserta 1 (pemesan)' : `Peserta ${i + 1}`}
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant mb-1 block">
                  Nama lengkap sesuai identitas
                </label>
                <input
                  className={inputCls}
                  value={p.nama || ''}
                  onChange={(e) => ubah(i, 'nama', e.target.value)}
                  placeholder="mis. Shalu Safitri Arzuf"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant mb-1 block">
                    Usia (tahun)
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    max="120"
                    value={p.usia ?? ''}
                    onChange={(e) => ubah(i, 'usia', e.target.value)}
                    placeholder="mis. 22"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant mb-1 block">
                    Jenis kelamin
                  </label>
                  <div className="flex gap-2">
                    {[['L', 'Laki-laki'], ['P', 'Perempuan']].map(([kode, label]) => (
                      <button
                        key={kode}
                        type="button"
                        onClick={() => ubah(i, 'jenis_kelamin', kode)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          (p.jenis_kelamin || 'L') === kode
                            ? 'bg-[#004873] text-white'
                            : 'bg-white border border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant mb-1 block">
                  Nomor identitas (KTP / KIA)
                  {wajibIdentitas ? (
                    <span className="text-[#8e4e14]"> — wajib</span>
                  ) : (
                    <span className="text-on-surface-variant"> — boleh dikosongkan untuk anak</span>
                  )}
                </label>
                <input
                  className={inputCls}
                  value={p.no_identitas || ''}
                  onChange={(e) => ubah(i, 'no_identitas', e.target.value)}
                  placeholder="16 digit NIK"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant mb-1 block">
                  Nomor HP yang bisa dihubungi
                  <span className="text-on-surface-variant"> — boleh dikosongkan</span>
                </label>
                <input
                  className={inputCls}
                  value={p.no_hp || ''}
                  onChange={(e) => ubah(i, 'no_hp', e.target.value)}
                  placeholder="mis. 08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
