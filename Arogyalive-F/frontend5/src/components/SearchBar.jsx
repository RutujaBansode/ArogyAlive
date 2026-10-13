import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', onSubmit }) {
  return (
    <div
      className="al-input"
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}
    >
      <Search size={18} color="var(--al-text-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: 'var(--al-text)', fontSize: '0.95rem' }}
      />
    </div>
  );
}
