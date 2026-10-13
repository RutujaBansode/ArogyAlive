import { SearchX } from 'lucide-react';

export default function EmptyState({ title = 'No results found', message = 'Try adjusting your filters or search again.', icon: Icon = SearchX, action = null }) {
  return (
    <div className="al-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div className="al-icon-circle" style={{ margin: '0 auto 16px' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <p className="al-muted" style={{ marginBottom: action ? 18 : 0 }}>{message}</p>
      {action}
    </div>
  );
}
