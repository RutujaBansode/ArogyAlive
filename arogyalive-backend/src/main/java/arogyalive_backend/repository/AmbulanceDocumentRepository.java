package arogyalive_backend.repository;

import arogyalive_backend.entity.AmbulanceDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmbulanceDocumentRepository
        extends JpaRepository<AmbulanceDocument, Long> {

    List<AmbulanceDocument> findByAmbulanceId(
            Long ambulanceId
    );

    boolean existsByAmbulanceIdAndDocumentTypeAndVerificationStatus(
            Long ambulanceId,
            String documentType,
            String verificationStatus
    );
}