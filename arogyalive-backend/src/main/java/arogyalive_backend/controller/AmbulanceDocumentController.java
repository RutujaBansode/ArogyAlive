package arogyalive_backend.controller;

import arogyalive_backend.entity.AmbulanceDocument;
import arogyalive_backend.service.AmbulanceDocumentService;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179"
    }
)
@RequestMapping("/api/ambulance-documents")
public class AmbulanceDocumentController {

    private final AmbulanceDocumentService documentService;

    public AmbulanceDocumentController(
            AmbulanceDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadDocument(
            @RequestParam Long ambulanceId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file) {

        try {
            AmbulanceDocument savedDocument =
                    documentService.uploadDocument(
                            ambulanceId,
                            documentType,
                            file
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedDocument);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to save the uploaded file.");
        }
    }

    @GetMapping("/ambulance/{ambulanceId}")
    public List<AmbulanceDocument> getDocumentsByAmbulance(
            @PathVariable Long ambulanceId) {

        return documentService.getDocumentsByAmbulanceId(ambulanceId);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<AmbulanceDocument> getDocumentById(
            @PathVariable Long documentId) {

        return documentService.getDocumentById(documentId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // VIEW ACTUAL DOCUMENT FILE
    // ============================================================
    @GetMapping("/{documentId}/file")
    public ResponseEntity<?> getDocumentFile(
            @PathVariable Long documentId,
            Authentication authentication) {

        try {

            // ------------------------------------------------------
            // ADMIN CHECK
            // ------------------------------------------------------
            boolean isAdmin = authentication != null
                    && authentication.getAuthorities()
                    .stream()
                    .anyMatch(authority -> {

                        String authorityName =
                                authority.getAuthority();

                        return "ROLE_ADMIN".equals(authorityName)
                                || "ADMIN".equals(authorityName);
                    });

            if (!isAdmin) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Only admin can view ambulance documents.");
            }

            // ------------------------------------------------------
            // GET DOCUMENT FROM DATABASE
            // ------------------------------------------------------
            AmbulanceDocument document =
                    documentService
                            .getDocumentById(documentId)
                            .orElse(null);

            if (document == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Document not found with id: " + documentId);
            }

            String filePath = document.getFilePath();
            String fileName = document.getFileName();

            System.out.println(
                    "=========================================="
            );
            System.out.println(
                    "AMBULANCE DOCUMENT FILE REQUEST"
            );
            System.out.println(
                    "Document ID      : " + documentId
            );
            System.out.println(
                    "Database path    : " + filePath
            );
            System.out.println(
                    "Database filename: " + fileName
            );
            System.out.println(
                    "Working directory: "
                            + System.getProperty("user.dir")
            );
            System.out.println(
                    "=========================================="
            );

            // ------------------------------------------------------
            // POSSIBLE FILE LOCATIONS
            // ------------------------------------------------------
            List<Path> possiblePaths = new ArrayList<>();

            // 1. Path exactly as stored in database
            if (filePath != null && !filePath.isBlank()) {

                Path rawPath = Paths.get(filePath);

                possiblePaths.add(rawPath);

                // 2. Relative to backend project directory
                if (!rawPath.isAbsolute()) {

                    possiblePaths.add(
                            Paths.get(
                                    System.getProperty("user.dir")
                            ).resolve(filePath)
                    );
                }
            }

            // 3. uploads/ambulance-documents/fileName
            if (fileName != null && !fileName.isBlank()) {

                possiblePaths.add(
                        Paths.get(
                                System.getProperty("user.dir")
                        )
                        .resolve("uploads")
                        .resolve("ambulance-documents")
                        .resolve(fileName)
                );

                // 4. test-files/fileName
                possiblePaths.add(
                        Paths.get(
                                System.getProperty("user.dir")
                        )
                        .resolve("test-files")
                        .resolve(fileName)
                );
            }

            // ------------------------------------------------------
            // FIND FILE
            // ------------------------------------------------------
            Path foundPath = null;

            for (Path candidate : possiblePaths) {

                Path normalizedPath =
                        candidate.toAbsolutePath().normalize();

                System.out.println(
                        "Checking file: " + normalizedPath
                );

                if (Files.exists(normalizedPath)
                        && Files.isRegularFile(normalizedPath)) {

                    foundPath = normalizedPath;
                    break;
                }
            }

            // ------------------------------------------------------
            // FILE NOT FOUND
            // ------------------------------------------------------
            if (foundPath == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "File not found. Database path = "
                                        + filePath
                                        + ", file name = "
                                        + fileName
                        );
            }

            // ------------------------------------------------------
            // CREATE FILE RESOURCE
            // ------------------------------------------------------
            Resource resource =
                    new FileSystemResource(foundPath);

            if (!resource.exists()
                    || !resource.isReadable()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "File exists but cannot be read."
                        );
            }

            // ------------------------------------------------------
            // CONTENT TYPE
            // ------------------------------------------------------
            String contentType =
                    document.getContentType();

            if (contentType == null
                    || contentType.isBlank()) {

                contentType =
                        Files.probeContentType(foundPath);
            }

            if (contentType == null
                    || contentType.isBlank()) {

                contentType =
                        MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            // ------------------------------------------------------
            // RESPONSE HEADERS
            // ------------------------------------------------------
            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.parseMediaType(contentType)
            );

            headers.setContentDisposition(
                    ContentDisposition
                            .inline()
                            .filename(fileName)
                            .build()
            );

            headers.setContentLength(
                    Files.size(foundPath)
            );

            // ------------------------------------------------------
            // RETURN FILE
            // ------------------------------------------------------
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to open document: "
                                    + e.getMessage()
                    );
        }
    }

    @PutMapping("/{documentId}/approve")
    public ResponseEntity<AmbulanceDocument> approveDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false) String remarks) {

        return documentService
                .approveDocument(documentId, remarks)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @PutMapping("/{documentId}/reject")
    public ResponseEntity<AmbulanceDocument> rejectDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false) String remarks) {

        return documentService
                .rejectDocument(documentId, remarks)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}