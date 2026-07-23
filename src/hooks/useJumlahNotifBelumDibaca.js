import { useEffect, useState } from 'react';
import api from '../api/axios';

// Dipakai bareng oleh BottomNav (wisatawan) & TopNav (pengantar/pengelola pulau) buat nampilin
// badge jumlah notifikasi yang belum dibaca — supaya user langsung tahu ada notif masuk tanpa
// harus buka halaman Notifikasi dulu. Kedua komponen ini dimuat ulang tiap pindah halaman
// (bukan 1 layout bersama), jadi hook ini otomatis ambil angka terbaru tiap kali dipasang lagi.
export function useJumlahNotifBelumDibaca() {
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
    // PENTING: BottomNav & TopNav ini juga dipasang di halaman PUBLIK (Beranda, Detail Pulau,
    // Peta) yang sengaja bisa dibuka tanpa login. /notifikasi wajib login (401 kalau tanpa
    // token) — dan axios.js punya aturan global "401 dari mana pun = paksa redirect ke
    // /login" (lihat src/api/axios.js). Tanpa pengecekan ini, pengunjung anonim yang buka
    // Beranda akan otomatis ke-lempar ke halaman Login gara-gara badge ini nge-fetch diam-diam.
    if (!localStorage.getItem('token')) return;

    let batal = false;
    api
      .get('/notifikasi')
      .then((res) => {
        if (batal) return;
        const list = res.data.data || res.data;
        setJumlah(list.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
    return () => { batal = true; };
  }, []);

  return jumlah;
}
