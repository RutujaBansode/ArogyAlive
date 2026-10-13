import api from './api';


// Convert backend doctor data into the structure
// expected by the React frontend.
function mapDoctor(doctor) {
  const doctorId = Number(doctor.id);

  return {
    // Keep the REAL numeric backend ID.
    // Example: 1, 2, 3...
    id: doctorId,

    hospitalId: doctor.hospital?.id
      ? `h${doctor.hospital.id}`
      : null,

    hospitalName:
      doctor.hospital?.name || '',

    name:
      doctor.name || '',

    gender:
      doctor.gender || '',

    specialization:
      doctor.specialization?.name || '',

    qualification:
      doctor.qualification || '',

    experienceYears:
      doctor.experienceYears || 0,

    consultationType:
      doctor.consultationType || '',

    consultationFee:
      doctor.consultationFee || 0,

    availableToday:
      doctor.availableToday === true,

    opdTimings:
      doctor.opdTimings || '',

    rating:
      doctor.rating || 0,

    // Keep the image value coming from the backend.
    image:
      doctor.image || '',

    imageAlt:
      doctor.imageAlt ||
      `${doctor.name || 'Doctor'} photo`,

    about:
      doctor.about || '',

    // DoctorCard expects an array.
    languages: [],
  };
}


// Convert any of these:
//
// 1
// "1"
// "d1"
//
// into:
//
// 1
function normalizeDoctorId(doctorId) {
  const value =
    String(doctorId ?? '').trim();

  const numericValue =
    value.startsWith('d')
      ? value.substring(1)
      : value;

  const parsedId =
    Number(numericValue);

  return Number.isInteger(parsedId)
    ? parsedId
    : null;
}


// Get languages for one doctor
export async function getDoctorLanguages(
  doctorId
) {

  const numericDoctorId =
    normalizeDoctorId(doctorId);

  if (numericDoctorId === null) {
    console.error(
      'Invalid doctor ID:',
      doctorId
    );

    return [];
  }

  try {

    const response =
      await api.get(
        `/doctors/${numericDoctorId}/languages`
      );

    return Array.isArray(response.data)
      ? response.data.map(
          (item) => item.language
        )
      : [];

  } catch (error) {

    console.error(
      `Could not load languages for doctor ${numericDoctorId}`,
      error
    );

    return [];
  }
}


// Get availability for one doctor
export async function getDoctorAvailability(
  doctorId
) {

  const numericDoctorId =
    normalizeDoctorId(doctorId);

  if (numericDoctorId === null) {
    console.error(
      'Invalid doctor ID:',
      doctorId
    );

    return [];
  }

  try {

    const response =
      await api.get(
        `/doctors/${numericDoctorId}/availability`
      );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error) {

    console.error(
      `Could not load availability for doctor ${numericDoctorId}`,
      error
    );

    return [];
  }
}


// Add languages to one doctor
async function enrichDoctor(
  doctor
) {

  const mappedDoctor =
    mapDoctor(doctor);

  const languages =
    await getDoctorLanguages(
      doctor.id
    );

  return {
    ...mappedDoctor,
    languages,
  };
}


// Get all doctors
export async function getAllDoctors() {

  const response =
    await api.get('/doctors');

  const doctors =
    Array.isArray(response.data)
      ? response.data
      : [];

  return Promise.all(
    doctors.map(
      (doctor) =>
        enrichDoctor(doctor)
    )
  );
}


// Get doctors for a particular hospital
export async function getDoctorsByHospitalId(
  hospitalId
) {

  const numericHospitalId =
    String(hospitalId)
      .replace('h', '');

  const response =
    await api.get(
      `/doctors/hospital/${numericHospitalId}`
    );

  const doctors =
    Array.isArray(response.data)
      ? response.data
      : [];

  return Promise.all(
    doctors.map(
      (doctor) =>
        enrichDoctor(doctor)
    )
  );
}


// Compatibility function for existing HospitalDetails.jsx
export async function getDoctorsByHospital(
  hospitalId
) {
  return getDoctorsByHospitalId(
    hospitalId
  );
}


// Get one doctor by ID
export async function getDoctorById(
  doctorId
) {

  const numericDoctorId =
    normalizeDoctorId(doctorId);

  if (numericDoctorId === null) {
    return null;
  }

  const doctors =
    await getAllDoctors();

  return (
    doctors.find(
      (doctor) =>
        Number(doctor.id) ===
        numericDoctorId
    ) || null
  );
}


// Search/filter doctors
export async function searchDoctors(
  filters = {},
  additionalFilters = {}
) {

  let results =
    await getAllDoctors();

  let normalizedFilters;

  if (typeof filters === 'string') {

    normalizedFilters = {
      ...additionalFilters,
      search: filters,
    };

  } else {

    normalizedFilters = {
      ...filters,
      ...additionalFilters,
    };
  }

  const searchText =
    normalizedFilters.search ||
    normalizedFilters.query ||
    normalizedFilters.searchTerm ||
    '';

  if (searchText) {

    const search =
      String(searchText)
        .toLowerCase()
        .trim();

    results =
      results.filter(
        (doctor) =>
          doctor.name
            ?.toLowerCase()
            .includes(search) ||

          doctor.specialization
            ?.toLowerCase()
            .includes(search) ||

          doctor.hospitalName
            ?.toLowerCase()
            .includes(search)
      );
  }


  if (
    normalizedFilters.specialization &&
    normalizedFilters.specialization !== 'All'
  ) {

    results =
      results.filter(
        (doctor) =>
          doctor.specialization ===
          normalizedFilters.specialization
      );
  }


  if (
    Array.isArray(
      normalizedFilters.specializations
    )
  ) {

    results =
      results.filter(
        (doctor) =>
          normalizedFilters.specializations.includes(
            doctor.specialization
          )
      );
  }


  if (normalizedFilters.hospitalId) {

    const hospitalId =
      String(
        normalizedFilters.hospitalId
      ).replace('h', '');

    results =
      results.filter(
        (doctor) =>
          String(doctor.hospitalId) ===
          `h${hospitalId}`
      );
  }


  if (
    normalizedFilters.availableToday
  ) {

    results =
      results.filter(
        (doctor) =>
          doctor.availableToday === true
      );
  }


  return results;
}