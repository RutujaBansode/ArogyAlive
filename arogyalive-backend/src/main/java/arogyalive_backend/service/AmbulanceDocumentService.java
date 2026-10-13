package arogyalive_backend.service;

import arogyalive_backend.entity.Ambulance;
import arogyalive_backend.entity.AmbulanceDocument;
import arogyalive_backend.repository.AmbulanceDocumentRepository;
import arogyalive_backend.repository.AmbulanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AmbulanceDocumentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private final AmbulanceDocumentRepository documentRepository;
    private final AmbulanceRepository ambulanceRepository;

    private final Path uploadDirectory =
            Paths.get("uploads", "ambulance-documents");

    public AmbulanceDocumentService(
            AmbulanceDocumentRepository documentRepository,
            AmbulanceRepository ambulanceRepository) {

        this.documentRepository = documentRepository;
        this.ambulanceRepository = ambulanceRepository;
    }

    // Get all documents for one ambulance
    public List<AmbulanceDocument> getDocumentsByAmbulanceId(
            Long ambulanceId) {

        return documentRepository.findByAmbulanceId(ambulanceId);
    }

    // Upload document
    public AmbulanceDocument uploadDocument(
            Long ambulanceId,
            String documentType,
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a file."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size must not exceed 10 MB."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase())) {

            throw new IllegalArgumentException(
                    "Only PDF, JPG, JPEG and PNG files are allowed."
            );
        }

        Ambulance ambulance =
                ambulanceRepository.findById(ambulanceId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ambulance not found."
                                ));

        if (documentType == null ||
                documentType.isBlank()) {

            throw new IllegalArgumentException(
                    "Document type is required."
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid file name."
            );
        }

        Files.createDirectories(uploadDirectory);

        String cleanedFileName =
                Paths.get(originalFileName)
                        .getFileName()
                        .toString();

        String extension = "";

        int dotIndex =
                cleanedFileName.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension =
                    cleanedFileName
                            .substring(dotIndex)
                            .toLowerCase();
        }

        String storedFileName =
                UUID.randomUUID() + extension;

        Path targetPath =
                uploadDirectory.resolve(
                        storedFileName
                );

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        AmbulanceDocument document =
                new AmbulanceDocument();

        document.setAmbulance(ambulance);
        document.setDocumentType(documentType);
        document.setFileName(cleanedFileName);
        document.setFilePath(
                targetPath.toString()
        );
        document.setContentType(contentType);
        document.setVerificationStatus("PENDING");

        return documentRepository.save(document);
    }

    // Get one document
    public Optional<AmbulanceDocument> getDocumentById(
            Long documentId) {

        return documentRepository.findById(documentId);
    }

    // Approve document
    public Optional<AmbulanceDocument> approveDocument(
            Long documentId,
            String remarks) {

        return documentRepository.findById(documentId)
                .map(document -> {

                    document.setVerificationStatus(
                            "APPROVED"
                    );

                    document.setAdminRemarks(
                            remarks
                    );

                    return documentRepository.save(
                            document
                    );
                });
    }

    // Reject document
    public Optional<AmbulanceDocument> rejectDocument(
            Long documentId,
            String remarks) {

        return documentRepository.findById(documentId)
                .map(document -> {

                    document.setVerificationStatus(
                            "REJECTED"
                    );

                    document.setAdminRemarks(
                            remarks
                    );

                    return documentRepository.save(
                            document
                    );
                });
    }
}