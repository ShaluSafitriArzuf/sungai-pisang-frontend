import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TopNav from '../../components/TopNav';
import { pengantarIcon } from '../../utils/mapIcons';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/laporan', label: 'Laporan' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  // icon={pengantarIcon} WAJIB. Tanpa ini Leaflet memakai ikon bawaannya, dan berkas
  // gambarnya tidak ikut terbawa saat proyek di-build sehingga marker tampil sebagai
  // gambar rusak. pengantarIcon berupa divIcon (HTML murni), jadi tidak pernah gagal muat.
  return <Marker position={position} draggable icon={pengantarIcon} eventHandlers={{
    dragend: (e) => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]),
  }} />;
}

// Menyimpan instance peta supaya tombol di luar MapContainer (Lokasi Saya, hasil pencarian)
// bisa menggeser dan memperbesar tampilan peta.
function SimpanPeta({ petaRef }) {
  petaRef.current = useMap();
  return null;
}

export default function PengaturanLokasi() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const petaRef = useRef(null);
  const [position, setPosition] = useState([
    user?.latitude ? Number(user.latitude) : -1.078,
    user?.longitude ? Number(user.longitude) : 100.35,
  ]);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [cari, setCari] = useState('');
  const [cariLoading, setCariLoading] = useState(false);

  // Koordinat yang sudah tersimpan sering baru tiba SESUDAH halaman ini digambar, karena
  // AuthContext masih mengambil data user. Nilai awal useState di atas hanya dibaca sekali,
  // jadi tanpa penyelarasan ini marker menetap di titik cadangan -- dan penyimpanan
  // berikutnya malah menimpa koordinat asli dengan titik cadangan itu.
  // Dijalankan sekali saja lewat penanda sudahDisetel, supaya marker yang sedang digeser
  // pengguna tidak ditarik balik ketika data user datang terlambat.
  const sudahDisetel = useRef(false);

  useEffect(() => {
    if (sudahDisetel.current) return;
    if (!user?.latitude || !user?.longitude) return;

    const lat = Number(user.latitude);
    const lng = Number(user.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    sudahDisetel.current = true;
    setPosition([lat, lng]);
    petaRef.current?.flyTo([lat, lng], 17);
  }, [user?.latitude, user?.longitude]);

  function pindahPeta(lat, lng, zoom = 18) {
    setPosition([lat, lng]);
    petaRef.current?.flyTo([lat, lng], zoom);
  }

  // Ambil koordinat perangkat. Paling akurat kalau Pengantar Pulau membuka halaman ini
  // sambil berada di rumah/dermaganya sendiri — tinggal satu ketukan, tidak perlu mencari
  // di peta sama sekali.
  function pakaiLokasiSaya() {
    if (!navigator.geolocation) {
      showToast('Perangkat ini tidak mendukung deteksi lokasi.', 2500, 'peringatan');
      return;
    }
    showToast('Mendeteksi lokasi kamu...', 1500);
    navigator.geolocation.getCurrentPosition(
      (pos) => pindahPeta(pos.coords.latitude, pos.coords.longitude, 19),
      () => showToast('Gagal mendapatkan lokasi. Izinkan akses lokasi di peramban.', 3000, 'peringatan'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Pencarian nama tempat memakai Nominatim (layanan gratis milik OpenStreetMap, tanpa
  // API key). Hasil pertama langsung dipakai sebagai titik marker.
  async function cariLokasi(e) {
    e?.preventDefault();
    const q = cari.trim();
    if (!q) return;
    setCariLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (data.length) {
        pindahPeta(Number(data[0].lat), Number(data[0].lon));
      } else {
        showToast('Lokasi tidak ditemukan. Coba kata kunci lain.', 2500, 'peringatan');
      }
    } catch {
      showToast('Pencarian gagal. Periksa koneksi internet.', 2500, 'peringatan');
    } finally {
      setCariLoading(false);
    }
  }

  function pilihFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function simpan() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('latitude', position[0]);
      formData.append('longitude', position[1]);
      if (fotoFile) formData.append('foto', fotoFile);

      await api.post('/peta/lokasi-saya', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Lokasi berhasil disimpan.', 2000, 'sukses');

      // Sebelumnya halaman ini diam di tempat setelah menyimpan. Pesan "berhasil" muncul
      // sebentar lalu hilang, dan yang tersisa di layar tetap formulir yang sama persis --
      // tidak ada tanda apakah pekerjaannya sudah selesai. Sekarang dikembalikan ke Dashboard,
      // sama seperti alur simpan di halaman lain. Jeda 1,2 detik memberi waktu pesan
      // berhasilnya terbaca dulu sebelum halaman berpindah.
      setTimeout(() => navigate('/pengantar/dashboard'), 1200);
    } catch (err) {
      // Dulu blok ini tidak ada sama sekali: kalau penyimpanan gagal (jaringan putus, foto
      // lebih dari 10MB, sesi kedaluwarsa), tidak ada pesan apa pun yang muncul dan tombolnya
      // sekadar berhenti berputar -- persis seperti berhasil. Pengantar Pulau bisa mengira
      // lokasinya sudah tersimpan padahal belum.
      showToast(
        err.response?.data?.message || 'Lokasi gagal disimpan. Periksa koneksi lalu coba lagi.',
        3500,
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  // h-screen dilepas dari pembungkus terluar. Sebelumnya tinggi halaman dikunci setinggi layar,
  // padahal isinya (petunjuk, pencarian, peta, foto, tombol simpan) lebih tinggi dari itu.
  // Akibatnya halaman tidak bisa digulir sama sekali, isi bagian bawah terpotong, dan header
  // biru yang ber-sticky di dalamnya ikut hilang begitu halaman digeser -- menunya jadi tidak
  // kelihatan lagi. Dengan tinggi mengikuti isi, halaman bergulir wajar dan headernya tetap
  // menempel di atas.
  return (
    <div className="pb-10 bg-background min-h-screen">
      <TopNav title="Pengaturan Lokasi" menu={MENU} />

      <p className="wadah-lebar w-full text-xs text-gray-500 px-4 md:px-6 py-2 md:py-3">
        Tap peta atau geser marker untuk menandai lokasi dermaga/rumah kamu. Gunakan tampilan
        <span className="font-semibold"> Satelit </span>
        supaya atap rumah terlihat jelas.
      </p>

      {/* Cari nama tempat + tombol lokasi perangkat */}
      <div className="wadah-lebar w-full px-4 md:px-6 pb-2 md:pb-3 flex gap-2">
        <form onSubmit={cariLokasi} className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
            search
          </span>
          <input
            className="w-full border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
            placeholder="Cari alamat, mis. Sungai Pisang Padang"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
          {cariLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
              mencari...
            </span>
          )}
        </form>

        <button
          type="button"
          onClick={pakaiLokasiSaya}
          title="Gunakan lokasi perangkat saat ini"
          className="shrink-0 w-11 rounded-xl bg-[#004873] text-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Tinggi peta dipatok, bukan lagi "isi sisa ruang layar" -- karena ruang sisanya
          sudah habis, peta selalu menyusut ke tinggi minimumnya. Angka 240px di HP
          disamakan dengan tinggi yang selama ini benar-benar terjadi, supaya tampilan
          di HP tidak berubah. Di laptop dilebarkan jadi 520px karena ruangnya ada. */}
      {/* Mulai lebar 768px isi halaman dipecah dua kolom: peta di kiri (lebih lebar karena
          itu pekerjaan utamanya), panel foto dan tombol simpan di kanan. Sebelumnya semuanya
          ditumpuk satu kolom ke bawah selebar layar -- foto titik kumpul jadi memanjang lebih
          dari 1200px dengan tinggi cuma 128px, terpotong jadi strip pipih yang justru
          menyulitkan mengenali rumahnya. Di HP susunannya tetap bertumpuk seperti sebelumnya. */}
      <div className="wadah-lebar w-full px-4 md:px-6 md:grid md:grid-cols-12 md:gap-6 md:items-start">
        <div className="md:col-span-8">
          <div className="h-[240px] md:h-[520px]">
        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
          <SimpanPeta petaRef={petaRef} />

          {/* Satelit dijadikan tampilan awal: di kawasan pesisir seperti Sungai Pisang, peta
              jalan biasa hampir kosong sehingga rumah sulit dikenali. Citra satelit membuat
              atap rumah, dermaga, dan garis pantai terlihat langsung. */}
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satelit">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Peta Jalan">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
          </div>

          <div className="py-2 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
        </span>
        {/* Pembanding: buka titik yang sama di Google Maps untuk memastikan letaknya benar. */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-[#004873] shrink-0"
        >
          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          Cek di Google Maps
        </a>
          </div>
        </div>

        {/* Kolom kanan: panel foto + tombol simpan. Di laptop dibungkus kartu putih supaya
            terbaca sebagai satu kesatuan di samping peta, bukan sisa yang tercecer. */}
        <div className="md:col-span-4 md:bg-white md:rounded-2xl md:shadow-sm md:p-5">
        <div className="pb-3 md:pb-0">
        <p className="text-xs font-semibold text-[#F4A261] mb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">image</span>
          Foto Titik Kumpul / Rumah
        </p>
        {(previewUrl || user?.foto) && (
          <img src={previewUrl || user.foto} alt="Preview lokasi" className="w-full h-32 md:h-44 object-cover rounded-lg md:rounded-xl mb-2 md:mb-3" />
        )}
        <label className="flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-500 cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">photo_library</span>
          {previewUrl || user?.foto ? 'Ganti Foto' : 'Pilih dari Galeri'}
          <input type="file" accept="image/*" className="hidden" onChange={pilihFoto} />
        </label>
        <p className="text-[10px] text-gray-400 mt-1">
          Opsional, maks 10MB — supaya wisatawan tahu persis mau berhenti di mana.
        </p>
      </div>

        <div className="pb-4 md:pb-0 md:pt-5">
          <button className="btn-primary" onClick={simpan} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
