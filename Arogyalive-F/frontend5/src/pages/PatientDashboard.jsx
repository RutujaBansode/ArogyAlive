import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, History, Ticket, Heart, Siren, UserCircle2, Phone, MapPin, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentsForPatient } from '../services/appointmentService';
import { hospitals } from '../data/mockData';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const savedHospitalIds = ['h1', 'h3'];

const fallbackDemoAmbulance = {
  requestId: 'AMB-REQ-3391',
  vehicleNumber: 'MH-13-AZ-4521',
  driverName: 'Ramesh Jadhav',
  driverContact: '+91 98231 45678',
  currentLocation: 'Saat Rasta, Solapur',
  destinationHospital: 'Solapur City Hospital',
  status: 'On the way',
  etaMinutes: 10,
  image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=700&q=80',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeAmbulance, setActiveAmbulance] = useState(() => {
    const saved = localStorage.getItem('arogya_active_ambulance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return fallbackDemoAmbulance;
      }
    }
    return fallbackDemoAmbulance;
  });

  useEffect(() => {
    getAppointmentsForPatient(user?.name)
      .then((res) => {
        setAppointments(res);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [user]);

  const upcoming = appointments.filter((a) => a.status !== 'Completed');
  const history = appointments.filter((a) => a.status === 'Completed');
  const savedHospitals = hospitals.filter((h) => savedHospitalIds.includes(h.id));

  return (
    <div className="al-container" style={{ paddingTop: 28 }}>
      <div className="al-flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="al-icon-circle" style={{ margin: 0 }}>
            <UserCircle2 size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Welcome, {user?.name || 'Patient'}</h1>
            <p className="al-muted" style={{ margin: 0 }}>Patient Dashboard</p>
          </div>
        </div>
        <button className="al-btn al-btn-danger" onClick={() => navigate('/emergency')}>
          <Siren size={16} /> Request Ambulance
        </button>
      </div>

      {status === 'loading' && <LoadingSpinner label="Loading your dashboard..." />}

      {status === 'success' && (
        <div className="al-stack">
          {/* Active Ambulance Tracking Details */}
          {activeAmbulance && (
            <div className="al-card" style={{ border: '2px solid var(--al-secondary)', padding: 22 }}>
              <div className="al-flex-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="al-icon-circle" style={{ width: 40, height: 40, margin: 0, background: 'rgba(15, 168, 120, 0.15)', color: 'var(--al-secondary)' }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Ambulance Assigned</h3>
                    <p className="al-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Request ID: {activeAmbulance.requestId}</p>
                  </div>
                </div>
                <span className="al-badge al-badge-available" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  ● {activeAmbulance.status || 'On the way'}
                </span>
              </div>

              <div className="al-grid" style={{ gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: 20, alignItems: 'center' }}>
                <div style={{ borderRadius: 14, overflow: 'hidden', height: 160, background: 'var(--al-surface-hover)' }}>
                  <img
                    src={activeAmbulance.image || 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=700&q=80'}
                    alt="Assigned Ambulance"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div>
                  <div className="al-grid al-grid-2" style={{ gap: 12, marginBottom: 16 }}>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Ambulance Vehicle</div>
                      <strong style={{ fontSize: '1rem', color: 'var(--al-primary)' }}>{activeAmbulance.vehicleNumber || 'MH-13-AZ-4521'}</strong>
                    </div>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Assigned Driver</div>
                      <strong style={{ fontSize: '0.98rem' }}>{activeAmbulance.driverName || 'Ramesh Jadhav'}</strong>
                    </div>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Driver Contact</div>
                      <a href={`tel:${activeAmbulance.driverContact || '+919823145678'}`} style={{ fontWeight: 600, color: 'var(--al-primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} /> {activeAmbulance.driverContact || '+91 98231 45678'}
                      </a>
                    </div>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Current Location</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <MapPin size={14} color="var(--al-secondary)" /> {activeAmbulance.currentLocation || 'Solapur'}
                      </span>
                    </div>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Estimated Arrival</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--al-secondary)' }}>
                        <Clock size={14} /> {activeAmbulance.etaMinutes || 10} minutes
                      </span>
                    </div>
                    <div>
                      <div className="al-muted" style={{ fontSize: '0.8rem' }}>Destination Hospital</div>
                      <span style={{ fontWeight: 600 }}>{activeAmbulance.destinationHospital || 'Solapur City Hospital'}</span>
                    </div>
                  </div>

                  {/* Route & Tracking Indicator */}
                  <div style={{ background: 'var(--al-surface-hover)', padding: '12px 16px', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                      <span style={{ color: 'var(--al-secondary)' }}>✓ Request Confirmed</span>
                      <span style={{ color: 'var(--al-secondary)' }}>✓ Dispatched</span>
                      <span style={{ color: 'var(--al-primary)', fontWeight: 700 }}>● On the way</span>
                      <span className="al-muted">○ Arrived</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--al-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '70%', background: 'var(--al-gradient)', borderRadius: 999 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CalendarCheck size={18} /> Upcoming Appointment
            </h3>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                message="Book an appointment to see it here."
                icon={Ticket}
                action={<button className="al-btn al-btn-primary" onClick={() => navigate('/appointment')}>Book Appointment</button>}
              />
            ) : (
              <div className="al-grid al-grid-3">
                {upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <History size={18} /> Appointment History
            </h3>
            {history.length === 0 ? (
              <p className="al-muted">No past appointments yet.</p>
            ) : (
              <div className="al-grid al-grid-3">
                {history.map((a) => <AppointmentCard key={a.id} appointment={a} />)}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Heart size={18} /> Saved Hospitals in Solapur
            </h3>
            <div className="al-grid al-grid-3">
              {savedHospitals.map((h) => (
                <div key={h.id} className="al-card">
                  <strong>{h.name}</strong>
                  <p className="al-muted" style={{ fontSize: '0.85rem', margin: '6px 0 12px' }}>{h.location} • {h.distanceKm} km away</p>
                  <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => navigate(`/hospital/${h.id}`)}>View Hospital</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
