import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { luasPoligonHektar } from '../utils/jarak';

const PUSAT_KAWASAN = [-1.0836, 100.3556];

/* Titik sudut poligon — diberi nomor urut supaya Pengelola Pulau tahu arah gambarnya. */
function titikIcon(nomor) {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#F4A261;border:2px solid white;
             box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;
             color:white;font-size:10px;font-weight:700;font-family:Inter,sans-serif;">${nomor}</div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function PenangkapKlik({ onKlik }) {
  useMapEvents({
    click: (e) => onKlik([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

/*
  Alat digitasi batas wilayah pulau di atas citra satelit.

  Pengelola Pulau menelusuri garis pantai pulaunya dengan cara mengeklik peta titik demi
  titik. Hasilnya disimpan sebagai poligon, sehingga di Peta Interaktif pulau tidak lagi
  hanya berupa satu penanda titik, melainkan tergambar wilayahnya. Luas hasil gambaran
  ikut dihitung supaya bisa dibandingkan dengan luas yang diisikan secara manual.
*/
export default function DigitasiBatas({ titik = [], pusat, onChange }) {
  const daftar = Array.isArray(titik) ? titik : [];

  const tengah = useMemo(() => {
    if (daftar.length) {
      const lat = daftar.reduce((j, t) => j + Number(t[0]), 0) / daftar.length;
      const lng = daftar.reduce((j, t) => j + Number(t[1]), 0) / daftar.length;
      return [lat, lng];
    }
    if (pusat && pusat[0] != null) return [Number(pusat[0]), Number(pusat[1])];
    return PUSAT_KAWASAN;
  }, [daftar, pusat]);

  const luas = luasPoligonHektar(daftar);

  const tambahTitik = (koordinat) => onChange([...daftar, koordinat]);

  const geserTitik = (indeks, latlng) => {
    const baru = daftar.map((t, i) => (i === indeks ? [latlng.lat, latlng.lng] : t));
    onChange(baru);
  };

  const hapusTerakhir = () => onChange(daftar.slice(0, -1));
  const hapusSemua = () => onChange([]);

  return (
    <div>
      <div className="relative h-64 rounded-xl overflow-hidden border border-outline-variant">
        <MapContainer center={tengah} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <PenangkapKlik onKlik={tambahTitik} />

          {daftar.length >= 3 && (
            <Polygon
              positions={daftar}
              pathOptions={{ color: '#F4A261', weight: 2, fillColor: '#F4A261', fillOpacity: 0.25 }}
            />
          )}
          {daftar.length === 2 && (
            <Polyline positions={daftar} pathOptions={{ color: '#F4A261', weight: 2 }} />
          )}

          {daftar.map((t, i) => (
            <Marker
              key={`sudut-${i}`}
              position={t}
              icon={titikIcon(i + 1)}
              draggable
              eventHandlers={{ dragend: (e) => geserTitik(i, e.target.getLatLng()) }}
            />
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="text-[11px] text-on-surface-variant">
          {daftar.length} titik
          {daftar.length >= 3 && (
            <> &middot; luas tergambar <span className="font-bold text-[#004873]">{luas.toFixed(2)} ha</span></>
          )}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={hapusTerakhir}
          disabled={!daftar.length}
          className="flex items-center gap-1 border border-outline-variant rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[14px]">undo</span>
          Batal 1 titik
        </button>
        <button
          type="button"
          onClick={hapusSemua}
          disabled={!daftar.length}
          className="flex items-center gap-1 border border-outline-variant rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[#8e4e14] disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
          Hapus semua
        </button>
      </div>

      <p className="text-[10px] text-on-surface-variant mt-1.5 leading-snug">
        Klik peta mengikuti garis pantai pulau, searah saja, sampai kembali ke titik awal.
        Titik yang sudah ada bisa digeser. Minimal 3 titik agar batas tersimpan; makin banyak
        titik makin rapi bentuknya.
      </p>
    </div>
  );
}
