import { useToast } from '../context/ToastContext';

const typeStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${typeStyles[t.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-start justify-between gap-3 animate-slide-in`}
          role="alert"
        >
          <span className="text-sm leading-snug">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-white/70 hover:text-white shrink-0 text-lg leading-none mt-0.5"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
