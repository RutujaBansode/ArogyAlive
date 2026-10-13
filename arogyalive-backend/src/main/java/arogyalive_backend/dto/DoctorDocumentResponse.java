package arogyalive_backend.dto;

import java.time.LocalDateTime;

public record DoctorDocumentResponse(
        Long id,
        Long doctorId,
        String doctorName,
        String doctorEmail,
        String documentType,
        String fileName,
        String contentType,
        LocalDateTime uploadedAt,
        String verificationStatus,
        String adminRemarks
) {}