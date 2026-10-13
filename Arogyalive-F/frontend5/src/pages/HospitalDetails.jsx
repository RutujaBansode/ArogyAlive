import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Building2, Star, Siren, BedDouble } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import BedAvailability from '../components/BedAvailability';
import DoctorCard from '../components/DoctorCard';
import AvailabilityBadge from '../components/AvailabilityBadge';
import { getHospitalById } from '../services/hospitalService';
import { getDoctorsByHospital } from '../services/doctorService';

const tabs = ['Overview', 'Doctors', 'Beds', 'Appointments', 'Ambulance'];

export default function HospitalDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeTab, setActiveTab] = useState(
    tabs.find((t) => t.toLowerCase() === searchParams.get('tab')) || 'Overview'
  );

  useEffect(() => {
    setStatus('loading');
    Promise.all([getHospitalById(id), getDoctorsByHospital(id)])
      .then(([h, docs]) => {
        if (!h) {
          setStatus('error');
          return;
        }
        setHospital(h);
        setHospitalDoctors(docs);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="al-container" style={{ paddingTop: 40 }}>
        <LoadingSpinner label="Loading hospital details..." />
      </div>
    );
  }

  if (status === 'error' || !hospital) {
    return (
      <div className="al-container" style={{ paddingTop: 40 }}>
        <ErrorState message="We couldn't find that hospital." onRetry={() => navigate('/find-care')} />
      </div>
    );
  }

  const isGeneralHospital = hospital.type === 'General' || hospital.name.toLowerCase().includes('general');

  return (
    <div className="al-container" style={{ paddingTop: 28 }}>
      <Link
        to="/find-care"
        className="al-muted"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18, fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Arogya Care
      </Link>

      {/* Prominent Hospital Showcase Banner */}
      <div
        className="al-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: 24,
          border: '1px solid var(--al-border)',
        }}
      >
        <div className="al-horizontal-card">
          <div className="al-horizontal-card-info" style={{ padding: '24px 28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="al-badge al-badge-neutral">🏥 {hospital.type} Hospital</span>
                {hospital.city && <span className="al-badge al-badge-neutral">📍 {hospital.city}</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, marginLeft: 'auto' }}>
                  <Star size={16} fill="var(--al-warning)" color="var(--al-warning)" /> {hospital.rating}
                </div>
              </div>

              <h1 style={{ marginBottom: 10, fontSize: '1.65rem' }}>{hospital.name}</h1>
              <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.92rem' }}>
                <MapPin size={16} /> {hospital.location} • {hospital.distanceKm} km away
              </div>
              <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.92rem' }}>
                <Phone size={16} /> {hospital.contact}
              </div>
              {hospital.description && (
                <p className="al-muted" style={{ fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.5 }}>
                  {hospital.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <AvailabilityBadge
                status={hospital.doctorAvailable ? 'Available' : 'Full'}
                label={`Doctors: ${hospital.doctorAvailable ? 'Available' : 'Unavailable'}`}
              />
              <AvailabilityBadge
                status={hospital.opdAvailable ? 'Available' : 'Full'}
                label={`OPD: ${hospital.opdAvailable ? 'Open' : 'Closed'}`}
              />
              <AvailabilityBadge
                status={hospital.emergencyAvailable ? 'Available' : 'Full'}
                label={`Ambulance: ${hospital.emergencyAvailable ? 'Available' : 'Unavailable'}`}
              />
            </div>
          </div>

          <div
            className="al-horizontal-card-image"
            style={{
              flex: '0 0 42%',
              maxHeight: 280,
              minHeight: 240,
            }}
          >
            <img
              src={hospital.image}
              alt={hospital.imageAlt || `${hospital.name} photo`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="al-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`al-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'Overview' && (
        <div className="al-grid al-grid-2">
          <div className="al-card">
            <h4 style={{ marginBottom: 12 }}>Departments</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hospital.departments.map((d) => (
                <span key={d} className="al-badge al-badge-neutral">{d}</span>
              ))}
            </div>
          </div>
          <div className="al-card">
            <h4 style={{ marginBottom: 12 }}>Facilities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hospital.facilities.map((f) => (
                <span key={f} className="al-badge al-badge-neutral">{f}</span>
              ))}
            </div>
          </div>
          <div className="al-card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Clock size={16} /> OPD Timings
            </h4>
            <p className="al-muted" style={{ margin: 0 }}>{hospital.opdTimings}</p>
          </div>
          <div className="al-card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Building2 size={16} /> Emergency / Ambulance Status
            </h4>
            <p className="al-muted" style={{ margin: 0 }}>
              {hospital.emergencyAvailable
                ? 'Ambulance and emergency triage services are currently active.'
                : 'Emergency services are not available at this hospital.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab: Doctors */}
      {activeTab === 'Doctors' && (
        <div className="al-grid al-grid-2">
          {hospitalDoctors.length === 0 ? (
            <p className="al-muted">No doctors listed for this hospital yet.</p>
          ) : (
            hospitalDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)
          )}
        </div>
      )}

      {/* Tab: Beds — Under General Hospital, only 1 General Bed option is shown */}
      {activeTab === 'Beds' && (
        <div>
          {isGeneralHospital && (
            <div className="al-card" style={{ marginBottom: 18, background: 'var(--al-primary-light)', borderColor: 'var(--al-primary)' }}>
              <strong>General Hospital Bed Availability:</strong> Showing available General Beds. (ICU and Emergency beds are routed to specialized trauma centers).
            </div>
          )}
          <BedAvailability beds={hospital.beds} hospital={hospital} hospitalType={hospital.type} />
        </div>
      )}

      {/* Tab: Appointments */}
      {activeTab === 'Appointments' && (
        <div className="al-card">
          <h4 style={{ marginBottom: 12 }}>Available Doctors & Slots</h4>
          <div className="al-stack">
            {hospitalDoctors.map((d) => (
              <div
                key={d.id}
                className="al-flex-between"
                style={{ borderBottom: '1px solid var(--al-border)', paddingBottom: 12 }}
              >
                <div>
                  <strong>{d.name}</strong>
                  <div className="al-muted" style={{ fontSize: '0.85rem' }}>
                    {d.specialization} • OPD {d.opdTimings}
                  </div>
                </div>
                <button
                  className="al-btn al-btn-primary al-btn-sm"
                  onClick={() => navigate(`/appointment?hospitalId=${hospital.id}&doctorId=${d.id}`)}
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Ambulance (formerly Emergency) */}
      {activeTab === 'Ambulance' && (
        <div className="al-card">
          <div style={{ marginBottom: 16 }}>
            <AvailabilityBadge
              status={hospital.emergencyAvailable ? 'Available' : 'Full'}
              label={`Ambulance Services: ${hospital.emergencyAvailable ? 'Available' : 'Unavailable'}`}
            />
          </div>
          <h4 style={{ marginBottom: 12 }}>
            <Siren size={18} style={{ marginRight: 6 }} /> Hospital Bed & Triage Status
          </h4>
          <BedAvailability beds={hospital.beds} hospital={hospital} hospitalType={hospital.type} />
          <button
            className="al-btn al-btn-danger"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/emergency')}
          >
            Go to Ambulance Services
          </button>
        </div>
      )}
    </div>
  );
}
