const WARNA = {
  menunggu_verifikasi: 'bg-yellow-100 text-yellow-700',
  valid: 'bg-green-100 text-green-700',
  ditolak: 'bg-red-100 text-red-700',
  pengajuan_batal: 'bg-orange-100 text-orange-700',
  dibatalkan: 'bg-gray-200 text-gray-600',
  selesai: 'bg-blue-100 text-blue-700',
};

const LABEL = {
  menunggu_verifikasi: 'Menunggu Verifikasi',
  valid: 'Valid',
  ditolak: 'Ditolak',
  pengajuan_batal: 'Pengajuan Batal',
  dibatalkan: 'Dibatalkan',
  selesai: 'Selesai',
};

export default function StatusBadge({ status, compact = false }) {
  return (
    <span
      className={`font-semibold rounded-full whitespace-nowrap shrink-0 ${
        compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      } ${WARNA[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {LABEL[status] || status}
    </span>
  );
}
