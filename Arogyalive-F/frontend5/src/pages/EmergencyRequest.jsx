
import { useState } from 'react';
import { createEmergencyRequest } from '../services/emergencyRequestService';

const initialForm = {
  patientName: '',
  patientContact: '',
  pickupLocation: '',
  emergencyType: 'Medical Emergency',
  description: '',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '15px',
  marginTop: '6px',
  background: '#ffffff',
};

const labelStyle = {
  display: 'block',
  marginBottom: '18px',
  fontWeight: 500,
  color: '#374151',
};

export default function EmergencyRequest() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);

    try {
      const created = await createEmergencyRequest({
        patientName: form.patientName.trim(),
        patientContact: form.patientContact.trim(),
        pickupLocation: form.pickupLocation.trim(),
        emergencyType: form.emergencyType,
        description: form.description.trim(),
      });

      setResult(created ?? {});
      setForm(initialForm);
    } catch (err) {
      const responseMessage = err.response?.data?.message;

      setError(
        responseMessage ||
        (typeof err.response?.data === 'string'
          ? err.response.data
          : null) ||
        (err.response?.status === 404
          ? 'The emergency-request API was not found. Check the Spring Boot controller endpoint.'
          : err.message === 'Network Error'
            ? 'Cannot connect to the backend. Make sure Spring Boot is running on port 8080.'
            : 'Unable to submit the request. Please check the backend console.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: '760px',
        margin: '35px auto',
        padding: '24px',
        color: '#1f2937',
      }}
    >
      <header style={{ marginBottom: '25px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '30px' }}>
          Emergency Ambulance
        </h1>

        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Enter the patient and pickup details to request an ambulance
          through ArogyAlive.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          background: '#ffffff',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
        }}
      >
        <label style={labelStyle}>
          Patient Name *
          <input
            style={inputStyle}
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            placeholder="Enter patient's full name"
            autoComplete="name"
            required
            maxLength={100}
          />
        </label>

        <label style={labelStyle}>
          Patient Contact Number *
          <input
            style={inputStyle}
            type="tel"
            name="patientContact"
            value={form.patientContact}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number"
            autoComplete="tel"
            required
          />
        </label>

        <label style={labelStyle}>
          Pickup Location *
          <textarea
            style={{
              ...inputStyle,
              minHeight: '90px',
              resize: 'vertical',
            }}
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            placeholder="Enter area, street, landmark and city"
            required
            maxLength={500}
          />
        </label>

        <label style={labelStyle}>
          Emergency Type *
          <select
            style={inputStyle}
            name="emergencyType"
            value={form.emergencyType}
            onChange={handleChange}
            required
          >
            <option value="Medical Emergency">
              Medical Emergency
            </option>
            <option value="Accident">
              Road Accident
            </option>
            <option value="Breathing Difficulty">
              Breathing Difficulty
            </option>
            <option value="Unconscious Patient">
              Unconscious Patient
            </option>
            <option value="Pregnancy Emergency">
              Pregnancy Emergency
            </option>
            <option value="Other">
              Other
            </option>
          </select>
        </label>

        <label style={labelStyle}>
          Additional Emergency Details
          <textarea
            style={{
              ...inputStyle,
              minHeight: '90px',
              resize: 'vertical',
            }}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Briefly describe the emergency (optional)"
            maxLength={1000}
          />
        </label>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#fef2f2',
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            role="status"
            style={{
              padding: '16px',
              marginBottom: '18px',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              background: '#f0fdf4',
              color: '#166534',
            }}
          >
            <strong>Emergency request submitted successfully!</strong>

            {result.id != null && (
              <p style={{ marginBottom: '4px' }}>
                Request ID: {result.id}
              </p>
            )}

            <p style={{ marginBottom: 0 }}>
              Status: {result.status || 'Submitted'}
            </p>

            <p style={{ marginBottom: 0, fontSize: '14px' }}>
              Your request has been submitted. An ambulance is not
              confirmed or dispatched until a driver or dispatcher
              accepts it.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            background: submitting ? '#9ca3af' : '#dc2626',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '16px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting Request...' : 'Request Ambulance'}
        </button>
      </form>

      <p
        style={{
          marginTop: '18px',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#6b7280',
        }}
      >
        For a real medical emergency in India, call 112 or 108
        where available. Do not rely on this development application
        as an emergency dispatch service.
      </p>
    </main>
  );
}