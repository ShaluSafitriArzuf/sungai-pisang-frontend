import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';
import { ikonWahana } from '../../utils/tampilanKegiatan';

const MENU = [
  { to: '/pengelola/dashboard', label: 'Dashboard' },
  { to: '/pengelola/akomodasi', label: 'Akomodasi' },
  { to: '/pengelola/wahana', label: 'Wahana' },
  { to: '/pengelola/galeri', label: 'Galeri' },
  { to: '/pengelola/profil-pulau', label: 'Profil Pulau' },
  { to: '/pengelola/statistik', label: 'Statistik & Ulasan' },
];

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#F4A261] mb-1.5 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[15px]">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30 bg-white';

export default function KelolaWahana() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: '', deskripsi: '', berbayar_lokasi: false });
  const [loading, setLoading] = useState(false);

  function muatUlang() {
    api.get(`/wahana?pulau_id=${user.pulau_id}`).then((res) => setList(res.data));
  }

  useEffect(() => { if (user?.pulau_id) muatUlang(); }, [user]);

  async function simpan() {
    setLoading(true);
    try {
      await api.post('/wahana', form);
      setShowForm(false);
      setForm({ nama: '', deskripsi: '', berbayar_lokasi: false });
      muatUlang();
    } finally {
      setLoading(false);
    }
  }

  async function toggleAktif(w) {
    await api.put(`/wahana/${w.id}`, { aktif: !w.aktif });
    muatUlang();
  }

  async function toggleBerbayar(w) {
    await api.put(`/wahana/${w.id}`, { berbayar_lokasi: !w.berbayar_lokasi });
    muatUlang();
  }

  async function hapus(w) {
    if (!confirm('Hapus wahana ini?')) return;
    await api.delete(`/wahana/${w.id}`);
    muatUlang();
  }

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <TopNav title="Kelola Wahana & Kegiatan" menu={MENU} />

      <div className="px-4 py-4">
        <button
          className="w-full bg-[#004873] text-white font-semibold py-3 rounded-xl mb-4 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          onClick={() => setShowForm((s) => !s)}
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Tutup Form' : 'Tambah Wahana / Aktivitas'}
        </button>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4 mb-4">
            <p className="text-[11px] text-on-surface-variant bg-surface-container rounded-lg px-3 py-2 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">info</span>
              Info daya tarik/aktivitas di pulau ini — murni informasi buat wisatawan (mis. "Puncak Pasumpahan" untuk hiking, "Banana Boat", "Donat Boat"). Harga tidak diatur di sistem ini, tapi kamu bisa tandai kalau aktivitasnya dibayar langsung di lokasi.
            </p>

            <Field label="Nama Kegiatan / Spot" icon="badge">
              <input className={inputCls} placeholder="mis. Puncak Pasumpahan" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Field>

            <Field label="Deskripsi" icon="description">
              <textarea className={inputCls} rows={3} placeholder="Jelaskan aktivitasnya, lokasi, atau syaratnya..." value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            </Field>

            <Field label="Status Biaya" icon="payments">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, berbayar_lokasi: false })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!form.berbayar_lokasi ? 'bg-[#004873] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'}`}
                >
                  Gratis
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, berbayar_lokasi: true })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.berbayar_lokasi ? 'bg-[#F4A261] text-white' : 'bg-white border border-outline-variant text-on-surface-variant'}`}
                >
                  Bayar di Lokasi
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                "Bayar di lokasi" = dibayar tunai langsung ke operator di sana, bukan lewat reservasi/pembayaran aplikasi ini.
              </p>
            </Field>

            <button
              className="w-full bg-[#F4A261] text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
              onClick={simpan}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Wahana'}
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {list.map((w) => {
            const { icon, warna } = ikonWahana(w.nama);
            return (
              <div key={w.id} className="bg-white rounded-xl shadow-sm p-3.5 flex items-center gap-3">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${warna}`}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{w.nama}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{w.deskripsi || 'Tidak ada deskripsi'}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button onClick={() => toggleAktif(w)} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${w.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {w.aktif ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button onClick={() => toggleBerbayar(w)} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${w.berbayar_lokasi ? 'bg-[#F4A261]/15 text-[#F4A261]' : 'bg-blue-100 text-blue-600'}`}>
                    {w.berbayar_lokasi ? 'Bayar di Lokasi' : 'Gratis'}
                  </button>
                  <button onClick={() => hapus(w)} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 whitespace-nowrap">
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada wahana.</p>}
        </div>
      </div>
    </div>
  );
}
