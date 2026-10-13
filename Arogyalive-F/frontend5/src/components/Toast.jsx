import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={20} color="var(--al-secondary)" />,
  error: <XCircle size={20} color="var(--al-danger)" />,
  info: <Info size={20} color="var(--al-primary)" />,
};

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="al-toast" role="status">
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button className="al-icon-btn" style={{ width: 28, height: 28, border: 'none' }} onClick={onClose} aria-label="Dismiss notification">
        <X size={14} />
      </button>
    </div>
  );
}
