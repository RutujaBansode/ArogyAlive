package arogyalive_backend.controller;

import arogyalive_backend.entity.DoctorLanguage;
import arogyalive_backend.service.DoctorLanguageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/doctors")
public class DoctorLanguageController {

    private final DoctorLanguageService doctorLanguageService;

    public DoctorLanguageController(DoctorLanguageService doctorLanguageService) {
        this.doctorLanguageService = doctorLanguageService;
    }

    @GetMapping("/{doctorId}/languages")
    public List<DoctorLanguage> getLanguagesByDoctorId(
            @PathVariable Long doctorId) {
        return doctorLanguageService.getLanguagesByDoctorId(doctorId);
    }
}