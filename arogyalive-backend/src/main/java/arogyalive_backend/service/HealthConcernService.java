package arogyalive_backend.service;

import arogyalive_backend.entity.HealthConcern;
import arogyalive_backend.repository.HealthConcernRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthConcernService {

    private final HealthConcernRepository healthConcernRepository;

    public HealthConcernService(
            HealthConcernRepository healthConcernRepository) {
        this.healthConcernRepository = healthConcernRepository;
    }

    public List<HealthConcern> getAllHealthConcerns() {
        return healthConcernRepository.findAll();
    }
}