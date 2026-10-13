package arogyalive_backend.service;

import arogyalive_backend.entity.HealthConcernSpecialization;
import arogyalive_backend.repository.HealthConcernSpecializationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthConcernSpecializationService {

    private final HealthConcernSpecializationRepository repository;

    public HealthConcernSpecializationService(
            HealthConcernSpecializationRepository repository) {
        this.repository = repository;
    }

    public List<HealthConcernSpecialization> getByHealthConcernId(
            Long healthConcernId) {

        return repository.findByHealthConcernId(healthConcernId);
    }
}