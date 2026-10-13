import { useNavigate } from 'react-router-dom';
import { Stethoscope, Building2, Clock, Star, Languages, IndianRupee, UserRound } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <div className="al-card al-card-hover al-card-accent al-doctor-card-horiz">
      {/* ── Left: all info ── */}
      <div className="al-doctor-card-info">
        {/* Name + rating row */}
        <div className="al-flex-between" style={{ alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{doctor.name}</h3>
            <div className="al-muted" style={{ fontSize: '0.82rem', marginTop: 2 }}>
              {doctor.qualification}
              {doctor.gender && <> &bull; {doctor.gender}</>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem', fontWeight: 700, flexShrink: 0, marginLeft: 10 }}>
            <Star size={14} fill="var(--al-warning)" color="var(--al-warning)" />
            {doctor.rating}
          </div>
        </div>

        {/* Specialization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 4px', fontSize: '0.9rem' }}>
          <Stethoscope size={15} color="var(--al-primary)" />
          <strong>{doctor.specialization}</strong>
        </div>

        {/* Hospital */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '0.85rem' }} className="al-muted">
          <Building2 size={14} />
          {doctor.hospitalName}
        </div>

        {/* Experience + OPD timings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '0.85rem' }} className="al-muted">
          <UserRound size={14} />
          {doctor.experienceYears}+ yrs exp &nbsp;&bull;&nbsp;
          <Clock size={13} />
          {doctor.opdTimings}
        </div>

        {/* Languages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.82rem' }} className="al-muted">
          <Languages size={14} />
          {doctor.languages.join(', ')}
        </div>

        {/* Availability + fee row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <AvailabilityBadge
            status={doctor.availableToday ? 'Available' : 'Full'}
            label={doctor.availableToday ? 'Available Today' : 'Not Available'}
          />
          {doctor.consultationFee && (
            <span className="al-badge al-badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <IndianRupee size={11} />
              {doctor.consultationFee} / visit
            </span>
          )}
          {doctor.consultationType && (
            <span className="al-badge al-badge-neutral">{doctor.consultationType}</span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => navigate(`/doctor/${doctor.id}`)}>
            View Profile
          </button>
          <button className="al-btn al-btn-primary al-btn-sm" onClick={() => navigate(`/appointment?doctorId=${doctor.id}`)}>
            Book Appointment
          </button>
        </div>
      </div>

      {/* ── Right: doctor photo ── */}
      {doctor.image && (
        <div className="al-doctor-card-photo-wrap">
          <img
            src={doctor.image}
            alt={doctor.imageAlt || `${doctor.name} photo`}
            className="al-doctor-card-photo"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
