import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CalendarCheck, Home as HomeIcon, Eye, CalendarPlus, FileDown, Stethoscope, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { hospitals, doctors } from '../data/mockData';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import BedAvailability from '../components/BedAvailability';

const appointmentTypes = ['OPD', 'Consultation'];

// Dynamically generate current and upcoming dates based on system date
function generateDynamicDates(count = 6) {
  const arr = [];
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const dayNum = d.getDate();
    const year = d.getFullYear();

    let displayLabel = `${dayNum} ${monthName} ${year}`;
    let sub = dayName;

    if (i === 0) {
      displayLabel = 'Today';
      sub = `${dayNum} ${monthName}`;
    } else if (i === 1) {
      displayLabel = 'Tomorrow';
      sub = `${dayNum} ${monthName}`;
    }

    arr.push({
      iso,
      displayLabel,
      sub,
      fullFormatted: `${displayLabel} • ${dayNum} ${monthName} ${year}`,
    });
  }
  return arr;
}

function parseTimeTo24h(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatICSLocal(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function formatICSUTC(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function downloadICS(appointment) {
  const { hours, minutes } = parseTimeTo24h(appointment.time);
  const [y, m, d] = appointment.date.split('-').map(Number);
  const start = new Date(y, m - 1, d, hours, minutes);
  const end = new Date(start.getTime() + 30 * 60000);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arogya Live//Appointment//EN',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@arogyalive.demo`,
    `DTSTAMP:${formatICSUTC(new Date())}`,
    `DTSTART:${formatICSLocal(start)}`,
    `DTEND:${formatICSLocal(end)}`,
    `SUMMARY:Appointment with ${appointment.doctorName} - Arogya Live`,
    `DESCRIPTION:Token ${appointment.tokenNumber} \\n${appointment.type} appointment at ${appointment.hospitalName}.`,
    `LOCATION:${appointment.hospitalName}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `arogya-live-appointment-${appointment.tokenNumber}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadConfirmationPDF(appointment, doctor, hospital) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(17);
  doc.setFont(undefined, 'bold');
  doc.text('Arogya Live', 14, y);
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Appointment Confirmation', 14, y + 7);
  y += 22;

  doc.setDrawColor(200);
  doc.line(14, y - 8, 196, y - 8);

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Appointment Details', 14, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  y += 8;
  doc.text(`Appointment ID: ${appointment.id}`, 14, y); y += 7;
  doc.text(`OPD Token: ${appointment.tokenNumber}`, 14, y); y += 7;
  doc.text(`Date: ${appointment.date}`, 14, y); y += 7;
  doc.text(`Time: ${appointment.time}`, 14, y); y += 7;
  doc.text(`Type: ${appointment.type}`, 14, y); y += 7;
  doc.text(`Status: ${appointment.status}`, 14, y); y += 14;

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Doctor Details', 14, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  y += 8;
  doc.text(`Name: ${appointment.doctorName}`, 14, y); y += 7;
  if (doctor) {
    doc.text(`Specialization: ${doctor.specialization}`, 14, y); y += 7;
    doc.text(`Qualification: ${doctor.qualification}`, 14, y); y += 7;
    doc.text(`OPD Timings: ${doctor.opdTimings}`, 14, y); y += 7;
  }
  y += 7;

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Hospital Details', 14, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  y += 8;
  doc.text(`Name: ${appointment.hospitalName}`, 14, y); y += 7;
  if (hospital) {
    doc.text(`Location: ${hospital.location}`, 14, y); y += 7;
    doc.text(`Contact: ${hospital.contact}`, 14, y); y += 7;
  }

  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text('This is a frontend demo confirmation generated by Arogya Live.', 14, y);

  doc.save(`arogya-live-appointment-${appointment.tokenNumber}.pdf`);
}

export default function Appointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dynamicDates = useMemo(() => generateDynamicDates(6), []);

  const [hospitalId, setHospitalId] = useState(searchParams.get('hospitalId') || 'h1');
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [date, setDate] = useState(dynamicDates[0].iso);
  const [time, setTime] = useState(searchParams.get('slot') || '');
  const [type, setType] = useState('OPD');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [confirmation, setConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (doctorId && !hospitalId) {
      const doc = doctors.find((d) => d.id === doctorId);
      if (doc) setHospitalId(doc.hospitalId);
    }
  }, [doctorId, hospitalId]);

  const availableDoctors = useMemo(() => {
    if (!hospitalId) return doctors;
    return doctors.filter((d) => d.hospitalId === hospitalId);
  }, [hospitalId]);

  // Default doctor when hospital is selected
  useEffect(() => {
    if (hospitalId && !doctorId && availableDoctors.length > 0) {
      setDoctorId(availableDoctors[0].id);
    }
  }, [hospitalId, doctorId, availableDoctors]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];
  const selectedHospital = hospitals.find((h) => h.id === (hospitalId || selectedDoctor?.hospitalId)) || hospitals[0];

  function validate() {
    const errors = {};
    if (!patientName.trim()) errors.patientName = 'Please enter your name.';
    if (!hospitalId) errors.hospitalId = 'Please select a hospital.';
    if (!doctorId) errors.doctorId = 'Please select a doctor.';
    if (!date) errors.date = 'Please select a date.';
    if (!time) errors.time = 'Please select an available time slot.';
    return errors;
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        patientName: patientName.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        date,
        time,
        type,
      });
      setConfirmation(appointment);
    } catch {
      setFieldErrors({ form: 'Could not create the appointment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  // After Confirmation View
  if (confirmation) {
    const isGeneralHospital = selectedHospital.type === 'General' || selectedHospital.name.toLowerCase().includes('general');

    return (
      <div className="al-container" style={{ paddingTop: 36, maxWidth: 680 }}>
        <div className="al-card" style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="al-icon-circle" style={{ margin: '0 auto 12px', background: 'rgba(18,168,120,0.14)', color: 'var(--al-secondary)' }}>
              <CalendarCheck size={28} />
            </div>
            <h2 style={{ marginBottom: 4 }}>Appointment Confirmed</h2>
            <p className="al-muted" style={{ margin: 0 }}>Your OPD token has been generated successfully.</p>
          </div>

          <div className="al-table-wrap" style={{ marginBottom: 20 }}>
            <table className="al-table">
              <tbody>
                <tr><th>Appointment ID</th><td>{confirmation.id}</td></tr>
                <tr><th>OPD Token</th><td><strong>{confirmation.tokenNumber}</strong></td></tr>
                <tr><th>Doctor</th><td>{confirmation.doctorName}</td></tr>
                <tr><th>Hospital</th><td>{confirmation.hospitalName}</td></tr>
                <tr><th>Date</th><td>{confirmation.date}</td></tr>
                <tr><th>Time</th><td>{confirmation.time}</td></tr>
                <tr><th>Status</th><td><span className="al-badge al-badge-available">{confirmation.status}</span></td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <button className="al-btn al-btn-secondary" onClick={() => downloadICS(confirmation)}>
              <CalendarPlus size={16} /> Add to Calendar
            </button>
            <button className="al-btn al-btn-secondary" onClick={() => downloadConfirmationPDF(confirmation, selectedDoctor, selectedHospital)}>
              <FileDown size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Requirement 16: Doctor Availability Section */}
        <div className="al-card" style={{ marginBottom: 24, border: '1.5px solid var(--al-primary)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--al-primary-dark)' }}>
            <Stethoscope size={18} /> Doctor Availability
          </h4>
          <div className="al-grid al-grid-2" style={{ gap: 14, fontSize: '0.92rem' }}>
            <div>
              <div className="al-muted" style={{ fontSize: '0.8rem' }}>Doctor Name</div>
              <strong>{selectedDoctor.name}</strong>
            </div>
            <div>
              <div className="al-muted" style={{ fontSize: '0.8rem' }}>Specialization</div>
              <span>{selectedDoctor.specialization} ({selectedDoctor.qualification})</span>
            </div>
            <div>
              <div className="al-muted" style={{ fontSize: '0.8rem' }}>Hospital</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={13} /> {selectedHospital.name}
              </span>
            </div>
            <div>
              <div className="al-muted" style={{ fontSize: '0.8rem' }}>Available Date & Time</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <Clock size={13} /> {confirmation.date} • {selectedDoctor.opdTimings}
              </span>
            </div>
            <div>
              <div className="al-muted" style={{ fontSize: '0.8rem' }}>Appointment Status</div>
              <span className="al-badge al-badge-available">Available / Confirmed</span>
            </div>
          </div>
        </div>

        {/* Requirement 15 & Requirement 1: Bed Options Section (General Hospital has strictly ONE General Bed option) */}
        <div className="al-card" style={{ marginBottom: 28 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            🛏️ Bed Availability at {selectedHospital.name}
          </h4>
          <p className="al-muted" style={{ fontSize: '0.86rem', marginBottom: 14 }}>
            {isGeneralHospital
              ? 'General Hospital bed options: Showing available General Bed ward option.'
              : 'Current real-time bed status at this hospital.'}
          </p>

          <BedAvailability
            beds={selectedHospital.beds}
            hospital={selectedHospital}
            hospitalType={selectedHospital.type}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="al-btn al-btn-secondary" onClick={() => navigate('/patient/dashboard')}>
            <Eye size={16} /> View in Patient Dashboard
          </button>
          <button className="al-btn al-btn-primary" onClick={() => navigate('/')}>
            <HomeIcon size={16} /> Return Home
          </button>
        </div>
      </div>
    );
  }

  // Booking Form View
  return (
    <div className="al-container" style={{ paddingTop: 32, maxWidth: 640 }}>
      <h1 style={{ marginBottom: 6 }}>Book an Appointment</h1>
      <p className="al-muted" style={{ marginBottom: 24 }}>
        Select a hospital, specialist doctor, dynamically generated date and available OPD time slot.
      </p>

      <form className="al-card al-stack" onSubmit={handleConfirm} noValidate>
        <div>
          <label className="al-label">Your Name *</label>
          <input
            className="al-input"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Full patient name"
            style={fieldErrors.patientName ? { borderColor: 'var(--al-danger)' } : undefined}
          />
          {fieldErrors.patientName && <p style={{ color: 'var(--al-danger)', fontSize: '0.8rem', marginTop: 6 }}>{fieldErrors.patientName}</p>}
        </div>

        <div>
          <label className="al-label">Hospital (Solapur) *</label>
          <select
            className="al-select"
            value={hospitalId}
            onChange={(e) => {
              setHospitalId(e.target.value);
              setDoctorId('');
            }}
            style={fieldErrors.hospitalId ? { borderColor: 'var(--al-danger)' } : undefined}
          >
            <option value="">Select a hospital in Solapur</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
          {fieldErrors.hospitalId && <p style={{ color: 'var(--al-danger)', fontSize: '0.8rem', marginTop: 6 }}>{fieldErrors.hospitalId}</p>}
        </div>

        <div>
          <label className="al-label">Doctor *</label>
          <select
            className="al-select"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            style={fieldErrors.doctorId ? { borderColor: 'var(--al-danger)' } : undefined}
          >
            <option value="">Select an available doctor</option>
            {availableDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization} (Fee: ₹{d.consultationFee})
              </option>
            ))}
          </select>
          {fieldErrors.doctorId && <p style={{ color: 'var(--al-danger)', fontSize: '0.8rem', marginTop: 6 }}>{fieldErrors.doctorId}</p>}
        </div>

        {/* Requirement 14: Real-time Dynamic Dates generated from current system date */}
        <div>
          <label className="al-label" style={{ marginBottom: 8, display: 'block' }}>
            Available Dates *
          </label>
          <div className="al-date-pills">
            {dynamicDates.map((item) => {
              const isSelected = date === item.iso;
              return (
                <button
                  type="button"
                  key={item.iso}
                  className={`al-date-pill${isSelected ? ' active' : ''}`}
                  onClick={() => setDate(item.iso)}
                >
                  <span>{item.displayLabel}</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>{item.sub}</span>
                </button>
              );
            })}
          </div>
          {fieldErrors.date && <p style={{ color: 'var(--al-danger)', fontSize: '0.8rem', marginTop: 6 }}>{fieldErrors.date}</p>}
        </div>

        <div className="al-grid al-grid-2">
          <div>
            <label className="al-label">Appointment Type</label>
            <select className="al-select" value={type} onChange={(e) => setType(e.target.value)}>
              {appointmentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="al-label">OPD Timings</label>
            <input
              className="al-input"
              disabled
              value={selectedDoctor ? selectedDoctor.opdTimings : '9:00 AM – 5:00 PM'}
              style={{ background: 'var(--al-surface-hover)' }}
            />
          </div>
        </div>

        <div>
          <label className="al-label">Available Time Slot *</label>
          <div
            style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', padding: fieldErrors.time ? 10 : 0,
              border: fieldErrors.time ? '1.5px solid var(--al-danger)' : 'none', borderRadius: 10,
            }}
          >
            {(selectedDoctor ? Object.values(selectedDoctor.weeklyAvailability).flat() : []).length === 0 && (
              <p className="al-muted">Select a doctor to see available time slots.</p>
            )}
            {[...new Set(selectedDoctor ? Object.values(selectedDoctor.weeklyAvailability).flat() : [])].map((slot) => (
              <button
                type="button"
                key={slot}
                className={`al-btn al-btn-sm ${time === slot ? 'al-btn-primary' : 'al-btn-secondary'}`}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          {fieldErrors.time && <p style={{ color: 'var(--al-danger)', fontSize: '0.8rem', marginTop: 6 }}>{fieldErrors.time}</p>}
        </div>

        {fieldErrors.form && <p style={{ color: 'var(--al-danger)', fontSize: '0.88rem' }}>{fieldErrors.form}</p>}

        <button className="al-btn al-btn-primary al-btn-block" disabled={submitting} type="submit" style={{ marginTop: 8 }}>
          {submitting ? 'Confirming Appointment...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}
