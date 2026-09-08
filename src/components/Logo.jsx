/**
 * Lambang usaha "Jelajah Bahari Sungai Pisang".
 *
 * Ditulis sebagai SVG di dalam komponen, bukan berkas gambar yang dimuat lewat <img>,
 * karena tiga alasan: tidak ada permintaan jaringan tambahan, tetap tajam di semua
 * ukuran layar, dan warnanya bisa diatur langsung dari kode.
 *
 * Unsurnya: lingkaran biru laut sebagai bidang tertutup yang mudah dikenali, matahari
 * oranye, perahu layar putih yang menegaskan fungsi tempat sebagai titik penyeberangan,
 * dan satu garis ombak.
 *
 * varian:
 *   'utama'      – lingkaran biru penuh. Dipakai di atas latar terang.
 *   'latarGelap' – tanpa lingkaran luar, supaya menyatu di atas latar biru tua.
 *   'satuWarna'  – matahari dibuat putih pudar, untuk cetak hitam putih.
 */
export default function Logo({ ukuran = 36, varian = 'utama', className = '' }) {
  const oranye = varian === 'satuWarna' ? '#FFFFFF' : '#F4A261';
  const buramMatahari = varian === 'satuWarna' ? 0.35 : 1;
  const warnaOmbak = varian === 'satuWarna' ? '#FFFFFF' : '#F4A261';
  const buramOmbak = varian === 'satuWarna' ? 0.7 : 1;

  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 130 130"
      className={className}
      role="img"
      aria-label="Jelajah Bahari Sungai Pisang"
    >
      <title>Jelajah Bahari Sungai Pisang</title>
      {varian !== 'latarGelap' && <circle cx="65" cy="65" r="65" fill="#004873" />}
      <circle cx="65" cy="50" r="17" fill={oranye} opacity={buramMatahari} />
      <path d="M65 79 L65 50" stroke="#FFFFFF" strokeWidth={varian === 'latarGelap' ? 3.4 : 3.2} strokeLinecap="round" />
      <path d="M67 54 L67 76 L84 76 Z" fill="#FFFFFF" />
      <path d="M63 58 L63 76 L50 76 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M38 79 L92 79 L83 92 Q65 96 47 92 Z" fill="#FFFFFF" />
      <path
        d="M25 101 Q38 94 51 101 T77 101 T103 101"
        stroke={warnaOmbak}
        strokeWidth={varian === 'latarGelap' ? 4.5 : 4}
        fill="none"
        strokeLinecap="round"
        opacity={buramOmbak}
      />
    </svg>
  );
}
