import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import { fotoPulauFallback } from '../../utils/fotoPulau';
import { ikonWahana, fotoAkomodasiFallback } from '../../utils/tampilanKegiatan';
import { FASILITAS_OPSI } from '../../utils/tampilanFasilitas';
import { jarakKm } from '../../utils/jarak';
import { pulauIcon, pengantarIcon } from '../../utils/mapIcons';

function inisial(nama = '') {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

const WARNA_AVATAR = [
  'bg-[#004873]/10 text-[#004873]',
  'bg-[#F4A261]/15 text-[#F4A261]',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-600',
];
function warnaAvatar(nama = '') {
  const kode = nama.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return WARNA_AVATAR[kode % WARNA_AVATAR.length];
}

function Bintang({ rating, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-yellow-500"
          style={{ fontSize: size, fontVariationSettings: `'FILL' ${i <= rating ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </span>
  );
}

function waktuRelatif(tanggal) {
  const detik = Math.floor((Date.now() - new Date(tanggal).getTime()) / 1000);
  if (detik < 3600) return Math.max(1, Math.floor(detik / 60)) + ' menit lalu';
  if (detik < 86400) return Math.floor(detik / 3600) + ' jam lalu';
  if (detik < 604800) return Math.floor(detik / 86400) + ' hari lalu';
  return Math.floor(detik / 604800) + ' minggu lalu';
}

export default function DetailPulau() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pulau, setPulau] = useState(null);
  const [pengantarUtama, setPengantarUtama] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [akomodasiLightbox, setAkomodasiLightbox] = useState(null); // { nama, fotos: [...], index }
  const touchX = useRef(null);

  useEffect(() => {
    api.get(`/pulau/${id}`).then((res) => setPulau(res.data));
    // Dipakai buat hitung jarak & rute dari Pengantar Pulau — data sama yang dipakai Peta Interaktif.
    api.get('/peta').then((res) => setPengantarUtama(res.data.pengantar_pulau?.[0] || null)).catch(() => {});
  }, [id]);

  if (!pulau) return <p className="p-6 text-center">Memuat...</p>;

  async function bagikan() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: pulau.nama, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      alert('Tautan halaman disalin.');
    }
  }

  const hargaMulai = pulau.akomodasi?.length
    ? Math.min(...pulau.akomodasi.map((a) => Number(a.harga_per_malam)))
    : Number(pulau.harga_tiket_masuk);

  return (
    <div className="max-w-md mx-auto pb-24 bg-background min-h-screen">
      {/* Foto + tombol back/share mengambang */}
      <div className="relative h-52">
        <img
          src={pulau.foto_utama || fotoPulauFallback(pulau.nama)}
          alt={pulau.nama}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={bagikan}
            className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 relative">
        {/* Kartu judul + rating + badge */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-bold text-on-surface">{pulau.nama}</p>
              <p className="flex items-center gap-1 text-sm mt-1">
                <span className="material-symbols-outlined text-[16px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-semibold text-on-surface">{pulau.rating_rata_rata ?? 0}</span>
                <span className="text-on-surface-variant">({pulau.ulasan?.length ?? 0} ulasan)</span>
              </p>
            </div>
            {pulau.badge && (
              <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                {pulau.badge}
              </span>
            )}
          </div>
        </div>

        {/* Info ringkas */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">straighten</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">Luas Wilayah</p>
              <p className="text-sm font-semibold text-on-surface">{pulau.luas ?? '-'} Hektar</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">Genset</p>
              <p className="text-sm font-semibold text-on-surface">{pulau.jam_operasional_genset ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Akses & Transportasi */}
        {pengantarUtama && pulau.latitude && pulau.longitude && (
          <div className="mt-3 bg-white rounded-xl shadow-sm p-4">
            <p className="font-semibold text-on-surface text-sm mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-primary">directions_boat</span>
              Akses &amp; Transportasi
            </p>

            <div className="flex gap-3">
              {pengantarUtama.foto && (
                <img
                  src={pengantarUtama.foto}
                  alt="Titik kumpul Pengantar Pulau"
                  className="w-16 h-16 shrink-0 object-cover rounded-lg"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant mb-2">
                  Berangkat dari titik kumpul {pengantarUtama.name}, sekitar{' '}
                  <span className="font-semibold text-on-surface">
                    {jarakKm(
                      [Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)],
                      [Number(pulau.latitude), Number(pulau.longitude)]
                    )} km
                  </span>{' '}
                  lewat jalur laut.
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${pengantarUtama.latitude},${pengantarUtama.longitude}&destination=${pulau.latitude},${pulau.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">route</span>
                  Lihat Rute di Google Maps
                </a>
              </div>
            </div>

            {/* Mini peta lokasi — pratinjau langsung di halaman, sesuai tema "pemetaan lokasi" */}
            <div className="mt-3 rounded-lg overflow-hidden border border-[#eceef1]" style={{ height: 140 }}>
              <MapContainer
                center={[
                  (Number(pulau.latitude) + Number(pengantarUtama.latitude)) / 2,
                  (Number(pulau.longitude) + Number(pengantarUtama.longitude)) / 2,
                ]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <Marker position={[Number(pulau.latitude), Number(pulau.longitude)]} icon={pulauIcon} />
                <Marker position={[Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)]} icon={pengantarIcon} />
                <Polyline
                  positions={[
                    [Number(pengantarUtama.latitude), Number(pengantarUtama.longitude)],
                    [Number(pulau.latitude), Number(pulau.longitude)],
                  ]}
                  pathOptions={{ color: '#F4A261', weight: 3, dashArray: '8 6' }}
                />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tentang Pulau */}
        <div className="mt-5">
          <p className="font-bold text-on-surface mb-2">Tentang Pulau</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{pulau.deskripsi}</p>
        </div>

        {/* Fasilitas Pulau */}
        {pulau.fasilitas?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface mb-2">Fasilitas Pulau</p>
            <div className="grid grid-cols-2 gap-2">
              {pulau.fasilitas.map((key) => {
                const f = FASILITAS_OPSI.find((opt) => opt.key === key);
                return (
                  <div key={key} className="bg-white rounded-xl shadow-sm p-2.5 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">{f?.icon || 'check_circle'}</span>
                    </span>
                    <p className="text-xs font-medium text-on-surface">{f?.label || key}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Galeri Foto & Video */}
        {pulau.galeri_foto?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface mb-2">Galeri Foto &amp; Video</p>
            <div className="grid grid-cols-3 gap-1.5">
              {pulau.galeri_foto.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setLightbox(g)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-surface-container"
                >
                  {g.tipe === 'video' ? (
                    <>
                      <video src={g.foto} className="w-full h-full object-cover" muted playsInline />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="material-symbols-outlined text-white text-[26px] drop-shadow">play_circle</span>
                      </span>
                    </>
                  ) : (
                    <img src={g.foto} alt={`Galeri ${pulau.nama} ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tata Tertib */}
        {pulau.regulasi && (
          <details className="bg-white rounded-xl shadow-sm mt-4 p-4 text-sm group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between text-on-surface list-none">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">gavel</span>
                Tata Tertib &amp; Regulasi
              </span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <p className="mt-2 text-on-surface-variant">{pulau.regulasi}</p>
          </details>
        )}

        {/* Wahana & Aktivitas */}
        {pulau.wahana_kegiatan?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface">Wahana &amp; Aktivitas</p>
            <p className="text-[11px] text-on-surface-variant mb-2">
              Daftar aktivitas yang ada di pulau ini — sebagian gratis, sebagian dibayar langsung di lokasi.
            </p>
            <div className="space-y-2">
              {pulau.wahana_kegiatan.map((w) => {
                const { icon, warna } = ikonWahana(w.nama);
                return (
                  <div key={w.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${warna}`}>
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-on-surface">{w.nama}</p>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            w.berbayar_lokasi ? 'bg-[#F4A261]/15 text-[#F4A261]' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {w.berbayar_lokasi ? 'Bayar di Lokasi' : 'Gratis'}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{w.deskripsi || 'Bisa dinikmati langsung di pulau ini'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Akomodasi */}
        {pulau.akomodasi?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface mb-2">Akomodasi Tersedia</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pulau.akomodasi.map((a, i) => {
                const fotos = [a.foto || fotoAkomodasiFallback(a.tipe), ...(a.foto_tambahan?.map((f) => f.foto) || [])];
                return (
                  <div key={a.id} className="min-w-[160px] bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAkomodasiLightbox({ nama: a.nama, fotos, index: 0 })}
                      className="relative h-24 w-full block"
                    >
                      <img src={fotos[0]} alt={a.nama} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-[#F4A261] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Best Seller
                        </span>
                      )}
                      {fotos.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">photo_library</span>
                          {fotos.length}
                        </span>
                      )}
                    </button>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-on-surface">{a.nama}</p>
                      <p className="text-[11px] text-on-surface-variant capitalize">{a.tipe}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        Rp{Number(a.harga_per_malam).toLocaleString('id-ID')}/malam
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ulasan */}
        <div className="mt-5">
          <p className="font-bold text-on-surface mb-2">Ulasan Pengunjung</p>

          {pulau.ulasan?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-3 flex items-center gap-4">
              <div className="text-center shrink-0">
                <p className="text-3xl font-bold text-on-surface leading-none">{pulau.rating_rata_rata ?? 0}</p>
                <Bintang rating={Math.round(pulau.rating_rata_rata ?? 0)} size={12} />
                <p className="text-[10px] text-on-surface-variant mt-1">{pulau.ulasan.length} ulasan</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((bintang) => {
                  const jumlah = pulau.ulasan.filter((u) => u.rating === bintang).length;
                  const persen = (jumlah / pulau.ulasan.length) * 100;
                  return (
                    <div key={bintang} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-on-surface-variant w-2.5">{bintang}</span>
                      <span className="material-symbols-outlined text-[11px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${persen}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {pulau.ulasan?.slice(0, 3).map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${warnaAvatar(u.wisatawan?.name)}`}>
                    {inisial(u.wisatawan?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-on-surface truncate">{u.wisatawan?.name}</p>
                      <Bintang rating={u.rating} size={13} />
                    </div>
                    <p className="text-[10px] text-on-surface-variant">{waktuRelatif(u.created_at)}</p>
                    <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                      <span className="text-outline">&ldquo;</span>{u.komentar}<span className="text-outline">&rdquo;</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!pulau.ulasan || pulau.ulasan.length === 0) && (
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <span className="material-symbols-outlined text-[28px] text-outline">rate_review</span>
                <p className="text-sm text-on-surface-variant mt-1">Belum ada ulasan untuk pulau ini.</p>
              </div>
            )}
            {pulau.ulasan?.length > 3 && (
              <button type="button" className="w-full text-xs text-primary font-semibold py-2">
                Lihat Semua {pulau.ulasan.length} Ulasan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bar bawah sticky */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-3 pt-2 bg-background/95 backdrop-blur-sm border-t border-outline-variant flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-on-surface-variant">Mulai dari</p>
          <p className="text-lg font-bold text-on-surface">
            Rp{hargaMulai.toLocaleString('id-ID')}<span className="text-xs font-normal">/pax</span>
          </p>
        </div>
        <button
          className="bg-[#F4A261] text-white text-sm font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
          onClick={() => navigate(`/reservasi/baru?pulau_id=${pulau.id}`)}
        >
          Reservasi Sekarang
        </button>
      </div>

      {/* Lightbox galeri */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          {lightbox.tipe === 'video' ? (
            <video
              src={lightbox.foto}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.foto}
              alt="Galeri"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Lightbox carousel foto akomodasi (bisa geser) */}
      {akomodasiLightbox && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setAkomodasiLightbox(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) < 40) return;
            setAkomodasiLightbox((lb) => {
              if (!lb) return lb;
              const arah = dx < 0 ? 1 : -1;
              const total = lb.fotos.length;
              return { ...lb, index: (lb.index + arah + total) % total };
            });
          }}
        >
          <button
            type="button"
            onClick={() => setAkomodasiLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <p className="absolute top-4 left-4 text-white text-sm font-semibold">{akomodasiLightbox.nama}</p>

          <div className="relative w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {akomodasiLightbox.fotos.length > 1 && (
              <button
                type="button"
                onClick={() => setAkomodasiLightbox((lb) => ({ ...lb, index: (lb.index - 1 + lb.fotos.length) % lb.fotos.length }))}
                className="absolute left-1 z-10 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
            <img
              src={akomodasiLightbox.fotos[akomodasiLightbox.index]}
              alt={akomodasiLightbox.nama}
              className="max-w-full max-h-[70vh] rounded-xl object-contain"
            />
            {akomodasiLightbox.fotos.length > 1 && (
              <button
                type="button"
                onClick={() => setAkomodasiLightbox((lb) => ({ ...lb, index: (lb.index + 1) % lb.fotos.length }))}
                className="absolute right-1 z-10 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
          </div>

          {akomodasiLightbox.fotos.length > 1 && (
            <div className="flex gap-1.5 mt-4">
              {akomodasiLightbox.fotos.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === akomodasiLightbox.index ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
