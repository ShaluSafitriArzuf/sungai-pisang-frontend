import { useEffect, useState } from 'react';
import api from '../api/axios';

// Dipakai bareng oleh BottomNav (wisatawan) & TopNav (pengantar/pengelola pulau) buat nampilin
// badge jumlah notifikasi yang belum dibaca — supaya user langsung tahu ada notif masuk tanpa
// harus buka halaman Notifikasi dulu. Kedua komponen ini dimuat ulang tiap pindah halaman
// (bukan 1 layout bersama), jadi hook ini otomatis ambil angka terbaru tiap kali dipasang lagi.
export function useJumlahNotifBelumDibaca() {
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
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
