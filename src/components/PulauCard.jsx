import { Link } from 'react-router-dom';
import { fotoPulauFallback } from '../utils/fotoPulau';
import { formatRupiah, hargaMulaiPerOrang } from '../utils/harga';

export default function PulauCard({ pulau }) {
  const deskripsiSingkat = pulau.deskripsi
    ? pulau.deskripsi.length > 70
      ? pulau.deskripsi.slice(0, 70).trim() + '...'
      : pulau.deskripsi
    : 'Pesona pulau di kawasan Wisata Bahari Sungai Pisang.';

  return (
    // mb-5 md:mb-0 -- di HP kartu ini ditumpuk ke bawah satu per satu sehingga butuh margin
    // bawah. Di layar lebar kartunya disusun sebagai grid (lihat Beranda), dan jarak antar
    // kartu sudah diatur oleh gap grid-nya; margin bawah di sini malah bikin baris tidak rata.
    //
    // md:flex md:flex-col md:h-full -- menyamakan tinggi semua kartu dalam satu baris grid,
    // supaya deskripsi pulau yang panjangnya berbeda-beda tidak membuat kartunya jadi
    // bertingkat-tingkat.
    <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-5 md:mb-0 md:flex md:flex-col md:h-full md:transition-all md:duration-200 md:hover:shadow-xl md:hover:-translate-y-1">
      <div className="relative h-44 md:h-48 shrink-0">
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

      <div className="p-4 md:flex md:flex-col md:flex-1">
        <p className="font-bold text-on-surface text-base md:text-lg">{pulau.nama}</p>
        <p className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          Sungai Pisang, Padang
        </p>
        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed md:flex-1">{deskripsiSingkat}</p>

        <div className="flex justify-between items-end mt-3 md:pt-3 md:border-t md:border-outline-variant">
          <div>
            <p className="text-[11px] text-on-surface-variant leading-none">Mulai dari</p>
            <p className="font-bold text-primary text-base leading-tight mt-0.5">
              {formatRupiah(hargaMulaiPerOrang(pulau))}
              <span className="font-normal text-[11px] text-on-surface-variant">/orang</span>
            </p>
            <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">
              Kapal + tiket masuk
            </p>
          </div>
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
