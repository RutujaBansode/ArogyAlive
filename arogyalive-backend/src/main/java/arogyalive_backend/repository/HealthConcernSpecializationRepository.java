package arogyalive_backend.repository;

import arogyalive_backend.entity.HealthConcernSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthConcernSpecializationRepository
        extends JpaRepository<HealthConcernSpecialization, Long> {

    List<HealthConcernSpecialization> findByHealthConcernId(Long healthConcernId);

}