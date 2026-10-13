package arogyalive_backend.controller;

import arogyalive_backend.entity.HealthConcern;
import arogyalive_backend.service.HealthConcernService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/health-concerns")
public class HealthConcernController {

    private final HealthConcernService healthConcernService;

    public HealthConcernController(
            HealthConcernService healthConcernService) {
        this.healthConcernService = healthConcernService;
    }

    @GetMapping
    public List<HealthConcern> getAllHealthConcerns() {
        return healthConcernService.getAllHealthConcerns();
    }
}