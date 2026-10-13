import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="al-card" style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--al-danger)' }}>
      <div className="al-icon-circle" style={{ margin: '0 auto 16px', background: 'rgba(224,71,63,0.14)', color: 'var(--al-danger)' }}>
        <AlertTriangle size={24} />
      </div>
      <p className="al-muted" style={{ marginBottom: onRetry ? 18 : 0 }}>{message}</p>
      {onRetry && (
        <button className="al-btn al-btn-outline" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
