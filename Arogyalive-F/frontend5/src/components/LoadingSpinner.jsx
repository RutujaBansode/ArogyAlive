import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0' }}>
      <Loader2 size={size} className="al-spin" style={{ animation: 'al-spin 0.9s linear infinite', color: 'var(--al-primary)' }} />
      <span className="al-muted">{label}</span>
      <style>{`@keyframes al-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}
