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
import { formatRupiah, hargaMulaiPerOrang, hargaMenginapPerOrang, akomodasiTermurah } from '../../utils/harga';
import { FASILITAS_AKOMODASI_OPSI, labelFasilitasAkomodasi, ikonFasilitasAkomodasi } from '../../utils/tampilanFasilitasAkomodasi';
import { useToast } from '../../context/ToastContext';
import { waLink } from '../../utils/kontak';

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
  const { showToast } = useToast();
  const [pulau, setPulau] = useState(null);
  const [pengantarUtama, setPengantarUtama] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [akomodasiLightbox, setAkomodasiLightbox] = useState(null); // { nama, fotos: [...], index }
  const [tampilSemuaFasilitas, setTampilSemuaFasilitas] = useState(false);
  const [tampilSemuaUlasan, setTampilSemuaUlasan] = useState(false);
  // Fasilitas pada tiap kartu akomodasi dibatasi 3 chip dulu. Sebelumnya semua fasilitas
  // ditampilkan sekaligus, dan karena kartunya sempit hampir tiap chip turun ke barisnya
  // sendiri -- unit dengan 7 fasilitas bikin kartunya memanjang jauh ke bawah sampai harga
  // (informasi yang paling dicari) terdorong keluar layar. Disimpan per id akomodasi supaya
  // membuka satu kartu tidak ikut membuka kartu lain di sebelahnya.
  const [fasilitasTerbuka, setFasilitasTerbuka] = useState({});
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
      showToast('Tautan halaman disalin.', 2000, 'sukses');
    }
  }

  // "Mulai dari" = biaya minimum per orang untuk berkunjung (kapal + tiket masuk One Day
  // Trip). Aturannya ada di utils/harga.js supaya sama dengan yang dipakai kartu Beranda.
  const hargaMulai = hargaMulaiPerOrang(pulau);
  const hargaMenginap = hargaMenginapPerOrang(pulau);
  const termurahAkomodasi = akomodasiTermurah(pulau);

  return (
    <div className="wadah-lebar pb-24 md:pb-24 bg-background min-h-screen">
      {/* Foto + tombol back/share mengambang */}
      <div className="relative h-52 md:h-80 lg:h-96 md:rounded-b-3xl md:overflow-hidden">
        <img
          src={pulau.foto_utama || fotoPulauFallback(pulau.nama)}
          alt={pulau.nama}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <button
            onClick={bagikan}
            className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 -mt-6 md:-mt-10 relative">
        {/* Kartu judul + rating + badge */}
        <div className="bg-white rounded-2xl shadow-md p-5 md:p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl md:text-3xl font-bold text-on-surface">{pulau.nama}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 md:mt-5">
          <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">straighten</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">Luas Wilayah</p>
              {/* pulau.luas dari API berupa string desimal (mis. "10.00") karena kolomnya
                  bertipe decimal -- dibungkus Number() dulu biar angka nol di belakang koma
                  yang ga perlu (10.00 -> 10) ga ikut tampil ke wisatawan. */}
              <p className="text-sm font-semibold text-on-surface">
                {pulau.luas != null ? Number(pulau.luas) : '-'} Hektare
              </p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">Genset</p>
              {/* Sebagian pulau genset-nya 24 jam penuh, sebagian lagi cuma dinyalain
                  berjadwal (mis. pas ramai) -- genset_24_jam yang nentuin teksnya, bukan
                  cuma nampilin jam_operasional_genset mentah-mentah kayak sebelumnya. */}
              <p className="text-sm font-semibold text-on-surface">
                {pulau.genset_24_jam ? '24 Jam' : (pulau.jam_operasional_genset || '-')}
              </p>
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
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      items: [{ foto: pengantarUtama.foto, tipe: 'foto' }],
                      index: 0,
                      judul: `Titik kumpul / rumah ${pengantarUtama.name}`,
                    })
                  }
                  className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden group"
                  aria-label="Perbesar foto titik kumpul Pengantar Pulau"
                >
                  <img
                    src={pengantarUtama.foto}
                    alt="Titik kumpul Pengantar Pulau"
                    className="w-full h-full object-cover"
                  />
                  {/* Penanda bahwa foto bisa diperbesar — disamakan dengan foto akomodasi
                      supaya perilakunya konsisten di seluruh halaman. */}
                  <span className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[18px] drop-shadow">
                      zoom_in
                    </span>
                  </span>
                </button>
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
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${pengantarUtama.latitude},${pengantarUtama.longitude}&destination=${pulau.latitude},${pulau.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">route</span>
                    Lihat Rute di Google Maps
                  </a>

                  {pengantarUtama.no_hp && (
                    <a
                      href={waLink(pengantarUtama.no_hp)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      Tanya Jadwal Jemputan
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Mini peta lokasi — pratinjau langsung di halaman, sesuai tema "pemetaan lokasi".
                Interaksi peta (drag/zoom) dimatikan supaya klik di mana pun langsung membuka
                halaman Peta Interaktif yang lengkap, bukan malah geser-geser peta kecil ini. */}
            <button
              type="button"
              onClick={() => navigate('/peta')}
              className="relative mt-3 w-full rounded-lg overflow-hidden border border-[#eceef1] block"
              style={{ height: 140 }}
            >
              <div className="absolute inset-0 z-[500]" />
              <MapContainer
                center={[
                  (Number(pulau.latitude) + Number(pengantarUtama.latitude)) / 2,
                  (Number(pulau.longitude) + Number(pengantarUtama.longitude)) / 2,
                ]}
                zoom={12}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}
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

              <span className="absolute bottom-2 right-2 z-[600] inline-flex items-center gap-1 bg-white/95 text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full shadow">
                <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                Lihat Peta Lengkap
              </span>
            </button>
          </div>
        )}

        {/* Tentang Pulau */}
        <div className="mt-5">
          <p className="font-bold text-on-surface mb-2">Tentang Pulau</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{pulau.deskripsi}</p>
        </div>

        {/* Rincian Biaya — ditampilkan terbuka supaya wisatawan tahu persis komponen biaya
            sebelum masuk form reservasi, tidak kaget saat melihat total di halaman berikutnya. */}
        <div className="mt-5">
          <p className="font-bold text-on-surface mb-2">Rincian Biaya per Orang</p>
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">directions_boat</span>
                Kapal penyeberangan
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {formatRupiah(pulau.harga_penyeberangan)}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">confirmation_number</span>
                Tiket masuk — One Day Trip
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {formatRupiah(pulau.harga_tiket_masuk_one_day)}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">confirmation_number</span>
                Tiket masuk — Menginap
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {formatRupiah(pulau.harga_tiket_masuk_menginap)}
              </span>
            </div>

            <div className="px-4 py-3 border-t border-outline-variant bg-surface-container/60">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">One Day Trip</span>
                <span className="text-sm font-bold text-primary">{formatRupiah(hargaMulai)}/orang</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-on-surface">Menginap</span>
                <span className="text-sm font-bold text-primary">
                  {formatRupiah(hargaMenginap)}/orang
                  {termurahAkomodasi !== null && (
                    <span className="font-normal text-on-surface-variant"> + akomodasi</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fasilitas Pulau */}
        {pulau.fasilitas?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface mb-2">Fasilitas Pulau</p>
            {/* Dikunci maksimal 3 baris (6 item) kayak galeri -- sisanya baru muncul
                kalau tombol "Lihat semua" di bawah dipencet, ga langsung numpuk ke bawah. */}
            <div className="grid grid-cols-2 gap-2">
              {(tampilSemuaFasilitas ? pulau.fasilitas : pulau.fasilitas.slice(0, 6)).map((key) => {
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
            {pulau.fasilitas.length > 6 && (
              <button
                type="button"
                onClick={() => setTampilSemuaFasilitas((v) => !v)}
                className="mt-2 text-xs font-semibold text-primary flex items-center gap-1"
              >
                {tampilSemuaFasilitas ? 'Sembunyikan' : `Lihat ${pulau.fasilitas.length - 6} fasilitas lainnya`}
                <span className="material-symbols-outlined text-[16px]">
                  {tampilSemuaFasilitas ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Galeri Foto & Video */}
        {pulau.galeri_foto?.length > 0 && (
          <div className="mt-5">
            <p className="font-bold text-on-surface mb-2">Galeri Foto &amp; Video</p>
            {/* Dikunci maksimal 2 baris (6 thumbnail) walau foto makin banyak ditambah pengelola,
                supaya halaman ga makin panjang ke bawah -- sisanya tetap bisa dilihat lewat lightbox
                geser (swipe) setelah salah satu thumbnail dibuka. */}
            <div className="grid grid-cols-3 gap-1.5">
              {pulau.galeri_foto.slice(0, 6).map((g, i) => {
                const sisa = pulau.galeri_foto.length - 6;
                const isLebih = i === 5 && sisa > 0;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setLightbox({ items: pulau.galeri_foto, index: i })}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-container"
                  >
                    {g.tipe === 'video' ? (
                      <video src={g.foto} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={g.foto} alt={`Galeri ${pulau.nama} ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                    {g.tipe === 'video' && !isLebih && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="material-symbols-outlined text-white text-[26px] drop-shadow">play_circle</span>
                      </span>
                    )}
                    {isLebih && (
                      <span className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">+{sisa} lagi</span>
                      </span>
                    )}
                  </button>
                );
              })}
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
            <div className="space-y-2">
              {pulau.wahana_kegiatan.map((w) => {
                const { icon, warna } = ikonWahana(w.nama);
                return (
                  <div key={w.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                    {w.foto ? (
                      <img src={w.foto} alt={w.nama} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${warna}`}>
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>
                    )}
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
                // Lebar kartu dinaikkan dari 190px ke 215px: pada 190px hampir tiap chip
                // fasilitas turun ke barisnya sendiri, sedangkan di 215px dua chip pendek
                // bisa berdampingan sehingga kartunya jauh lebih ringkas ke bawah.
                return (
                  <div key={a.id} className="min-w-[215px] max-w-[215px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
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

                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-sm font-semibold text-on-surface leading-tight">{a.nama}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-on-surface-variant capitalize">{a.tipe}</span>
                        {a.kapasitas && (
                          <span className="flex items-center gap-0.5 text-[11px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-[13px]">group</span>
                            {a.kapasitas} orang
                          </span>
                        )}
                      </div>

                      {a.tiket_termasuk && (
                        <p className="flex items-center gap-1 text-[10px] font-semibold text-green-700 mt-1.5">
                          <span className="material-symbols-outlined text-[13px]">confirmation_number</span>
                          Sudah termasuk tiket masuk pulau
                        </p>
                      )}

                      {/* Fasilitas unit — pembeda utama antar akomodasi (ber-AC, berkipas,
                          atau pondok terbuka). Dibatasi 3 chip dulu supaya tinggi kartunya
                          wajar; sisanya dibuka lewat chip "+N lainnya" agar informasinya
                          tetap bisa diakses tanpa memaksa wisatawan menggulir jauh. */}
                      {a.fasilitas?.length > 0 && (() => {
                        const terbuka = !!fasilitasTerbuka[a.id];
                        const tampil = terbuka ? a.fasilitas : a.fasilitas.slice(0, 3);
                        const sisa = a.fasilitas.length - tampil.length;
                        return (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tampil.map((f) => (
                              <span
                                key={f}
                                className="flex items-center gap-0.5 bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-md"
                              >
                                <span className="material-symbols-outlined text-[12px] text-primary">
                                  {ikonFasilitasAkomodasi(f)}
                                </span>
                                {labelFasilitasAkomodasi(f)}
                              </span>
                            ))}

                            {(sisa > 0 || terbuka) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFasilitasTerbuka((prev) => ({ ...prev, [a.id]: !prev[a.id] }))
                                }
                                className="flex items-center gap-0.5 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10"
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {terbuka ? 'expand_less' : 'expand_more'}
                                </span>
                                {terbuka ? 'Sembunyikan' : `+${sisa} lainnya`}
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      <div className="mt-auto pt-2">
                        <p className="text-sm font-bold text-primary leading-tight">
                          {formatRupiah(a.harga_per_malam)}
                          <span className="text-[11px] font-normal text-on-surface-variant">/malam</span>
                        </p>
                      </div>
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
            {(tampilSemuaUlasan ? pulau.ulasan : pulau.ulasan?.slice(0, 3))?.map((u) => (
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
            {/* BUG: tombol ini sebelumnya tidak punya onClick sama sekali -- keliatan bisa
                diklik (ada label "Lihat Semua N Ulasan") tapi tidak melakukan apa-apa saat
                ditekan. Sekarang expand/collapse in-place, pola yang sama dengan "Lihat N
                fasilitas lainnya" di atas. */}
            {pulau.ulasan?.length > 3 && (
              <button
                type="button"
                onClick={() => setTampilSemuaUlasan((v) => !v)}
                className="w-full flex items-center justify-center gap-1 text-xs text-primary font-semibold py-2"
              >
                {tampilSemuaUlasan ? 'Sembunyikan' : `Lihat Semua ${pulau.ulasan.length} Ulasan`}
                <span className="material-symbols-outlined text-[16px]">
                  {tampilSemuaUlasan ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bar bawah sticky */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 wadah-lebar px-4 md:px-6 pb-3 md:pb-4 pt-2 md:pt-4 bg-background/95 backdrop-blur-sm border-t border-outline-variant flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] text-on-surface-variant leading-none">Mulai dari</p>
          <p className="text-lg font-bold text-on-surface leading-tight">
            {formatRupiah(hargaMulai)}
            <span className="text-xs font-normal text-on-surface-variant">/orang</span>
          </p>
          <p className="text-[10px] text-on-surface-variant leading-none">
            Kapal + tiket masuk (One Day Trip)
          </p>
        </div>
        <button
          className="bg-[#F4A261] text-white text-sm font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
          onClick={() => navigate(`/reservasi/baru?pulau_id=${pulau.id}`)}
        >
          Reservasi Sekarang
        </button>
      </div>

      {/* Lightbox galeri -- geser (swipe) atau panah kiri/kanan buat pindah foto/video,
          ga perlu tutup-buka lagi kayak sebelumnya. Dipakai sama untuk galeri pulau maupun
          foto titik kumpul Pengantar Pulau (yang cuma 1 item). */}
      {lightbox && (() => {
        const total = lightbox.items.length;
        const current = lightbox.items[lightbox.index];
        return (
          <div
            className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) < 40) return;
              setLightbox((lb) => {
                if (!lb) return lb;
                const arah = dx < 0 ? 1 : -1;
                const tot = lb.items.length;
                return { ...lb, index: (lb.index + arah + tot) % tot };
              });
            }}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {total > 1 && (
              <p className="absolute top-4 left-4 text-white text-xs font-semibold bg-white/15 rounded-full px-2.5 py-1">
                {lightbox.index + 1} / {total}
              </p>
            )}

            <div className="relative w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {total > 1 && (
                <button
                  type="button"
                  onClick={() => setLightbox((lb) => ({ ...lb, index: (lb.index - 1 + lb.items.length) % lb.items.length }))}
                  className="absolute left-1 z-10 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              )}

              {current.tipe === 'video' ? (
                <video
                  key={lightbox.index}
                  src={current.foto}
                  controls
                  autoPlay
                  className="max-w-full max-h-[75vh] rounded-xl"
                />
              ) : (
                <img
                  src={current.foto}
                  alt={lightbox.judul || `Galeri ${pulau.nama}`}
                  className="max-w-full max-h-[75vh] rounded-xl object-contain"
                />
              )}

              {total > 1 && (
                <button
                  type="button"
                  onClick={() => setLightbox((lb) => ({ ...lb, index: (lb.index + 1) % lb.items.length }))}
                  className="absolute right-1 z-10 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              )}
            </div>

            {lightbox.judul && (
              <p className="absolute bottom-6 left-0 right-0 text-center text-white text-sm px-6">
                {lightbox.judul}
              </p>
            )}
          </div>
        );
      })()}

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
