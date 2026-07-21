import { NavLink } from 'react-router-dom';
import { useJumlahNotifBelumDibaca } from '../hooks/useJumlahNotifBelumDibaca';

const items = [
  { to: '/beranda', label: 'Beranda', icon: 'home' },
  { to: '/peta', label: 'Peta', icon: 'map' },
  { to: '/reservasi', label: 'Reservasi', icon: 'confirmation_number' },
  { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications' },
  { to: '/profil', label: 'Profil', icon: 'person' },
];

export default function BottomNav() {
  const belumDibaca = useJumlahNotifBelumDibaca();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant flex justify-around py-2 max-w-md mx-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] px-2 py-1 ${isActive ? 'text-primary font-semibold' : 'text-outline'}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative inline-flex">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                  {item.icon}
                </span>
                {item.to === '/notifikasi' && belumDibaca > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-[3px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none border border-white">
                    {belumDibaca > 9 ? '9+' : belumDibaca}
                  </span>
                )}
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
