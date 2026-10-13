package arogyalive_backend.controller;

import arogyalive_backend.entity.Appointment;
import arogyalive_backend.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public Appointment createAppointment(
            @RequestBody Appointment appointment) {

        return appointmentService.createAppointment(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatientId(
            @PathVariable Long patientId) {

        return appointmentService
                .getAppointmentsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctorAndDate(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {

        return appointmentService
                .getAppointmentsByDoctorAndDate(
                        doctorId,
                        date
                );
    }
}