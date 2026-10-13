import { mockAppointments } from '../data/mockData';
import { simulateRequest } from './api';

let tokenCounter = 17;
let appointmentCounter = 1002;

// TODO(backend): replace with `return api.post('/appointments', payload).then(r => r.data)`

export function createAppointment(payload) {
  const appointment = {
    id: `APT-${appointmentCounter++}`,
    tokenNumber: `T-${String(tokenCounter++).padStart(3, '0')}`,
    status: 'Confirmed',
    ...payload,
  };
  mockAppointments.push(appointment);
  return simulateRequest(appointment, 800);
}

export function getAppointmentsForPatient(patientName) {
  const results = mockAppointments.filter((a) => a.patientName === patientName);
  return simulateRequest(results, 400);
}

export function getAllAppointments() {
  return simulateRequest(mockAppointments, 400);
}

export function getAppointmentById(id) {
  const found = mockAppointments.find((a) => a.id === id);
  return simulateRequest(found || null, 300);
}
