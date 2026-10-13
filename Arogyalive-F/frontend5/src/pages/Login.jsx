import { useState } from 'react';
import { User, Stethoscope, ClipboardList, ShieldCheck, Truck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'patient',      label: 'Patient',           Icon: User },
  { id: 'doctor',       label: 'Doctor',            Icon: Stethoscope },
  { id: 'receptionist', label: 'Receptionist',      Icon: ClipboardList },
  { id: 'admin',        label: 'Admin',             Icon: ShieldCheck },
  { id: 'ambulance',    label: 'Ambulance Driver',  Icon: Truck },
];

function getDashboardPath(role) {
  const map = {
    patient:      '/patient/dashboard',
    doctor:       '/doctor/dashboard',
    receptionist: '/receptionist/dashboard',
    admin:        '/admin/dashboard',
    ambulance:    '/ambulance/dashboard',
  };
  return map[role] || '/patient/dashboard';
}

export default function Login() {
  const [role, setRole]               = useState('patient');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError]     = useState('');
  const { login, loading, error }     = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }
    try {
      await login({ role, email, password });
      // Dashboard opens in a NEW TAB — localStorage is shared so auth persists
      window.open(getDashboardPath(role), '_blank', 'noopener,noreferrer');
    } catch {
      // error surfaced from context
    }
  }

  function openRegisterTab() {
    window.open('/register', '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="al-container" style={{ paddingTop: 48, maxWidth: 460 }}>
      <div className="al-card">
        <h1 style={{ fontSize: '1.4rem', marginBottom: 6, textAlign: 'center' }}>Welcome Back</h1>
        <p className="al-muted" style={{ textAlign: 'center', marginBottom: 24 }}>
          Log in to Arogya Live to continue.
        </p>

        {/* Role selector */}
        <div className="al-grid al-grid-4" style={{ marginBottom: 22, gap: 10 }}>
          {roles.map((r) => (
            <button
              type="button"
              key={r.id}
              className="al-card al-card-hover"
              style={{
                padding: 12,
                textAlign: 'center',
                border: role === r.id ? '2px solid var(--al-primary)' : undefined,
                cursor: 'pointer',
              }}
              onClick={() => setRole(r.id)}
            >
              <r.Icon size={20} color="var(--al-primary)" style={{ marginBottom: 6 }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{r.label}</div>
            </button>
          ))}
        </div>

        <form className="al-stack" onSubmit={handleSubmit}>
          <div>
            <label className="al-label">Email</label>
            <input
              className="al-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@demo.com`}
            />
          </div>
          <div>
            <label className="al-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="al-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                  color: 'var(--al-text-muted)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {(formError || error) && (
            <p style={{ color: 'var(--al-danger)', fontSize: '0.85rem', margin: 0 }}>
              {formError || error}
            </p>
          )}

          <button className="al-btn al-btn-primary al-btn-block" disabled={loading} type="submit">
            {loading ? 'Logging in…' : `Login as ${roles.find((r) => r.id === role).label}`}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--al-border)', textAlign: 'center' }}>
          <p className="al-muted" style={{ marginBottom: 12, fontSize: '0.9rem' }}>
            New to Arogya Live? Create your account:
          </p>
          <button
            id="register-btn"
            className="al-btn al-btn-secondary al-btn-block"
            style={{ fontWeight: 700 }}
            onClick={openRegisterTab}
          >
            Register — Opens in New Tab
          </button>
        </div>

        <p className="al-muted" style={{ textAlign: 'center', marginTop: 14, fontSize: '0.78rem' }}>
          Demo mode: any email/password combination will log you in with mock data.
        </p>
      </div>
    </div>
  );
}
