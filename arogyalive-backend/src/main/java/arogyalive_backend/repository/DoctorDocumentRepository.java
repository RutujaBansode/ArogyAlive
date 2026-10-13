package arogyalive_backend.repository;

import arogyalive_backend.entity.DoctorDocument;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorDocumentRepository
        extends JpaRepository<DoctorDocument, Long> {

    Optional<DoctorDocument> findByDoctorUser_Id(Long userId);

    List<DoctorDocument> findAllByOrderByUploadedAtDesc();
}