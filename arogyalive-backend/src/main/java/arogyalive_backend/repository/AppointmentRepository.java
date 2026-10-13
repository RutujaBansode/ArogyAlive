package arogyalive_backend.repository;

import arogyalive_backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdAndAppointmentDate(
            Long doctorId,
            LocalDate appointmentDate
    );

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByHospitalIdAndAppointmentDate(
            Long hospitalId,
            LocalDate appointmentDate
    );
}