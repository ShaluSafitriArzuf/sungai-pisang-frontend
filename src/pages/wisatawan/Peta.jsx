import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import PetaInteraktif from '../../components/PetaInteraktif';
import BottomNav from '../../components/BottomNav';
import { FASILITAS_OPSI } from '../../utils/tampilanFasilitas';
import { fotoPulauFallback } from '../../utils/fotoPulau';
import { formatRupiah, hargaMulaiPerOrang } from '../../utils/harga';
import { jarakKm } from '../../utils/jarak';

export default function Peta() {
  const [data, setData] = useState({ pulau: [], pengantar_pulau: [] });
  const [kataKunci, setKataKunci] = useState('');
  const [fasilitasDipilih, setFasilitasDipilih] = useState([]);
  const [fokus, setFokus] = useState(null);
  const [panelTerbuka, setPanelTerbuka] = useState(false);

  useEffect(() => {
    api.get('/peta').then((res) => setData(res.data));
  }, []);

  const titikKumpul = useMemo(() => {
    const p = data.pengantar_pulau[0];
    return p && p.latitude != null ? [Number(p.latitude), Number(p.longitude)] : null;
  }, [data.pengantar_pulau]);

  // Penyaringan atribut yang langsung berpengaruh pada tampilan keruangan:
  // penanda pulau yang tidak lolos saringan ikut hilang dari peta.
  const pulauTersaring = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return data.pulau.filter((p) => {
      const cocokNama = !kunci || (p.nama || '').toLowerCase().includes(kunci);
      const punyaFasilitas = fasilitasDipilih.every((f) => (p.fasilitas || []).includes(f));
      return cocokNama && punyaFasilitas;
    });
  }, [data.pulau, kataKunci, fasilitasDipilih]);

  // Hanya fasilitas yang benar-benar dimiliki minimal satu pulau yang ditawarkan
  // sebagai saringan, supaya tidak ada tombol yang selalu menghasilkan nol.
  const fasilitasTersedia = useMemo(() => {
    const ada = new Set();
    data.pulau.forEach((p) => (p.fasilitas || []).forEach((f) => ada.add(f)));
    return FASILITAS_OPSI.filter((f) => ada.has(f.key));
  }, [data.pulau]);

  const alihkanFasilitas = (key) =>
    setFasilitasDipilih((lama) => (lama.includes(key) ? lama.filter((k) => k !== key) : [...lama, key]));

  const terbangKe = (p) => {
    if (p.latitude == null) return;
    setFokus({ lat: Number(p.latitude), lng: Number(p.longitude), zoom: 15, nonce: Date.now() });
    setPanelTerbuka(false);
  };

  const adaSaringan = Boolean(kataKunci.trim()) || fasilitasDipilih.length > 0;

  return (
    <div className="wadah-lebar pb-20 md:pb-0 h-screen md:h-[calc(100vh-64px)] flex flex-col">
      {/* ── Kepala halaman ── */}
      <div className="bg-white px-4 md:px-6 py-3.5 md:py-5 shadow-sm flex items-center gap-3 z-20">
        <span className="w-10 h-10 rounded-full bg-[#004873] flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-[20px]">map</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-on-surface leading-tight md:text-xl">Peta Interaktif</p>
          <p className="text-xs text-on-surface-variant truncate">
            Sebaran pulau, batas wilayah, titik kumpul, dan rute darat menuju penjemputan
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelTerbuka((v) => !v)}
          className="md:hidden shrink-0 w-10 h-10 rounded-full border border-[#c1c7d0] flex items-center justify-center text-[#004873]"
          aria-label="Daftar pulau"
        >
          <span className="material-symbols-outlined text-[20px]">{panelTerbuka ? 'close' : 'list'}</span>
        </button>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* ── Panel daftar & penyaringan ── */}
        <aside
          className={`${
            panelTerbuka ? 'flex' : 'hidden'
          } md:flex absolute md:relative inset-0 md:inset-auto z-[1100] md:z-auto w-full md:w-[290px] shrink-0 bg-white md:border-r border-[#eceef1] flex-col`}
        >
          <div className="p-3 border-b border-[#eceef1] space-y-2.5">
            <div className="relative">
              <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                placeholder="Cari nama pulau..."
                className="w-full border border-[#c1c7d0] rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#004873]/30"
              />
            </div>

            {fasilitasTersedia.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Saring menurut fasilitas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fasilitasTersedia.map((f) => {
                    const aktif = fasilitasDipilih.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => alihkanFasilitas(f.key)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10.5px] font-semibold border transition-colors ${
                          aktif
                            ? 'bg-[#004873] border-[#004873] text-white'
                            : 'bg-white border-[#c1c7d0] text-[#41474f]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">{f.icon}</span>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-on-surface-variant">
                Menampilkan <span className="font-bold text-[#004873]">{pulauTersaring.length}</span> dari{' '}
                {data.pulau.length} pulau
              </p>
              {adaSaringan && (
                <button
                  type="button"
                  onClick={() => {
                    setKataKunci('');
                    setFasilitasDipilih([]);
                  }}
                  className="text-[11px] font-semibold text-[#8e4e14]"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#eceef1]">
            {pulauTersaring.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => terbangKe(p)}
                className="w-full text-left px-3 py-3 hover:bg-[#f4ede3] transition-colors flex gap-3"
              >
                <img
                  src={p.foto_utama || fotoPulauFallback(p.nama)}
                  alt={p.nama}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#eceef1]"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[13px] text-on-surface truncate">{p.nama}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {p.luas != null ? `${Number(p.luas)} ha` : 'Luas belum diisi'}
                    {titikKumpul && p.latitude != null && (
                      <> &middot; {jarakKm(titikKumpul, [Number(p.latitude), Number(p.longitude)])} km</>
                    )}
                  </p>
                  <p className="text-[11px] font-semibold text-[#2a7f62] mt-0.5">
                    Mulai {formatRupiah(hargaMulaiPerOrang(p))}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline self-center shrink-0">
                  my_location
                </span>
              </button>
            ))}

            {pulauTersaring.length === 0 && (
              <div className="px-4 py-10 text-center">
                <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
                <p className="text-[12px] text-on-surface-variant mt-2">
                  Tidak ada pulau yang cocok dengan saringan ini.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Peta ── */}
        <div className="flex-1 relative min-w-0">
          <PetaInteraktif
            pulauList={pulauTersaring}
            pengantarList={data.pengantar_pulau}
            fokus={fokus}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
