
import api from './api';

// Submit a new patient emergency request.
export async function createEmergencyRequest(requestData) {
  const response = await api.post(
    '/emergency-requests',
    requestData
  );

  return response.data;
}