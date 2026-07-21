import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

// Gaya per jenis toast — dipakai buat gantiin alert() bawaan browser (yang keliatan "dari
// localhost", bukan bagian dari tampilan aplikasi) dengan notifikasi in-app yang beneran
// kelihatan seperti bagian dari desain.
const GAYA_TOAST = {
  info: { bg: 'bg-on-surface', ikon: 'info' },
  sukses: { bg: 'bg-green-600', ikon: 'check_circle' },
  peringatan: { bg: 'bg-red-600', ikon: 'error' },
};

// Sengaja dipasang di root (lihat main.jsx), BUKAN di dalam satu halaman saja — supaya toast
// tetap kelihatan walau halaman langsung berpindah (contoh: dari Login/GoogleCallback ke
// Beranda/Dashboard), karena komponennya tidak ikut ter-unmount saat navigasi.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, durasiMs = 2000, tipe = 'info') => {
    setToast({ message, tipe });
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => setToast(null), durasiMs);
  }, []);

  const gaya = toast ? GAYA_TOAST[toast.tipe] || GAYA_TOAST.info : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-[90vw] flex items-center gap-2 px-4 py-2.5 ${gaya.bg} text-white text-sm font-medium rounded-full shadow-lg transition-opacity`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">{gaya.ikon}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
