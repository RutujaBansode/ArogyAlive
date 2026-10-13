import api from './api';

export async function getAllAmbulances() {
  const response = await api.get('/ambulances');
  return response.data;
}

export async function getMyAmbulance() {
  const response = await api.get('/ambulances/me');
  return response.data;
}

export async function getAmbulanceById(ambulanceId) {
  const response = await api.get(
    `/ambulances/${ambulanceId}`
  );

  return response.data;
}

export async function registerAmbulance(data) {
  const response = await api.post(
    '/ambulances/register',
    data
  );

  return response.data;
}

export async function getAvailableAmbulances() {
  const response = await api.get(
    '/ambulances/available'
  );

  return response.data;
}

export async function getAmbulanceDocuments(ambulanceId) {
  const response = await api.get(
    `/ambulance-documents/ambulance/${ambulanceId}`
  );

  return response.data;
}

export async function uploadAmbulanceDocument(
  ambulanceId,
  documentType,
  file
) {
  const formData = new FormData();

  formData.append('ambulanceId', ambulanceId);
  formData.append('documentType', documentType);
  formData.append('file', file);

  const response = await api.post(
    '/ambulance-documents/upload',
    formData
  );

  return response.data;
}

export async function getAmbulanceDocument(documentId) {
  const response = await api.get(
    `/ambulance-documents/${documentId}`
  );

  return response.data;
}

/*
 * NEW:
 * Downloads the real PDF/image file as a Blob.
 *
 * We use Axios here instead of simply opening
 * the URL because the backend requires authentication.
 */
export async function getAmbulanceDocumentFile(
  documentId
) {
  const response = await api.get(
    `/ambulance-documents/${documentId}/file`,
    {
      responseType: 'blob',
    }
  );

  return response;
}

export async function approveAmbulanceDocument(
  documentId,
  remarks = ''
) {
  const response = await api.put(
    `/ambulance-documents/${documentId}/approve`,
    null,
    {
      params: {
        remarks,
      },
    }
  );

  return response.data;
}

export async function rejectAmbulanceDocument(
  documentId,
  remarks = ''
) {
  const response = await api.put(
    `/ambulance-documents/${documentId}/reject`,
    null,
    {
      params: {
        remarks,
      },
    }
  );

  return response.data;
}

export async function verifyAmbulance(
  ambulanceId
) {
  const response = await api.put(
    `/ambulances/${ambulanceId}/verify`
  );

  return response.data;
}

export async function suspendAmbulance(
  ambulanceId
) {
  const response = await api.put(
    `/ambulances/${ambulanceId}/suspend`
  );

  return response.data;
}

export async function updateAmbulanceAvailability(
  ambulanceId,
  available
) {
  const response = await api.put(
    `/ambulances/${ambulanceId}/availability`,
    null,
    {
      params: {
        available,
      },
    }
  );

  return response.data;
}