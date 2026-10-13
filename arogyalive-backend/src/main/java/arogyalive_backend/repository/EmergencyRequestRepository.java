package arogyalive_backend.repository;

import arogyalive_backend.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmergencyRequestRepository
        extends JpaRepository<EmergencyRequest, Long> {

    List<EmergencyRequest> findByPatientId(Long patientId);

    List<EmergencyRequest> findByAmbulanceId(Long ambulanceId);

    List<EmergencyRequest> findByStatus(String status);
}