package arogyalive_backend.controller;

import arogyalive_backend.entity.HealthConcernSpecialization;
import arogyalive_backend.service.HealthConcernSpecializationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/health-concerns")
public class HealthConcernSpecializationController {

    private final HealthConcernSpecializationService service;

    public HealthConcernSpecializationController(
            HealthConcernSpecializationService service) {
        this.service = service;
    }

    @GetMapping("/{healthConcernId}/specializations")
    public List<HealthConcernSpecialization> getSpecializations(
            @PathVariable Long healthConcernId) {

        return service.getByHealthConcernId(healthConcernId);
    }
}