import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import VoiceSearchInput from '../components/VoiceSearchInput';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

import { getAllDoctors } from '../services/doctorService';

export default function Doctors() {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(
    searchParams.get('query') || ''
  );

  const [specialization, setSpecialization] =
    useState('All');

  const [hospital, setHospital] =
    useState('All');

  const [availableOnly, setAvailableOnly] =
    useState(false);

  const [minExperience, setMinExperience] =
    useState('');

  const [allDoctors, setAllDoctors] =
    useState([]);

  const [status, setStatus] =
    useState('loading');

  const [searchText, setSearchText] =
    useState(
      searchParams.get('query') || ''
    );


  // Load doctors from backend
  useEffect(() => {
    loadDoctors();
  }, []);


  async function loadDoctors() {
    try {
      setStatus('loading');

      const data =
        await getAllDoctors();

      setAllDoctors(data);

      setStatus('success');

    } catch (error) {

      console.error(
        'Unable to load doctors:',
        error
      );

      setStatus('error');
    }
  }


  // Get specialization options from backend doctors
  const specializations = useMemo(() => {

    const values =
      allDoctors
        .map(
          (doctor) =>
            doctor.specialization
        )
        .filter(Boolean);

    return [
      'All',
      ...Array.from(
        new Set(values)
      ).sort(),
    ];

  }, [allDoctors]);


  // Get hospital options from backend doctors
  const hospitalOptions = useMemo(() => {

    const values =
      allDoctors
        .map(
          (doctor) =>
            doctor.hospitalName
        )
        .filter(Boolean);

    return [
      'All',
      ...Array.from(
        new Set(values)
      ).sort(),
    ];

  }, [allDoctors]);


  // Filter doctors
  const doctors = useMemo(() => {

    let results = [...allDoctors];


    // Search by doctor name,
    // specialization or hospital
    const search =
      searchText
        .trim()
        .toLowerCase();

    if (search) {

      results =
        results.filter((doctor) => {

          const doctorName =
            doctor.name
              ?.toLowerCase() || '';

          const doctorSpecialization =
            doctor.specialization
              ?.toLowerCase() || '';

          const doctorHospital =
            doctor.hospitalName
              ?.toLowerCase() || '';

          return (
            doctorName.includes(search) ||
            doctorSpecialization.includes(search) ||
            doctorHospital.includes(search)
          );
        });
    }


    // Specialization filter
    if (
      specialization &&
      specialization !== 'All'
    ) {

      results =
        results.filter(
          (doctor) =>
            doctor.specialization ===
            specialization
        );
    }


    // Hospital filter
    if (
      hospital &&
      hospital !== 'All'
    ) {

      results =
        results.filter(
          (doctor) =>
            doctor.hospitalName ===
            hospital
        );
    }


    // Available today filter
    if (availableOnly) {

      results =
        results.filter(
          (doctor) =>
            doctor.availableToday === true
        );
    }


    // Minimum experience filter
    if (
      minExperience !== '' &&
      minExperience !== null
    ) {

      const minimum =
        Number(minExperience);

      if (!Number.isNaN(minimum)) {

        results =
          results.filter(
            (doctor) =>
              Number(
                doctor.experienceYears || 0
              ) >= minimum
          );
      }
    }


    return results;

  }, [
    allDoctors,
    searchText,
    specialization,
    hospital,
    availableOnly,
    minExperience,
  ]);


  function runSearch() {
    setSearchText(query);
  }


  function handleReset() {

    setQuery('');
    setSearchText('');

    setSpecialization('All');

    setHospital('All');

    setAvailableOnly(false);

    setMinExperience('');
  }


  return (
    <div
      className="al-container"
      style={{
        paddingTop: 32,
      }}
    >

      {/* Page heading */}
      <div
        style={{
          marginBottom: 24,
          textAlign: 'center',
        }}
      >

        <h1
          style={{
            marginBottom: 8,
          }}
        >
          Find a Doctor
        </h1>

        <p className="al-muted">
          Search by name or specialization,
          or narrow down with filters.
        </p>

      </div>


      {/* Search */}
      <div
        className="al-card"
        style={{
          maxWidth: 760,
          margin: '0 auto 28px',
        }}
      >

        <VoiceSearchInput
          value={query}
          onChange={setQuery}
          onSearch={runSearch}
          placeholder="Search doctor name or specialization..."
        />

      </div>


      {/* Main layout */}
      <div
        className="al-grid"
        style={{
          gridTemplateColumns:
            '280px 1fr',
          alignItems: 'start',
        }}
      >

        {/* Filters */}
        <div className="al-card">

          <h3
            style={{
              fontSize: '1rem',
              marginBottom: 16,
            }}
          >
            Filters
          </h3>

          <div className="al-stack">

            {/* Specialization */}
            <div>

              <label className="al-label">
                Specialization
              </label>

              <select
                className="al-select"
                value={specialization}
                onChange={(event) =>
                  setSpecialization(
                    event.target.value
                  )
                }
              >

                {specializations.map(
                  (specializationName) => (
                    <option
                      key={
                        specializationName
                      }
                      value={
                        specializationName
                      }
                    >
                      {
                        specializationName
                      }
                    </option>
                  )
                )}

              </select>

            </div>


            {/* Hospital */}
            <div>

              <label className="al-label">
                Hospital
              </label>

              <select
                className="al-select"
                value={hospital}
                onChange={(event) =>
                  setHospital(
                    event.target.value
                  )
                }
              >

                {hospitalOptions.map(
                  (hospitalName) => (
                    <option
                      key={hospitalName}
                      value={hospitalName}
                    >
                      {hospitalName}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* Experience */}
            <div>

              <label className="al-label">
                Minimum Experience (years)
              </label>

              <input
                type="number"
                min="0"
                className="al-input"
                value={minExperience}
                onChange={(event) =>
                  setMinExperience(
                    event.target.value
                  )
                }
                placeholder="e.g. 5"
              />

            </div>


            {/* Available */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.9rem',
              }}
            >

              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) =>
                  setAvailableOnly(
                    event.target.checked
                  )
                }
              />

              Available Today

            </label>


            {/* Reset */}
            <button
              className="al-btn al-btn-secondary al-btn-block"
              onClick={handleReset}
            >
              Reset Filters
            </button>

          </div>

        </div>


        {/* Doctor results */}
        <div>

          {status === 'loading' && (
            <LoadingSpinner
              label="Loading doctors..."
            />
          )}


          {status === 'error' && (
            <ErrorState
              onRetry={loadDoctors}
            />
          )}


          {status === 'success' &&
            doctors.length === 0 && (

            <EmptyState
              title="No doctors found"
              message="Try a different search term or clear your filters."
              action={
                <button
                  className="al-btn al-btn-outline"
                  onClick={
                    handleReset
                  }
                >
                  Reset Filters
                </button>
              }
            />

          )}


          {status === 'success' &&
            doctors.length > 0 && (

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >

              {doctors.map((doctor) => (

                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                />

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}