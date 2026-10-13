import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, CheckCircle2, ArrowRight } from 'lucide-react';
import EmergencyCard from '../components/EmergencyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getNearestAmbulances, requestAmbulance } from '../services/emergencyService';

export default function Emergency() {
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [status, setStatus] = useState('loading');
  const [requestingId, setRequestingId] = useState(null);
  const [dispatch, setDispatch] = useState(null);

  useEffect(() => {
    getNearestAmbulances()
      .then((ambList) => {
        setAmbulances(ambList);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, []);

  async function handleRequest(ambulanceId) {
    setRequestingId(ambulanceId);
    try {
      const result = await requestAmbulance(ambulanceId);
      const chosenAmbulance = ambulances.find((a) => a.id === ambulanceId);

      const activeDispatch = {
        requestId: result.requestId || `AMB-REQ-${Date.now().toString().slice(-4)}`,
        ambulance: chosenAmbulance,
        ambulanceId: chosenAmbulance?.id || 'A101',
        vehicleNumber: chosenAmbulance?.vehicleNumber || 'MH-13-AZ-4521',
        driverName: chosenAmbulance?.driverName || 'Ramesh Jadhav',
        driverContact: chosenAmbulance?.driverContact || '+91 98231 45678',
        currentLocation: chosenAmbulance?.currentLocation || 'Saat Rasta, Solapur',
        destinationHospital: 'Solapur City Hospital',
        patientName: 'Demo Patient',
        status: 'On the way',
        etaMinutes: chosenAmbulance?.etaMinutes || 10,
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgentCareInfo: 'Emergency Ambulance Request • Solapur',
        image: chosenAmbulance?.image || 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=700&q=80',
      };

      // Store in localStorage for Patient Dashboard & Ambulance Driver Dashboard coordination
      localStorage.setItem('arogya_active_ambulance', JSON.stringify(activeDispatch));

      setDispatch(activeDispatch);
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="al-container" style={{ paddingTop: 32 }}>
      <div className="al-card" style={{ background: 'var(--al-gradient)', color: '#fff', marginBottom: 28, padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Siren size={28} />
          <h1 style={{ margin: 0, color: '#fff' }}>Ambulance Services</h1>
        </div>
        <p style={{ margin: 0, opacity: 0.92, fontSize: '1rem' }}>
          Request the nearest available ambulance in Solapur with rapid emergency dispatch and driver coordination.
        </p>
      </div>

      {dispatch && (
        <div className="al-card" style={{ marginBottom: 28, border: '2px solid var(--al-secondary)' }}>
          <div className="al-flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <CheckCircle2 size={22} color="var(--al-secondary)" />
                <strong style={{ fontSize: '1.1rem' }}>
                  Ambulance {dispatch.vehicleNumber} Assigned!
                </strong>
              </div>
              <p className="al-muted" style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>
                Driver: <strong>{dispatch.driverName}</strong> ({dispatch.driverContact}) • Location: <strong>{dispatch.currentLocation}</strong> • Status: <span className="al-badge al-badge-available">{dispatch.status}</span>
              </p>
              <div style={{ fontSize: '0.88rem' }}>
                Estimated Arrival Time: <strong>{dispatch.etaMinutes} minutes</strong> • Request ID: {dispatch.requestId}
              </div>
            </div>

            <button
              className="al-btn al-btn-primary"
              onClick={() => navigate('/patient/dashboard')}
            >
              View on Patient Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingSpinner label="Locating nearby ambulances in Solapur..." />}

      {status === 'success' && (
        <>
          <h3 style={{ marginBottom: 16 }}>🚑 Available Ambulances in Solapur</h3>
          <div className="al-grid al-grid-3" style={{ marginBottom: 40 }}>
            {ambulances.map((a) => (
              <EmergencyCard key={a.id} ambulance={a} onRequest={handleRequest} requesting={requestingId === a.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
