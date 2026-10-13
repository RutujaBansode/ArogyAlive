package arogyalive_backend.service;

import arogyalive_backend.entity.Appointment;
import arogyalive_backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // Create a new appointment and automatically generate the OPD token
    public Appointment createAppointment(Appointment appointment) {

        List<Appointment> existingAppointments =
                appointmentRepository
                        .findByHospitalIdAndAppointmentDate(
                                appointment.getHospital().getId(),
                                appointment.getAppointmentDate()
                        );

        int nextToken = 1;

        for (Appointment existing : existingAppointments) {

            if (existing.getTokenNumber() != null
                    && existing.getTokenNumber() >= nextToken) {

                nextToken = existing.getTokenNumber() + 1;
            }
        }

        appointment.setTokenNumber(nextToken);

        if (appointment.getStatus() == null
                || appointment.getStatus().isBlank()) {

            appointment.setStatus("PENDING");
        }

        return appointmentRepository.save(appointment);
    }

    // Get all appointments of a patient
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {

        return appointmentRepository.findByPatientId(patientId);
    }

    // Get all appointments of a doctor for a particular date
    public List<Appointment> getAppointmentsByDoctorAndDate(
            Long doctorId,
            LocalDate appointmentDate) {

        return appointmentRepository
                .findByDoctorIdAndAppointmentDate(
                        doctorId,
                        appointmentDate
                );
    }

    // Cancel an existing appointment
    public Optional<Appointment> cancelAppointment(Long appointmentId) {

        return appointmentRepository.findById(appointmentId)
                .map(appointment -> {

                    appointment.setStatus("CANCELLED");

                    return appointmentRepository.save(appointment);
                });
    }
}