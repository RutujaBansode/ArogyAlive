package arogyalive_backend.repository;

import arogyalive_backend.entity.DoctorLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorLanguageRepository extends JpaRepository<DoctorLanguage, Long> {

    List<DoctorLanguage> findByDoctorId(Long doctorId);
}