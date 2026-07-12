import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
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

export default function PengaturanLokasi() {
  const { user } = useAuth();
  const [position, setPosition] = useState([
    user?.latitude ? Number(user.latitude) : -1.078,
    user?.longitude ? Number(user.longitude) : 100.35,
  ]);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

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
      alert('Lokasi berhasil disimpan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pb-10 flex flex-col h-screen">
      <TopNav title="Pengaturan Lokasi" menu={MENU} />

      <p className="text-xs text-gray-500 px-4 py-2">Tap peta atau geser marker untuk menandai lokasi dermaga/rumah kamu.</p>

      <div className="flex-1 px-4">
        <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500">
        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
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
