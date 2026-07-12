import { Link } from 'react-router-dom';
import { fotoPulauFallback } from '../utils/fotoPulau';

export default function PulauCard({ pulau }) {
  const deskripsiSingkat = pulau.deskripsi
    ? pulau.deskripsi.length > 70
      ? pulau.deskripsi.slice(0, 70).trim() + '...'
      : pulau.deskripsi
    : 'Pesona pulau di kawasan Wisata Bahari Sungai Pisang.';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-5">
      <div className="relative h-44">
        <img
          src={pulau.foto_utama || fotoPulauFallback(pulau.nama)}
          alt={pulau.nama}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 bg-white/90 rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          {pulau.rating_rata_rata ?? '0'}
        </div>

        {pulau.badge && (
          <div className="absolute top-3 right-3 bg-primary/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {pulau.badge}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-bold text-on-surface text-base">{pulau.nama}</p>
        <p className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          Sungai Pisang, Padang
        </p>
        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{deskripsiSingkat}</p>

        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-on-surface-variant">
            Tiket mulai{' '}
            <span className="font-bold text-primary text-sm">
              Rp{Number(pulau.harga_tiket_masuk).toLocaleString('id-ID')}
            </span>
          </p>
          <Link
            to={`/pulau/${pulau.id}`}
            className="bg-[#F4A261] text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
