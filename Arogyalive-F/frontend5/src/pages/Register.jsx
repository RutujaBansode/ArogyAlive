import { useState } from 'react';
import { User, Stethoscope, ClipboardList, ShieldCheck, Truck, Eye, EyeOff, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hospitals } from '../data/mockData';

const roles = [
  { id: 'patient', label: 'Patient', Icon: User, desc: 'Book appointments, view bed options & ambulance' },
  { id: 'doctor', label: 'Doctor', Icon: Stethoscope, desc: 'Manage consultations, schedule & patient records' },
  { id: 'receptionist', label: 'Receptionist', Icon: ClipboardList, desc: 'OPD queue management & bed availability' },
  { id: 'admin', label: 'Admin', Icon: ShieldCheck, desc: 'Hospital analytics, staff & system access' },
  { id: 'ambulance', label: 'Ambulance Driver', Icon: Truck, desc: 'Accept emergency requests & live dispatch' },
];

export default function Register() {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  // Patient
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Doctor
  const [specialization, setSpecialization] = useState('General Medicine');
  const [hospitalId, setHospitalId] = useState('h1');
  const [medicalLicense, setMedicalLicense] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');

  // Receptionist
  const [staffId, setStaffId] = useState('');
  const [receptionistHospital, setReceptionistHospital] = useState('Solapur City Hospital');

  // Admin
  const [organization, setOrganization] = useState('Solapur City Hospital Network');
  const [adminKey, setAdminKey] = useState('');

  const [formError, setFormError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(null);
  const { register, loading, error } = useAuth();

  function getDashboardPath(selectedRole) {
    switch (selectedRole) {
      case 'doctor':
        return '/doctor/dashboard';
      case 'receptionist':
        return '/receptionist/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'ambulance':
        return '/ambulance/dashboard';
      case 'patient':
      default:
        return '/patient/dashboard';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError(
        'Please fill in all required fields (Name, Email, Password).'
      );
      return;
    }

    if (password.length < 8) {
      setFormError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (role === 'admin' && !adminKey.trim()) {
      setFormError(
        'Admin Security Key is required for an admin account.'
      );
      return;
    }

    try {
      const newUser = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        metadata: {
          ...(role === 'patient' && {
            age,
            gender,
            bloodGroup,
          }),

          ...(role === 'doctor' && {
            specialization,
            hospitalId,
            medicalLicense,
            experienceYears,
          }),

          ...(role === 'receptionist' && {
            staffId,
            receptionistHospital,
          }),

          ...(role === 'admin' && {
            organization,
            adminKey,
          }),
        },
      });

      const dashboardPath = getDashboardPath(role);

      // Open corresponding dashboard in a NEW BROWSER TAB as required
      window.open(dashboardPath, '_blank', 'noopener,noreferrer');

      setRegisteredSuccess({
        roleName: roles.find((r) => r.id === role)?.label || role,
        dashboardPath,
        user: newUser,
      });
    } catch {
      // Handled by context
    }
  }

  return (
    <div className="al-container" style={{ paddingTop: 38, maxWidth: 560 }}>
      <div className="al-card">
        <h1 style={{ fontSize: '1.45rem', marginBottom: 6, textAlign: 'center' }}>Create Your Account</h1>
        <p className="al-muted" style={{ textAlign: 'center', marginBottom: 22 }}>
          Join Arogya Live to access appointments, dashboards, and emergency services.
        </p>

        {registeredSuccess && (
          <div className="al-card" style={{ marginBottom: 22, background: 'var(--al-secondary-light)', borderColor: 'var(--al-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <CheckCircle2 size={22} color="var(--al-secondary)" />
              <strong style={{ fontSize: '1.05rem', color: 'var(--al-text)' }}>Registration Successful!</strong>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
              Your <strong>{registeredSuccess.roleName}</strong> account has been created, and your dashboard has been opened in a new tab.
              {role === 'ambulance' && (
                <> Complete your ambulance profile and document verification from the Ambulance Operator Dashboard.</>
              )}
            </p>
            <a
              href={registeredSuccess.dashboardPath}
              target="_blank"
              rel="noreferrer"
              className="al-btn al-btn-primary al-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Open {registeredSuccess.roleName} Dashboard <ExternalLink size={14} />
            </a>
          </div>
        )}

        <form className="al-stack" onSubmit={handleSubmit}>
          {/* Requirement 12: The Registration page must start by asking the user: "Register As" */}
          <div>
            <label className="al-label" style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 10, display: 'block' }}>
              Register As
            </label>
            <div className="al-role-grid">
              {roles.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    className={`al-role-option-card${isSelected ? ' active' : ''}`}
                    onClick={() => setRole(r.id)}
                  >
                    <r.Icon size={22} color={isSelected ? 'var(--al-primary-dark)' : 'var(--al-primary)'} />
                    <strong style={{ fontSize: '0.85rem' }}>{r.label}</strong>
                  </button>
                );
              })}
            </div>
            <p className="al-muted" style={{ fontSize: '0.82rem', marginTop: -12, marginBottom: 18 }}>
              Selected: <strong>{roles.find((r) => r.id === role)?.label}</strong> — {roles.find((r) => r.id === role)?.desc}
            </p>
          </div>

          {/* Common Account Fields */}
          <div>
            <label className="al-label">Full Name *</label>
            <input
              className="al-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'doctor' ? 'Dr. Name' : 'Full name'}
              required
            />
          </div>

          <div>
            <label className="al-label">Email Address *</label>
            <input
              className="al-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@demo.com`}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="al-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                className="al-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: 42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--al-text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Role-Specific Form Fields */}

          {/* 1. Patient Fields */}
          {role === 'patient' && (
            <div className="al-grid al-grid-3">
              <div>
                <label className="al-label">Age</label>
                <input className="al-input" type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" />
              </div>
              <div>
                <label className="al-label">Gender</label>
                <select className="al-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="al-label">Blood Group</label>
                <select className="al-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. Doctor Fields */}
          {role === 'doctor' && (
            <div className="al-stack-sm">
              <div className="al-grid al-grid-2">
                <div>
                  <label className="al-label">Specialization</label>
                  <select className="al-select" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    {['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Ophthalmology', 'Pulmonology', 'Gynecology', 'Dermatology'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="al-label">Affiliated Hospital (Solapur)</label>
                  <select className="al-select" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="al-grid al-grid-2">
                <div>
                  <label className="al-label">Medical Registration No.</label>
                  <input className="al-input" value={medicalLicense} onChange={(e) => setMedicalLicense(e.target.value)} placeholder="e.g. MMC-2018-XXXX" />
                </div>
                <div>
                  <label className="al-label">Experience (Years)</label>
                  <input className="al-input" type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 8" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Receptionist Fields */}
          {role === 'receptionist' && (
            <div className="al-grid al-grid-2">
              <div>
                <label className="al-label">Hospital Name</label>
                <select className="al-select" value={receptionistHospital} onChange={(e) => setReceptionistHospital(e.target.value)}>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="al-label">Employee / Staff ID</label>
                <input className="al-input" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder="e.g. REC-SOL-104" />
              </div>
            </div>
          )}

          {/* 4. Admin Fields */}
          {role === 'admin' && (
            <div className="al-grid al-grid-2">
              <div>
                <label className="al-label">Organization Name</label>
                <input className="al-input" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Healthcare Network" />
              </div>
              <div>
                <label className="al-label">Admin Security Key</label>
                <input className="al-input" type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Admin authorization code" />
              </div>
            </div>
          )}

          {/* 5. Ambulance Driver */}
          {role === 'ambulance' && (
            <div
              className="al-card"
              style={{
                background: 'var(--al-secondary-light)',
                borderColor: 'var(--al-secondary)',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Ambulance Driver Account
              </strong>

              <p
                className="al-muted"
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  lineHeight: 1.55,
                }}
              >
                This page creates your Ambulance Driver account only.
                After registration, the Ambulance Operator Dashboard will
                collect your ambulance-specific information such as
                vehicle number, driving licence, ambulance type, current
                location and service price.
              </p>
            </div>
          )}

          {(formError || error) && <p style={{ color: 'var(--al-danger)', fontSize: '0.85rem', margin: 0 }}>{formError || error}</p>}

          <button className="al-btn al-btn-primary al-btn-block" disabled={loading} type="submit" style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : `Register as ${roles.find((r) => r.id === role)?.label}`}
          </button>
        </form>

        <p className="al-muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => window.open('/login', '_blank', 'noopener,noreferrer')}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--al-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit' }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
