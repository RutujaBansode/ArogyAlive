import api from './api';

export async function getMyDoctorLicense() {
  const response = await api.get(
    '/doctor-documents/me'
  );

  return response.data;
}

export async function uploadMyDoctorLicense(file) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await api.post(
    '/doctor-documents/my-license',
    formData
  );

  return response.data;
}

export async function getAllDoctorLicenses() {
  const response = await api.get(
    '/doctor-documents/admin'
  );

  return response.data;
}

export async function getDoctorLicenseFile(documentId) {
  return api.get(
    `/doctor-documents/${documentId}/file`,
    { responseType: 'blob' }
  );
}

export async function approveDoctorLicense(
  documentId,
  remarks = ''
) {
  const response = await api.put(
    `/doctor-documents/${documentId}/approve`,
    null,
    { params: { remarks } }
  );

  return response.data;
}

export async function rejectDoctorLicense(
  documentId,
  remarks
) {
  const response = await api.put(
    `/doctor-documents/${documentId}/reject`,
    null,
    { params: { remarks } }
  );

  return response.data;
}