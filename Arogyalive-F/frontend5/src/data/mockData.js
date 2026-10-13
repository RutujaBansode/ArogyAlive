// ============================================================
// Arogya Live — Centralized Mock Data
// Realistic frontend mock data centered on Solapur, Maharashtra.
// Pure frontend demonstration only — NO backend/database changes.
// ============================================================

export const departments = [
  { id: 'cardiology', name: 'Cardiology', category: 'Heart & Chest' },
  { id: 'pulmonology', name: 'Pulmonology', category: 'Respiratory' },
  { id: 'neurology', name: 'Neurology', category: 'Neurology' },
  { id: 'orthopedics', name: 'Orthopedics', category: 'Orthopedics' },
  { id: 'ophthalmology', name: 'Ophthalmology', category: 'Eye' },
  { id: 'dental', name: 'Dental', category: 'Dental' },
  { id: 'ent', name: 'ENT', category: 'ENT' },
  { id: 'dermatology', name: 'Dermatology', category: 'Dermatology' },
  { id: 'gynecology', name: "Gynecology", category: "Women's Health" },
  { id: 'pediatrics', name: 'Pediatrics', category: 'Pediatrics' },
  { id: 'general', name: 'General Medicine', category: 'General Medicine' },
];

// Map a health-concern category to the specialization it needs.
export const categoryToSpecialization = {
  'Heart & Chest': 'Cardiology',
  'Respiratory': 'Pulmonology',
  'Neurology': 'Neurology',
  'Orthopedics': 'Orthopedics',
  'Eye': 'Ophthalmology',
  'Dental': 'Dental',
  'ENT': 'ENT',
  'Dermatology': 'Dermatology',
  "Women's Health": 'Gynecology',
  'Pediatrics': 'Pediatrics',
  'General Medicine': 'General Medicine',
  'Other': 'General Medicine',
};

// Common symptom mappings returning multiple relevant options
// For example: Headache -> General Hospital + Neurology / Neuro
export const symptomMatches = [
  {
    keywords: ['headache', 'head ache', 'migraine', 'डोकेदुखी', 'सरदर्द', 'सिरदर्द'],
    queryLabel: 'Headache',
    options: [
      {
        id: 'opt-gen',
        title: 'General Hospital',
        specialization: 'General Medicine',
        category: 'General Hospital',
        description: 'General consultation • Suitable for common, tension, or basic headache complaints',
        recommended: true,
      },
      {
        id: 'opt-neuro',
        title: 'Neurology / Neuro',
        specialization: 'Neurology',
        category: 'Neurology',
        description: 'Neurologist consultation • For neurological, severe, or persistent migraine-related concerns',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['fever', 'cold', 'flu', 'ताप', 'बुखार', 'viral'],
    queryLabel: 'Fever & Viral Complaints',
    options: [
      {
        id: 'opt-gen',
        title: 'General Hospital',
        specialization: 'General Medicine',
        category: 'General Hospital',
        description: 'General consultation • Treatment for seasonal fever, infection, and body ache',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['cough', 'breath', 'asthma', 'खोकला', 'खांसी', 'respiratory', 'lung'],
    queryLabel: 'Cough & Respiratory',
    options: [
      {
        id: 'opt-gen',
        title: 'General Hospital',
        specialization: 'General Medicine',
        category: 'General Hospital',
        description: 'General OPD consultation for seasonal cough and cold',
        recommended: true,
      },
      {
        id: 'opt-pulmo',
        title: 'Pulmonology',
        specialization: 'Pulmonology',
        category: 'Respiratory',
        description: 'Pulmonologist consultation for chronic asthma or persistent breathing issues',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['skin', 'rash', 'derma', 'itching', 'त्वचा', 'खाज'],
    queryLabel: 'Skin Rash & Dermatology',
    options: [
      {
        id: 'opt-derma',
        title: 'Dermatology',
        specialization: 'Dermatology',
        category: 'Dermatology',
        description: 'Dermatologist consultation for allergy, rash, and skin conditions',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['tooth', 'teeth', 'dental', 'दांत', 'दातदुखी'],
    queryLabel: 'Tooth Pain & Dental',
    options: [
      {
        id: 'opt-dental',
        title: 'Dental Care',
        specialization: 'Dental',
        category: 'Dental',
        description: 'Dental surgeon consultation for cavities, toothache, and gum care',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['heart', 'cardio', 'chest pain', 'हृदय', 'छातीत दुखणे'],
    queryLabel: 'Chest Discomfort & Cardiology',
    options: [
      {
        id: 'opt-cardio',
        title: 'Cardiology',
        specialization: 'Cardiology',
        category: 'Heart & Chest',
        description: 'Cardiologist consultation for cardiac evaluation and chest pain assessment',
        recommended: true,
      },
    ],
  },
  {
    keywords: ['bone', 'fracture', 'joint', 'ortho', 'हड्डी', 'सांधेदुखी'],
    queryLabel: 'Bone & Joint Concerns',
    options: [
      {
        id: 'opt-ortho',
        title: 'Orthopedics',
        specialization: 'Orthopedics',
        category: 'Orthopedics',
        description: 'Orthopedic surgeon for joint pain, trauma, and bone health',
        recommended: true,
      },
    ],
  },
];

export function resolveSymptomMatches(query = '') {
  const q = query.toLowerCase().trim();
  for (const match of symptomMatches) {
    if (match.keywords.some((k) => q.includes(k.toLowerCase()))) {
      return match;
    }
  }
  return null;
}

export function resolveSpecializationFromQuery(query = '') {
  const symptomMatch = resolveSymptomMatches(query);
  if (symptomMatch && symptomMatch.options.length > 0) {
    return symptomMatch.options[0].specialization;
  }
  return 'General Medicine';
}

function makeBeds(general, generalTotal, icu, icuTotal, emergency, emergencyTotal, oxygen, oxygenTotal, ventilator, ventilatorTotal) {
  const statusFor = (avail, total) => {
    if (avail <= 0) return 'Full';
    if (avail / total <= 0.25) return 'Limited';
    return 'Available';
  };
  return {
    general: { total: generalTotal, available: general, occupied: generalTotal - general, status: statusFor(general, generalTotal) },
    icu: { total: icuTotal, available: icu, occupied: icuTotal - icu, status: statusFor(icu, icuTotal) },
    emergency: { total: emergencyTotal, available: emergency, occupied: emergencyTotal - emergency, status: statusFor(emergency, emergencyTotal) },
    oxygen: { total: oxygenTotal, available: oxygen, occupied: oxygenTotal - oxygen, status: statusFor(oxygen, oxygenTotal) },
    ventilator: { total: ventilatorTotal, available: ventilator, occupied: ventilatorTotal - ventilator, status: statusFor(ventilator, ventilatorTotal) },
  };
}

// Special bed generator for General Hospital:
// Strictly ONE General Bed option (ICU and Emergency removed)
function makeGeneralHospitalBeds(available, total) {
  return {
    general: {
      total,
      available,
      occupied: total - available,
      status: available > 0 ? (available / total <= 0.25 ? 'Limited' : 'Available') : 'Full',
    },
    // ICU and Emergency removed / 0 total so they never appear
    icu: { total: 0, available: 0, occupied: 0, status: 'Full' },
    emergency: { total: 0, available: 0, occupied: 0, status: 'Full' },
    oxygen: { total: 0, available: 0, occupied: 0, status: 'Full' },
    ventilator: { total: 0, available: 0, occupied: 0, status: 'Full' },
  };
}

export const hospitals = [
  {
    id: 'h1',
    name: 'Solapur City Hospital',
    type: 'Multispeciality',
    location: 'Station Road, Saat Rasta, Solapur',
    city: 'Solapur',
    distanceKm: 1.8,
    contact: '+91 217 274 4001',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics'],
    facilities: ['24x7 Emergency Unit', 'Diagnostic Imaging (CT/MRI)', 'Cardiac Cath Lab', 'Central Pharmacy', 'Ambulance Service'],
    opdTimings: '9:00 AM – 6:00 PM',
    emergencyAvailable: true,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Solapur City Hospital building exterior and entrance',
    beds: makeBeds(14, 45, 4, 12, 3, 8, 6, 15, 2, 5),
    rating: 4.8,
    isFlagship: true,
    description: 'Solapur City Hospital is the primary multispeciality healthcare institute in Solapur, equipped with comprehensive cardiac, neurological, surgical, and emergency care.',
  },
  {
    id: 'h2',
    name: 'Solapur City General Hospital',
    type: 'General',
    location: 'Old Pune Naka, Solapur',
    city: 'Solapur',
    distanceKm: 2.9,
    contact: '+91 217 262 1102',
    departments: ['General Medicine', 'Pulmonology', 'ENT', 'Pediatrics'],
    facilities: ['24x7 General OPD', 'Pathology Lab', 'X-Ray Diagnostics', 'Government Jan Aushadhi Pharmacy'],
    opdTimings: '8:30 AM – 5:00 PM',
    emergencyAvailable: false,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Solapur City General Hospital facility',
    // Rule: Under General Hospital -> General Beds, ONLY ONE General Bed option.
    // ICU and Emergency beds removed.
    beds: makeGeneralHospitalBeds(18, 50),
    rating: 4.2,
    description: 'Solapur City General Hospital provides affordable, quality primary care, routine consultations, and general inpatient wards for common health complaints.',
  },
  {
    id: 'h3',
    name: 'Ashwini Sahakari Rugnalaya (Ashwini Hospital)',
    type: 'Multispeciality',
    location: 'North Sadar Bazar, Solapur',
    city: 'Solapur',
    distanceKm: 3.2,
    contact: '+91 217 231 9900',
    departments: ['Cardiology', 'Orthopedics', 'General Medicine', 'Gynecology'],
    facilities: ['Joint Replacement Centre', 'Trauma Care Unit', 'Blood Bank', '24x7 Pharmacy', 'Ambulance Service'],
    opdTimings: '9:00 AM – 7:00 PM',
    emergencyAvailable: true,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Ashwini Hospital Solapur main building',
    beds: makeBeds(11, 35, 3, 8, 2, 6, 4, 10, 1, 3),
    rating: 4.6,
    description: 'A premier cooperative multispeciality hospital in Solapur renowned for cardiology, joint replacement, and round-the-clock emergency medical response.',
  },
  {
    id: 'h4',
    name: 'Markandey General Hospital',
    type: 'General',
    location: 'Budhwar Peth, Solapur',
    city: 'Solapur',
    distanceKm: 3.8,
    contact: '+91 217 272 5544',
    departments: ['General Medicine', 'Ophthalmology', 'Dental', 'ENT'],
    facilities: ['General Medical OPD', 'Cataract Surgery Wing', 'Routine Diagnostic Lab', 'Pharmacy'],
    opdTimings: '9:00 AM – 5:30 PM',
    emergencyAvailable: false,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Markandey General Hospital Solapur clinical ward',
    // Rule: Under General Hospital -> General Beds, ONLY ONE General Bed option.
    // ICU and Emergency beds removed.
    beds: makeGeneralHospitalBeds(12, 30),
    rating: 4.3,
    description: 'A trusted general healthcare institution in Budhwar Peth, Solapur catering to general medical consultations, eye checkups, and inpatient general bed wards.',
  },
  {
    id: 'h5',
    name: 'Solapur Neuro & Trauma Centre',
    type: 'Specialty',
    location: 'Railway Lines, Solapur',
    city: 'Solapur',
    distanceKm: 2.4,
    contact: '+91 217 265 8899',
    departments: ['Neurology', 'General Medicine'],
    facilities: ['Advanced EEG / EMG Lab', 'Spiral CT Scan', 'Neuro ICU', 'Stroke Rehabilitation Unit'],
    opdTimings: '9:30 AM – 5:00 PM',
    emergencyAvailable: true,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Solapur Neuro & Trauma Centre modern medical facility',
    beds: makeBeds(8, 25, 3, 8, 2, 5, 3, 8, 1, 2),
    rating: 4.7,
    description: 'Solapur Neuro & Trauma Centre is dedicated to comprehensive neurological diagnostics, migraine management, acute stroke care, and neuro-rehabilitation.',
  },
  {
    id: 'h6',
    name: 'Matoshree Multispeciality Hospital',
    type: 'Multispeciality',
    location: 'Near Old Water Tank, Jule Solapur, Solapur',
    city: 'Solapur',
    distanceKm: 4.5,
    contact: '+91 217 234 7711',
    departments: ['Gynecology', 'Pediatrics', 'General Medicine', 'Dermatology'],
    facilities: ['Maternity Wing', 'NICU & PICU', 'Pediatric Vaccination Hub', '24x7 Ambulance Service'],
    opdTimings: '9:00 AM – 6:30 PM',
    emergencyAvailable: true,
    doctorAvailable: true,
    opdAvailable: true,
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Matoshree Multispeciality Hospital Solapur',
    beds: makeBeds(10, 30, 2, 6, 2, 4, 3, 8, 1, 2),
    rating: 4.5,
    description: 'Serving Jule Solapur with comprehensive family healthcare, advanced mother and child care, and general physician services.',
  },
];

export const doctors = [
  {
    id: 'd1',
    name: 'Dr. Priya Patil',
    gender: 'Female',
    specialization: 'Cardiology',
    qualification: 'MD, DM Cardiology',
    experienceYears: 9,
    hospitalId: 'h1',
    hospitalName: 'Solapur City Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person & Online',
    consultationFee: 600,
    availableToday: true,
    opdTimings: '10:00 AM – 2:00 PM',
    rating: 4.8,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ0SiVwKTVU2BxODKub2DACgsHEoW-TWZSDW6hT2is7Q&s=10',
    imageAlt: 'Dr. Priya Patil — Cardiologist at Solapur City Hospital',
    about: 'Dr. Priya Patil is a senior cardiologist at Solapur City Hospital specializing in preventive cardiology, hypertension, and interventional cardiac care.',
    weeklyAvailability: {
      Monday: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      Tuesday: ['10:00 AM', '11:30 AM'],
      Wednesday: ['10:00 AM', '10:30 AM', '12:00 PM'],
      Thursday: ['10:00 AM', '11:00 AM'],
      Friday: ['10:00 AM', '11:00 AM', '11:30 AM'],
    },
  },
  {
    id: 'd2',
    name: 'Dr. Sameer Kulkarni',
    gender: 'Male',
    specialization: 'Orthopedics',
    qualification: 'MS Orthopedics',
    experienceYears: 14,
    hospitalId: 'h3',
    hospitalName: 'Ashwini Sahakari Rugnalaya (Ashwini Hospital)',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person',
    consultationFee: 500,
    availableToday: true,
    opdTimings: '9:00 AM – 1:00 PM',
    rating: 4.6,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0_nQSNjfe9_gTRP5YnNwyaLBK-tuhUd-ukI_GrDL1w&s=10',
    imageAlt: 'Dr. Sameer Kulkarni — Orthopedic Surgeon at Ashwini Hospital',
    about: 'Dr. Sameer Kulkarni specializes in joint replacement, sports injury recovery, and fracture management in Solapur.',
    weeklyAvailability: {
      Monday: ['9:00 AM', '9:30 AM'],
      Tuesday: ['9:00 AM', '9:30 AM', '10:00 AM'],
      Wednesday: ['9:00 AM', '10:00 AM'],
      Thursday: ['9:00 AM', '10:30 AM'],
      Friday: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'],
    },
  },
  {
    id: 'd3',
    name: 'Dr. Anjali Deshmukh',
    gender: 'Female',
    specialization: 'Ophthalmology',
    qualification: 'MS Ophthalmology',
    experienceYears: 8,
    hospitalId: 'h4',
    hospitalName: 'Markandey General Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Marathi'],
    consultationType: 'In-person',
    consultationFee: 350,
    availableToday: true,
    opdTimings: '10:00 AM – 3:00 PM',
    rating: 4.7,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkOEd5Mz1JD5VW2htcxiDu1aYAyslpy2B-LBoduggleQ&s=10',
    imageAlt: 'Dr. Anjali Deshmukh — Ophthalmologist at Markandey General Hospital',
    about: 'Dr. Anjali Deshmukh provides comprehensive ophthalmology care, cataract screening, and routine vision correction.',
    weeklyAvailability: {
      Monday: ['10:00 AM', '10:30 AM'],
      Tuesday: ['10:00 AM'],
      Wednesday: ['10:00 AM', '10:30 AM', '11:00 AM'],
      Thursday: ['10:00 AM'],
      Friday: ['10:00 AM', '11:30 AM'],
    },
  },
  {
    id: 'd4',
    name: 'Dr. Rohan Joshi',
    gender: 'Male',
    specialization: 'Pulmonology',
    qualification: 'MD Pulmonology',
    experienceYears: 10,
    hospitalId: 'h2',
    hospitalName: 'Solapur City General Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person & Online',
    consultationFee: 400,
    availableToday: true,
    opdTimings: '8:30 AM – 12:30 PM',
    rating: 4.4,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrY1naYmEpMfNMqi2Pw9q1jkpiBoTi1kFEfK1U79_oCg&s=10',
    imageAlt: 'Dr. Rohan Joshi — Pulmonologist at Solapur City General Hospital',
    about: 'Dr. Rohan Joshi treats respiratory illnesses including bronchial asthma, chronic bronchitis, allergy cough, and pneumonia.',
    weeklyAvailability: {
      Monday: ['8:30 AM', '9:00 AM'],
      Tuesday: ['8:30 AM', '9:00 AM'],
      Wednesday: ['8:30 AM', '10:00 AM'],
      Thursday: ['8:30 AM', '9:00 AM', '9:30 AM'],
      Friday: ['8:30 AM', '9:30 AM'],
    },
  },
  {
    id: 'd5',
    name: 'Dr. Neha Shinde',
    gender: 'Female',
    specialization: 'Gynecology',
    qualification: 'MD OBG',
    experienceYears: 11,
    hospitalId: 'h6',
    hospitalName: 'Matoshree Multispeciality Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person',
    consultationFee: 500,
    availableToday: true,
    opdTimings: '9:00 AM – 1:00 PM',
    rating: 4.8,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxZyk8TCqc_ImnjDgFNz3Qe-ggLkPWR0dTkGHhLYxSJg&s=10',
    imageAlt: 'Dr. Neha Shinde — Gynecologist at Matoshree Multispeciality Hospital',
    about: 'Dr. Neha Shinde provides compassionate women’s healthcare, prenatal guidance, and obstetrical treatment in Jule Solapur.',
    weeklyAvailability: {
      Monday: ['9:00 AM', '9:30 AM', '10:00 AM'],
      Tuesday: ['9:00 AM', '10:30 AM'],
      Wednesday: ['9:00 AM', '9:30 AM'],
      Thursday: ['9:00 AM', '9:30 AM', '10:00 AM'],
      Friday: ['9:00 AM', '11:00 AM'],
    },
  },
  {
    id: 'd6',
    name: 'Dr. Vikram Rane',
    gender: 'Male',
    specialization: 'Neurology',
    qualification: 'DM Neurology',
    experienceYears: 16,
    hospitalId: 'h5',
    hospitalName: 'Solapur Neuro & Trauma Centre',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person',
    consultationFee: 700,
    availableToday: true,
    opdTimings: '9:30 AM – 1:30 PM',
    rating: 4.9,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFL0zMSAJq1dUf2vXG6l4N4WC6Hpzqse0a8GBoxhmBTg&s=10',
    imageAlt: 'Dr. Vikram Rane — Neurologist at Solapur Neuro & Trauma Centre',
    about: 'Dr. Vikram Rane is a distinguished senior neurologist in Solapur specializing in chronic headaches, migraine management, stroke prevention, and epilepsy care.',
    weeklyAvailability: {
      Monday: ['9:30 AM', '10:00 AM', '10:30 AM'],
      Tuesday: ['9:30 AM', '10:00 AM'],
      Wednesday: ['9:30 AM', '11:00 AM'],
      Thursday: ['9:30 AM', '10:00 AM'],
      Friday: ['9:30 AM', '10:30 AM'],
    },
  },
  {
    id: 'd7',
    name: 'Dr. Kavita Bhosale',
    gender: 'Female',
    specialization: 'Pediatrics',
    qualification: 'MD Pediatrics',
    experienceYears: 8,
    hospitalId: 'h6',
    hospitalName: 'Matoshree Multispeciality Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person & Online',
    consultationFee: 400,
    availableToday: true,
    opdTimings: '10:00 AM – 2:00 PM',
    rating: 4.7,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFBwHf220iLPTJO7YCeKxQyR6OOA-P_I9xcphHtaq8bA&s=10',
    imageAlt: 'Dr. Kavita Bhosale — Pediatrician at Matoshree Multispeciality Hospital',
    about: 'Dr. Kavita Bhosale provides gentle healthcare, vaccinations, and growth assessments for infants and children.',
    weeklyAvailability: {
      Monday: ['10:00 AM', '10:30 AM'],
      Tuesday: ['10:00 AM', '10:30 AM', '11:00 AM'],
      Wednesday: ['10:00 AM'],
      Thursday: ['10:00 AM', '10:30 AM'],
      Friday: ['10:00 AM', '10:30 AM', '11:00 AM'],
    },
  },
  {
    id: 'd8',
    name: 'Dr. Arjun Mehta',
    gender: 'Male',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD Medicine',
    experienceYears: 7,
    hospitalId: 'h1',
    hospitalName: 'Solapur City Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person & Online',
    consultationFee: 400,
    availableToday: true,
    opdTimings: '9:00 AM – 5:00 PM',
    rating: 4.5,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtxZeqcYJswdrFhjssNnGwbrgnpl5MtOkedzyXfJ796A&s=10',
    imageAlt: 'Dr. Arjun Mehta — General Physician at Solapur City Hospital',
    about: 'Dr. Arjun Mehta treats common fever, headache, seasonal cough, chronic diabetes checkups, and provides comprehensive primary care.',
    weeklyAvailability: {
      Monday: ['9:00 AM', '9:30 AM', '10:00 AM'],
      Tuesday: ['9:00 AM', '9:30 AM', '11:00 AM'],
      Wednesday: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'],
      Thursday: ['9:00 AM', '11:30 AM'],
      Friday: ['9:00 AM', '9:30 AM'],
    },
  },
  {
    id: 'd9',
    name: 'Dr. Sandeep Kadam',
    gender: 'Male',
    specialization: 'General Medicine',
    qualification: 'MBBS, DNB Family Medicine',
    experienceYears: 12,
    hospitalId: 'h2',
    hospitalName: 'Solapur City General Hospital',
    hospitalCity: 'Solapur',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationType: 'In-person',
    consultationFee: 250,
    availableToday: true,
    opdTimings: '8:30 AM – 4:00 PM',
    rating: 4.4,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSK52d1xLbrObLMFo9MuTA5uokbCsMI5w38Jdv4iiR5A&s=10',
    imageAlt: 'Dr. Sandeep Kadam — General Physician at Solapur City General Hospital',
    about: 'Dr. Sandeep Kadam provides general medical care, headache evaluation, hypertension monitoring, and routine outpatient checkups in Solapur.',
    weeklyAvailability: {
      Monday: ['9:00 AM', '10:00 AM', '11:00 AM'],
      Tuesday: ['9:00 AM', '10:00 AM'],
      Wednesday: ['9:00 AM', '10:00 AM', '11:30 AM'],
      Thursday: ['9:00 AM', '10:30 AM'],
      Friday: ['9:00 AM', '11:00 AM'],
    },
  },
];

export const ambulances = [
  {
    id: 'A101',
    vehicleNumber: 'MH-13-AZ-4521',
    distanceKm: 1.2,
    etaMinutes: 6,
    available: true,
    type: 'Basic Life Support',
    price: 800,
    driverName: 'Ramesh Jadhav',
    driverContact: '+91 98231 45678',
    currentLocation: 'Saat Rasta, Solapur',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'A102',
    vehicleNumber: 'MH-13-BX-8820',
    distanceKm: 1.8,
    etaMinutes: 9,
    available: true,
    type: 'Advanced Life Support',
    price: 1500,
    driverName: 'Suresh Pawar',
    driverContact: '+91 98231 56789',
    currentLocation: 'Old Pune Naka, Solapur',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN3VQQ1pYPEXOAg3m-sjbxe_fNhE0U3wFjIr3eN5PL7g&s=10',
  },
  {
    id: 'A103',
    vehicleNumber: 'MH-13-CY-1104',
    distanceKm: 3.4,
    etaMinutes: 14,
    available: false,
    type: 'ICU Ambulance',
    price: 2200,
    driverName: 'Vilas Shinde',
    driverContact: '+91 98231 67890',
    currentLocation: 'Railway Lines, Solapur',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=700&q=80',
  },
];

// Mutable in-memory list of ambulance requests
export const mockAmbulanceRequests = [
  {
    id: 'AMB-REQ-3391',
    patientName: 'Anita Kamble',
    pickupLocation: 'Jule Solapur, Solapur',
    destinationHospital: 'Solapur City Hospital',
    requestTime: '10:15 AM',
    urgentCareInfo: 'Urgent Care: Acute Chest Pain & Breathing Difficulty',
    distanceKm: 2.1,
    ambulanceId: 'A101',
    vehicleNumber: 'MH-13-AZ-4521',
    driverName: 'Ramesh Jadhav',
    driverContact: '+91 98231 45678',
    status: 'Dispatched',
    etaMinutes: 8,
  },
  {
    id: 'AMB-REQ-3392',
    patientName: 'Ravi Deshpande',
    pickupLocation: 'MG Road, Solapur',
    destinationHospital: 'Solapur City General Hospital',
    requestTime: '10:28 AM',
    urgentCareInfo: 'Urgent Care: Severe Head Injury & Dizziness',
    distanceKm: 1.4,
    ambulanceId: 'A102',
    vehicleNumber: 'MH-13-BX-8820',
    driverName: 'Suresh Pawar',
    driverContact: '+91 98231 56789',
    status: 'Pending',
    etaMinutes: 11,
  },
  {
    id: 'AMB-REQ-3393',
    patientName: 'Sunita More',
    pickupLocation: 'Station Road, Solapur',
    destinationHospital: 'Ashwini Sahakari Rugnalaya',
    requestTime: '09:40 AM',
    urgentCareInfo: 'Patient Transfer Request',
    distanceKm: 3.6,
    ambulanceId: 'A101',
    vehicleNumber: 'MH-13-AZ-4521',
    driverName: 'Ramesh Jadhav',
    driverContact: '+91 98231 45678',
    status: 'Completed',
    etaMinutes: 0,
  },
];

export const mockAppointments = [
  {
    id: 'APT-1001',
    tokenNumber: 'T-014',
    patientName: 'Rahul Sawant',
    doctorId: 'd1',
    doctorName: 'Dr. Priya Patil',
    hospitalId: 'h1',
    hospitalName: 'Solapur City Hospital',
    date: '2026-09-23',
    time: '10:30 AM',
    type: 'OPD',
    status: 'Confirmed',
  },
];

export const mockPatients = [
  { id: 'p1', name: 'Rahul Sawant', age: 34, gender: 'Male', phone: '+91 90000 11111' },
  { id: 'p2', name: 'Sneha Kale', age: 28, gender: 'Female', phone: '+91 90000 22222' },
  { id: 'p3', name: 'Vikas Pawar', age: 52, gender: 'Male', phone: '+91 90000 33333' },
];

export const mockStaff = [
  { id: 's1', name: 'Meera Joshi', role: 'Receptionist', hospitalId: 'h1' },
  { id: 's2', name: 'Admin User', role: 'Admin', hospitalId: null },
];

export const opdQueue = [
  { id: 'q1', tokenNumber: 'T-014', patientName: 'Rahul Sawant', doctor: 'Dr. Priya Patil', status: 'Waiting' },
  { id: 'q2', tokenNumber: 'T-015', patientName: 'Sneha Kale', doctor: 'Dr. Priya Patil', status: 'In Consultation' },
  { id: 'q3', tokenNumber: 'T-016', patientName: 'Vikas Pawar', doctor: 'Dr. Arjun Mehta', status: 'Completed' },
];

export const doctorPatientHistory = {
  'Rahul Sawant': [
    { date: '2026-07-02', diagnosis: 'Routine check-up', notes: 'Blood pressure normal, advised regular exercise.' },
    { date: '2026-05-14', diagnosis: 'Chest discomfort', notes: 'ECG normal, advised lifestyle changes and follow-up in 2 months.' },
  ],
  'Sneha Kale': [
    { date: '2026-06-20', diagnosis: 'Follow-up consultation', notes: 'Recovering well, continue current medication.' },
  ],
  'Vikas Pawar': [
    { date: '2026-04-11', diagnosis: 'Annual check-up', notes: 'All vitals normal.' },
  ],
};

export const doctorSlotOptions = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
