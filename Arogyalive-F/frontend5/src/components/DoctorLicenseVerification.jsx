import { useEffect, useState } from 'react';
import {
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  FileCheck2,
} from 'lucide-react';

import {
  getAllDoctorLicenses,
  getDoctorLicenseFile,
  approveDoctorLicense,
  rejectDoctorLicense,
} from '../services/doctorLicenseService';

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object' && data.message) {
    return data.message;
  }

  return error?.message || 'The request failed.';
}

function statusStyle(status) {
  if (status === 'APPROVED') {
    return { background: '#dcfce7', color: '#166534' };
  }

  if (status === 'REJECTED') {
    return { background: '#fee2e2', color: '#991b1b' };
  }

  return { background: '#fef3c7', color: '#92400e' };
}

function isImage(contentType) {
  return contentType?.toLowerCase().startsWith('image/');
}

function isPdf(contentType) {
  return contentType?.toLowerCase() === 'application/pdf';
}

export default function DoctorLicenseVerification() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError('');

      const data = await getAllDoctorLicenses();

      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleView(document) {
    try {
      setError('');

      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }

      setPreview(null);
      setActionLoading(true);

      const response =
        await getDoctorLicenseFile(document.id);

      const contentType =
        response.headers?.['content-type'] ||
        document.contentType ||
        response.data?.type ||
        'application/octet-stream';

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      setPreview({
        url,
        contentType,
        fileName: document.fileName || 'Doctor Licence',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  function closePreview() {
    if (preview?.url) {
      window.URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
  }

  async function handleApprove(document) {
    const remarks = window.prompt(
      `Optional approval remarks for ${document.doctorName}:`,
      ''
    );

    if (remarks === null) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setMessage('');

      await approveDoctorLicense(document.id, remarks);

      setMessage(
        `Licence approved for ${document.doctorName}.`
      );

      await loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(document) {
    const remarks = window.prompt(
      `Enter the rejection reason for ${document.doctorName}:`
    );

    if (remarks === null) {
      return;
    }

    if (!remarks.trim()) {
      setError('A rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setMessage('');

      await rejectDoctorLicense(
        document.id,
        remarks.trim()
      );

      setMessage(
        `Licence rejected for ${document.doctorName}.`
      );

      await loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
              Doctor Licence Verification
            </h2>

            <p className="al-muted" style={{ margin: '6px 0 0' }}>
              Inspect each doctor's uploaded medical licence and
              approve or reject it.
            </p>
          </div>

          <button
            type="button"
            className="al-btn al-btn-secondary"
            onClick={loadDocuments}
            disabled={loading || actionLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {message && (
          <div
            role="status"
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 14,
              background: '#dcfce7',
              color: '#166534',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 14,
              background: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="al-card">
            Loading doctor licences...
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div className="al-card">
            <FileCheck2
              size={32}
              color="var(--al-primary)"
              style={{ marginBottom: 8 }}
            />

            <h3 style={{ margin: 0 }}>
              No Doctor Licences Submitted
            </h3>

            <p className="al-muted" style={{ marginBottom: 0 }}>
              Submitted licences will appear here for verification.
            </p>
          </div>
        )}

        <div className="al-stack">
          {documents.map((document) => (
            <article className="al-card" key={document.id}>
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
                  <h3 style={{ margin: '0 0 5px', fontSize: '1rem' }}>
                    {document.doctorName}
                  </h3>

                  <p className="al-muted" style={{ margin: 0 }}>
                    {document.doctorEmail}
                  </p>

                  <p style={{ margin: '10px 0 0' }}>
                    <strong>Document: </strong>
                    {document.fileName}
                  </p>

                  <p className="al-muted" style={{ margin: '5px 0 0' }}>
                    Uploaded:{' '}
                    {document.uploadedAt
                      ? new Date(document.uploadedAt).toLocaleString()
                      : '—'}
                  </p>
                </div>

                <span
                  style={{
                    ...statusStyle(document.verificationStatus),
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {document.verificationStatus}
                </span>
              </div>

              {document.adminRemarks && (
                <p style={{ marginBottom: 0 }}>
                  <strong>Admin remarks: </strong>
                  {document.adminRemarks}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  className="al-btn al-btn-secondary"
                  disabled={actionLoading}
                  onClick={() => handleView(document)}
                >
                  <Eye size={15} />
                  View Licence
                </button>

                {document.verificationStatus === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="al-btn al-btn-primary"
                      disabled={actionLoading}
                      onClick={() => handleApprove(document)}
                    >
                      <CheckCircle2 size={15} />
                      Approve
                    </button>

                    <button
                      type="button"
                      className="al-btn al-btn-danger"
                      disabled={actionLoading}
                      onClick={() => handleReject(document)}
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {preview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: 'min(1100px, 96vw)',
              height: 'min(850px, 92vh)',
              background: '#fff',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <strong>{preview.fileName}</strong>

              <button
                type="button"
                className="al-btn al-btn-secondary"
                onClick={closePreview}
                aria-label="Close licence preview"
              >
                <X size={18} />
                Close
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                background: '#f1f5f9',
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
            >
              {isImage(preview.contentType) ? (
                <img
                  src={preview.url}
                  alt={preview.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : isPdf(preview.contentType) ? (
                <iframe
                  title={preview.fileName}
                  src={preview.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    background: '#fff',
                  }}
                />
              ) : (
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open licence file
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}