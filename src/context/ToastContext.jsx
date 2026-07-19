import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

// Sengaja dipasang di root (lihat main.jsx), BUKAN di dalam satu halaman saja — supaya toast
// tetap kelihatan walau halaman langsung berpindah (contoh: dari Login/GoogleCallback ke
// Beranda/Dashboard), karena komponennya tidak ikut ter-unmount saat navigasi.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, durasiMs = 2000) => {
    setToast(message);
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => setToast(null), durasiMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 bg-on-surface text-white text-sm font-medium rounded-full shadow-lg transition-opacity">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
