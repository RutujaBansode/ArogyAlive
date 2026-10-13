import { useNavigate } from 'react-router-dom';
import { MapPin, Stethoscope, Star } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';
import BedAvailability from './BedAvailability';

export default function HospitalCard({ hospital, matchedDepartment }) {
  const navigate = useNavigate();

  return (
    <div className="al-card al-card-hover al-card-accent">
      {hospital.image && (
        <img
          src={hospital.image}
          alt={hospital.imageAlt || `${hospital.name} photo`}
          className="al-card-hospital-img"
          loading="lazy"
        />
      )}

      <div className="al-flex-between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{hospital.name}</h3>
          <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginTop: 4 }}>
            <MapPin size={14} /> {hospital.location} • {hospital.distanceKm} km away
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 700 }}>
          <Star size={14} fill="var(--al-warning)" color="var(--al-warning)" /> {hospital.rating}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.9rem' }}>
        <Stethoscope size={16} color="var(--al-primary)" />
        <strong>{matchedDepartment || hospital.departments[0]}</strong>
        <span className="al-badge al-badge-neutral">🏥 {hospital.type}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <AvailabilityBadge status={hospital.doctorAvailable ? 'Available' : 'Full'} label={`Doctor: ${hospital.doctorAvailable ? 'Available' : 'Unavailable'}`} />
        <AvailabilityBadge status={hospital.opdAvailable ? 'Available' : 'Full'} label={`OPD: ${hospital.opdAvailable ? 'Available' : 'Closed'}`} />
        <AvailabilityBadge status={hospital.emergencyAvailable ? 'Available' : 'Full'} label={`Emergency: ${hospital.emergencyAvailable ? 'Available' : 'Unavailable'}`} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <BedAvailability beds={hospital.beds} hospital={hospital} hospitalType={hospital.type} compact />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => navigate(`/hospital/${hospital.id}`)}>
          View Hospital
        </button>
        <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => navigate(`/hospital/${hospital.id}?tab=doctors`)}>
          View Doctors
        </button>
        <button className="al-btn al-btn-primary al-btn-sm" onClick={() => navigate(`/appointment?hospitalId=${hospital.id}`)}>
          Book Appointment
        </button>
      </div>
    </div>
  );
}
