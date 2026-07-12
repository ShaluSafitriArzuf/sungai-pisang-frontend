import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PetaInteraktif from '../../components/PetaInteraktif';
import BottomNav from '../../components/BottomNav';

export default function Peta() {
  const [data, setData] = useState({ pulau: [], pengantar_pulau: [] });

  useEffect(() => {
    api.get('/peta').then((res) => setData(res.data));
  }, []);

  return (
    <div className="max-w-md mx-auto pb-20 h-screen flex flex-col">
      <div className="bg-white px-4 py-3.5 shadow-sm flex items-center gap-3 z-10">
        <span className="w-10 h-10 rounded-full bg-[#004873] flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-[20px]">map</span>
        </span>
        <div className="min-w-0">
          <p className="font-bold text-on-surface leading-tight">Peta Interaktif</p>
          <p className="text-xs text-on-surface-variant truncate">Semua pulau &amp; lokasi Pengantar Pulau</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <PetaInteraktif pulauList={data.pulau} pengantarList={data.pengantar_pulau} />

        {/* Legenda — kartu melayang di pojok, tidak mengganggu tombol zoom bawaan Leaflet */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2.5">
          <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Legenda</p>
          <div className="space-y-1.5">
            <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004873] inline-block shrink-0" /> Pulau
            </span>
            <span className="flex items-center gap-2 text-[11px] text-on-surface font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261] inline-block shrink-0" /> Pengantar Pulau
            </span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
