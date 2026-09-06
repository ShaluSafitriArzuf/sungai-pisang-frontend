import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, CircleMarker,
  LayersControl, LayerGroup, ScaleControl, Tooltip, useMap, useMapEvents,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { fotoPulauFallback } from '../utils/fotoPulau';
import { jarakKm, terdekatDari } from '../utils/jarak';
import { formatRupiah, hargaMulaiPerOrang } from '../utils/harga';
import { ikonFasilitas, labelFasilitas } from '../utils/tampilanFasilitas';
import { pulauIcon, pengantarIcon, lokasiSayaIcon } from '../utils/mapIcons';
import { cariRuteDarat, formatDurasi, formatJarak } from '../utils/rute';

const { BaseLayer, Overlay } = LayersControl;

const PUSAT_KAWASAN = [-1.0836, 100.3556];
const PUSAT_KOTA_PADANG = [-0.9471, 100.4172];
const RADIUS_ZONA_METER = 500;

/* Menyalurkan instance peta ke komponen induk supaya tombol di luar MapContainer
   (Lokasi Saya, layar penuh, panel daftar pulau) bisa menggerakkan peta. */
function Penghubung({ onSiap }) {
  const peta = useMap();
  useEffect(() => { onSiap(peta); }, [peta, onSiap]);
  return null;
}

/* Menyesuaikan tampilan awal supaya seluruh objek muat di layar begitu data pertama
   masuk. Tanpa ini peta akan berhenti di titik bawaan karena prop center hanya dibaca
   sekali saat peta dibuat. */
function PasAwal({ titik }) {
  const peta = useMap();
  const sudah = useRef(false);
  useEffect(() => {
    if (sudah.current || !titik.length) return;
    sudah.current = true;
    if (titik.length === 1) peta.setView(titik[0], 14);
    else peta.fitBounds(titik, { padding: [50, 50] });
  }, [titik, peta]);
  return null;
}

/* Menerbangkan peta ke pulau yang dipilih dari panel daftar di halaman Peta. */
function Fokuskan({ fokus }) {
  const peta = useMap();
  useEffect(() => {
    if (!fokus) return;
    peta.flyTo([fokus.lat, fokus.lng], fokus.zoom ?? 15, { duration: 1.1 });
  }, [fokus, peta]);
  return null;
}

/* Pembacaan koordinat pointer — komponen terpisah supaya gerakan tetikus hanya
   menggambar ulang angka koordinatnya, bukan seluruh isi peta. */
function KoordinatKursor() {
  const [titik, setTitik] = useState(null);
  useMapEvents({
    mousemove: (e) => setTitik(e.latlng),
    mouseout: () => setTitik(null),
  });
  if (!titik) return null;
  return (
    <div className="absolute bottom-8 right-2 z-[1000] pointer-events-none bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 shadow text-[10px] font-mono text-[#41474f]">
      {titik.lat.toFixed(5)}, {titik.lng.toFixed(5)}
    </div>
  );
}

function TombolPeta({ ikon, label, onClick, aktif, sibuk }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sibuk}
      className={`flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-2 text-[11px] font-semibold shadow-md transition-colors disabled:opacity-60 ${
        aktif ? 'bg-[#004873] text-white' : 'bg-white/95 backdrop-blur-sm text-[#004873] hover:bg-white'
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">{ikon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function PetaInteraktif({ pulauList = [], pengantarList = [], fokus = null }) {
  const wadahRef = useRef(null);
  const [peta, setPeta] = useState(null);
  const [rutePulauId, setRutePulauId] = useState(null);
  const [lokasiSaya, setLokasiSaya] = useState(null);
  const [pesanLokasi, setPesanLokasi] = useState('');
  const [ruteDarat, setRuteDarat] = useState(null);
  const [statusRute, setStatusRute] = useState('idle');
  const [pesanRute, setPesanRute] = useState('');
  const [layarPenuh, setLayarPenuh] = useState(false);

  const pengantarUtama = pengantarList[0];

  const titikKumpul = useMemo(
    () => (pengantarUtama && pengantarUtama.latitude != null
      ? [Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)]
      : null),
    [pengantarUtama]
  );

  const pusat = pulauList.length && pulauList[0].latitude != null
    ? [Number(pulauList[0].latitude), Number(pulauList[0].longitude)]
    : PUSAT_KAWASAN;

  const pulauDipilih = pulauList.find((p) => p.id === rutePulauId);

  const semuaTitik = useMemo(
    () => [...pulauList, ...pengantarList]
      .filter((o) => o.latitude != null)
      .map((o) => [Number(o.latitude), Number(o.longitude)]),
    [pulauList, pengantarList]
  );

  const pulauTerdekat = useMemo(
    () => (lokasiSaya ? terdekatDari(lokasiSaya, pulauList) : null),
    [lokasiSaya, pulauList]
  );

  // Dasar penskalaan lingkaran pada lapisan kepadatan kunjungan.
  const kunjunganTertinggi = useMemo(
    () => Math.max(1, ...pulauList.map((p) => Number(p.jumlah_wisatawan) || 0)),
    [pulauList]
  );

  /* Analisis jaringan jalan: mencari jalur darat sesungguhnya menuju titik kumpul. */
  const gambarRuteDarat = useCallback(async (dari) => {
    if (!titikKumpul) {
      setStatusRute('gagal');
      setPesanRute('Titik kumpul belum diatur oleh Pengantar Pulau.');
      return;
    }
    setStatusRute('mencari');
    setPesanRute('');
    try {
      const hasil = await cariRuteDarat(dari, titikKumpul);
      setRuteDarat(hasil);
      setStatusRute('siap');
      peta?.fitBounds(hasil.garis, { padding: [48, 48] });
    } catch (err) {
      setRuteDarat(null);
      setStatusRute('gagal');
      setPesanRute(err.message || 'Rute darat gagal dimuat.');
    }
  }, [titikKumpul, peta]);

  const cariLokasiSaya = () => {
    if (!navigator.geolocation) {
      setPesanLokasi('Peramban ini tidak mendukung penentuan lokasi.');
      return;
    }
    setPesanLokasi('Mencari posisi Anda...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const titik = [pos.coords.latitude, pos.coords.longitude];
        setLokasiSaya(titik);
        setPesanLokasi('');
        peta?.flyTo(titik, 14, { duration: 1.2 });
        gambarRuteDarat(titik);
      },
      () => setPesanLokasi('Posisi tidak dapat diambil. Pastikan izin lokasi diizinkan dan halaman dibuka lewat HTTPS.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const saatBerubah = () => {
      setLayarPenuh(Boolean(document.fullscreenElement));
      setTimeout(() => peta?.invalidateSize(), 220);
    };
    document.addEventListener('fullscreenchange', saatBerubah);
    return () => document.removeEventListener('fullscreenchange', saatBerubah);
  }, [peta]);

  const alihkanLayarPenuh = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wadahRef.current?.requestFullscreen?.();
  };

  const adaPanelInfo = Boolean(
    pesanLokasi || pesanRute || statusRute === 'mencari' || ruteDarat || pulauTerdekat
  );

  return (
    <div ref={wadahRef} className="relative h-full w-full bg-[#0b3d5c]">
      <MapContainer center={pusat} zoom={13} style={{ height: '100%', width: '100%' }}>
        <Penghubung onSiap={setPeta} />
        <PasAwal titik={semuaTitik} />
        <Fokuskan fokus={fokus} />
        <ScaleControl position="bottomleft" imperial={false} />

        <LayersControl position="topright">
          {/* ── Peta dasar: pengguna bisa berpindah sudut pandang sesuai kebutuhan ── */}
          <BaseLayer checked name="Citra Satelit">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Peta Jalan">
            <TileLayer
              attribution='&copy; Kontributor OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Peta Topografi">
            <TileLayer
              attribution='&copy; OpenTopoMap (CC-BY-SA) &mdash; data &copy; Kontributor OpenStreetMap'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          {/* ── Lapisan tematik: bisa dinyalakan dan dimatikan satu per satu ── */}
          <Overlay checked name="Pulau Wisata">
            <LayerGroup>
              {pulauList.filter((p) => p.latitude != null).map((p) => (
                <Marker
                  key={`pulau-${p.id}`}
                  position={[Number(p.latitude), Number(p.longitude)]}
                  icon={pulauIcon}
                  eventHandlers={{ click: () => setRutePulauId(p.id) }}
                >
                  <Popup minWidth={225} maxWidth={245} className="pulau-popup">
                    <div>
                      <img
                        src={p.foto_utama || fotoPulauFallback(p.nama)}
                        alt={p.nama}
                        className="w-full h-24 object-cover"
                      />
                      <div className="px-3.5 pt-3 pb-3.5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-bold text-[13.5px] text-[#1e1b16] leading-snug">{p.nama}</p>
                          {Number(p.rating_rata_rata) > 0 && (
                            <span className="shrink-0 text-[10px] font-bold text-[#8e4e14] bg-[#ffdcc4] rounded px-1.5 py-0.5">
                              &#9733; {Number(p.rating_rata_rata).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#41474f] mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#004873]/8 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[12px] text-[#004873]">square_foot</span>
                          </span>
                          Luas {p.luas != null ? Number(p.luas) : '-'} ha
                        </div>

                        {titikKumpul && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#41474f] mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#F4A261]/12 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[12px] text-[#F4A261]">directions_boat</span>
                            </span>
                            {jarakKm(titikKumpul, [Number(p.latitude), Number(p.longitude)])} km dari titik kumpul
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-[#41474f] mb-2">
                          <span className="w-5 h-5 rounded-full bg-[#2a7f62]/12 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[12px] text-[#2a7f62]">payments</span>
                          </span>
                          Mulai {formatRupiah(hargaMulaiPerOrang(p))}/orang
                        </div>

                        {Array.isArray(p.fasilitas) && p.fasilitas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {p.fasilitas.slice(0, 4).map((f) => (
                              <span
                                key={f}
                                title={labelFasilitas(f)}
                                className="w-6 h-6 rounded-md bg-[#eceef1] flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[13px] text-[#41474f]">
                                  {ikonFasilitas(f)}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-1.5 pt-2.5 border-t border-[#eceef1]">
                          <Link
                            to={`/pulau/${p.id}`}
                            className="flex-1 text-center border border-[#c1c7d0] text-[#004873] text-[11px] font-semibold py-2 rounded-lg active:scale-[0.97] transition-transform"
                          >
                            Detail
                          </Link>
                          <Link
                            to={`/reservasi/baru?pulau_id=${p.id}`}
                            className="flex-1 text-center bg-[#004873] text-white text-[11px] font-semibold py-2 rounded-lg active:scale-[0.97] transition-transform"
                          >
                            Reservasi
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </Overlay>

          {/* Batas wilayah hasil digitasi Pengelola Pulau di atas citra satelit. */}
          <Overlay checked name="Batas Wilayah Pulau">
            <LayerGroup>
              {pulauList
                .filter((p) => Array.isArray(p.batas_koordinat) && p.batas_koordinat.length >= 3)
                .map((p) => (
                  <Polygon
                    key={`batas-${p.id}`}
                    positions={p.batas_koordinat}
                    pathOptions={{ color: '#F4A261', weight: 2, fillColor: '#F4A261', fillOpacity: 0.18 }}
                  >
                    <Tooltip sticky>
                      {p.nama} &mdash; {p.luas != null ? `${Number(p.luas)} ha` : 'luas belum diisi'}
                    </Tooltip>
                  </Polygon>
                ))}
            </LayerGroup>
          </Overlay>

          <Overlay checked name="Titik Kumpul">
            <LayerGroup>
              {pengantarList.filter((u) => u.latitude != null).map((u) => (
                <Marker key={`pengantar-${u.id}`} position={[Number(u.latitude), Number(u.longitude)]} icon={pengantarIcon}>
                  <Popup minWidth={190} className={u.foto ? 'pulau-popup' : ''}>
                    <div>
                      {u.foto && <img src={u.foto} alt={u.name} className="w-full h-24 object-cover" />}
                      <div className={u.foto ? 'px-3.5 py-3' : ''}>
                        <p className="font-bold text-sm text-[#1e1b16] mb-0.5">{u.name}</p>
                        <p className="text-[11px] text-[#41474f] mb-2.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          Pengantar Pulau &mdash; {u.no_hp}
                        </p>
                        <button
                          type="button"
                          onClick={cariLokasiSaya}
                          className="block w-full text-center bg-[#F4A261] text-white text-[11px] font-semibold py-1.5 rounded-lg"
                        >
                          Rute dari lokasi saya
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </Overlay>

          {/* Buffer: zona jangkauan penjemputan di sekitar titik kumpul. */}
          <Overlay checked name="Zona Penjemputan (500 m)">
            <LayerGroup>
              {pengantarList.filter((u) => u.latitude != null).map((u) => (
                <Circle
                  key={`zona-${u.id}`}
                  center={[Number(u.latitude), Number(u.longitude)]}
                  radius={RADIUS_ZONA_METER}
                  pathOptions={{ color: '#F4A261', weight: 1.5, dashArray: '5 5', fillColor: '#F4A261', fillOpacity: 0.08 }}
                />
              ))}
            </LayerGroup>
          </Overlay>

          {/* Peta tematik: besar lingkaran sebanding dengan jumlah wisatawan yang berkunjung. */}
          <Overlay name="Kepadatan Kunjungan">
            <LayerGroup>
              {pulauList.filter((p) => p.latitude != null).map((p) => {
                const jumlah = Number(p.jumlah_wisatawan) || 0;
                return (
                  <CircleMarker
                    key={`padat-${p.id}`}
                    center={[Number(p.latitude), Number(p.longitude)]}
                    radius={12 + 26 * (jumlah / kunjunganTertinggi)}
                    pathOptions={{ color: '#004873', weight: 1.5, fillColor: '#1E6091', fillOpacity: 0.45 }}
                  >
                    <Tooltip direction="top">
                      <span className="font-semibold">{p.nama}</span> &mdash; {jumlah} wisatawan
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          </Overlay>
        </LayersControl>

        {/* Jalur laut (garis lurus) dari titik kumpul ke pulau yang sedang dipilih. */}
        {titikKumpul && pulauDipilih && pulauDipilih.latitude != null && (
          <Polyline
            positions={[titikKumpul, [Number(pulauDipilih.latitude), Number(pulauDipilih.longitude)]]}
            pathOptions={{ color: '#F4A261', weight: 3, dashArray: '8 6' }}
          >
            <Tooltip sticky>
              Jalur laut &mdash; {jarakKm(titikKumpul, [Number(pulauDipilih.latitude), Number(pulauDipilih.longitude)])} km
            </Tooltip>
          </Polyline>
        )}

        {/* Jalur darat hasil penelusuran jaringan jalan. */}
        {ruteDarat && (
          <Polyline positions={ruteDarat.garis} pathOptions={{ color: '#1A73E8', weight: 5, opacity: 0.85 }}>
            <Tooltip sticky>
              Rute darat &mdash; {formatJarak(ruteDarat.jarakMeter)}, {formatDurasi(ruteDarat.durasiDetik)}
            </Tooltip>
          </Polyline>
        )}

        {lokasiSaya && (
          <Marker position={lokasiSaya} icon={lokasiSayaIcon}>
            <Popup>Posisi Anda saat ini</Popup>
          </Marker>
        )}

        <KoordinatKursor />
      </MapContainer>

      {/* ── Alat bantu peta ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1.5">
        <TombolPeta
          ikon="my_location"
          label="Lokasi Saya"
          onClick={cariLokasiSaya}
          aktif={Boolean(lokasiSaya)}
        />
        <TombolPeta
          ikon="route"
          label="Rute dari Kota Padang"
          onClick={() => gambarRuteDarat(PUSAT_KOTA_PADANG)}
          sibuk={statusRute === 'mencari'}
          aktif={Boolean(ruteDarat)}
        />
        <TombolPeta
          ikon={layarPenuh ? 'fullscreen_exit' : 'fullscreen'}
          label={layarPenuh ? 'Keluar' : 'Layar Penuh'}
          onClick={alihkanLayarPenuh}
        />
      </div>

      {/* ── Panel hasil analisis ── */}
      {adaPanelInfo && (
        <div className="absolute top-16 left-3 z-[1000] w-[236px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2.5 space-y-2">
          {statusRute === 'mencari' && (
            <p className="text-[11px] text-[#41474f]">Menelusuri jaringan jalan...</p>
          )}

          {ruteDarat && statusRute === 'siap' && (
            <div>
              <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1">Rute darat ke titik kumpul</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[12px] font-bold text-[#004873]">
                  <span className="material-symbols-outlined text-[14px]">straighten</span>
                  {formatJarak(ruteDarat.jarakMeter)}
                </span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-[#004873]">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {formatDurasi(ruteDarat.durasiDetik)}
                </span>
              </div>
            </div>
          )}

          {pulauTerdekat && (
            <div className="pt-2 border-t border-[#eceef1]">
              <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1">Pulau terdekat dari Anda</p>
              <p className="text-[12px] font-semibold text-[#1e1b16]">
                {pulauTerdekat.item.nama}
                <span className="font-normal text-[#41474f]"> &mdash; {pulauTerdekat.jarak.toFixed(1)} km</span>
              </p>
            </div>
          )}

          {(pesanLokasi || pesanRute) && (
            <p className="text-[10.5px] leading-snug text-[#8e4e14]">{pesanLokasi || pesanRute}</p>
          )}
        </div>
      )}

      {/* ── Legenda ── */}
      <div className="absolute bottom-10 left-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2.5">
        <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Legenda</p>
        <div className="space-y-1.5">
          <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004873] inline-block shrink-0" /> Pulau
          </span>
          <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261] inline-block shrink-0" /> Titik Kumpul
          </span>
          <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
            <span className="w-4 h-0.5 bg-[#1A73E8] inline-block shrink-0" /> Rute darat
          </span>
          <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#F4A261] inline-block shrink-0" /> Jalur laut
          </span>
        </div>
      </div>
    </div>
  );
}
