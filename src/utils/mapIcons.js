import L from 'leaflet';

// Ikon pin bulat khas Material dipakai bareng di Peta Interaktif & mini map Detail Pulau,
// biar konsisten dan ga perlu didefinisikan ulang di tiap halaman.
export function pinIcon(bg, iconName) {
  return L.divIcon({
    html: `<div style="background:${bg};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
             display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;">
             <span class="material-symbols-outlined" style="transform:rotate(45deg);color:white;font-size:18px;">${iconName}</span>
           </div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

export const pulauIcon = pinIcon('#004873', 'landscape');
export const pengantarIcon = pinIcon('#F4A261', 'directions_boat');

// Titik biru posisi pengguna, mengikuti kelaziman aplikasi peta pada umumnya.
export const lokasiSayaIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#1A73E8;border:3px solid white;
           box-shadow:0 0 0 7px rgba(26,115,232,0.22), 0 1px 4px rgba(0,0,0,0.35);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -14],
});
