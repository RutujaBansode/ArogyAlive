import api from './api';

function mapBeds(beds = []) {
  const mapped = {
    general: {
      total: 0,
      available: 0,
      occupied: 0,
      status: 'Full',
    },
    icu: {
      total: 0,
      available: 0,
      occupied: 0,
      status: 'Full',
    },
    emergency: {
      total: 0,
      available: 0,
      occupied: 0,
      status: 'Full',
    },
    oxygen: {
      total: 0,
      available: 0,
      occupied: 0,
      status: 'Full',
    },
    ventilator: {
      total: 0,
      available: 0,
      occupied: 0,
      status: 'Full',
    },
  };

  beds.forEach((bed) => {
    const key = bed.bedType.toLowerCase();

    if (mapped[key]) {
      mapped[key] = {
        total: bed.totalBeds,
        available: bed.availableBeds,
        occupied: bed.occupiedBeds,
        status: bed.status,
      };
    }
  });

  return mapped;
}

async function mapHospital(hospital) {
  let beds = [];

  try {
    const bedResponse = await api.get(
      `/hospitals/${hospital.id}/beds`
    );

    beds = bedResponse.data;
  } catch (error) {
    console.error(
      `Could not load beds for hospital ${hospital.id}`,
      error
    );
  }

  return {
    ...hospital,

    // Backend ID: 1, 2, 3...
    // Frontend ID: h1, h2, h3...
    id: `h${hospital.id}`,

    // Frontend expects departments[]
    departments: (hospital.specializations || []).map(
      (specialization) => specialization.name
    ),

    // Frontend expects facilities[]
    facilities: hospital.facilities
      ? hospital.facilities.split(', ')
      : [],

    // Backend returns "flagship"
    // Frontend uses "isFlagship"
    isFlagship: hospital.flagship ?? false,

    // Frontend expects beds object
    beds: mapBeds(beds),
  };
}

export async function getAllHospitals() {
  const response = await api.get('/hospitals');

  const hospitals = response.data;

  return Promise.all(
    hospitals.map((hospital) => mapHospital(hospital))
  );
}

export async function getHospitalById(id) {
  const hospitals = await getAllHospitals();

  return (
    hospitals.find((hospital) => hospital.id === id) ||
    null
  );
}

export async function getHospitalsBySpecialization(
  specialization
) {
  const hospitals = await getAllHospitals();

  return hospitals.filter((hospital) =>
    (hospital.departments || []).includes(specialization)
  );
}

export async function searchHospitals(filters = {}) {
  let results = await getAllHospitals();

  if (Array.isArray(filters.specialization)) {
    results = results.filter((hospital) =>
      filters.specialization.some((specialization) =>
        (hospital.departments || []).includes(specialization)
      )
    );
  } else if (
    filters.specializations &&
    Array.isArray(filters.specializations)
  ) {
    results = results.filter((hospital) =>
      filters.specializations.some((specialization) =>
        (hospital.departments || []).includes(specialization)
      )
    );
  } else if (
    filters.specialization &&
    filters.specialization !== 'All'
  ) {
    results = results.filter((hospital) =>
      (hospital.departments || []).includes(
        filters.specialization
      )
    );
  }

  if (filters.maxDistance) {
    results = results.filter(
      (hospital) =>
        hospital.distanceKm <= Number(filters.maxDistance)
    );
  }

  if (filters.doctorAvailable) {
    results = results.filter(
      (hospital) => hospital.doctorAvailable
    );
  }

  if (filters.opdAvailable) {
    results = results.filter(
      (hospital) => hospital.opdAvailable
    );
  }

  if (filters.emergencyAvailable) {
    results = results.filter(
      (hospital) => hospital.emergencyAvailable
    );
  }

  if (filters.icuAvailable) {
    results = results.filter(
      (hospital) => hospital.beds.icu.available > 0
    );
  }

  if (filters.bedsAvailable) {
    results = results.filter(
      (hospital) => hospital.beds.general.available > 0
    );
  }

  if (
    filters.hospitalType &&
    filters.hospitalType !== 'All'
  ) {
    results = results.filter(
      (hospital) => hospital.type === filters.hospitalType
    );
  }

  results.sort(
    (a, b) => a.distanceKm - b.distanceKm
  );

  return results;
}

export async function getEmergencyHospitals() {
  const hospitals = await getAllHospitals();

  return hospitals.filter(
    (hospital) => hospital.emergencyAvailable
  );
}