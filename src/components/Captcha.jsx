import { useEffect, useRef, useState } from 'react';

/*
  Kotak verifikasi "Saya bukan robot" (Google reCAPTCHA v2).

  Sengaja tidak memakai pustaka pihak ketiga: paket yang umum dipakai belum mendukung
  React 19, sehingga pemasangannya justru menimbulkan bentrok versi. Komponen ini memuat
  sendiri skrip resmi dari Google lalu memanggil grecaptcha.render() secara eksplisit.

  Token yang dihasilkan HANYA SEKALI PAKAI. Karena itu ada prop `reset`: halaman pemanggil
  menaikkan angkanya setiap kali permintaan gagal, supaya kotaknya kembali kosong dan
  pengguna bisa mencentang ulang.
*/

const KUNCI = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let pemuatan = null;

function muatSkrip() {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (pemuatan) return pemuatan;

  pemuatan = new Promise((selesai, gagal) => {
    window.__captchaSiap = () => selesai();

    const skrip = document.createElement('script');
    skrip.src = 'https://www.google.com/recaptcha/api.js?onload=__captchaSiap&render=explicit&hl=id';
    skrip.async = true;
    skrip.defer = true;
    skrip.onerror = () => {
      pemuatan = null;
      gagal(new Error('Verifikasi keamanan gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.'));
    };
    document.head.appendChild(skrip);
  });

  return pemuatan;
}

export default function Captcha({ onChange, reset = 0 }) {
  const kotakRef = useRef(null);
  const idWidget = useRef(null);
  const simpanOnChange = useRef(onChange);
  const [pesanGagal, setPesanGagal] = useState('');

  useEffect(() => {
    simpanOnChange.current = onChange;
  });

  useEffect(() => {
    if (!KUNCI) {
      setPesanGagal('Kunci reCAPTCHA belum diatur pada berkas .env (VITE_RECAPTCHA_SITE_KEY).');
      return undefined;
    }

    let batal = false;
    muatSkrip()
      .then(() => {
        if (batal || !kotakRef.current || idWidget.current !== null) return;
        idWidget.current = window.grecaptcha.render(kotakRef.current, {
          sitekey: KUNCI,
          callback: (token) => simpanOnChange.current(token),
          'expired-callback': () => simpanOnChange.current(''),
          'error-callback': () => simpanOnChange.current(''),
        });
      })
      .catch((err) => {
        if (!batal) setPesanGagal(err.message);
      });

    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    if (reset > 0 && idWidget.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(idWidget.current);
      simpanOnChange.current('');
    }
  }, [reset]);

  if (pesanGagal) {
    return <p className="text-xs text-red-600 text-center leading-snug">{pesanGagal}</p>;
  }

  return (
    <div className="flex justify-center overflow-x-auto">
      <div ref={kotakRef} />
    </div>
  );
}
