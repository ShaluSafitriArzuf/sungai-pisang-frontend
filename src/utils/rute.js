// Pencarian rute darat yang sesungguhnya — mengikuti jaringan jalan, bukan garis lurus.
//
// Memakai OSRM (Open Source Routing Machine), layanan routing terbuka berbasis data
// OpenStreetMap yang tidak memerlukan kunci API. Dipakai halaman Peta Interaktif untuk
// menggambar jalur darat dari posisi wisatawan menuju titik kumpul Pengantar Pulau,
// lengkap dengan jarak tempuh dan estimasi waktu.
//
// Ini yang membedakan "menampilkan titik" dengan "pemetaan": jalur hasil analisis
// jaringan jalan digambar sendiri oleh sistem di atas peta Leaflet, bukan dilempar
// ke aplikasi peta pihak lain.

const OSRM = 'https://router.project-osrm.org/route/v1/driving';

// dari & ke berupa [lintang, bujur]. Mengembalikan garis siap gambar untuk Leaflet.
export async function cariRuteDarat(dari, ke) {
  // OSRM memakai urutan bujur,lintang pada URL-nya.
  const url = `${OSRM}/${dari[1]},${dari[0]};${ke[1]},${ke[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Layanan rute sedang tidak dapat dihubungi.');

  const data = await res.json();
  const rute = data?.routes?.[0];
  if (!rute) throw new Error('Rute darat menuju titik ini tidak ditemukan.');

  return {
    // GeoJSON memakai urutan [bujur, lintang], Leaflet memakai [lintang, bujur] — dibalik.
    garis: rute.geometry.coordinates.map(([bujur, lintang]) => [lintang, bujur]),
    jarakMeter: rute.distance,
    durasiDetik: rute.duration,
  };
}

export function formatJarak(meter) {
  if (meter == null) return '-';
  return meter < 1000 ? `${Math.round(meter)} m` : `${(meter / 1000).toFixed(1)} km`;
}

export function formatDurasi(detik) {
  if (detik == null) return '-';
  const menit = Math.round(detik / 60);
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`;
}
