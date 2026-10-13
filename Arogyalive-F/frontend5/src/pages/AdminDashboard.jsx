import { useEffect, useState } from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  Siren,
  BedDouble,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck2,
  Eye,
  X,
} from 'lucide-react';

import {
  hospitals,
  doctors,
  mockPatients,
  mockStaff,
  departments,
  mockAppointments,
} from '../data/mockData';

import {
  getAllAmbulances,
  getAmbulanceDocuments,
  getAmbulanceDocumentFile,
  approveAmbulanceDocument,
  rejectAmbulanceDocument,
  verifyAmbulance,
} from '../services/ambulanceDocumentService';

const sections = [
  'Hospitals',
  'Doctors',
  'Receptionists',
  'Patients',
  'Ambulance Drivers',
  'Departments',
  'Beds',
  'Appointments',
];

const REQUIRED_DOCUMENT_TYPES = [
  'DRIVING_LICENSE',
  'VEHICLE_RC',
  'INSURANCE',
  'FITNESS_CERTIFICATE',
];

const DOCUMENT_LABELS = {
  DRIVER_PHOTO: 'Driver Photo',
  DRIVING_LICENSE: 'Driving Licence',
  VEHICLE_RC: 'Vehicle Registration Certificate',
  INSURANCE: 'Insurance Certificate',
  FITNESS_CERTIFICATE: 'Fitness Certificate',
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim() !== '') {
    return data;
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.message === 'string' &&
    data.message.trim() !== ''
  ) {
    return data.message;
  }

  if (
    typeof error?.message === 'string' &&
    error.message.trim() !== ''
  ) {
    return error.message;
  }

  return fallback;
}

function getStatusStyle(status) {
  switch (status) {
    case 'VERIFIED':
      return {
        background: '#dcfce7',
        color: '#166534',
      };

    case 'APPROVED':
      return {
        background: '#dcfce7',
        color: '#166534',
      };

    case 'REJECTED':
      return {
        background: '#fee2e2',
        color: '#991b1b',
      };

    case 'PENDING':
    default:
      return {
        background: '#fef3c7',
        color: '#92400e',
      };
  }
}

function getDocumentStatus(document) {
  return (
    document?.verificationStatus ||
    document?.status ||
    'PENDING'
  );
}

function isImageType(contentType) {
  return (
    typeof contentType === 'string' &&
    contentType.toLowerCase().startsWith('image/')
  );
}

function isPdfType(contentType) {
  return (
    typeof contentType === 'string' &&
    contentType.toLowerCase() === 'application/pdf'
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] =
    useState('Hospitals');

  const [ambulances, setAmbulances] = useState([]);
  const [ambulanceDocuments, setAmbulanceDocuments] =
    useState({});
  const [selectedAmbulanceId, setSelectedAmbulanceId] =
    useState(null);

  const [ambulanceLoading, setAmbulanceLoading] =
    useState(false);

  const [ambulanceActionLoading, setAmbulanceActionLoading] =
    useState(false);

  const [ambulanceError, setAmbulanceError] =
    useState('');

  const [ambulanceMessage, setAmbulanceMessage] =
    useState('');

  /*
   * Document preview state.
   *
   * When the admin clicks "View Document",
   * the actual uploaded PDF/image is fetched
   * from the backend and displayed here.
   */
  const [previewDocument, setPreviewDocument] =
    useState(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState('');

  const totalBeds = hospitals.reduce(
    (sum, h) =>
      sum +
      h.beds.general.available +
      h.beds.icu.available,
    0
  );

  const receptionists = mockStaff.filter(
    (s) => s.role === 'Receptionist'
  );

  const stats = [
    {
      label: 'Total Hospitals',
      value: hospitals.length,
      Icon: Building2,
    },
    {
      label: 'Total Doctors',
      value: doctors.length,
      Icon: Stethoscope,
    },
    {
      label: 'Total Patients',
      value: mockPatients.length,
      Icon: Users,
    },
    {
      label: "Today's Appointments",
      value: mockAppointments.length,
      Icon: CalendarCheck,
    },
    {
      label: 'Emergency Requests',
      value: 3,
      Icon: Siren,
    },
    {
      label: 'Available Beds',
      value: totalBeds,
      Icon: BedDouble,
    },
  ];

  useEffect(() => {
    if (activeSection === 'Ambulance Drivers') {
      loadAmbulances();
    }
  }, [activeSection]);

  /*
   * Clean up the preview Blob URL when this page
   * is unmounted.
   */
  useEffect(() => {
    return () => {
      if (previewDocument?.url) {
        window.URL.revokeObjectURL(
          previewDocument.url
        );
      }
    };
  }, [previewDocument]);

  async function loadAmbulances() {
    try {
      setAmbulanceLoading(true);
      setAmbulanceError('');
      setAmbulanceMessage('');

      const data = await getAllAmbulances();

      const ambulanceList = Array.isArray(data)
        ? data
        : [];

      setAmbulances(ambulanceList);

      if (ambulanceList.length === 0) {
        setSelectedAmbulanceId(null);
        return;
      }

      const currentSelectedExists =
        ambulanceList.some(
          (ambulance) =>
            ambulance.id === selectedAmbulanceId
        );

      const ambulanceToSelect =
        currentSelectedExists
          ? selectedAmbulanceId
          : ambulanceList[0].id;

      setSelectedAmbulanceId(
        ambulanceToSelect
      );

      await loadAmbulanceDocuments(
        ambulanceToSelect,
        false
      );
    } catch (error) {
      console.error(error);

      setAmbulanceError(
        getErrorMessage(
          error,
          'Unable to load ambulance registrations.'
        )
      );
    } finally {
      setAmbulanceLoading(false);
    }
  }

  async function loadAmbulanceDocuments(
    ambulanceId,
    showLoading = true
  ) {
    if (!ambulanceId) {
      return;
    }

    try {
      if (showLoading) {
        setAmbulanceActionLoading(true);
      }

      setAmbulanceError('');

      const data =
        await getAmbulanceDocuments(
          ambulanceId
        );

      const documents = Array.isArray(data)
        ? data
        : [];

      setAmbulanceDocuments((current) => ({
        ...current,
        [ambulanceId]: documents,
      }));
    } catch (error) {
      console.error(error);

      setAmbulanceError(
        getErrorMessage(
          error,
          'Unable to load ambulance documents.'
        )
      );
    } finally {
      if (showLoading) {
        setAmbulanceActionLoading(false);
      }
    }
  }

  async function handleAmbulanceSelect(
    ambulanceId
  ) {
    setSelectedAmbulanceId(ambulanceId);
    setAmbulanceMessage('');
    setAmbulanceError('');

    if (!ambulanceDocuments[ambulanceId]) {
      await loadAmbulanceDocuments(
        ambulanceId
      );
    }
  }

  /*
   * NEW:
   * Open the real uploaded document/photo.
   */
  async function handleViewDocument(
    document
  ) {
    if (!document?.id) {
      setPreviewError(
        'This document does not have a valid ID.'
      );
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError('');

      /*
       * Close the previous preview first.
       */
      if (previewDocument?.url) {
        window.URL.revokeObjectURL(
          previewDocument.url
        );
      }

      setPreviewDocument(null);

      const response =
        await getAmbulanceDocumentFile(
          document.id
        );

      const blob = response.data;

      const contentType =
        response.headers?.['content-type'] ||
        document.contentType ||
        blob?.type ||
        'application/octet-stream';

      const url =
        window.URL.createObjectURL(blob);

      setPreviewDocument({
        url,
        contentType,
        fileName:
          document.fileName ||
          'Uploaded Document',
      });
    } catch (error) {
      console.error(error);

      setPreviewError(
        getErrorMessage(
          error,
          'Unable to open the uploaded document.'
        )
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function closeDocumentPreview() {
    if (previewDocument?.url) {
      window.URL.revokeObjectURL(
        previewDocument.url
      );
    }

    setPreviewDocument(null);
    setPreviewError('');
  }

  async function handleApproveDocument(
    documentId
  ) {
    const remarks = window.prompt(
      'Enter admin remarks for approval (optional):',
      ''
    );

    if (remarks === null) {
      return;
    }

    try {
      setAmbulanceActionLoading(true);
      setAmbulanceError('');
      setAmbulanceMessage('');

      await approveAmbulanceDocument(
        documentId,
        remarks
      );

      setAmbulanceMessage(
        'Document approved successfully.'
      );

      await loadAmbulanceDocuments(
        selectedAmbulanceId,
        false
      );

      await loadAmbulancesWithoutChangingSelection();
    } catch (error) {
      console.error(error);

      setAmbulanceError(
        getErrorMessage(
          error,
          'Unable to approve the document.'
        )
      );
    } finally {
      setAmbulanceActionLoading(false);
    }
  }

  async function handleRejectDocument(
    documentId
  ) {
    const remarks = window.prompt(
      'Enter the reason for rejecting this document:'
    );

    if (remarks === null) {
      return;
    }

    if (!remarks.trim()) {
      setAmbulanceError(
        'Please enter a rejection reason.'
      );
      return;
    }

    try {
      setAmbulanceActionLoading(true);
      setAmbulanceError('');
      setAmbulanceMessage('');

      await rejectAmbulanceDocument(
        documentId,
        remarks.trim()
      );

      setAmbulanceMessage(
        'Document rejected successfully.'
      );

      await loadAmbulanceDocuments(
        selectedAmbulanceId,
        false
      );

      await loadAmbulancesWithoutChangingSelection();
    } catch (error) {
      console.error(error);

      setAmbulanceError(
        getErrorMessage(
          error,
          'Unable to reject the document.'
        )
      );
    } finally {
      setAmbulanceActionLoading(false);
    }
  }

  async function loadAmbulancesWithoutChangingSelection() {
    try {
      const data =
        await getAllAmbulances();

      const ambulanceList =
        Array.isArray(data)
          ? data
          : [];

      setAmbulances(ambulanceList);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleVerifyAmbulance(
    ambulanceId
  ) {
    const ambulance = ambulances.find(
      (item) =>
        item.id === ambulanceId
    );

    if (!ambulance) {
      return;
    }

    const documents =
      ambulanceDocuments[ambulanceId] || [];

    const missingDocuments =
      REQUIRED_DOCUMENT_TYPES.filter(
        (type) => {
          const document =
            documents.find(
              (item) =>
                item.documentType === type
            );

          return (
            !document ||
            getDocumentStatus(document) !==
              'APPROVED'
          );
        }
      );

    if (missingDocuments.length > 0) {
      const missingLabels =
        missingDocuments
          .map(
            (type) =>
              DOCUMENT_LABELS[type] ||
              type
          )
          .join(', ');

      setAmbulanceError(
        `The ambulance cannot be verified yet. These required documents must be approved first: ${missingLabels}`
      );

      return;
    }

    const confirmed = window.confirm(
      `Verify ambulance ${ambulance.vehicleNumber}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setAmbulanceActionLoading(true);
      setAmbulanceError('');
      setAmbulanceMessage('');

      await verifyAmbulance(
        ambulanceId
      );

      setAmbulanceMessage(
        'Ambulance verified successfully.'
      );

      await loadAmbulancesWithoutChangingSelection();

      await loadAmbulanceDocuments(
        ambulanceId,
        false
      );
    } catch (error) {
      console.error(error);

      setAmbulanceError(
        getErrorMessage(
          error,
          'Unable to verify the ambulance. Please make sure the backend verification endpoint is enabled.'
        )
      );
    } finally {
      setAmbulanceActionLoading(false);
    }
  }

  function getSelectedAmbulance() {
    return ambulances.find(
      (ambulance) =>
        ambulance.id ===
        selectedAmbulanceId
    );
  }

  function getSelectedDocuments() {
    if (!selectedAmbulanceId) {
      return [];
    }

    return (
      ambulanceDocuments[
        selectedAmbulanceId
      ] || []
    );
  }

  function isAllRequiredDocumentsApproved() {
    const documents =
      getSelectedDocuments();

    return REQUIRED_DOCUMENT_TYPES.every(
      (type) => {
        const document =
          documents.find(
            (item) =>
              item.documentType === type
          );

        return (
          document &&
          getDocumentStatus(document) ===
            'APPROVED'
        );
      }
    );
  }

  return (
    <>
      <div
        className="al-container"
        style={{
          paddingTop: 28,
        }}
      >
        <h1
          style={{
            marginBottom: 4,
            fontSize: '1.4rem',
          }}
        >
          Admin Dashboard
        </h1>

        <p
          className="al-muted"
          style={{
            marginBottom: 24,
          }}
        >
          Platform-wide overview and
          management.
        </p>

        <div
          className="al-grid al-grid-3"
          style={{
            marginBottom: 32,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="al-stat-card"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <s.Icon
                  size={18}
                  color="var(--al-primary)"
                />

                <span
                  className="al-muted"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >
                  {s.label}
                </span>
              </div>

              <div className="al-stat-value">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="al-tabs"
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {sections.map((s) => (
            <div
              key={s}
              className={`al-tab${
                activeSection === s
                  ? ' active'
                  : ''
              }`}
              onClick={() =>
                setActiveSection(s)
              }
              style={{
                cursor: 'pointer',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {activeSection === 'Hospitals' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Departments</th>
                </tr>
              </thead>

              <tbody>
                {hospitals.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.type}</td>
                    <td>{h.location}</td>
                    <td>
                      {h.departments.join(
                        ', '
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'Doctors' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Hospital</th>
                  <th>Experience</th>
                </tr>
              </thead>

              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>
                      {d.specialization}
                    </td>
                    <td>{d.hospitalName}</td>
                    <td>
                      {d.experienceYears} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'Receptionists' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>
                    Assigned Hospital
                  </th>
                </tr>
              </thead>

              <tbody>
                {receptionists.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>

                    <td>
                      {hospitals.find(
                        (h) =>
                          h.id ===
                          r.hospitalId
                      )?.name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'Patients' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                </tr>
              </thead>

              <tbody>
                {mockPatients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection ===
          'Ambulance Drivers' && (
          <section>
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 15,
                flexWrap: 'wrap',
                marginBottom: 18,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                  }}
                >
                  Ambulance Driver
                  Registrations
                </h2>

                <p
                  className="al-muted"
                  style={{
                    margin:
                      '5px 0 0',
                  }}
                >
                  Review driver information,
                  inspect uploaded documents,
                  and approve or reject
                  verification documents.
                </p>
              </div>

              <button
                type="button"
                className="al-btn al-btn-secondary"
                onClick={() =>
                  loadAmbulances()
                }
                disabled={
                  ambulanceLoading
                }
                style={{
                  display:
                    'inline-flex',
                  alignItems:
                    'center',
                  gap: 7,
                }}
              >
                <RefreshCw size={16} />

                {ambulanceLoading
                  ? 'Loading...'
                  : 'Refresh'}
              </button>
            </div>

            {ambulanceMessage && (
              <div
                style={{
                  ...messageBox,
                  background: '#dcfce7',
                  color: '#166534',
                }}
              >
                {ambulanceMessage}
              </div>
            )}

            {ambulanceError && (
              <div
                style={{
                  ...messageBox,
                  background: '#fee2e2',
                  color: '#991b1b',
                }}
              >
                {ambulanceError}
              </div>
            )}

            {ambulanceLoading &&
              ambulances.length ===
                0 && (
                <div className="al-card">
                  Loading ambulance
                  registrations...
                </div>
              )}

            {!ambulanceLoading &&
              ambulances.length ===
                0 && (
                <div className="al-card">
                  <Truck
                    size={34}
                    color="var(--al-primary)"
                    style={{
                      marginBottom: 8,
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    No Ambulance
                    Registrations
                  </h3>

                  <p
                    className="al-muted"
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    New ambulance
                    driver registrations
                    will appear here.
                  </p>
                </div>
              )}

            {ambulances.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(280px, 1fr) minmax(420px, 2fr)',
                  gap: 20,
                  alignItems:
                    'start',
                }}
              >
                <div>
                  {ambulances.map(
                    (ambulance) => {
                      const isSelected =
                        ambulance.id ===
                        selectedAmbulanceId;

                      const status =
                        ambulance.verificationStatus ||
                        'PENDING';

                      return (
                        <button
                          type="button"
                          key={
                            ambulance.id
                          }
                          onClick={() =>
                            handleAmbulanceSelect(
                              ambulance.id
                            )
                          }
                          style={{
                            width: '100%',
                            textAlign:
                              'left',
                            border:
                              isSelected
                                ? '2px solid var(--al-primary)'
                                : '1px solid #dbe5ea',
                            background:
                              isSelected
                                ? '#f0fbfd'
                                : '#ffffff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            cursor:
                              'pointer',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              justifyContent:
                                'space-between',
                              alignItems:
                                'flex-start',
                              gap: 10,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight:
                                    800,
                                  fontSize:
                                    '1rem',
                                  color:
                                    'var(--al-text)',
                                }}
                              >
                                {ambulance.driverName ||
                                  'Unnamed Driver'}
                              </div>

                              <div
                                className="al-muted"
                                style={{
                                  marginTop:
                                    4,
                                  fontSize:
                                    '0.84rem',
                                }}
                              >
                                {ambulance.vehicleNumber ||
                                  'No vehicle number'}
                              </div>
                            </div>

                            <span
                              style={{
                                ...statusBadge,
                                ...getStatusStyle(
                                  status
                                ),
                              }}
                            >
                              {status}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop:
                                12,
                              fontSize:
                                '0.87rem',
                              lineHeight:
                                1.7,
                              color:
                                'var(--al-text)',
                            }}
                          >
                            <div>
                              <strong>
                                Type:
                              </strong>{' '}
                              {ambulance.type ||
                                '—'}
                            </div>

                            <div>
                              <strong>
                                Location:
                              </strong>{' '}
                              {ambulance.currentLocation ||
                                '—'}
                            </div>

                            <div>
                              <strong>
                                Contact:
                              </strong>{' '}
                              {ambulance.driverContact ||
                                '—'}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                <div>
                  {getSelectedAmbulance() ? (
                    <div className="al-card">
                      {(() => {
                        const selectedAmbulance =
                          getSelectedAmbulance();

                        const documents =
                          getSelectedDocuments();

                        const allRequiredApproved =
                          isAllRequiredDocumentsApproved();

                        return (
                          <>
                            <div
                              style={{
                                display:
                                  'flex',
                                justifyContent:
                                  'space-between',
                                alignItems:
                                  'flex-start',
                                gap: 15,
                                marginBottom:
                                  18,
                              }}
                            >
                              <div>
                                <h2
                                  style={{
                                    margin:
                                      '0 0 5px',
                                    fontSize:
                                      '1.18rem',
                                  }}
                                >
                                  {selectedAmbulance.driverName ||
                                    'Ambulance Driver'}
                                </h2>

                                <p
                                  className="al-muted"
                                  style={{
                                    margin: 0,
                                  }}
                                >
                                  {
                                    selectedAmbulance.vehicleNumber
                                  }
                                </p>
                              </div>

                              <span
                                style={{
                                  ...statusBadge,
                                  ...getStatusStyle(
                                    selectedAmbulance.verificationStatus ||
                                      'PENDING'
                                  ),
                                }}
                              >
                                {selectedAmbulance.verificationStatus ||
                                  'PENDING'}
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(190px, 1fr))',
                                gap: 12,
                                marginBottom:
                                  22,
                              }}
                            >
                              <InfoBox
                                label="Driver"
                                value={
                                  selectedAmbulance.driverName
                                }
                              />

                              <InfoBox
                                label="Contact"
                                value={
                                  selectedAmbulance.driverContact
                                }
                              />

                              <InfoBox
                                label="Driving Licence"
                                value={
                                  selectedAmbulance.driverLicenseNumber
                                }
                              />

                              <InfoBox
                                label="Vehicle Number"
                                value={
                                  selectedAmbulance.vehicleNumber
                                }
                              />

                              <InfoBox
                                label="Ambulance Type"
                                value={
                                  selectedAmbulance.type
                                }
                              />

                              <InfoBox
                                label="Current Location"
                                value={
                                  selectedAmbulance.currentLocation
                                }
                              />
                            </div>

                            <div
                              style={{
                                display:
                                  'flex',
                                justifyContent:
                                  'space-between',
                                alignItems:
                                  'center',
                                gap: 10,
                                flexWrap:
                                  'wrap',
                                marginBottom:
                                  12,
                              }}
                            >
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize:
                                    '1rem',
                                }}
                              >
                                Verification
                                Documents
                              </h3>

                              <button
                                type="button"
                                className="al-btn al-btn-secondary"
                                onClick={() =>
                                  loadAmbulanceDocuments(
                                    selectedAmbulance.id
                                  )
                                }
                                disabled={
                                  ambulanceActionLoading
                                }
                              >
                                Refresh
                                Documents
                              </button>
                            </div>

                            <div
                              style={{
                                display:
                                  'flex',
                                flexDirection:
                                  'column',
                                gap: 10,
                              }}
                            >
                              {documents.length ===
                                0 && (
                                <div
                                  style={{
                                    padding: 15,
                                    border:
                                      '1px dashed #cbd5e1',
                                    borderRadius:
                                      10,
                                    color:
                                      '#64748b',
                                  }}
                                >
                                  No documents
                                  uploaded yet.
                                </div>
                              )}

                              {documents.map(
                                (
                                  document
                                ) => {
                                  const documentStatus =
                                    getDocumentStatus(
                                      document
                                    );

                                  const label =
                                    DOCUMENT_LABELS[
                                      document.documentType
                                    ] ||
                                    document.documentType;

                                  return (
                                    <div
                                      key={
                                        document.id
                                      }
                                      style={{
                                        border:
                                          '1px solid #e2e8f0',
                                        borderRadius:
                                          10,
                                        padding:
                                          14,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display:
                                            'flex',
                                          justifyContent:
                                            'space-between',
                                          alignItems:
                                            'flex-start',
                                          gap: 12,
                                        }}
                                      >
                                        <div
                                          style={{
                                            minWidth:
                                              0,
                                          }}
                                        >
                                          <strong>
                                            {
                                              label
                                            }
                                          </strong>

                                          <div
                                            className="al-muted"
                                            style={{
                                              marginTop:
                                                4,
                                              fontSize:
                                                '0.82rem',
                                              wordBreak:
                                                'break-word',
                                            }}
                                          >
                                            {document.fileName ||
                                              'File uploaded'}
                                          </div>

                                          {document.adminRemarks && (
                                            <div
                                              style={{
                                                marginTop:
                                                  7,
                                                fontSize:
                                                  '0.82rem',
                                              }}
                                            >
                                              <strong>
                                                Admin
                                                Remark:
                                              </strong>{' '}
                                              {
                                                document.adminRemarks
                                              }
                                            </div>
                                          )}
                                        </div>

                                        <span
                                          style={{
                                            ...statusBadge,
                                            ...getStatusStyle(
                                              documentStatus
                                            ),
                                            flexShrink:
                                              0,
                                          }}
                                        >
                                          {
                                            documentStatus
                                          }
                                        </span>
                                      </div>

                                      <div
                                        style={{
                                          display:
                                            'flex',
                                          gap: 8,
                                          flexWrap:
                                            'wrap',
                                          marginTop:
                                            12,
                                        }}
                                      >
                                        {/* NEW VIEW BUTTON */}
                                        <button
                                          type="button"
                                          className="al-btn al-btn-secondary"
                                          disabled={
                                            previewLoading ||
                                            ambulanceActionLoading
                                          }
                                          onClick={() =>
                                            handleViewDocument(
                                              document
                                            )
                                          }
                                          style={{
                                            display:
                                              'inline-flex',
                                            alignItems:
                                              'center',
                                            gap: 6,
                                          }}
                                        >
                                          <Eye
                                            size={
                                              15
                                            }
                                          />

                                          {previewLoading
                                            ? 'Opening...'
                                            : 'View Document'}
                                        </button>

                                        {documentStatus ===
                                          'PENDING' && (
                                          <>
                                            <button
                                              type="button"
                                              className="al-btn al-btn-primary"
                                              disabled={
                                                ambulanceActionLoading
                                              }
                                              onClick={() =>
                                                handleApproveDocument(
                                                  document.id
                                                )
                                              }
                                              style={{
                                                display:
                                                  'inline-flex',
                                                alignItems:
                                                  'center',
                                                gap: 6,
                                              }}
                                            >
                                              <CheckCircle2
                                                size={
                                                  15
                                                }
                                              />

                                              Approve
                                            </button>

                                            <button
                                              type="button"
                                              className="al-btn al-btn-danger"
                                              disabled={
                                                ambulanceActionLoading
                                              }
                                              onClick={() =>
                                                handleRejectDocument(
                                                  document.id
                                                )
                                              }
                                              style={{
                                                display:
                                                  'inline-flex',
                                                alignItems:
                                                  'center',
                                                gap: 6,
                                              }}
                                            >
                                              <XCircle
                                                size={
                                                  15
                                                }
                                              />

                                              Reject
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            <div
                              style={{
                                marginTop: 18,
                                padding: 15,
                                borderRadius: 10,
                                background:
                                  allRequiredApproved
                                    ? '#ecfdf5'
                                    : '#f8fafc',
                                border:
                                  allRequiredApproved
                                    ? '1px solid #86efac'
                                    : '1px solid #e2e8f0',
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  gap: 8,
                                  fontWeight:
                                    700,
                                }}
                              >
                                <FileCheck2
                                  size={
                                    18
                                  }
                                />

                                Required
                                Document Check
                              </div>

                              <p
                                className="al-muted"
                                style={{
                                  margin:
                                    '7px 0 0',
                                  fontSize:
                                    '0.84rem',
                                }}
                              >
                                {allRequiredApproved
                                  ? 'All four required documents have been approved. The ambulance is ready for verification.'
                                  : 'The Driving Licence, Vehicle RC, Insurance and Fitness Certificate must all be approved before the ambulance can be verified.'}
                              </p>
                            </div>

                            <div
                              style={{
                                marginTop: 15,
                                display:
                                  'flex',
                                justifyContent:
                                  'flex-end',
                              }}
                            >
                              <button
                                type="button"
                                className="al-btn al-btn-primary"
                                disabled={
                                  ambulanceActionLoading ||
                                  !allRequiredApproved ||
                                  selectedAmbulance.verificationStatus ===
                                    'VERIFIED'
                                }
                                onClick={() =>
                                  handleVerifyAmbulance(
                                    selectedAmbulance.id
                                  )
                                }
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  gap: 7,
                                }}
                              >
                                <CheckCircle2
                                  size={
                                    16
                                  }
                                />

                                {selectedAmbulance.verificationStatus ===
                                'VERIFIED'
                                  ? 'Ambulance Verified'
                                  : 'Approve & Verify Ambulance'}
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="al-card">
                      Select an ambulance
                      driver to review
                      the registration.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === 'Departments' && (
          <div className="al-grid al-grid-4">
            {departments.map((d) => (
              <div
                key={d.id}
                className="al-card"
              >
                <strong>{d.name}</strong>

                <p
                  className="al-muted"
                  style={{
                    fontSize:
                      '0.82rem',
                    margin:
                      '4px 0 0',
                  }}
                >
                  {d.category}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'Beds' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>General</th>
                  <th>ICU</th>
                  <th>Emergency</th>
                  <th>Oxygen</th>
                  <th>Ventilator</th>
                </tr>
              </thead>

              <tbody>
                {hospitals.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>

                    <td>
                      {
                        h.beds.general
                          .available
                      }
                      /
                      {
                        h.beds.general
                          .total
                      }
                    </td>

                    <td>
                      {
                        h.beds.icu
                          .available
                      }
                      /
                      {
                        h.beds.icu.total
                      }
                    </td>

                    <td>
                      {
                        h.beds.emergency
                          .available
                      }
                      /
                      {
                        h.beds.emergency
                          .total
                      }
                    </td>

                    <td>
                      {
                        h.beds.oxygen
                          .available
                      }
                      /
                      {
                        h.beds.oxygen
                          .total
                      }
                    </td>

                    <td>
                      {
                        h.beds.ventilator
                          .available
                      }
                      /
                      {
                        h.beds.ventilator
                          .total
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection ===
          'Appointments' && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Hospital</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {mockAppointments.map(
                  (a) => (
                    <tr key={a.id}>
                      <td>
                        {a.tokenNumber}
                      </td>

                      <td>
                        {a.patientName}
                      </td>

                      <td>
                        {a.doctorName}
                      </td>

                      <td>
                        {a.hospitalName}
                      </td>

                      <td>{a.date}</td>

                      <td>
                        {a.status}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocument && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(15, 23, 42, 0.72)',
            zIndex: 9999,
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
              background: '#ffffff',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow:
                '0 25px 70px rgba(0,0,0,0.30)',
            }}
          >
            {/* Preview Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: 12,
                padding:
                  '14px 18px',
                borderBottom:
                  '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <strong
                  style={{
                    display:
                      'block',
                    fontSize:
                      '1rem',
                  }}
                >
                  Document Preview
                </strong>

                <span
                  className="al-muted"
                  style={{
                    fontSize:
                      '0.82rem',
                    wordBreak:
                      'break-word',
                  }}
                >
                  {
                    previewDocument.fileName
                  }
                </span>
              </div>

              <button
                type="button"
                onClick={
                  closeDocumentPreview
                }
                style={{
                  width: 38,
                  height: 38,
                  border:
                    '1px solid #cbd5e1',
                  background:
                    '#ffffff',
                  borderRadius: 8,
                  cursor:
                    'pointer',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  flexShrink: 0,
                }}
                aria-label="Close document preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Content */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: 15,
                background:
                  '#f1f5f9',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                overflow: 'auto',
              }}
            >
              {isImageType(
                previewDocument.contentType
              ) ? (
                <img
                  src={
                    previewDocument.url
                  }
                  alt={
                    previewDocument.fileName
                  }
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit:
                      'contain',
                    borderRadius: 8,
                    background:
                      '#ffffff',
                    boxShadow:
                      '0 6px 25px rgba(0,0,0,0.12)',
                  }}
                />
              ) : isPdfType(
                  previewDocument.contentType
                ) ? (
                <iframe
                  title={
                    previewDocument.fileName
                  }
                  src={
                    previewDocument.url
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 8,
                    background:
                      '#ffffff',
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign:
                      'center',
                    padding: 30,
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                      fontWeight: 700,
                    }}
                  >
                    Preview is not
                    available for this
                    file type.
                  </p>

                  <a
                    href={
                      previewDocument.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="al-btn al-btn-primary"
                  >
                    Open File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW ERROR */}
      {previewError && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(15, 23, 42, 0.55)',
            zIndex: 10000,
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding: 20,
          }}
        >
          <div
            className="al-card"
            style={{
              maxWidth: 500,
              width: '100%',
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Unable to Open Document
            </h3>

            <p
              style={{
                color: '#991b1b',
              }}
            >
              {previewError}
            </p>

            <button
              type="button"
              className="al-btn al-btn-secondary"
              onClick={() =>
                setPreviewError('')
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background: '#f8fafc',
        border:
          '1px solid #e2e8f0',
      }}
    >
      <div
        className="al-muted"
        style={{
          fontSize: '0.76rem',
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '0.87rem',
          fontWeight: 700,
          wordBreak:
            'break-word',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

const statusBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 9px',
  borderRadius: 999,
  fontSize: '0.72rem',
  fontWeight: 800,
};

const messageBox = {
  padding: 12,
  borderRadius: 9,
  marginBottom: 15,
  fontSize: '0.88rem',
};