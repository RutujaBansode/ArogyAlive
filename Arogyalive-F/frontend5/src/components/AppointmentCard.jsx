import { Calendar, Clock, Building2, Ticket } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
  return (
    <div className="al-card">
      <div className="al-flex-between" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={18} color="var(--al-primary)" />
          <strong>{appointment.tokenNumber}</strong>
        </div>
        <span className="al-badge al-badge-available">{appointment.status}</span>
      </div>
      <h4 style={{ margin: '0 0 4px' }}>{appointment.doctorName}</h4>
      <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem', marginBottom: 4 }}>
        <Building2 size={14} /> {appointment.hospitalName}
      </div>
      <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem', marginBottom: 4 }}>
        <Calendar size={14} /> {appointment.date}
      </div>
      <div className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem' }}>
        <Clock size={14} /> {appointment.time} • {appointment.type}
      </div>
    </div>
  );
}
