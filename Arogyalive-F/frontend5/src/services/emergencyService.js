import { ambulances } from '../data/mockData';
import { simulateRequest } from './api';

// TODO(backend): replace with `return api.get('/emergency/ambulances').then(r => r.data)`

export function getNearestAmbulances() {
  return simulateRequest(ambulances, 500);
}

export function requestAmbulance(ambulanceId) {
  const ambulance = ambulances.find((a) => a.id === ambulanceId);
  return simulateRequest(
    {
      requestId: `AMB-REQ-${Date.now().toString().slice(-6)}`,
      ambulance,
      status: 'Dispatched',
      requestedAt: new Date().toISOString(),
    },
    900
  );
}
