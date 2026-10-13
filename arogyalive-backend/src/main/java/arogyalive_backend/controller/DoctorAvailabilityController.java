package arogyalive_backend.controller;

import arogyalive_backend.entity.DoctorAvailability;
import arogyalive_backend.service.DoctorAvailabilityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/doctors")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    public DoctorAvailabilityController(
            DoctorAvailabilityService doctorAvailabilityService) {
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @GetMapping("/{doctorId}/availability")
    public List<DoctorAvailability> getAvailabilityByDoctorId(
            @PathVariable Long doctorId) {
        return doctorAvailabilityService
                .getAvailabilityByDoctorId(doctorId);
    }
}