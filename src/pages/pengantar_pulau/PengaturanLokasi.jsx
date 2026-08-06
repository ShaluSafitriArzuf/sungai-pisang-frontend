import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TopNav from '../../components/TopNav';

const MENU = [
  { to: '/pengantar/dashboard', label: 'Dashboard' },
  { to: '/pengantar/manifest', label: 'Manifest' },
  { to: '/pengantar/riwayat', label: 'Riwayat' },
  { to: '/pengantar/lokasi', label: 'Lokasi' },
];

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} draggable eventHandlers={{
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-10 flex flex-col h-screen">
      <TopNav title="Pengaturan Lokasi" menu={MENU} />

      <p className="text-xs text-gray-500 px-4 py-2">
        Tap peta atau geser marker untuk menandai lokasi dermaga/rumah kamu. Gunakan tampilan
        <span className="font-semibold"> Satelit </span>
        supaya atap rumah terlihat jelas.
      </p>

      {/* Cari nama tempat + tombol lokasi perangkat */}
      <div className="px-4 pb-2 flex gap-2">
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

      <div className="flex-1 px-4 min-h-[240px]">
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

      <div className="px-4 py-2 flex items-center justify-between gap-2">
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

      <div className="px-4 pb-3">
        <p className="text-xs font-semibold text-[#F4A261] mb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">image</span>
          Foto Titik Kumpul / Rumah
        </p>
        {(previewUrl || user?.foto) && (
          <img src={previewUrl || user.foto} alt="Preview lokasi" className="w-full h-32 object-cover rounded-lg mb-2" />
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

      <div className="px-4 pb-4">
        <button className="btn-primary" onClick={simpan} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
        </button>
      </div>
    </div>
  );
}
