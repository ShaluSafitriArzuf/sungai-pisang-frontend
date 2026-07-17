// Daftar fasilitas standar yang bisa dipilih pengelola pulau (Kelola Profil Pulau) dan
// ditampilkan di Detail Pulau. Key ini yang disimpan di kolom pulau.fasilitas (array JSON).
export const FASILITAS_OPSI = [
  { key: 'toilet', label: 'Toilet Umum', icon: 'wc' },
  { key: 'mushola', label: 'Mushola', icon: 'mosque' },
  { key: 'warung_makan', label: 'Warung Makan / Kios', icon: 'storefront' },
  { key: 'gazebo_umum', label: 'Gazebo / Tempat Istirahat', icon: 'deck' },
  { key: 'dermaga', label: 'Dermaga', icon: 'anchor' },
  { key: 'area_parkir', label: 'Area Parkir', icon: 'local_parking' },
  { key: 'spot_foto', label: 'Spot Foto', icon: 'photo_camera' },
  { key: 'tempat_sampah', label: 'Tempat Sampah', icon: 'delete' },
];

export function labelFasilitas(key) {
  return FASILITAS_OPSI.find((f) => f.key === key)?.label || key;
}

export function ikonFasilitas(key) {
  return FASILITAS_OPSI.find((f) => f.key === key)?.icon || 'check_circle';
}
