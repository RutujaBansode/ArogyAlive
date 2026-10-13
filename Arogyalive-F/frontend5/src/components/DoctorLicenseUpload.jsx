import { useEffect, useState } from 'react';
import {
  FileCheck2,
  Upload,
  RefreshCw,
} from 'lucide-react';

import {
  getMyDoctorLicense,
  uploadMyDoctorLicense,
} from '../services/doctorLicenseService';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

function statusStyle(status) {
  if (status === 'APPROVED') {
    return {
      background: '#dcfce7',
      color: '#166534',
    };
  }

  if (status === 'REJECTED') {
    return {
      background: '#fee2e2',
      color: '#991b1b',
    };
  }

  return {
    background: '#fef3c7',
    color: '#92400e',
  };
}

function readError(error) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object' && data.message) {
    return data.message;
  }

  return error?.message || 'Something went wrong.';
}

export default function DoctorLicenseUpload() {
  const [document, setDocument] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDocument();
  }, []);

  async function loadDocument() {
    try {
      setLoading(true);
      setError('');

      const data = await getMyDoctorLicense();

      setDocument(data);
    } catch (err) {
      if (err?.response?.status === 404) {
        setDocument(null);
      } else {
        setError(readError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];

    setError('');
    setMessage('');

    if (!selected) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Choose a PDF, JPG, JPEG or PNG file.');
      setFile(null);
      event.target.value = '';
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError('The file must not exceed 10 MB.');
      setFile(null);
      event.target.value = '';
      return;
    }

    setFile(selected);
  }

  async function handleUpload() {
    if (!file) {
      setError('Please select your licence document first.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setMessage('');

      const saved = await uploadMyDoctorLicense(file);

      setDocument(saved);
      setFile(null);
      setMessage(
        'Licence uploaded successfully. It is now awaiting admin verification.'
      );

      const input = document.getElementById(
        'doctor-medical-license-file'
      );

      if (input) {
        input.value = '';
      }
    } catch (err) {
      setError(readError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="al-card" style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              margin: '0 0 8px',
            }}
          >
            <FileCheck2 size={20} />
            Medical Licence Verification
          </h3>

          <p className="al-muted" style={{ margin: 0 }}>
            Upload your medical licence or registration certificate
            for admin verification. Accepted formats: PDF, JPG,
            JPEG and PNG. Maximum size: 10 MB.
          </p>
        </div>

        <button
          type="button"
          className="al-btn al-btn-secondary"
          onClick={loadDocument}
          disabled={loading || uploading}
        >
          <RefreshCw size={15} />
          Refresh Status
        </button>
      </div>

      {loading && (
        <p className="al-muted" style={{ marginTop: 16 }}>
          Loading licence status...
        </p>
      )}

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: '#fee2e2',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: '#dcfce7',
            color: '#166534',
          }}
        >
          {message}
        </div>
      )}

      {document && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <strong>
                {document.fileName}
              </strong>

              <p className="al-muted" style={{ margin: '6px 0 0' }}>
                Submitted:{' '}
                {document.uploadedAt
                  ? new Date(document.uploadedAt).toLocaleString()
                  : '—'}
              </p>
            </div>

            <span
              style={{
                ...statusStyle(document.verificationStatus),
                display: 'inline-block',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: '0.78rem',
                fontWeight: 800,
              }}
            >
              {document.verificationStatus}
            </span>
          </div>

          {document.adminRemarks && (
            <p style={{ marginBottom: 0, marginTop: 12 }}>
              <strong>Admin remarks: </strong>
              {document.adminRemarks}
            </p>
          )}
        </div>
      )}

      {document?.verificationStatus === 'APPROVED' && (
        <p style={{ color: '#166534', marginTop: 14 }}>
          Your licence has been approved by the administrator.
        </p>
      )}

      {document?.verificationStatus === 'REJECTED' && (
        <p style={{ color: '#991b1b', marginTop: 14 }}>
          Your licence was rejected. Select a corrected document below
          and upload it again for review.
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <label
          className="al-label"
          htmlFor="doctor-medical-license-file"
        >
          {document
            ? 'Replace Medical Licence'
            : 'Select Medical Licence'}
        </label>

        <input
          id="doctor-medical-license-file"
          className="al-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading || loading}
        />

        {file && (
          <p className="al-muted" style={{ marginTop: 8 }}>
            Selected: {file.name}
          </p>
        )}

        <button
          type="button"
          className="al-btn al-btn-primary"
          style={{ marginTop: 10 }}
          disabled={!file || uploading || loading}
          onClick={handleUpload}
        >
          <Upload size={16} />
          {uploading
            ? 'Uploading...'
            : document
              ? 'Upload Replacement Licence'
              : 'Upload Licence'}
        </button>

        {document && file && (
          <p className="al-muted" style={{ marginTop: 8 }}>
            Replacing the licence sends it back to PENDING status
            until an administrator reviews it.
          </p>
        )}
      </div>
    </section>
  );
}