package arogyalive_backend.repository;

import arogyalive_backend.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BedRepository extends JpaRepository<Bed, Long> {

    List<Bed> findByHospitalId(Long hospitalId);
}