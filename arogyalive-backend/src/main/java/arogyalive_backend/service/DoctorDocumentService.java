package arogyalive_backend.service;

import arogyalive_backend.dto.DoctorDocumentResponse;
import arogyalive_backend.entity.DoctorDocument;
import arogyalive_backend.entity.User;
import arogyalive_backend.repository.DoctorDocumentRepository;
import arogyalive_backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class DoctorDocumentService {

    private static final long MAX_FILE_SIZE =
            10L * 1024 * 1024;

    private static final Path UPLOAD_DIRECTORY =
            Paths.get("uploads", "doctor-documents");

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/jpg",
                    "image/png"
            );

    private final DoctorDocumentRepository documentRepository;
    private final UserRepository userRepository;

    public DoctorDocumentService(
            DoctorDocumentRepository documentRepository,
            UserRepository userRepository) {

        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    // ---------------------------------------------------------
    // CURRENT USER / ROLE CHECKS
    // ---------------------------------------------------------

    private User getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in."
            );
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Unable to identify the logged-in account."
                        )
                );
    }

    private User requireRole(
            Authentication authentication,
            String requiredRole) {

        User user = getCurrentUser(authentication);

        String actualRole = user.getRole() == null
                ? ""
                : user.getRole()
                        .replaceFirst("(?i)^ROLE_", "")
                        .trim();

        if (!requiredRole.equalsIgnoreCase(actualRole)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to perform this action."
            );
        }

        if (!user.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This account is inactive."
            );
        }

        return user;
    }

    // ---------------------------------------------------------
    // UPLOAD DIRECTORY
    // ---------------------------------------------------------

    private Path getUploadRoot() {

        return Paths.get(System.getProperty("user.dir"))
                .resolve(UPLOAD_DIRECTORY)
                .toAbsolutePath()
                .normalize();
    }

    // ---------------------------------------------------------
    // DOCTOR UPLOAD
    // ---------------------------------------------------------

    public DoctorDocumentResponse uploadMyLicense(
            Authentication authentication,
            MultipartFile file) throws IOException {

        User doctor = requireRole(
                authentication,
                "DOCTOR"
        );

        if (file == null || file.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select your medical licence document."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size must not exceed 10 MB."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase(Locale.ROOT))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PDF, JPG, JPEG and PNG files are allowed."
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The uploaded filename is invalid."
            );
        }

        // Remove directory information supplied in the filename.
        String safeFileName = originalFileName
                .replace('\\', '/');

        safeFileName = safeFileName.substring(
                safeFileName.lastIndexOf('/') + 1
        );

        if (safeFileName.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The uploaded filename is invalid."
            );
        }

        String extension = "";

        int dotIndex = safeFileName.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = safeFileName.substring(dotIndex)
                    .toLowerCase(Locale.ROOT);
        }

        // Use a generated filename to avoid collisions.
        String storedFileName =
                UUID.randomUUID() + extension;

        Path uploadRoot = getUploadRoot();

        Files.createDirectories(uploadRoot);

        Path targetPath = uploadRoot
                .resolve(storedFileName)
                .normalize();

        if (!targetPath.startsWith(uploadRoot)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid upload path."
            );
        }

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        Optional<DoctorDocument> existing =
                documentRepository.findByDoctorUser_Id(
                        doctor.getId()
                );

        DoctorDocument document = existing.orElseGet(
                DoctorDocument::new
        );

        String oldPath = document.getFilePath();

        document.setDoctorUser(doctor);
        document.setDocumentType("MEDICAL_LICENSE");
        document.setFileName(safeFileName);

        // Store a relative path, as used by ambulance uploads.
        document.setFilePath(
                UPLOAD_DIRECTORY
                        .resolve(storedFileName)
                        .toString()
        );

        document.setContentType(contentType);
        document.setUploadedAt(LocalDateTime.now());
        document.setVerificationStatus("PENDING");
        document.setAdminRemarks(null);

        DoctorDocument saved =
                documentRepository.save(document);

        // Clean up the replaced file, but only inside our own
        // document upload directory.
        if (oldPath != null &&
                !oldPath.equals(saved.getFilePath())) {

            deleteOldFileSafely(oldPath);
        }

        return toResponse(saved);
    }

    private void deleteOldFileSafely(String storedPath) {

        try {
            Path oldPath = Paths.get(
                    storedPath.replace('\\', '/')
            );

            if (!oldPath.isAbsolute()) {
                oldPath = Paths.get(
                        System.getProperty("user.dir")
                ).resolve(oldPath);
            }

            oldPath = oldPath.toAbsolutePath().normalize();

            Path uploadRoot = getUploadRoot();

            if (oldPath.startsWith(uploadRoot) &&
                    Files.isRegularFile(oldPath)) {

                Files.deleteIfExists(oldPath);
            }

        } catch (Exception ignored) {
            // The saved database record remains valid if cleanup fails.
        }
    }

    // ---------------------------------------------------------
    // DOCTOR: VIEW OWN STATUS
    // ---------------------------------------------------------

    public Optional<DoctorDocumentResponse> getMyLicense(
            Authentication authentication) {

        User doctor = requireRole(
                authentication,
                "DOCTOR"
        );

        return documentRepository
                .findByDoctorUser_Id(doctor.getId())
                .map(this::toResponse);
    }

    // ---------------------------------------------------------
    // ADMIN: LIST ALL UPLOADED LICENCES
    // ---------------------------------------------------------

    public List<DoctorDocumentResponse> getAllLicensesForAdmin(
            Authentication authentication) {

        requireRole(authentication, "ADMIN");

        return documentRepository
                .findAllByOrderByUploadedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // ADMIN: GET FILE FOR PREVIEW
    // ---------------------------------------------------------

    public DocumentFile getLicenseFileForAdmin(
            Long documentId,
            Authentication authentication) {

        requireRole(authentication, "ADMIN");

        DoctorDocument document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Doctor licence document not found."
                                )
                        );

        Path path = resolveStoredFile(document.getFilePath());

        if (!Files.exists(path) ||
                !Files.isRegularFile(path) ||
                !Files.isReadable(path)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "The uploaded doctor licence file was not found."
            );
        }

        return new DocumentFile(
                path,
                document.getFileName(),
                document.getContentType()
        );
    }

    private Path resolveStoredFile(String storedPath) {

        Path stored = Paths.get(
                storedPath.replace('\\', '/')
        );

        Path resolved = stored.isAbsolute()
                ? stored.normalize()
                : Paths.get(System.getProperty("user.dir"))
                        .resolve(stored)
                        .toAbsolutePath()
                        .normalize();

        // Licence files must remain inside our private upload folder.
        if (!resolved.startsWith(getUploadRoot())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invalid document storage path."
            );
        }

        return resolved;
    }

    public record DocumentFile(
            Path path,
            String fileName,
            String contentType
    ) {
    }

    // ---------------------------------------------------------
    // ADMIN: APPROVE
    // ---------------------------------------------------------

    public DoctorDocumentResponse approveLicense(
            Long documentId,
            String remarks,
            Authentication authentication) {

        requireRole(authentication, "ADMIN");

        DoctorDocument document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Doctor licence document not found."
                                )
                        );

        validateRemarks(remarks);

        document.setVerificationStatus("APPROVED");
        document.setAdminRemarks(
                remarks == null || remarks.isBlank()
                        ? null
                        : remarks.trim()
        );

        return toResponse(
                documentRepository.save(document)
        );
    }

    // ---------------------------------------------------------
    // ADMIN: REJECT
    // ---------------------------------------------------------

    public DoctorDocumentResponse rejectLicense(
            Long documentId,
            String remarks,
            Authentication authentication) {

        requireRole(authentication, "ADMIN");

        if (remarks == null || remarks.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please enter a reason for rejecting the licence."
            );
        }

        validateRemarks(remarks);

        DoctorDocument document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Doctor licence document not found."
                                )
                        );

        document.setVerificationStatus("REJECTED");
        document.setAdminRemarks(remarks.trim());

        return toResponse(
                documentRepository.save(document)
        );
    }

    private void validateRemarks(String remarks) {

        if (remarks != null && remarks.length() > 500) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admin remarks must not exceed 500 characters."
            );
        }
    }

    // ---------------------------------------------------------
    // ENTITY -> SAFE RESPONSE
    // ---------------------------------------------------------

    private DoctorDocumentResponse toResponse(
            DoctorDocument document) {

        User doctor = document.getDoctorUser();

        return new DoctorDocumentResponse(
                document.getId(),
                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),
                document.getDocumentType(),
                document.getFileName(),
                document.getContentType(),
                document.getUploadedAt(),
                document.getVerificationStatus(),
                document.getAdminRemarks()
        );
    }
}