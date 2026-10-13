import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Clock,
  Languages,
  Star,
  IndianRupee,
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import AvailabilityBadge from '../components/AvailabilityBadge';

import {
  getDoctorById,
  getDoctorAvailability,
} from '../services/doctorService';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctorProfile() {
      try {
        setStatus('loading');

        // Get doctor using the numeric backend ID.
        const doctorData = await getDoctorById(id);

        if (!doctorData) {
          if (isMounted) {
            setStatus('error');
          }
          return;
        }

        // Load availability separately.
        let availabilityData = [];

        try {
          availabilityData =
            await getDoctorAvailability(id);
        } catch (availabilityError) {
          console.error(
            'Could not load doctor availability:',
            availabilityError
          );
        }

        // Convert availability response into:
        //
        // {
        //   Monday: ['10:00 AM - 11:00 AM'],
        //   Tuesday: ['2:00 PM - 3:00 PM']
        // }
        //
        // The helper below supports several common backend
        // response formats.
        const weeklyAvailability =
          normalizeWeeklyAvailability(
            availabilityData
          );

        const finalDoctor = {
          ...doctorData,
          weeklyAvailability,
        };

        if (!isMounted) {
          return;
        }

        setDoctor(finalDoctor);

        const days =
          Object.keys(weeklyAvailability);

        setSelectedDay(
          days.length > 0
            ? days[0]
            : null
        );

        setSelectedSlot(null);

        setStatus('success');

      } catch (error) {

        console.error(
          'Unable to load doctor profile:',
          error
        );

        if (isMounted) {
          setStatus('error');
        }
      }
    }

    loadDoctorProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div
        className="al-container"
        style={{ paddingTop: 40 }}
      >
        <LoadingSpinner
          label="Loading doctor profile..."
        />
      </div>
    );
  }

  if (status === 'error' || !doctor) {
    return (
      <div
        className="al-container"
        style={{ paddingTop: 40 }}
      >
        <ErrorState
          message="We couldn't find that doctor."
          onRetry={() => navigate('/doctors')}
        />
      </div>
    );
  }

  function handleBook() {
    const params = new URLSearchParams({
      doctorId: String(doctor.id),
    });

    if (selectedDay) {
      params.set(
        'day',
        selectedDay
      );
    }

    if (selectedSlot) {
      params.set(
        'slot',
        selectedSlot
      );
    }

    navigate(
      `/appointment?${params.toString()}`
    );
  }

  const weeklyAvailability =
    doctor.weeklyAvailability || {};

  const availableDays =
    Object.keys(weeklyAvailability);

  const selectedDaySlots =
    selectedDay &&
    weeklyAvailability[selectedDay]
      ? weeklyAvailability[selectedDay]
      : [];

  return (
    <div
      className="al-container"
      style={{ paddingTop: 28 }}
    >

      <Link
        to="/doctors"
        className="al-muted"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 18,
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} />
        Back to Doctors
      </Link>

      <div
        className="al-grid"
        style={{
          gridTemplateColumns:
            '1fr 340px',
          alignItems: 'start',
        }}
      >

        <div className="al-stack">

          {/* Doctor basic information */}
          <div className="al-card">

            <div
              className="al-flex-between"
              style={{
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >

              <div>

                <h1
                  style={{
                    fontSize: '1.4rem',
                    marginBottom: 4,
                  }}
                >
                  {doctor.name}
                </h1>

                <p
                  className="al-muted"
                  style={{ margin: 0 }}
                >
                  {doctor.qualification}
                  {' • '}
                  {doctor.specialization}
                </p>

              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 700,
                }}
              >
                <Star
                  size={16}
                  fill="var(--al-warning)"
                  color="var(--al-warning)"
                />

                {doctor.rating}
              </div>

            </div>


            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                margin: '16px 0',
              }}
            >

              <AvailabilityBadge
                status={
                  doctor.availableToday
                    ? 'Available'
                    : 'Full'
                }
                label={
                  doctor.availableToday
                    ? 'Available Today'
                    : 'Not Available Today'
                }
              />

              <span className="al-badge al-badge-neutral">
                {doctor.experienceYears}+ years experience
              </span>

              <span className="al-badge al-badge-neutral">
                {doctor.consultationType}
              </span>

            </div>


            <div
              className="al-grid al-grid-2"
              style={{ marginBottom: 6 }}
            >

              <div
                className="al-muted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Building2 size={16} />
                {doctor.hospitalName}
              </div>

              <div
                className="al-muted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Clock size={16} />
                OPD: {doctor.opdTimings}
              </div>

              <div
                className="al-muted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Languages size={16} />

                {doctor.languages &&
                doctor.languages.length > 0
                  ? doctor.languages.join(', ')
                  : 'Languages not available'}
              </div>

              <div
                className="al-muted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IndianRupee size={16} />

                Consultation Fee: ₹
                {doctor.consultationFee}
              </div>

            </div>

          </div>


          {/* About */}
          <div className="al-card">

            <h4 style={{ marginBottom: 10 }}>
              About
            </h4>

            <p
              className="al-muted"
              style={{ margin: 0 }}
            >
              {doctor.about ||
                'No information available.'}
            </p>

          </div>


          {/* Availability */}
          <div className="al-card">

            <h4 style={{ marginBottom: 14 }}>
              Availability
            </h4>

            {availableDays.length === 0 ? (

              <p className="al-muted">
                No availability information is currently available for this doctor.
              </p>

            ) : (

              <>
                <div className="al-tabs">

                  {availableDays.map((day) => (

                    <div
                      key={day}
                      className={`al-tab${
                        selectedDay === day
                          ? ' active'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot(null);
                      }}
                    >
                      {day}
                    </div>

                  ))}

                </div>


                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >

                  {selectedDaySlots.length === 0 && (

                    <p className="al-muted">
                      No slots available on{' '}
                      {selectedDay}.
                    </p>

                  )}

                  {selectedDaySlots.map(
                    (slot) => (

                      <button
                        key={slot}
                        className={`al-btn al-btn-sm ${
                          selectedSlot === slot
                            ? 'al-btn-primary'
                            : 'al-btn-secondary'
                        }`}
                        onClick={() =>
                          setSelectedSlot(slot)
                        }
                      >
                        {slot}
                      </button>

                    )
                  )}

                </div>
              </>

            )}

          </div>

        </div>


        {/* Appointment card */}
        <div
          className="al-card"
          style={{
            position: 'sticky',
            top: 90,
          }}
        >

          <h4 style={{ marginBottom: 10 }}>
            Book an Appointment
          </h4>

          <p
            className="al-muted"
            style={{
              fontSize: '0.87rem',
              marginBottom: 16,
            }}
          >
            {selectedDay && selectedSlot
              ? `${selectedDay}, ${selectedSlot}`
              : 'Select a day and time slot above, or continue and choose during booking.'}
          </p>

          <button
            className="al-btn al-btn-primary al-btn-block"
            onClick={handleBook}
          >
            Book Appointment
          </button>

        </div>

      </div>

    </div>
  );
}


/*
 * Convert different possible backend availability
 * responses into the structure expected by the
 * Doctor Profile page.
 */
function normalizeWeeklyAvailability(
  availability
) {

  if (!availability) {
    return {};
  }

  // Already in the desired format:
  //
  // {
  //   Monday: ['10:00 AM', '11:00 AM']
  // }
  //
  if (
    !Array.isArray(availability) &&
    typeof availability === 'object'
  ) {

    const result = {};

    Object.entries(
      availability
    ).forEach(
      ([day, slots]) => {

        if (Array.isArray(slots)) {

          result[day] =
            slots.map(
              (slot) =>
                formatSlot(slot)
            );

        } else if (
          typeof slots === 'string'
        ) {

          result[day] = [slots];

        }

      }
    );

    return result;
  }


  // Array response from backend
  if (Array.isArray(availability)) {

    const result = {};

    availability.forEach(
      (item) => {

        if (!item) {
          return;
        }

        const day =
          item.day ||
          item.dayOfWeek ||
          item.weekDay ||
          item.weekday;

        if (!day) {
          return;
        }

        const slot =
          formatSlot(item);

        if (!result[day]) {
          result[day] = [];
        }

        if (slot) {
          result[day].push(slot);
        }

      }
    );

    return result;
  }

  return {};
}


/*
 * Convert one availability record into
 * readable text.
 */
function formatSlot(slot) {

  if (slot === null ||
      slot === undefined) {
    return '';
  }

  if (typeof slot === 'string') {
    return slot;
  }

  if (
    typeof slot === 'object'
  ) {

    const start =
      slot.startTime ||
      slot.start ||
      slot.from ||
      '';

    const end =
      slot.endTime ||
      slot.end ||
      slot.to ||
      '';

    if (start && end) {
      return `${start} - ${end}`;
    }

    if (start) {
      return String(start);
    }

    if (slot.time) {
      return String(slot.time);
    }

    if (slot.slot) {
      return String(slot.slot);
    }
  }

  return '';
}