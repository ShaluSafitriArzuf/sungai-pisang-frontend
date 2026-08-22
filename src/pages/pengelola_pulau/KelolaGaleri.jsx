import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TopNav from '../../components/TopNav';
import ConfirmModal from '../../components/ConfirmModal';

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
  const [files, setFiles] = useState([]); // bisa pilih beberapa sekaligus, diunggah satu-satu ke backend
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [error, setError] = useState('');
  const [confirmHapusId, setConfirmHapusId] = useState(null);

  function muatUlang() {
    api.get('/galeri-foto').then((res) => setList(res.data));
  }

  useEffect(() => { if (user?.pulau_id) muatUlang(); }, [user]);

  function pilihTipe(t) {
    setTipe(t);
    setFiles([]);
    setPreviewUrls([]);
    setError('');
  }

  function pilihFile(e) {
    const dipilih = Array.from(e.target.files || []);
    if (!dipilih.length) return;
    setFiles(dipilih);
    setPreviewUrls(dipilih.map((f) => URL.createObjectURL(f)));
    setError('');
  }

  // Backend cuma nerima 1 file per request (endpoint /galeri-foto), jadi kalau user pilih
  // beberapa foto/video sekaligus (input multiple), di sini yang looping kirim satu-satu
  // berurutan — dari sisi pengguna tetap terasa "sekali pilih, semua keupload".
  async function simpan() {
    if (!files.length) return;
    setLoading(true);
    setError('');
    setProgress({ done: 0, total: files.length });
    let gagal = 0;
    for (const f of files) {
      try {
        const formData = new FormData();
        formData.append('foto', f);
        formData.append('tipe', tipe);
        await api.post('/galeri-foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch (err) {
        gagal += 1;
      }
      setProgress((p) => ({ done: (p?.done || 0) + 1, total: files.length }));
    }
    if (gagal > 0) {
      setError(`${gagal} dari ${files.length} file gagal diunggah (mungkin ukurannya lebih dari 100MB).`);
    } else {
      setShowForm(false);
    }
    setFiles([]);
    setPreviewUrls([]);
    setLoading(false);
    setProgress(null);
    muatUlang();
  }

  function hapus(id) {
    setConfirmHapusId(id);
  }

  async function konfirmasiHapus() {
    await api.delete(`/galeri-foto/${confirmHapusId}`);
    setConfirmHapusId(null);
    muatUlang();
  }

  return (
    <div className="pb-10 bg-background min-h-screen">
      <TopNav title="Kelola Galeri" menu={MENU} />

      <div className="wadah-lebar px-4 md:px-6 py-4 md:py-8">
        <p className="text-xs text-gray-500 mb-3">
          Foto/video keseruan di pulau ini akan tampil di halaman Detail Pulau, supaya wisatawan lebih
          tertarik berkunjung. Keduanya bisa diunggah langsung dari galeri/device kamu.
        </p>

        <button className="btn-primary md:w-auto md:px-10 mb-4" onClick={() => setShowForm((s) => !s)}>
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

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black">
                      {tipe === 'video' ? (
                        <video src={url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-1.5 border border-dashed border-outline-variant rounded-xl py-2.5 text-sm text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">{tipe === 'video' ? 'video_library' : 'photo_library'}</span>
                {files.length ? `Ganti ${tipe === 'video' ? 'Video' : 'Foto'} (${files.length} dipilih)` : 'Pilih dari Galeri'}
                <input
                  type="file"
                  accept={tipe === 'video' ? 'video/*' : 'image/*'}
                  multiple
                  className="hidden"
                  onChange={pilihFile}
                />
              </label>
              <p className="text-[10px] text-on-surface-variant mt-1">
                {tipe === 'video'
                  ? 'Bisa pilih beberapa video sekaligus, maksimal 100MB per file. Video lebih besar akan gagal diunggah.'
                  : 'Bisa pilih beberapa foto sekaligus (tahan Ctrl/Shift saat memilih), maksimal 100MB per file.'}
              </p>
              {loading && progress && (
                <p className="text-[11px] text-[#004873] mt-1">Mengunggah {progress.done}/{progress.total}...</p>
              )}
              {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
            </div>

            <button
              className="w-full bg-[#F4A261] text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
              onClick={simpan}
              disabled={loading || !files.length}
            >
              {loading ? 'Mengunggah...' : `Simpan ke Galeri${files.length > 1 ? ` (${files.length} file)` : ''}`}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3">
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

      <ConfirmModal
        open={!!confirmHapusId}
        title="Hapus Item Galeri"
        message="Hapus foto/video ini dari galeri? Tindakan ini tidak bisa dibatalkan."
        danger
        confirmText="Hapus"
        onConfirm={konfirmasiHapus}
        onCancel={() => setConfirmHapusId(null)}
      />
    </div>
  );
}
