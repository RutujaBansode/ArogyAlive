package arogyalive_backend.controller;

import arogyalive_backend.entity.Doctor;
import arogyalive_backend.service.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Doctor> getDoctorsByHospitalId(
            @PathVariable Long hospitalId) {
        return doctorService.getDoctorsByHospitalId(hospitalId);
    }
}