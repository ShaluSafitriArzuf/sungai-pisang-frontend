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

export default function KelolaGaleri() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tipe, setTipe] = useState('foto');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function muatUlang() {
    api.get('/galeri-foto').then((res) => setList(res.data));
  }

  useEffect(() => { if (user?.pulau_id) muatUlang(); }, [user]);

  function pilihTipe(t) {
    setTipe(t);
    setFile(null);
    setPreviewUrl('');
    setError('');
  }

  function pilihFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError('');
  }

  async function simpan() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('tipe', tipe);
      await api.post('/galeri-foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setFile(null);
      setPreviewUrl('');
      muatUlang();
    } catch (err) {
      setError(err.response?.data?.errors?.foto?.[0] || 'Gagal mengunggah. Coba file lain atau ukuran lebih kecil.');
    } finally {
      setLoading(false);
    }
  }

  async function hapus(id) {
    if (!confirm('Hapus item galeri ini?')) return;
    await api.delete(`/galeri-foto/${id}`);
    muatUlang();
  }

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopNav title="Kelola Galeri" menu={MENU} />

      <div className="px-4 py-4">
        <p className="text-xs text-gray-500 mb-3">
          Foto/video keseruan di pulau ini akan tampil di halaman Detail Pulau, supaya wisatawan lebih
          tertarik berkunjung. Keduanya bisa diunggah langsung dari galeri/device kamu.
        </p>

        <button className="btn-primary mb-4" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Tutup Form' : '+ Tambah Foto/Video'}
        </button>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-[#F4A261] mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">category</span>
                Jenis Media
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => pilihTipe('foto')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tipe === 'foto' ? 'bg-[#004873] text-white' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => pilihTipe('video')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tipe === 'video' ? 'bg-[#004873] text-white' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  Video
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#F4A261] mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">{tipe === 'video' ? 'videocam' : 'image'}</span>
                {tipe === 'video' ? 'Video' : 'Foto'}
              </label>

              {previewUrl && (
                tipe === 'video' ? (
                  <video src={previewUrl} className="w-full h-32 object-cover rounded-lg mb-2 bg-black" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                )
              )}

              <label className="flex items-center justify-center gap-1.5 border border-dashed border-outline-variant rounded-xl py-2.5 text-sm text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">{tipe === 'video' ? 'video_library' : 'photo_library'}</span>
                {file ? `Ganti ${tipe === 'video' ? 'Video' : 'Foto'}` : 'Pilih dari Galeri'}
                <input
                  type="file"
                  accept={tipe === 'video' ? 'video/*' : 'image/*'}
                  className="hidden"
                  onChange={pilihFile}
                />
              </label>
              <p className="text-[10px] text-on-surface-variant mt-1">
                {tipe === 'video'
                  ? 'Pilih video langsung dari device, maksimal 100MB. Video lebih besar akan gagal diunggah.'
                  : 'Pilih foto langsung dari device, maksimal 100MB.'}
              </p>
              {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
            </div>

            <button
              className="w-full bg-[#F4A261] text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
              onClick={simpan}
              disabled={loading || !file}
            >
              {loading ? 'Mengunggah...' : 'Simpan ke Galeri'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {list.map((g) => (
            <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {g.tipe === 'video' ? (
                <video src={g.foto} className="w-full h-full object-cover" muted />
              ) : (
                <img src={g.foto} alt="galeri" className="w-full h-full object-cover" />
              )}
              {g.tipe === 'video' && (
                <span className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                  VIDEO
                </span>
              )}
              <button
                onClick={() => hapus(g.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-400 text-sm text-center col-span-3 py-4">Belum ada foto/video.</p>}
        </div>
      </div>
    </div>
  );
}
