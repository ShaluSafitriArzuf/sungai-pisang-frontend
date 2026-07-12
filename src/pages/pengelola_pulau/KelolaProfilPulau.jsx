import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';
import { fotoPulauFallback } from '../../utils/fotoPulau';
import { FASILITAS_OPSI } from '../../utils/tampilanFasilitas';

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

export default function KelolaProfilPulau() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.pulau_id) api.get(`/pulau/${user.pulau_id}`).then((res) => setForm(res.data));
  }, [user]);

  if (!form) return <p className="p-6 text-center text-sm text-on-surface-variant">Memuat...</p>;

  function pilihFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function toggleFasilitas(key) {
    const aktif = form.fasilitas || [];
    setForm({
      ...form,
      fasilitas: aktif.includes(key) ? aktif.filter((k) => k !== key) : [...aktif, key],
    });
  }

  async function simpan() {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('deskripsi', form.deskripsi || '');
      formData.append('luas', form.luas || '');
      formData.append('badge', form.badge || '');
      formData.append('harga_tiket_masuk', form.harga_tiket_masuk || '');
      formData.append('jam_operasional_genset', form.jam_operasional_genset || '');
      formData.append('regulasi', form.regulasi || '');
      (form.fasilitas || []).forEach((f) => formData.append('fasilitas[]', f));
      if (fotoFile) formData.append('foto_utama', fotoFile);

      const res = await api.post(`/pulau/${user.pulau_id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(res.data.pulau);
      setFotoFile(null);
      setPreviewUrl('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(' ') : 'Gagal menyimpan. Coba periksa isian atau ukuran foto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      <TopNav title="Kelola Profil Pulau (CMS)" menu={MENU} />

      <div className="px-4 py-4">
        <p className="font-bold text-lg text-on-surface mb-0.5">{form.nama}</p>
        <p className="text-xs text-on-surface-variant mb-4">
          Data di bawah ini yang tampil ke wisatawan di halaman Detail Pulau &amp; Beranda.
        </p>

        {saved && (
          <div className="bg-green-50 text-green-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Perubahan berhasil disimpan.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4">
          <Field label="Foto Utama" icon="image">
            <img
              src={previewUrl || form.foto_utama || fotoPulauFallback(form.nama)}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <label className="flex items-center justify-center gap-1.5 border border-dashed border-outline-variant rounded-xl py-2.5 text-sm text-on-surface-variant cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              {form.foto_utama || fotoFile ? 'Ganti Foto' : 'Pilih dari Galeri'}
              <input type="file" accept="image/*" className="hidden" onChange={pilihFoto} />
            </label>
            <p className="text-[10px] text-on-surface-variant mt-1">Maks 10MB.</p>
          </Field>

          <Field label="Deskripsi Pulau" icon="description">
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Ceritakan keunikan pulau ini untuk wisatawan..."
              value={form.deskripsi || ''}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </Field>

          <Field label="Luas Wilayah (hektar)" icon="straighten">
            <input
              className={inputCls}
              type="number"
              placeholder="mis. 5"
              value={form.luas || ''}
              onChange={(e) => setForm({ ...form, luas: e.target.value })}
            />
          </Field>

          <Field label="Badge / Kategori Unggulan" icon="sell">
            <input
              className={inputCls}
              placeholder="mis. Snorkeling, Diving, Camping"
              value={form.badge || ''}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
            />
          </Field>

          <Field label="Harga Tiket Masuk (Rp/orang)" icon="confirmation_number">
            <input
              className={inputCls}
              type="number"
              placeholder="mis. 15000"
              value={form.harga_tiket_masuk || ''}
              onChange={(e) => setForm({ ...form, harga_tiket_masuk: e.target.value })}
            />
          </Field>

          <Field label="Jam Operasional Genset" icon="bolt">
            <input
              className={inputCls}
              placeholder="mis. 18.00 - 06.00 WIB"
              value={form.jam_operasional_genset || ''}
              onChange={(e) => setForm({ ...form, jam_operasional_genset: e.target.value })}
            />
          </Field>

          <Field label="Fasilitas Pulau" icon="checklist">
            <div className="grid grid-cols-2 gap-2">
              {FASILITAS_OPSI.map((f) => {
                const aktif = (form.fasilitas || []).includes(f.key);
                return (
                  <button
                    type="button"
                    key={f.key}
                    onClick={() => toggleFasilitas(f.key)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium border transition-colors ${
                      aktif ? 'bg-[#004873] text-white border-[#004873]' : 'bg-white text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Regulasi / Tata Tertib Pulau" icon="gavel">
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Aturan yang wajib dipatuhi wisatawan selama berkunjung..."
              value={form.regulasi || ''}
              onChange={(e) => setForm({ ...form, regulasi: e.target.value })}
            />
          </Field>
        </div>

        <button
          className="w-full bg-[#004873] text-white font-semibold py-3.5 rounded-xl mt-5 active:scale-[0.98] transition-transform disabled:opacity-60"
          onClick={simpan}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
