package arogyalive_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_documents")
public class DoctorDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "doctor_user_id",
        nullable = false,
        unique = true
    )
    @JsonIgnore
    private User doctorUser;

    @Column(nullable = false, length = 50)
    private String documentType = "MEDICAL_LICENSE";

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    @JsonIgnore
    private String filePath;

    @Column(length = 100)
    private String contentType;

    private LocalDateTime uploadedAt;

    @Column(nullable = false, length = 20)
    private String verificationStatus = "PENDING";

    @Column(length = 500)
    private String adminRemarks;

    public DoctorDocument() {
    }

    @PrePersist
    public void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }

        if (verificationStatus == null) {
            verificationStatus = "PENDING";
        }

        if (documentType == null) {
            documentType = "MEDICAL_LICENSE";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDoctorUser() {
        return doctorUser;
    }

    public void setDoctorUser(User doctorUser) {
        this.doctorUser = doctorUser;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }
}