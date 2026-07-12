import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';

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

const TIPE_ICON = { cottage: 'cottage', gazebo: 'deck', tenda: 'cabin' };

const KOSONG = { nama: '', tipe: 'cottage', harga_per_malam: '', jumlah_unit: '', deskripsi: '' };

// Kelola foto TAMBAHAN 1 akomodasi (selain foto utama) — bisa lebih dari satu, supaya nanti
// bisa ditambah foto interior/sudut lain, dan tampil sebagai carousel yang bisa digeser di
// halaman Detail Pulau.
function FotoTambahanManager({ akomodasi, onUbah }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function tambahFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('foto', file);
      await api.post(`/akomodasi/${akomodasi.id}/foto`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUbah();
    } catch (err) {
      setError(err.response?.data?.errors?.foto?.[0] || 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function hapusFoto(fotoId) {
    if (!confirm('Hapus foto ini?')) return;
    await api.delete(`/akomodasi/${akomodasi.id}/foto/${fotoId}`);
    onUbah();
  }

  return (
    <div className="border-t border-outline-variant px-3.5 py-3">
      <p className="text-[11px] font-semibold text-[#F4A261] mb-2">
        Foto Tambahan (interior, sudut lain, dll — foto utama diatur lewat tombol "Ganti Foto" di atas)
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {akomodasi.foto_tambahan?.map((f) => (
          <div key={f.id} className="relative aspect-square rounded-lg overflow-hidden bg-surface-container">
            <img src={f.foto} alt="Foto tambahan" className="w-full h-full object-cover" />
            <button
              onClick={() => hapusFoto(f.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
        <label className="aspect-square rounded-lg border border-dashed border-outline-variant flex items-center justify-center cursor-pointer text-on-surface-variant">
          {uploading ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">add</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={tambahFoto} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-[10px] text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

export default function KelolaAkomodasi() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(KOSONG);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  function muatUlang() {
    api.get(`/akomodasi?pulau_id=${user.pulau_id}`).then((res) => setList(res.data));
  }

  useEffect(() => { if (user?.pulau_id) muatUlang(); }, [user]);

  function pilihFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function simpan() {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (fotoFile) formData.append('foto', fotoFile);

      await api.post('/akomodasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setForm(KOSONG);
      setFotoFile(null);
      setPreviewUrl('');
      muatUlang();
    } catch (err) {
      const errs = err.response?.data?.errors;
      const pesan = errs ? Object.values(errs).flat().join(' ') : 'Gagal menyimpan. Coba periksa isian atau ukuran foto.';
      setError(pesan);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAktif(a) {
    await api.put(`/akomodasi/${a.id}`, { aktif: !a.aktif });
    muatUlang();
  }

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <TopNav title="Kelola Akomodasi" menu={MENU} />

      <div className="px-4 py-4">
        <button
          className="w-full bg-[#004873] text-white font-semibold py-3 rounded-xl mb-4 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          onClick={() => setShowForm((s) => !s)}
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Tutup Form' : 'Tambah Akomodasi'}
        </button>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4 mb-4">
            <div className="bg-[#004873]/5 text-[#004873] text-[11px] rounded-xl px-3.5 py-2.5 flex items-start gap-2">
              <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">info</span>
              Foto di sini jadi foto utama/cover-nya. Setelah disimpan, kamu bisa tambah foto lain (interior, sudut lain) dengan klik akomodasinya di daftar bawah.
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <Field label="Foto Akomodasi" icon="image">
              {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />}
              <label className="flex items-center justify-center gap-1.5 border border-dashed border-outline-variant rounded-xl py-2.5 text-sm text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                {fotoFile ? 'Ganti Foto' : 'Pilih dari Galeri'}
                <input type="file" accept="image/*" className="hidden" onChange={pilihFoto} />
              </label>
              <p className="text-[10px] text-on-surface-variant mt-1">Opsional, maks 10MB — kalau kosong, dipakai foto contoh sesuai tipe.</p>
            </Field>

            <Field label="Nama Akomodasi" icon="badge">
              <input className={inputCls} placeholder="mis. Cottage Tepi Pantai" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Field>

            <Field label="Tipe Akomodasi" icon="category">
              <select className={inputCls} value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
                <option value="cottage">Cottage</option>
                <option value="gazebo">Gazebo</option>
                <option value="tenda">Tenda</option>
              </select>
            </Field>

            <Field label="Harga per Malam (Rp)" icon="payments">
              <input className={inputCls} type="number" placeholder="mis. 250000" value={form.harga_per_malam} onChange={(e) => setForm({ ...form, harga_per_malam: e.target.value })} />
            </Field>

            <Field label="Jumlah Unit Tersedia" icon="grid_view">
              <input className={inputCls} type="number" min="1" placeholder="mis. 10" value={form.jumlah_unit} onChange={(e) => setForm({ ...form, jumlah_unit: e.target.value })} />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Sisa unit dihitung otomatis dari reservasi aktif, tidak perlu diatur per tanggal.
              </p>
            </Field>

            <Field label="Deskripsi" icon="description">
              <textarea className={inputCls} rows={3} placeholder="Ceritakan fasilitas & kapasitasnya..." value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            </Field>

            <button
              className="w-full bg-[#F4A261] text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
              onClick={simpan}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Akomodasi'}
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {list.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                className="w-full p-3.5 flex items-center gap-3 text-left"
              >
                {a.foto ? (
                  <img src={a.foto} alt={a.nama} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-[#004873]/10 text-[#004873] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{TIPE_ICON[a.tipe] || 'cottage'}</span>
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{a.nama}</p>
                  <p className="text-[11px] text-on-surface-variant capitalize">
                    {a.tipe} · Rp{Number(a.harga_per_malam).toLocaleString('id-ID')}/malam · {a.jumlah_unit} unit
                    {a.foto_tambahan?.length > 0 && ` · ${a.foto_tambahan.length} foto tambahan`}
                  </p>
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); toggleAktif(a); }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${a.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                >
                  {a.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-outline shrink-0">
                  {expandedId === a.id ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {expandedId === a.id && <FotoTambahanManager akomodasi={a} onUbah={muatUlang} />}
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada akomodasi.</p>}
        </div>
      </div>
    </div>
  );
}
