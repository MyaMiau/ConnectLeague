export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-xl min-w-[320px] max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-zinc-700 hover:bg-zinc-800 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Fechar"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}