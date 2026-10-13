import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, BedDouble, Ambulance, MapPinned, MessageSquareText,
  ShieldCheck, Languages, ClipboardCheck, Search as SearchIcon, Sparkles,
} from 'lucide-react';
import VoiceSearchInput from '../components/VoiceSearchInput';
import doctorConsultationPhoto from '../assets/doctor-consultation-photo.jpg';
import homeBackground from '../assets/home-bg.jpeg';

const quickActions = [
  { icon: Stethoscope, title: 'Arogya Care', desc: 'Get matched to the right specialization for your concern.', to: '/find-care' },
  { icon: MessageSquareText, title: 'Find a Doctor', desc: 'Search doctors by name, specialization or hospital.', to: '/doctors' },
  { icon: BedDouble, title: 'Bed Availability', desc: 'Check hospital and ward bed availability.', to: '/find-care' },
  { icon: Ambulance, title: 'Ambulance', desc: 'Request the nearest available ambulance in Solapur.', to: '/emergency' },
];

const steps = [
  { title: 'Tell Us Your Concern', desc: 'Describe your health problem by text or voice, in the language you\u2019re comfortable with.' },
  { title: 'Find Suitable Care', desc: 'We match your concern to the right specialization and nearby hospitals.' },
  { title: 'Check Availability', desc: 'See doctor, OPD, bed, ICU and emergency availability before you travel.' },
  { title: 'Book Your Appointment', desc: 'Confirm an appointment or OPD token in a few taps.' },
];

const whyItems = [
  { icon: Stethoscope, title: 'Find the Right Specialist', desc: 'Your concern is matched to the specialization that treats it.' },
  { icon: ClipboardCheck, title: 'Check Hospital Availability', desc: 'Live view of beds, oxygen and ventilator availability.' },
  { icon: Languages, title: 'Multilingual Voice/Text Access', desc: 'Speak or type your concern in English, Hindi or Marathi.' },
  { icon: ShieldCheck, title: 'Ambulance Assistance', desc: 'Fast access to ambulances and urgent care response.' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch() {
    if (!query.trim()) return;
    navigate(`/find-care?query=${encodeURIComponent(query)}`);
  }

  return (
    <div
      style={{
        backgroundImage: `var(--al-home-bg-overlay), url(${homeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <section className="al-hero" style={{ background: 'transparent' }}>
        <div className="al-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span className="al-hero-badge">
            <Sparkles size={14} /> Trusted healthcare access, simplified
          </span>
          <h1>
            Find the <span className="al-hero-highlight">Right Care</span>, When You Need It
          </h1>
          <p className="lead">
            Tell us your health concern and find suitable doctors and nearby hospitals with important availability information before you visit.
          </p>

          <div className="al-search-box">
            <VoiceSearchInput value={query} onChange={setQuery} onSearch={handleSearch} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
            {['I need a cardiologist near me', 'I need an orthopedic doctor', 'Find a hospital with ICU beds', 'Where can I get emergency care?'].map((q) => (
              <button
                key={q}
                className="al-btn al-btn-secondary al-btn-sm"
                onClick={() => navigate(`/find-care?query=${encodeURIComponent(q)}`)}
              >
                <SearchIcon size={13} /> {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="al-section" style={{ paddingBottom: 0 }}>
        <div className="al-container">
          <div className="al-grid al-grid-2" style={{ alignItems: 'center', gap: 40 }}>
            <div>
              <span className="al-section-eyebrow" style={{ textAlign: 'left' }}>Care You Can Trust</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', fontWeight: 800, marginBottom: 14 }}>
                Real doctors, real hospitals, real-time answers
              </h2>
              <p className="al-muted" style={{ fontSize: '1rem', marginBottom: 0 }}>
                Arogya Live connects you directly with verified doctors and nearby hospitals — so
                you always know who's available, what's open, and where to go, before you ever leave home.
              </p>
            </div>
            <div>
              <img
                src={doctorConsultationPhoto}
                alt="An Indian doctor in a white coat consulting with a patient in a modern hospital setting in Solapur"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '1.25rem',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="al-section">
        <div className="al-container">
          <div className="al-grid al-grid-4">
            {quickActions.map((action) => (
              <div key={action.title} className="al-card al-card-hover al-card-accent" style={{ cursor: 'pointer' }} onClick={() => navigate(action.to)}>
                <div className="al-icon-circle">
                  <action.icon size={22} />
                </div>
                <h4 style={{ marginBottom: 6 }}>{action.title}</h4>
                <p className="al-muted" style={{ fontSize: '0.88rem', margin: 0 }}>{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="al-section" style={{ background: 'transparent' }}>
        <div className="al-container">
          <span className="al-section-eyebrow">Simple &amp; Guided</span>
          <h2 className="al-section-title">How Arogya Live Works</h2>
          <p className="al-section-sub">A simple four-step journey from health concern to a confirmed appointment.</p>
          <div className="al-grid al-grid-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="al-card">
                <div className="al-icon-circle" style={{ fontWeight: 800 }}>{idx + 1}</div>
                <h4 style={{ marginBottom: 6 }}>{step.title}</h4>
                <p className="al-muted" style={{ fontSize: '0.88rem', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="al-section">
        <div className="al-container">
          <span className="al-section-eyebrow">Why Choose Us</span>
          <h2 className="al-section-title">Why Arogya Live?</h2>
          <p className="al-section-sub">Built to remove the guesswork from finding the right healthcare, fast.</p>
          <div className="al-grid al-grid-4">
            {whyItems.map((item) => (
              <div key={item.title} className="al-card al-card-hover">
                <div className="al-icon-circle al-icon-circle-accent">
                  <item.icon size={22} />
                </div>
                <h4 style={{ marginBottom: 6 }}>{item.title}</h4>
                <p className="al-muted" style={{ fontSize: '0.88rem', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="al-section" style={{ paddingTop: 0 }}>
        <div className="al-container">
          <div className="al-card" style={{ background: 'var(--al-gradient)', color: '#fff', textAlign: 'center', padding: '44px 24px' }}>
            <MapPinned size={30} style={{ marginBottom: 10 }} />
            <h2 style={{ marginBottom: 10 }}>Need help right now?</h2>
            <p style={{ opacity: 0.9, marginBottom: 22 }}>Request an ambulance quickly with live driver tracking across Solapur.</p>
            <button className="al-btn" style={{ background: '#fff', color: 'var(--al-primary-dark)' }} onClick={() => navigate('/emergency')}>
              Go to Ambulance Services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
