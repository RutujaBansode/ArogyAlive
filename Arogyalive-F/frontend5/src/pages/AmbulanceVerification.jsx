import React, { useEffect, useState } from 'react';

import {
  getAllAmbulances,
  getAmbulanceDocuments,
  approveAmbulanceDocument,
  rejectAmbulanceDocument,
  verifyAmbulance,
} from '../services/ambulanceDocumentService';

function AmbulanceVerification() {
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAmbulances();
  }, []);

  async function loadAmbulances() {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await getAllAmbulances();

      const ambulanceList = Array.isArray(data)
        ? data
        : [];

      setAmbulances(ambulanceList);

      if (ambulanceList.length > 0) {
        await selectAmbulance(ambulanceList[0]);
      } else {
        setSelectedAmbulance(null);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Unable to load ambulances:', err);

      setAmbulances([]);
      setSelectedAmbulance(null);
      setDocuments([]);

      const status = err.response?.status;
      const backendMessage = err.response?.data;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again as an admin.'
        );
      } else if (status === 403) {
        setError(
          'Access denied. Please log in using an Admin account.'
        );
      } else if (typeof backendMessage === 'string') {
        setError(backendMessage);
      } else {
        setError(
          'Could not load ambulance information.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function selectAmbulance(ambulance) {
    try {
      setSelectedAmbulance(ambulance);
      setDocumentsLoading(true);
      setMessage('');
      setError('');

      const data = await getAmbulanceDocuments(
        ambulance.id
      );

      setDocuments(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        'Unable to load ambulance documents:',
        err
      );

      setDocuments([]);

      const status = err.response?.status;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          'You are not authorized to view these ambulance documents.'
        );
      } else {
        setError(
          'Could not load ambulance documents.'
        );
      }
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function refreshDocuments() {
    if (!selectedAmbulance) {
      return;
    }

    try {
      setDocumentsLoading(true);

      const data = await getAmbulanceDocuments(
        selectedAmbulance.id
      );

      setDocuments(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        'Unable to refresh documents:',
        err
      );

      setDocuments([]);

      const status = err.response?.status;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          'You are not authorized to view these documents.'
        );
      } else {
        setError(
          'Could not refresh ambulance documents.'
        );
      }
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function handleApprove(documentId) {
    try {
      setMessage('');
      setError('');

      await approveAmbulanceDocument(
        documentId,
        'Document approved by admin'
      );

      setMessage(
        'Document approved successfully.'
      );

      await refreshDocuments();

    } catch (err) {
      console.error(
        'Unable to approve document:',
        err
      );

      const status = err.response?.status;
      const backendMessage = err.response?.data;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          'Only an Admin can approve documents.'
        );
      } else if (typeof backendMessage === 'string') {
        setError(backendMessage);
      } else {
        setError(
          'Could not approve the document.'
        );
      }
    }
  }

  async function handleReject(documentId) {
    try {
      setMessage('');
      setError('');

      await rejectAmbulanceDocument(
        documentId,
        'Document rejected by admin'
      );

      setMessage(
        'Document rejected successfully.'
      );

      await refreshDocuments();

    } catch (err) {
      console.error(
        'Unable to reject document:',
        err
      );

      const status = err.response?.status;
      const backendMessage = err.response?.data;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          'Only an Admin can reject documents.'
        );
      } else if (typeof backendMessage === 'string') {
        setError(backendMessage);
      } else {
        setError(
          'Could not reject the document.'
        );
      }
    }
  }

  async function handleVerifyAmbulance() {
    if (!selectedAmbulance) {
      return;
    }

    try {
      setMessage('');
      setError('');

      const verified = await verifyAmbulance(
        selectedAmbulance.id
      );

      setSelectedAmbulance(verified);

      setAmbulances((current) =>
        current.map((ambulance) =>
          ambulance.id === verified.id
            ? verified
            : ambulance
        )
      );

      setMessage(
        'Ambulance verified successfully.'
      );

      await refreshDocuments();

    } catch (err) {
      console.error(
        'Unable to verify ambulance:',
        err
      );

      const status = err.response?.status;
      const backendMessage = err.response?.data;

      if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          'Only an Admin can verify an ambulance.'
        );
      } else if (typeof backendMessage === 'string') {
        setError(backendMessage);
      } else {
        setError(
          'Ambulance cannot be verified. Approve all required documents first.'
        );
      }
    }
  }

  function statusStyle(status) {
    if (
      status === 'VERIFIED' ||
      status === 'APPROVED'
    ) {
      return {
        background: '#dcfce7',
        color: '#166534',
      };
    }

    if (
      status === 'REJECTED' ||
      status === 'SUSPENDED'
    ) {
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

  function getDocumentLabel(type) {
    switch (type) {
      case 'DRIVER_PHOTO':
        return 'Driver Photo';

      case 'DRIVING_LICENSE':
        return 'Driving Licence';

      case 'VEHICLE_RC':
        return 'Vehicle Registration Certificate';

      case 'INSURANCE':
        return 'Insurance Certificate';

      case 'FITNESS_CERTIFICATE':
        return 'Fitness Certificate';

      default:
        return type;
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '30px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1>Ambulance Verification</h1>

        <p>
          Loading ambulance information...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1>
        Ambulance Verification
      </h1>

      <p>
        Review uploaded documents and verify
        ambulance operators.
      </p>

      {message && (
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: '8px',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      {ambulances.length === 0 ? (
        <div
          style={{
            padding: '25px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            background: '#fff',
          }}
        >
          <h2>
            No ambulances found
          </h2>

          <p>
            There are currently no registered
            ambulances available for verification.
          </p>

          {error && (
            <button
              type="button"
              onClick={loadAmbulances}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '320px 1fr',
            gap: '25px',
          }}
        >
          {/* Ambulance list */}
          <div>
            <h2>
              Ambulances
            </h2>

            {ambulances.map(
              (ambulance) => (
                <button
                  key={ambulance.id}
                  type="button"
                  onClick={() =>
                    selectAmbulance(
                      ambulance
                    )
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '15px',
                    marginBottom: '10px',
                    borderRadius: '10px',
                    border:
                      selectedAmbulance?.id ===
                      ambulance.id
                        ? '2px solid #2563eb'
                        : '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <strong>
                    {ambulance.vehicleNumber}
                  </strong>

                  <br />

                  <span>
                    {ambulance.driverName}
                  </span>

                  <br />

                  <span
                    style={{
                      ...statusStyle(
                        ambulance.verificationStatus
                      ),
                      display:
                        'inline-block',
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '12px',
                    }}
                  >
                    {
                      ambulance.verificationStatus
                    }
                  </span>
                </button>
              )
            )}
          </div>

          {/* Verification details */}
          <div>
            {selectedAmbulance && (
              <>
                <h2>
                  {
                    selectedAmbulance.vehicleNumber
                  }
                </h2>

                <p>
                  <strong>
                    Driver:
                  </strong>{' '}
                  {
                    selectedAmbulance.driverName
                  }
                </p>

                <p>
                  <strong>
                    Contact:
                  </strong>{' '}
                  {
                    selectedAmbulance.driverContact
                  }
                </p>

                <p>
                  <strong>
                    Type:
                  </strong>{' '}
                  {
                    selectedAmbulance.type
                  }
                </p>

                <p>
                  <strong>
                    Location:
                  </strong>{' '}
                  {
                    selectedAmbulance.currentLocation
                  }
                </p>

                <p>
                  <strong>
                    Verification:
                  </strong>{' '}

                  <span
                    style={{
                      ...statusStyle(
                        selectedAmbulance.verificationStatus
                      ),
                      padding:
                        '5px 10px',
                      borderRadius: '5px',
                    }}
                  >
                    {
                      selectedAmbulance.verificationStatus
                    }
                  </span>
                </p>

                <hr />

                <h3>
                  Uploaded Documents
                </h3>

                {documentsLoading ? (
                  <p>
                    Loading documents...
                  </p>
                ) : documents.length === 0 ? (
                  <p>
                    No documents uploaded yet.
                  </p>
                ) : (
                  documents.map(
                    (document) => (
                      <div
                        key={
                          document.id
                        }
                        style={{
                          padding:
                            '18px',
                          marginBottom:
                            '12px',
                          border:
                            '1px solid #ddd',
                          borderRadius:
                            '10px',
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                          }}
                        >
                          {getDocumentLabel(
                            document.documentType
                          )}
                        </h3>

                        <p>
                          <strong>
                            File:
                          </strong>{' '}
                          {
                            document.fileName
                          }
                        </p>

                        <p>
                          <strong>
                            Type:
                          </strong>{' '}
                          {
                            document.contentType
                          }
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{' '}

                          <span
                            style={{
                              ...statusStyle(
                                document.verificationStatus
                              ),
                              display:
                                'inline-block',
                              padding:
                                '5px 10px',
                              borderRadius:
                                '5px',
                            }}
                          >
                            {
                              document.verificationStatus
                            }
                          </span>
                        </p>

                        {document.adminRemarks && (
                          <p>
                            <strong>
                              Admin Remark:
                            </strong>{' '}
                            {
                              document.adminRemarks
                            }
                          </p>
                        )}

                        {document.uploadedAt && (
                          <p>
                            <strong>
                              Uploaded:
                            </strong>{' '}
                            {
                              document.uploadedAt
                            }
                          </p>
                        )}

                        {document.verificationStatus ===
                          'PENDING' && (
                          <div
                            style={{
                              marginTop:
                                '12px',
                              display:
                                'flex',
                              gap: '10px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(
                                  document.id
                                )
                              }
                              style={{
                                padding:
                                  '9px 14px',
                                border:
                                  'none',
                                borderRadius:
                                  '7px',
                                cursor:
                                  'pointer',
                              }}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleReject(
                                  document.id
                                )
                              }
                              style={{
                                padding:
                                  '9px 14px',
                                border:
                                  'none',
                                borderRadius:
                                  '7px',
                                cursor:
                                  'pointer',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )
                )}

                <hr />

                {selectedAmbulance.verificationStatus !==
                  'VERIFIED' && (
                  <button
                    type="button"
                    onClick={
                      handleVerifyAmbulance
                    }
                    style={{
                      padding:
                        '12px 20px',
                      marginTop: '15px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight:
                        '600',
                    }}
                  >
                    Verify Ambulance
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AmbulanceVerification;