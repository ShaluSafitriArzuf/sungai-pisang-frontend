import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HeaderBersama from '../../components/HeaderBersama';
import { pakaiTopNav } from '../../utils/menuPeran';
import { useAuth } from '../../context/AuthContext';

export default function EditProfil() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    no_hp: user?.no_hp || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);

  async function simpan() {
    setLoading(true);
    setErrors({});
    setSukses(false);
    try {
      const res = await api.put('/user', form);
      updateUser(res.data.user);
      setSukses(true);
      // navigate(-1) dipakai (bukan '/profil' yang di-hardcode) karena halaman ini sekarang
      // juga dibuka buat Pengelola/Pengantar Pulau, dan mereka tidak punya halaman '/profil'
      // (itu hub khusus wisatawan) -- balik ke halaman asal jauh lebih aman untuk semua role.
      setTimeout(() => navigate(-1), 900);
    } catch (err) {
      setErrors(err.response?.data?.errors || { umum: [err.response?.data?.message || 'Gagal menyimpan perubahan.'] });
    } finally {
      setLoading(false);
    }
  }

  // Pengantar/Pengelola Pulau memakai TopNav biru berikut deretan menunya, sama seperti di
  // seluruh halaman kerja mereka. Wisatawan tetap memakai bilah judul putih dengan tombol
  // kembali seperti semula — bagi mereka halaman ini dibuka dari hub Profil, jadi tombol
  // kembali memang jalan pulangnya.
  const headerPeran = pakaiTopNav(user?.role);

  return (
    <div className="pb-10 bg-background min-h-screen">
      <HeaderBersama title="Edit Profil" />

      {!headerPeran && (
        <div className="wadah-sempit flex items-center gap-3 px-4 py-3 bg-white border-b border-outline-variant sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="text-on-surface" type="button">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <p className="font-bold text-on-surface">Edit Profil</p>
        </div>
      )}

      <div className="wadah-sempit px-4 pt-5">
        {sukses && (
          <div className="bg-green-50 text-green-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Profil berhasil diperbarui.
          </div>
        )}
        {errors.umum && (
          <div className="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3 mb-4">{errors.umum[0]}</div>
        )}

        <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#F4A261] mb-1.5 block">Nama Lengkap</label>
            <input
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#F4A261] mb-1.5 block">Alamat Email</label>
            <input
              type="email"
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#F4A261] mb-1.5 block">Nomor HP</label>
            <input
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
              placeholder="08xxxxxxxxxx"
              value={form.no_hp}
              onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            />
            {errors.no_hp && <p className="text-[11px] text-red-500 mt-1">{errors.no_hp[0]}</p>}
          </div>
        </div>

        <button
          className="w-full bg-[#004873] text-white font-semibold py-3.5 rounded-xl mt-5 active:scale-[0.98] transition-transform disabled:opacity-60"
          onClick={simpan}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

        {/* Akun Google passwordnya diisi string acak otomatis (lihat GoogleAuthController),
            jadi tidak ada password asli buat diganti -- sama seperti aturan di Profil.jsx. */}
        {!user?.google_id && (
          <button
            type="button"
            onClick={() => navigate('/profil/password')}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#004873] py-3 mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Ganti Password
          </button>
        )}
      </div>
    </div>
  );
}
