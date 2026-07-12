import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { fotoPulauFallback } from '../utils/fotoPulau';
import { jarakKm } from '../utils/jarak';
import { pulauIcon, pengantarIcon } from '../utils/mapIcons';

export default function PetaInteraktif({ pulauList = [], pengantarList = [] }) {
  const [rutePulauId, setRutePulauId] = useState(null);

  const center = pulauList.length
    ? [Number(pulauList[0].latitude), Number(pulauList[0].longitude)]
    : [-1.08, 100.355];

  const pengantarUtama = pengantarList[0];
  const pulauDipilih = pulauList.find((p) => p.id === rutePulauId);

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      {/* Citra satelit — supaya terlihat "nyata" (hijau daratan, biru laut) seperti Google Maps */}
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {pulauList.map((p) => (
        <Marker
          key={`pulau-${p.id}`}
          position={[Number(p.latitude), Number(p.longitude)]}
          icon={pulauIcon}
          eventHandlers={{ click: () => setRutePulauId(p.id) }}
        >
          <Popup minWidth={215} maxWidth={235} className="pulau-popup">
            <div>
              <img
                src={p.foto_utama || fotoPulauFallback(p.nama)}
                alt={p.nama}
                className="w-full h-24 object-cover"
              />
              <div className="px-3.5 pt-3 pb-3.5">
                <p className="font-bold text-[13.5px] text-[#1e1b16] mb-2 leading-snug">{p.nama}</p>

                <div className="flex items-center gap-1.5 text-[11px] text-[#41474f] mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#004873]/8 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[12px] text-[#004873]">square_foot</span>
                  </span>
                  Luas {p.luas} ha
                </div>

                {pengantarUtama && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#41474f] mb-3">
                    <span className="w-5 h-5 rounded-full bg-[#F4A261]/12 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[12px] text-[#F4A261]">directions_boat</span>
                    </span>
                    {jarakKm(
                      [Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)],
                      [Number(p.latitude), Number(p.longitude)]
                    )} km dari Pengantar Pulau
                  </div>
                )}

                <div className="flex gap-1.5 pt-2.5 border-t border-[#eceef1]">
                  <Link
                    to={`/pulau/${p.id}`}
                    className="flex-1 text-center bg-[#004873] text-white text-[11px] font-semibold py-2 rounded-lg active:scale-[0.97] transition-transform"
                  >
                    Lihat Detail
                  </Link>
                  <a
                    className="flex-1 text-center border border-[#c1c7d0] text-[#004873] text-[11px] font-semibold py-2 rounded-lg active:scale-[0.97] transition-transform"
                    target="_blank"
                    rel="noreferrer"
                    href={
                      pengantarUtama
                        ? `https://www.google.com/maps/dir/?api=1&origin=${pengantarUtama.latitude},${pengantarUtama.longitude}&destination=${p.latitude},${p.longitude}`
                        : `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
                    }
                  >
                    Maps
                  </a>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {pengantarList.map((u) => (
        <Marker key={`pengantar-${u.id}`} position={[Number(u.latitude), Number(u.longitude)]} icon={pengantarIcon}>
          <Popup minWidth={180} className={u.foto ? 'pulau-popup' : ''}>
            <div>
              {u.foto && <img src={u.foto} alt={u.name} className="w-full h-24 object-cover" />}
              <div className={u.foto ? 'px-3.5 py-3' : ''}>
                <p className="font-bold text-sm text-[#1e1b16] mb-0.5">{u.name}</p>
                <p className="text-[11px] text-[#41474f] mb-2.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">call</span>
                  Pengantar Pulau — {u.no_hp}
                </p>
                <a
                  className="block text-center bg-[#F4A261] text-white text-[11px] font-semibold py-1.5 rounded-lg"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${u.latitude},${u.longitude}`}
                >
                  Rute Google Maps
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Garis rute laut (lurus) dari Pengantar Pulau ke pulau yang baru diklik */}
      {pengantarUtama && pulauDipilih && (
        <Polyline
          positions={[
            [Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)],
            [Number(pulauDipilih.latitude), Number(pulauDipilih.longitude)],
          ]}
          pathOptions={{ color: '#F4A261', weight: 3, dashArray: '8 6' }}
        />
      )}
    </MapContainer>
  );
}
