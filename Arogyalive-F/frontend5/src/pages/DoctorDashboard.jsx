import { useState } from 'react';
import {
  CalendarClock, Users, CheckCircle2, Clock, ToggleLeft, ToggleRight,
  StickyNote, CalendarX2, IndianRupee, X as XIcon, Star, Phone, Building2, MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doctors, doctorPatientHistory, doctorSlotOptions, hospitals } from '../data/mockData';
import AvailabilityBadge from '../components/AvailabilityBadge';
import BedAvailability from '../components/BedAvailability';
import Modal from '../components/Modal';

const initialAppointments = [
  { id: 'apt1', patient: 'Rahul Sawant', time: '10:00 AM', type: 'OPD', status: 'Waiting' },
  { id: 'apt2', patient: 'Sneha Kale', time: '10:30 AM', type: 'Consultation', status: 'In Consultation' },
  { id: 'apt3', patient: 'Vikas Pawar', time: '11:00 AM', type: 'OPD', status: 'Completed' },
];

const statusOrder = ['Waiting', 'In Consultation', 'Completed'];

function nextDates(count = 7) {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorProfile = doctors.find((d) => d.name === user?.name) || doctors[0];
  const affiliatedHospital = hospitals.find((h) => h.id === doctorProfile.hospitalId || h.name === doctorProfile.hospitalName) || hospitals[0];

  const [available, setAvailable] = useState(doctorProfile.availableToday);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [notes, setNotes] = useState({});
  const [noteDraft, setNoteDraft] = useState('');
  const [noteTargetId, setNoteTargetId] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [availabilityTick, setAvailabilityTick] = useState(0);
  const [leaveDates, setLeaveDates] = useState([]);

  const waiting = appointments.filter((a) => a.status === 'Waiting');
  const inConsultation = appointments.filter((a) => a.status === 'In Consultation');
  const completed = appointments.filter((a) => a.status === 'Completed');
  const todaysEarnings = completed.length * (doctorProfile.consultationFee || 0);

  function advanceStatus(id) {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = statusOrder.indexOf(a.status);
        const next = statusOrder[Math.min(idx + 1, statusOrder.length - 1)];
        return { ...a, status: next };
      })
    );
  }

  function openNoteEditor(id) {
    setNoteTargetId(id);
    setNoteDraft(notes[id] || '');
  }

  function saveNote() {
    setNotes((prev) => ({ ...prev, [noteTargetId]: noteDraft }));
    setNoteTargetId(null);
    setNoteDraft('');
  }

  function toggleSlot(day, slot) {
    const daySlots = doctorProfile.weeklyAvailability[day] || [];
    if (daySlots.includes(slot)) {
      doctorProfile.weeklyAvailability[day] = daySlots.filter((s) => s !== slot);
    } else {
      doctorProfile.weeklyAvailability[day] = [...daySlots, slot];
    }
    // weeklyAvailability is mutated in place on the shared mock doctor record,
    // so this update is also reflected on the doctor's public profile page.
    setAvailabilityTick((t) => t + 1);
  }

  function toggleLeaveDate(date) {
    setLeaveDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  }

  const noteTargetAppointment = appointments.find((a) => a.id === noteTargetId);

  return (
    <div className="al-container" style={{ paddingTop: 28 }}>
      <div className="al-flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{user?.name || doctorProfile.name}</h1>
          <p className="al-muted" style={{ margin: 0 }}>{doctorProfile.specialization} • Doctor Dashboard</p>
        </div>
        <button className="al-btn al-btn-secondary" onClick={() => setAvailable((v) => !v)}>
          {available ? <ToggleRight size={18} color="var(--al-secondary)" /> : <ToggleLeft size={18} />}
          {available ? 'Available Today' : 'Unavailable Today'}
        </button>
      </div>

      <div className="al-grid al-grid-4" style={{ marginBottom: 32 }}>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Today's Appointments</div>
          <div className="al-stat-value">{appointments.length}</div>
        </div>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Waiting Patients</div>
          <div className="al-stat-value">{waiting.length}</div>
        </div>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Completed Consultations</div>
          <div className="al-stat-value">{completed.length}</div>
        </div>
        <div className="al-stat-card">
          <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <IndianRupee size={13} /> Today's Earnings
          </div>
          <div className="al-stat-value">₹{todaysEarnings}</div>
        </div>
      </div>

      {/* Affiliated Hospital Card — Horizontally Longer/Wider (Info Left | Image Right) */}
      <div className="al-card" style={{ marginBottom: 28, overflow: 'hidden', padding: 0 }}>
        <div className="al-horizontal-card">
          <div className="al-horizontal-card-info" style={{ padding: '22px 24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="al-badge al-badge-neutral">🏥 {affiliatedHospital.type} Hospital</span>
                <span className="al-badge al-badge-neutral">📍 {affiliatedHospital.location}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, marginLeft: 'auto' }}>
                  <Star size={15} fill="var(--al-warning)" color="var(--al-warning)" /> {affiliatedHospital.rating}
                </div>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>{affiliatedHospital.name}</h3>
              <p className="al-muted" style={{ margin: '0 0 12px', fontSize: '0.88rem' }}>
                {affiliatedHospital.description}
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.86rem', marginBottom: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="var(--al-primary)" /> OPD Hours: <strong>{affiliatedHospital.opdTimings}</strong>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} color="var(--al-primary)" /> Contact: <strong>{affiliatedHospital.contact}</strong>
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div className="al-muted" style={{ fontSize: '0.8rem', marginBottom: 6, fontWeight: 600 }}>Specialized Departments:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {affiliatedHospital.departments.map((d) => (
                    <span key={d} className="al-badge al-badge-neutral">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--al-border)', paddingTop: 12, marginTop: 6 }}>
              <BedAvailability beds={affiliatedHospital.beds} hospital={affiliatedHospital} hospitalType={affiliatedHospital.type} compact />
            </div>
          </div>

          <div className="al-horizontal-card-image" style={{ minHeight: 220 }}>
            <img
              src={affiliatedHospital.image}
              alt={affiliatedHospital.imageAlt || `${affiliatedHospital.name} view`}
            />
          </div>
        </div>
      </div>

      <div className="al-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start', marginBottom: 28 }}>
        <div className="al-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><CalendarClock size={18} /> OPD Schedule</h4>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.time}</td>
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--al-primary)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setHistoryPatient(a.patient)}
                      >
                        {a.patient}
                      </button>
                    </td>
                    <td>{a.type}</td>
                    <td><AvailabilityBadge status={a.status === 'Completed' ? 'Available' : a.status === 'Waiting' ? 'Limited' : 'Available'} label={a.status} /></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {a.status !== 'Completed' && (
                        <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => advanceStatus(a.id)}>Advance</button>
                      )}
                      <button className="al-btn al-btn-secondary al-btn-sm" onClick={() => openNoteEditor(a.id)}>
                        <StickyNote size={13} /> {notes[a.id] ? 'Edit Note' : 'Add Note'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="al-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Users size={18} /> Waiting & In Consultation</h4>
          {waiting.length === 0 && inConsultation.length === 0 ? (
            <p className="al-muted">No patients waiting right now.</p>
          ) : (
            <div className="al-stack-sm">
              {[...waiting, ...inConsultation].map((a) => (
                <div key={a.id} className="al-flex-between" style={{ borderBottom: '1px solid var(--al-border)', paddingBottom: 10 }}>
                  <span>{a.patient}</span>
                  <span className="al-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><Clock size={14} /> {a.time}</span>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 12px' }}><CheckCircle2 size={18} /> Completed Consultations</h4>
          {completed.length === 0 ? (
            <p className="al-muted">No consultations completed yet.</p>
          ) : (
            <div className="al-stack-sm">
              {completed.map((a) => (
                <div key={a.id} className="al-flex-between">
                  <span>{a.patient}</span>
                  <span className="al-badge al-badge-available">Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="al-card" style={{ marginBottom: 28 }} key={`avail-${availabilityTick}`}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><CalendarClock size={18} /> Weekly Availability</h4>
        <p className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
          Toggle the slots you're free for each day — patients see this immediately on your public profile.
        </p>
        <div className="al-stack">
          {Object.keys(doctorProfile.weeklyAvailability).map((day) => (
            <div key={day}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>{day}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {doctorSlotOptions.map((slot) => {
                  const active = (doctorProfile.weeklyAvailability[day] || []).includes(slot);
                  return (
                    <button
                      key={slot}
                      className={`al-btn al-btn-sm ${active ? 'al-btn-primary' : 'al-btn-secondary'}`}
                      onClick={() => toggleSlot(day, slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="al-card">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><CalendarX2 size={18} /> Mark Leave / Unavailable Dates</h4>
        <p className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
          Block out upcoming dates you won't be available (demo only — not yet reflected in booking).
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nextDates().map((date) => {
            const onLeave = leaveDates.includes(date);
            return (
              <button
                key={date}
                className={`al-btn al-btn-sm ${onLeave ? 'al-btn-danger' : 'al-btn-secondary'}`}
                onClick={() => toggleLeaveDate(date)}
              >
                {onLeave && <XIcon size={12} />} {date}
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!noteTargetId}
        onClose={() => setNoteTargetId(null)}
        title={`Consultation Note — ${noteTargetAppointment ? noteTargetAppointment.patient : ''}`}
        footer={
          <>
            <button className="al-btn al-btn-secondary" onClick={() => setNoteTargetId(null)}>Cancel</button>
            <button className="al-btn al-btn-primary" onClick={saveNote}>Save Note</button>
          </>
        }
      >
        <textarea
          className="al-input"
          rows={5}
          style={{ resize: 'vertical' }}
          placeholder="Diagnosis, prescription, or referral notes..."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
        />
      </Modal>

      <Modal
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
        title={`Patient History — ${historyPatient || ''}`}
      >
        {(doctorPatientHistory[historyPatient] || []).length === 0 ? (
          <p className="al-muted">No previous visit history on record for this patient.</p>
        ) : (
          <div className="al-stack">
            {(doctorPatientHistory[historyPatient] || []).map((visit, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid var(--al-border)', paddingBottom: 10 }}>
                <div className="al-flex-between" style={{ marginBottom: 4 }}>
                  <strong>{visit.diagnosis}</strong>
                  <span className="al-muted" style={{ fontSize: '0.82rem' }}>{visit.date}</span>
                </div>
                <p className="al-muted" style={{ margin: 0, fontSize: '0.88rem' }}>{visit.notes}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
