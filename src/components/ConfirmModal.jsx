// Dialog konfirmasi custom bergaya aplikasi — dipakai sebagai pengganti confirm() bawaan
// browser (yang muncul dengan judul "localhost:xxxx says" dan tidak bisa diatur tampilannya).
export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-5"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${danger ? 'bg-red-100 text-red-600' : 'bg-[#004873]/10 text-[#004873]'}`}>
          <span className="material-symbols-outlined text-[22px]">
            {danger ? 'warning' : 'help'}
          </span>
        </div>

        <p className="font-semibold text-sm text-on-surface mb-1.5">{title}</p>
        <p className="text-[13px] text-on-surface-variant leading-relaxed mb-5">{message}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-container text-on-surface-variant active:scale-[0.98] transition-transform"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform ${danger ? 'bg-red-600' : 'bg-[#004873]'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
