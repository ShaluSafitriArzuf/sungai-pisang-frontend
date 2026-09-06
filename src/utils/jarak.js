// Jarak garis lurus (rumus haversine) antara dua titik koordinat di permukaan bumi.
// Dipakai untuk estimasi jalur laut, karena antar pulau tidak ada data jaringan jalan
// yang bisa ditelusuri. Untuk jalur darat, lihat utils/rute.js yang memakai OSRM.

export function jarakKmAngka([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // jari-jari rata-rata bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Versi siap tampil (satu angka di belakang koma). Dipakai popup peta & Detail Pulau.
export function jarakKm(a, b) {
  return jarakKmAngka(a, b).toFixed(1);
}

// Analisis keruangan sederhana: mencari objek terdekat dari sebuah posisi.
// Dipakai fitur "Lokasi Saya" untuk memberi tahu pulau mana yang paling dekat
// dari tempat wisatawan berada saat itu.
export function terdekatDari(posisi, daftar = []) {
  const berkoordinat = daftar.filter((d) => d.latitude != null && d.longitude != null);
  if (!berkoordinat.length) return null;

  return berkoordinat
    .map((d) => ({
      item: d,
      jarak: jarakKmAngka(posisi, [Number(d.latitude), Number(d.longitude)]),
    }))
    .sort((a, b) => a.jarak - b.jarak)[0];
}

// Luas poligon (hektar) dari deretan koordinat batas — rumus shoelace di atas proyeksi
// bidang datar lokal. Dipakai alat digitasi batas pulau supaya Pengelola Pulau bisa
// membandingkan luas hasil gambarannya dengan luas yang ia isikan sendiri.
export function luasPoligonHektar(titik = []) {
  if (titik.length < 3) return 0;

  const R = 6378137; // jari-jari bumi (meter)
  const latAcuan = ((titik.reduce((jml, t) => jml + Number(t[0]), 0) / titik.length) * Math.PI) / 180;

  const bidang = titik.map(([lat, lng]) => [
    R * ((Number(lng) * Math.PI) / 180) * Math.cos(latAcuan),
    R * ((Number(lat) * Math.PI) / 180),
  ]);

  let luas = 0;
  for (let i = 0; i < bidang.length; i += 1) {
    const [x1, y1] = bidang[i];
    const [x2, y2] = bidang[(i + 1) % bidang.length];
    luas += x1 * y2 - x2 * y1;
  }

  return Math.abs(luas / 2) / 10000; // meter persegi -> hektar
}
