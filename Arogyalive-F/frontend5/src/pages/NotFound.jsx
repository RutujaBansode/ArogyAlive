import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="al-container" style={{ paddingTop: 80, textAlign: 'center' }}>
      <HeartPulse size={40} color="var(--al-primary)" style={{ marginBottom: 16 }} />
      <h1 style={{ marginBottom: 8 }}>Page Not Found</h1>
      <p className="al-muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <button className="al-btn al-btn-primary" onClick={() => navigate('/')}>Return Home</button>
    </div>
  );
}
