import { useState } from 'react';
import { Ticket, Users, BedDouble, Stethoscope, Plus } from 'lucide-react';
import { opdQueue as initialQueue, doctors as allDoctors, hospitals } from '../data/mockData';
import { updateBedCount } from '../services/bedService';
import AvailabilityBadge from '../components/AvailabilityBadge';
import BedAvailability from '../components/BedAvailability';
import Toast from '../components/Toast';

const queueStatuses = ['Waiting', 'In Consultation', 'Completed'];
let tokenSeq = 17;

export default function ReceptionistDashboard() {
  const [queue, setQueue] = useState(initialQueue);
  const [doctorAvailability, setDoctorAvailability] = useState(
    Object.fromEntries(allDoctors.map((d) => [d.id, d.availableToday]))
  );
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0].id);
  const [toast, setToast] = useState('');

  const hospital = hospitals.find((h) => h.id === selectedHospitalId);

  function generateToken() {
    const token = `T-${String(tokenSeq++).padStart(3, '0')}`;
    setQueue((q) => [...q, { id: `q-${Date.now()}`, tokenNumber: token, patientName: 'Walk-in Patient', doctor: allDoctors[0].name, status: 'Waiting' }]);
    setToast(`Generated OPD token ${token}`);
  }

  function cycleStatus(id) {
    setQueue((q) =>
      q.map((item) => {
        if (item.id !== id) return item;
        const idx = queueStatuses.indexOf(item.status);
        const next = queueStatuses[(idx + 1) % queueStatuses.length];
        return { ...item, status: next };
      })
    );
  }

  function toggleDoctorAvailability(id) {
    setDoctorAvailability((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      return updated;
    });
    setToast('Doctor availability updated');
  }

  function adjustBed(bedType, delta) {
    const current = hospital.beds[bedType].available;
    updateBedCount(hospital.id, bedType, current + delta).then(() => {
      setToast(`${bedType} beds updated for ${hospital.name}`);
      // force re-render since mock data object mutated in place
      setSelectedHospitalId((id) => id);
    });
  }

  return (
    <div className="al-container" style={{ paddingTop: 28 }}>
      <h1 style={{ marginBottom: 4, fontSize: '1.4rem' }}>Receptionist Dashboard</h1>
      <p className="al-muted" style={{ marginBottom: 24 }}>Manage today's OPD queue, doctor availability and bed counts.</p>

      <div className="al-grid al-grid-3" style={{ marginBottom: 32 }}>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Today's OPD</div>
          <div className="al-stat-value">{queue.length}</div>
        </div>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Waiting</div>
          <div className="al-stat-value">{queue.filter((q) => q.status === 'Waiting').length}</div>
        </div>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Completed</div>
          <div className="al-stat-value">{queue.filter((q) => q.status === 'Completed').length}</div>
        </div>
      </div>

      <div className="al-card" style={{ marginBottom: 28 }}>
        <div className="al-flex-between" style={{ marginBottom: 16 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Ticket size={18} /> Patient Queue & OPD Tokens</h4>
          <button className="al-btn al-btn-primary al-btn-sm" onClick={generateToken}>
            <Plus size={14} /> Generate Token
          </button>
        </div>
        <div className="al-table-wrap">
          <table className="al-table">
            <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id}>
                  <td>{item.tokenNumber}</td>
                  <td>{item.patientName}</td>
                  <td>{item.doctor}</td>
                  <td><AvailabilityBadge status={item.status === 'Completed' ? 'Available' : item.status === 'Waiting' ? 'Limited' : 'Available'} label={item.status} /></td>
                  <td>
                    <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => cycleStatus(item.id)}>Advance Status</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="al-card" style={{ marginBottom: 28 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Stethoscope size={18} /> Doctor Availability</h4>
        <div className="al-grid al-grid-2">
          {allDoctors.map((d) => (
            <div key={d.id} className="al-flex-between" style={{ borderBottom: '1px solid var(--al-border)', paddingBottom: 10 }}>
              <div>
                <strong>{d.name}</strong>
                <div className="al-muted" style={{ fontSize: '0.82rem' }}>{d.specialization}</div>
              </div>
              <button
                className={`al-btn al-btn-sm ${doctorAvailability[d.id] ? 'al-btn-primary' : 'al-btn-secondary'}`}
                onClick={() => toggleDoctorAvailability(d.id)}
              >
                {doctorAvailability[d.id] ? 'Available' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="al-card">
        <div className="al-flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><BedDouble size={18} /> Bed Availability</h4>
          <select className="al-select" style={{ width: 'auto' }} value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)}>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <BedAvailability beds={hospital.beds} hospital={hospital} hospitalType={hospital.type} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {['general', 'icu', 'emergency', 'oxygen', 'ventilator'].map((type) => (
            hospital.beds[type].total > 0 && (
              <div key={type} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="al-muted" style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}>{type}:</span>
                <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => adjustBed(type, -1)}>-</button>
                <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => adjustBed(type, 1)}>+</button>
              </div>
            )
          ))}
        </div>
      </div>

      <Toast message={toast} type="success" onClose={() => setToast('')} />
    </div>
  );
}
