import React, { useEffect, useState } from 'react';

import {
  registerAmbulance,
  getMyAmbulance,
  getAmbulanceDocuments,
  uploadAmbulanceDocument,
  updateAmbulanceAvailability,
} from '../services/ambulanceDocumentService';

const DOCUMENTS = [
  {
    type: 'DRIVING_LICENSE',
    label: 'Driving Licence',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    type: 'VEHICLE_RC',
    label: 'Vehicle Registration Certificate',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    type: 'INSURANCE',
    label: 'Insurance Certificate',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    type: 'FITNESS_CERTIFICATE',
    label: 'Fitness Certificate',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
];

function AmbulanceDashboard() {
  const [form, setForm] = useState({
    driverName: '',
    driverContact: '',
    driverLicenseNumber: '',
    vehicleNumber: '',
    type: 'Basic Life Support',
    currentLocation: '',
    price: '',
  });

  const [ambulance, setAmbulance] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [driverPhoto, setDriverPhoto] = useState(null);
  const [documentFiles, setDocumentFiles] = useState({});

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /*
   * Convert any backend error into a safe string.
   *
   * This fixes:
   * "Objects are not valid as a React child"
   */
  function getErrorMessage(
    err,
    fallbackMessage
  ) {
    const backendData = err?.response?.data;

    if (
      typeof backendData === 'string' &&
      backendData.trim() !== ''
    ) {
      return backendData;
    }

    if (
      backendData &&
      typeof backendData === 'object' &&
      typeof backendData.message === 'string' &&
      backendData.message.trim() !== ''
    ) {
      return backendData.message;
    }

    if (
      typeof err?.message === 'string' &&
      err.message.trim() !== ''
    ) {
      return err.message;
    }

    return fallbackMessage;
  }

  useEffect(() => {
    /*
     * Old localStorage ambulance ID is no longer used.
     * The backend determines ownership from the JWT user.
     */
    localStorage.removeItem(
      'registeredAmbulanceId'
    );

    loadMyAmbulance();
  }, []);

  async function loadMyAmbulance() {
    try {
      setInitialLoading(true);
      setError('');
      setMessage('');

      const ambulanceData =
        await getMyAmbulance();

      setAmbulance(ambulanceData);

      if (ambulanceData?.id) {
        const documentData =
          await getAmbulanceDocuments(
            ambulanceData.id
          );

        setDocuments(
          Array.isArray(documentData)
            ? documentData
            : []
        );
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error(
        'Could not load my ambulance:',
        err
      );

      setAmbulance(null);
      setDocuments([]);

      const status =
        err?.response?.status;

      /*
       * 400 / 404 can mean that this authenticated
       * ambulance user has not registered an ambulance yet.
       *
       * In that situation we simply show the
       * registration form.
       */
      if (
        status === 400 ||
        status === 404
      ) {
        setError('');
      } else if (
        status === 401 ||
        status === 403
      ) {
        setError(
          'You are not authorized to access the ambulance dashboard. Please log in as an Ambulance Driver.'
        );
      } else {
        setError(
          getErrorMessage(
            err,
            'Unable to load your ambulance information. Please try again.'
          )
        );
      }
    } finally {
      setInitialLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const isRegistrationValid =
    form.driverName.trim() !== '' &&
    form.driverContact.trim() !== '' &&
    form.driverLicenseNumber.trim() !== '' &&
    form.vehicleNumber.trim() !== '' &&
    form.currentLocation.trim() !== '' &&
    form.price !== '' &&
    Number(form.price) > 0;

  async function handleRegister(event) {
    event.preventDefault();

    if (!isRegistrationValid) {
      setError(
        'Please fill all required registration details and enter a service price greater than 0.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const payload = {
        driverName:
          form.driverName.trim(),

        driverContact:
          form.driverContact.trim(),

        driverLicenseNumber:
          form.driverLicenseNumber
            .trim()
            .toUpperCase(),

        vehicleNumber:
          form.vehicleNumber
            .trim()
            .toUpperCase(),

        type: form.type,

        currentLocation:
          form.currentLocation.trim(),

        price:
          Number(form.price),

        distanceKm: 0,

        etaMinutes: 0,

        available: false,

        active: true,
      };

      const saved =
        await registerAmbulance(
          payload
        );

      /*
       * Backend attaches ambulance
       * to the authenticated user.
       */
      setAmbulance(saved);

      setDocuments([]);

      setForm({
        driverName: '',
        driverContact: '',
        driverLicenseNumber: '',
        vehicleNumber: '',
        type: 'Basic Life Support',
        currentLocation: '',
        price: '',
      });

      setMessage(
        'Ambulance registered successfully. Please upload your verification documents.'
      );
    } catch (err) {
      console.error(
        'Could not register ambulance:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Unable to register ambulance.'
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function validateFile(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        'Only PDF, JPG, JPEG and PNG files are allowed.'
      );

      return false;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        'File size must not exceed 10 MB.'
      );

      return false;
    }

    setError('');

    return true;
  }

  function handleDriverPhotoChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedPhotoTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (
      !allowedPhotoTypes.includes(
        file.type
      )
    ) {
      setError(
        'Driver photo must be JPG, JPEG or PNG.'
      );

      event.target.value = '';

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        'Driver photo must not exceed 10 MB.'
      );

      event.target.value = '';

      return;
    }

    setError('');

    setDriverPhoto(file);
  }

  function handleDocumentChange(
    documentType,
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateFile(file)) {
      event.target.value = '';

      return;
    }

    setDocumentFiles((current) => ({
      ...current,
      [documentType]: file,
    }));
  }

  async function uploadFile(
    documentType,
    file,
    successMessage
  ) {
    if (!ambulance) {
      setError(
        'Please register the ambulance first.'
      );

      return;
    }

    if (!file) {
      setError(
        'Please choose a file first.'
      );

      return;
    }

    try {
      setUploading(true);

      setError('');
      setMessage('');

      await uploadAmbulanceDocument(
        ambulance.id,
        documentType,
        file
      );

      const updatedDocuments =
        await getAmbulanceDocuments(
          ambulance.id
        );

      setDocuments(
        Array.isArray(
          updatedDocuments
        )
          ? updatedDocuments
          : []
      );

      setMessage(
        successMessage
      );
    } catch (err) {
      console.error(
        'File upload failed:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'File upload failed.'
        )
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDriverPhotoUpload() {
    if (!driverPhoto) {
      setError(
        'Please choose your photo first.'
      );

      return;
    }

    await uploadFile(
      'DRIVER_PHOTO',
      driverPhoto,
      'Driver photo uploaded successfully.'
    );

    setDriverPhoto(null);
  }

  async function handleDocumentUpload(
    documentType
  ) {
    const file =
      documentFiles[
        documentType
      ];

    if (!file) {
      setError(
        'Please choose a file first.'
      );

      return;
    }

    const document =
      DOCUMENTS.find(
        (item) =>
          item.type ===
          documentType
      );

    await uploadFile(
      documentType,
      file,
      `${
        document?.label ||
        'Document'
      } uploaded successfully.`
    );

    setDocumentFiles(
      (current) => ({
        ...current,
        [documentType]: null,
      })
    );
  }

  function getDocument(
    documentType
  ) {
    return documents.find(
      (document) =>
        document.documentType ===
        documentType
    );
  }

  async function handleAvailabilityChange(
    available
  ) {
    if (!ambulance) {
      return;
    }

    try {
      setAvailabilityLoading(
        true
      );

      setError('');
      setMessage('');

      const updated =
        await updateAmbulanceAvailability(
          ambulance.id,
          available
        );

      setAmbulance(updated);

      setMessage(
        available
          ? 'Ambulance marked as available.'
          : 'Ambulance marked as unavailable.'
      );
    } catch (err) {
      console.error(
        'Could not update ambulance availability:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Unable to update availability.'
        )
      );
    } finally {
      setAvailabilityLoading(
        false
      );
    }
  }

  function handleResetRegistration() {
    /*
     * This only resets local UI.
     * It does not delete anything
     * from the database.
     */
    setAmbulance(null);
    setDocuments([]);
    setDriverPhoto(null);
    setDocumentFiles({});

    setForm({
      driverName: '',
      driverContact: '',
      driverLicenseNumber: '',
      vehicleNumber: '',
      type: 'Basic Life Support',
      currentLocation: '',
      price: '',
    });

    setMessage(
      'Registration form has been reset.'
    );

    setError('');
  }

  if (initialLoading) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <section
          style={cardStyle}
        >
          <h2>
            Loading Ambulance Dashboard...
          </h2>

          <p>
            Checking your authenticated
            ambulance account.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '30px 20px',
      }}
    >
      <h1>
        Ambulance Operator Dashboard
      </h1>

      <p>
        Register your ambulance, upload your
        documents and manage your availability.
      </p>

      {message && (
        <div
          style={successBox}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={errorBox}
        >
          {error}
        </div>
      )}

      {!ambulance && (
        <section
          style={cardStyle}
        >
          <h2>
            Ambulance Registration
          </h2>

          <form
            onSubmit={
              handleRegister
            }
          >
            <div
              style={gridStyle}
            >
              <div>
                <label>
                  Driver Name *
                </label>

                <input
                  type="text"
                  name="driverName"
                  value={
                    form.driverName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter driver name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Driver Contact *
                </label>

                <input
                  type="tel"
                  name="driverContact"
                  value={
                    form.driverContact
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter mobile number"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Driving Licence Number *
                </label>

                <input
                  type="text"
                  name="driverLicenseNumber"
                  value={
                    form.driverLicenseNumber
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter driving licence number"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Vehicle Number *
                </label>

                <input
                  type="text"
                  name="vehicleNumber"
                  value={
                    form.vehicleNumber
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="MH-13-XX-1234"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Ambulance Type *
                </label>

                <select
                  name="type"
                  value={
                    form.type
                  }
                  onChange={
                    handleChange
                  }
                  style={inputStyle}
                >
                  <option>
                    Basic Life Support
                  </option>

                  <option>
                    Advanced Life Support
                  </option>

                  <option>
                    ICU Ambulance
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Current Location *
                </label>

                <input
                  type="text"
                  name="currentLocation"
                  value={
                    form.currentLocation
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter current location"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Service Price *
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    form.price
                  }
                  onChange={
                    handleChange
                  }
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter price"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !isRegistrationValid
              }
              style={{
                ...primaryButton,
                opacity:
                  loading ||
                  !isRegistrationValid
                    ? 0.5
                    : 1,
                cursor:
                  loading ||
                  !isRegistrationValid
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {loading
                ? 'Registering...'
                : 'Register Ambulance'}
            </button>
          </form>

          <p
            style={{
              fontSize: '13px',
              marginTop: '10px',
            }}
          >
            Fields marked with * are required.
          </p>
        </section>
      )}

      {ambulance && (
        <>
          <section
            style={cardStyle}
          >
            <h2>
              Ambulance Information
            </h2>

            <p>
              <strong>
                Driver:
              </strong>{' '}
              {
                ambulance.driverName
              }
            </p>

            <p>
              <strong>
                Contact:
              </strong>{' '}
              {
                ambulance.driverContact
              }
            </p>

            <p>
              <strong>
                Driving Licence:
              </strong>{' '}
              {
                ambulance.driverLicenseNumber
              }
            </p>

            <p>
              <strong>
                Vehicle:
              </strong>{' '}
              {
                ambulance.vehicleNumber
              }
            </p>

            <p>
              <strong>
                Type:
              </strong>{' '}
              {
                ambulance.type
              }
            </p>

            <p>
              <strong>
                Location:
              </strong>{' '}
              {
                ambulance.currentLocation
              }
            </p>

            <p>
              <strong>
                Verification:
              </strong>{' '}

              <span
                style={
                  statusBadge
                }
              >
                {
                  ambulance.verificationStatus
                }
              </span>
            </p>

            <p>
              {
                ambulance.verificationStatus ===
                'VERIFIED'
                  ? 'Your ambulance has been verified.'
                  : 'Your ambulance is waiting for document verification.'
              }
            </p>

            {ambulance.verificationStatus ===
              'VERIFIED' && (
              <div
                style={{
                  marginTop: '20px',
                }}
              >
                <strong>
                  Ambulance Availability
                </strong>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '10px',
                    marginTop:
                      '10px',
                  }}
                >
                  <button
                    type="button"
                    disabled={
                      availabilityLoading
                    }
                    onClick={() =>
                      handleAvailabilityChange(
                        true
                      )
                    }
                    style={
                      primaryButton
                    }
                  >
                    Available
                  </button>

                  <button
                    type="button"
                    disabled={
                      availabilityLoading
                    }
                    onClick={() =>
                      handleAvailabilityChange(
                        false
                      )
                    }
                    style={
                      secondaryButton
                    }
                  >
                    Unavailable
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={
                handleResetRegistration
              }
              style={{
                ...secondaryButton,
                marginTop:
                  '25px',
              }}
            >
              Reset Registration
            </button>
          </section>

          {/* Driver Photo */}
          <section
            style={cardStyle}
          >
            <h2>
              Driver Photo
            </h2>

            <p>
              Choose a photo directly from
              your phone or laptop.
            </p>

            {getDocument(
              'DRIVER_PHOTO'
            ) ? (
              <div>
                <p>
                  File:{' '}
                  {
                    getDocument(
                      'DRIVER_PHOTO'
                    ).fileName
                  }
                </p>

                <p>
                  Status:{' '}

                  <strong>
                    {
                      getDocument(
                        'DRIVER_PHOTO'
                      )
                        .verificationStatus
                    }
                  </strong>
                </p>

                {getDocument(
                  'DRIVER_PHOTO'
                ).adminRemarks && (
                  <p>
                    Admin Remark:{' '}
                    {
                      getDocument(
                        'DRIVER_PHOTO'
                      ).adminRemarks
                    }
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={
                    handleDriverPhotoChange
                  }
                />

                {driverPhoto && (
                  <p>
                    Selected:{' '}
                    {
                      driverPhoto.name
                    }
                  </p>
                )}

                <button
                  type="button"
                  disabled={
                    uploading ||
                    !driverPhoto
                  }
                  onClick={
                    handleDriverPhotoUpload
                  }
                  style={
                    secondaryButton
                  }
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Upload Driver Photo'}
                </button>
              </div>
            )}
          </section>

          {/* Verification Documents */}
          <section
            style={cardStyle}
          >
            <h2>
              Verification Documents
            </h2>

            <p>
              Accepted formats: PDF, JPG,
              JPEG and PNG. Maximum 10 MB
              per file.
            </p>

            {DOCUMENTS.map(
              (document) => {
                const existing =
                  getDocument(
                    document.type
                  );

                const selectedFile =
                  documentFiles[
                    document.type
                  ];

                return (
                  <div
                    key={
                      document.type
                    }
                    style={
                      documentBox
                    }
                  >
                    <h3>
                      {
                        document.label
                      }
                    </h3>

                    {existing ? (
                      <div>
                        <p>
                          File:{' '}
                          {
                            existing.fileName
                          }
                        </p>

                        <p>
                          Status:{' '}

                          <strong>
                            {
                              existing.verificationStatus
                            }
                          </strong>
                        </p>

                        {existing.adminRemarks && (
                          <p>
                            Admin Remark:{' '}
                            {
                              existing.adminRemarks
                            }
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept={
                            document.accept
                          }
                          onChange={(
                            event
                          ) =>
                            handleDocumentChange(
                              document.type,
                              event
                            )
                          }
                        />

                        {selectedFile && (
                          <p>
                            Selected:{' '}
                            {
                              selectedFile.name
                            }
                          </p>
                        )}

                        <button
                          type="button"
                          disabled={
                            uploading ||
                            !selectedFile
                          }
                          onClick={() =>
                            handleDocumentUpload(
                              document.type
                            )
                          }
                          style={
                            secondaryButton
                          }
                        >
                          {uploading
                            ? 'Uploading...'
                            : 'Upload'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </section>
        </>
      )}
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '15px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '6px',
  marginBottom: '15px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  boxSizing: 'border-box',
};

const cardStyle = {
  marginBottom: '25px',
  padding: '22px',
  border: '1px solid #ddd',
  borderRadius: '12px',
};

const documentBox = {
  padding: '18px',
  marginTop: '15px',
  border: '1px solid #ddd',
  borderRadius: '10px',
};

const primaryButton = {
  padding: '11px 18px',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  marginTop: '8px',
};

const secondaryButton = {
  padding: '10px 16px',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  marginTop: '10px',
};

const statusBadge = {
  padding: '5px 10px',
  borderRadius: '5px',
  background: '#fef3c7',
  color: '#92400e',
};

const successBox = {
  padding: '12px',
  marginBottom: '20px',
  background: '#dcfce7',
  color: '#166534',
  borderRadius: '8px',
};

const errorBox = {
  padding: '12px',
  marginBottom: '20px',
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: '8px',
};

export default AmbulanceDashboard;