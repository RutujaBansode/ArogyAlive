package arogyalive_backend.controller;

import arogyalive_backend.dto.DoctorDocumentResponse;
import arogyalive_backend.service.DoctorDocumentService;
import arogyalive_backend.service.DoctorDocumentService.DocumentFile;

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
import java.util.List;
import java.util.Optional;

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
@RequestMapping("/api/doctor-documents")
public class DoctorDocumentController {

    private final DoctorDocumentService documentService;

    public DoctorDocumentController(
            DoctorDocumentService documentService) {
        this.documentService = documentService;
    }

    // Doctor: upload their own licence.
    @PostMapping(
            value = "/my-license",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DoctorDocumentResponse> uploadMyLicense(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        DoctorDocumentResponse saved =
                documentService.uploadMyLicense(
                        authentication,
                        file
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // Doctor: view their own upload status.
    @GetMapping("/me")
    public ResponseEntity<DoctorDocumentResponse> getMyLicense(
            Authentication authentication) {

        Optional<DoctorDocumentResponse> document =
                documentService.getMyLicense(authentication);

        return document
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Admin: view every submitted doctor licence.
    @GetMapping("/admin")
    public List<DoctorDocumentResponse> getAllLicenses(
            Authentication authentication) {

        return documentService.getAllLicensesForAdmin(
                authentication
        );
    }

    // Admin: preview the actual uploaded image or PDF.
    @GetMapping("/{documentId}/file")
    public ResponseEntity<Resource> getLicenseFile(
            @PathVariable Long documentId,
            Authentication authentication) throws IOException {

        DocumentFile document =
                documentService.getLicenseFileForAdmin(
                        documentId,
                        authentication
                );

        FileSystemResource resource =
                new FileSystemResource(document.path());

        String contentType = document.contentType();

        if (contentType == null || contentType.isBlank()) {
            contentType = Files.probeContentType(document.path());
        }

        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.parseMediaType(contentType)
        );

        headers.setContentDisposition(
                ContentDisposition
                        .inline()
                        .filename(document.fileName())
                        .build()
        );

        headers.setContentLength(
                Files.size(document.path())
        );

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(resource);
    }

    // Admin: approve the licence.
    @PutMapping("/{documentId}/approve")
    public ResponseEntity<DoctorDocumentResponse> approveLicense(
            @PathVariable Long documentId,
            @RequestParam(required = false) String remarks,
            Authentication authentication) {

        return ResponseEntity.ok(
                documentService.approveLicense(
                        documentId,
                        remarks,
                        authentication
                )
        );
    }

    // Admin: reject the licence.
    @PutMapping("/{documentId}/reject")
    public ResponseEntity<DoctorDocumentResponse> rejectLicense(
            @PathVariable Long documentId,
            @RequestParam String remarks,
            Authentication authentication) {

        return ResponseEntity.ok(
                documentService.rejectLicense(
                        documentId,
                        remarks,
                        authentication
                )
        );
    }
}