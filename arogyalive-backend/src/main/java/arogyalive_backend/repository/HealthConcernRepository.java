package arogyalive_backend.repository;

import arogyalive_backend.entity.HealthConcern;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthConcernRepository
        extends JpaRepository<HealthConcern, Long> {
}