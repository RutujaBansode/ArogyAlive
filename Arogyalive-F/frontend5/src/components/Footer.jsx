import { Mail, Phone } from 'lucide-react';
import logoImg from '../assets/arogya-logo.jpeg';

export default function Footer() {
  return (
    <footer className="al-footer">
      <div className="al-container">
        <div className="al-grid al-grid-3" style={{ marginBottom: 22 }}>
          <div>
            <div className="al-logo" style={{ marginBottom: 10 }}>
              <span className="al-logo-badge">
                <img src={logoImg} alt="Arogya Live logo" />
              </span>
            </div>
            <p style={{ maxWidth: 260 }}>
              Helping patients find the right specialization, nearby hospitals and real-time availability — before they visit.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 12, color: 'var(--al-text)' }}>Quick Links</h4>
            <div className="al-stack-sm">
              <div><a href="/find-care">Arogya Care</a></div>
              <div><a href="/doctors">Doctors</a></div>
              <div><a href="/emergency">Ambulance Services</a></div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 12, color: 'var(--al-text)' }}>Contact</h4>
            <div className="al-stack-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={15} /> +91 98765 00000
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={15} /> support@arogyalive.demo
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--al-border)', paddingTop: 16, textAlign: 'center', fontSize: '0.82rem' }}>
          © {new Date().getFullYear()} Arogya Live. A healthcare access platform — final-year academic project (frontend demo).
        </div>
      </div>
    </footer>
  );
}
