import { hospitals } from '../data/mockData';
import { simulateRequest } from './api';

// TODO(backend): replace with `return api.get('/hospitals/${hospitalId}/beds').then(r => r.data)`

export function getBedsForHospital(hospitalId) {
  const hospital = hospitals.find((h) => h.id === hospitalId);
  return simulateRequest(hospital ? hospital.beds : null, 300);
}

// Used by the receptionist dashboard to demonstrate updating bed
// availability in the shared in-memory mock data.
export function updateBedCount(hospitalId, bedType, newAvailable) {
  const hospital = hospitals.find((h) => h.id === hospitalId);
  if (!hospital || !hospital.beds[bedType]) {
    return simulateRequest(null, 200, true);
  }
  const bed = hospital.beds[bedType];
  bed.available = Math.max(0, Math.min(newAvailable, bed.total));
  bed.occupied = bed.total - bed.available;
  bed.status = bed.available <= 0 ? 'Full' : bed.available / bed.total <= 0.25 ? 'Limited' : 'Available';
  return simulateRequest(bed, 300);
}
