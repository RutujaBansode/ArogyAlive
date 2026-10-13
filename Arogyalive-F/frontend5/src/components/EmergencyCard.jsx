import { MapPin, Clock, IndianRupee, ShieldCheck } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

export default function EmergencyCard({ ambulance, onRequest, requesting }) {
  return (
    <div className="al-card al-card-accent" style={{ borderColor: ambulance.available ? 'var(--al-border)' : undefined }}>
      <div className="al-flex-between" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="al-icon-circle" style={{ width: 34, height: 34, borderRadius: 10, margin: 0 }} aria-hidden="true">
            🚑
          </span>
          <div>
            <strong>Ambulance {ambulance.id}</strong>
            {ambulance.vehicleNumber && (
              <div style={{ fontSize: '0.78rem', color: 'var(--al-primary)', fontWeight: 700 }}>
                {ambulance.vehicleNumber}
              </div>
            )}
          </div>
        </div>
        <AvailabilityBadge status={ambulance.available ? 'Available' : 'Full'} label={ambulance.available ? 'Available' : 'Busy'} />
      </div>

      {ambulance.type && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className="al-badge al-badge-neutral">{ambulance.type}</span>
          {ambulance.currentLocation && <span className="al-badge al-badge-neutral">📍 {ambulance.currentLocation}</span>}
        </div>
      )}

      {ambulance.driverName && (
        <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: 4 }}>
          <ShieldCheck size={14} color="var(--al-secondary)" /> Driver: <strong>{ambulance.driverName}</strong>
        </div>
      )}

      <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem', marginBottom: 4 }}>
        <MapPin size={14} /> {ambulance.distanceKm} km away
      </div>
      <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem', marginBottom: 4 }}>
        <Clock size={14} /> ETA: {ambulance.etaMinutes} minutes
      </div>
      {typeof ambulance.price === 'number' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', marginBottom: 14, fontWeight: 700, color: 'var(--al-primary-dark)' }}>
          <IndianRupee size={15} /> Estimated Fare: ₹{ambulance.price}
        </div>
      )}
      <button
        className="al-btn al-btn-danger al-btn-block"
        disabled={!ambulance.available || requesting}
        onClick={() => onRequest(ambulance.id)}
      >
        {requesting ? 'Requesting...' : 'Request Ambulance'}
      </button>
    </div>
  );
}
