import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function FieldPassword({ label, value, onChange, error }) {
  const [lihat, setLihat] = useState(false);
  return (
    <div>
      <label className="text-xs font-semibold text-[#F4A261] mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={lihat ? 'text' : 'password'}
          className="w-full border border-outline-variant rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline"
          onClick={() => setLihat((v) => !v)}
        >
          <span className="material-symbols-outlined text-[20px]">{lihat ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error[0]}</p>}
    </div>
  );
}

export default function GantiPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password_lama: '', password_baru: '', password_baru_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);

  async function simpan() {
    setLoading(true);
    setErrors({});
    setSukses(false);

    if (form.password_baru !== form.password_baru_confirmation) {
      setErrors({ password_baru: ['Konfirmasi password baru tidak sama.'] });
      setLoading(false);
      return;
    }

    try {
      await api.put('/user/password', form);
      setSukses(true);
      setForm({ password_lama: '', password_baru: '', password_baru_confirmation: '' });
      setTimeout(() => navigate('/profil'), 900);
    } catch (err) {
      setErrors(err.response?.data?.errors || { umum: [err.response?.data?.message || 'Gagal mengganti password.'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-10 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-outline-variant sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-on-surface" type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-on-surface">Ganti Password</p>
      </div>

      <div className="px-4 pt-5">
        {sukses && (
          <div className="bg-green-50 text-green-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Password berhasil diganti.
          </div>
        )}
        {errors.umum && (
          <div className="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3 mb-4">{errors.umum[0]}</div>
        )}

        <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-4">
          <FieldPassword
            label="Password Lama"
            value={form.password_lama}
            onChange={(e) => setForm({ ...form, password_lama: e.target.value })}
            error={errors.password_lama}
          />
          <FieldPassword
            label="Password Baru"
            value={form.password_baru}
            onChange={(e) => setForm({ ...form, password_baru: e.target.value })}
            error={errors.password_baru}
          />
          <FieldPassword
            label="Konfirmasi Password Baru"
            value={form.password_baru_confirmation}
            onChange={(e) => setForm({ ...form, password_baru_confirmation: e.target.value })}
          />
          <p className="text-[11px] text-on-surface-variant">Minimal 8 karakter.</p>
        </div>

        <button
          className="w-full bg-[#004873] text-white font-semibold py-3.5 rounded-xl mt-5 active:scale-[0.98] transition-transform disabled:opacity-60"
          onClick={simpan}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </div>
    </div>
  );
}
