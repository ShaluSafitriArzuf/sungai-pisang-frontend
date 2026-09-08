import { useNavigate } from 'react-router-dom';
import { PENYELENGGARA } from '../../config/penyelenggara';

// Kerangka bersama untuk halaman Syarat & Ketentuan dan Kebijakan Privasi supaya
// keduanya tampil seragam: tombol kembali, judul, tanggal berlaku, lalu isi.
export default function KerangkaLegal({ judul, berlaku, children }) {
  const navigate = useNavigate();

  return (
    <div className="wadah-sempit pb-24 md:pb-10 px-4 md:px-6 pt-4 md:pt-8">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} type="button" className="text-laut-dark shrink-0">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-bold text-lg text-laut-dark">{judul}</p>
      </div>

      <div className="card text-sm leading-relaxed text-on-surface">
        <p className="text-on-surface-variant mb-4">
          Berlaku sejak {berlaku}. Penyelenggara: {PENYELENGGARA.nama} — {PENYELENGGARA.keterangan}.
        </p>
        {children}
        <p className="text-on-surface-variant mt-6 pt-4 border-t border-outline-variant">
          Pertanyaan mengenai halaman ini dapat disampaikan kepada {PENYELENGGARA.narahubung}{' '}
          melalui WhatsApp {PENYELENGGARA.noHp} atau surel {PENYELENGGARA.email}.
        </p>
      </div>
    </div>
  );
}

// Judul bagian bernomor, dipakai berulang di kedua halaman.
export function Bagian({ nomor, judul, children }) {
  return (
    <section className="mb-5">
      <p className="font-semibold text-laut-dark mb-1">{nomor}. {judul}</p>
      <div className="space-y-2 text-on-surface-variant">{children}</div>
    </section>
  );
}
