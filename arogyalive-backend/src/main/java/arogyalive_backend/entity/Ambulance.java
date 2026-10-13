package arogyalive_backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ambulances")
public class Ambulance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * The authenticated user who owns this ambulance.
     *
     * Existing ambulance records are allowed to remain NULL
     * temporarily so Hibernate can add this column without
     * breaking your existing database data.
     *
     * New ambulance registrations will always receive an owner
     * from the authenticated AMBULANCE user.
     */
    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.PERSIST,
            optional = true
    )
    @JoinColumn(
            name = "user_id",
            unique = true
    )
    @JsonIgnore
    private User owner;

    @jakarta.persistence.Column(
            name = "vehicle_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String vehicleNumber;

    @jakarta.persistence.Column(
            name = "driver_license_number",
            unique = true,
            length = 50
    )
    private String driverLicenseNumber;

    @jakarta.persistence.Column(length = 50)
    private String type;

    @jakarta.persistence.Column(
            name = "driver_name",
            length = 100
    )
    private String driverName;

    @jakarta.persistence.Column(
            name = "driver_contact",
            length = 20
    )
    private String driverContact;

    @jakarta.persistence.Column(
            name = "current_location",
            length = 255
    )
    private String currentLocation;

    private Double latitude;

    private Double longitude;

    @jakarta.persistence.Column(name = "distance_km")
    private Double distanceKm;

    @jakarta.persistence.Column(name = "eta_minutes")
    private Integer etaMinutes;

    private boolean available;

    private Double price;

    @jakarta.persistence.Column(length = 500)
    private String image;

    private boolean active = true;

    @jakarta.persistence.Column(
            name = "verification_status",
            length = 20
    )
    private String verificationStatus = "PENDING";

    @jakarta.persistence.Column(name = "driver_verified")
    private boolean driverVerified = false;

    @jakarta.persistence.Column(name = "vehicle_verified")
    private boolean vehicleVerified = false;

    @jakarta.persistence.Column(name = "documents_verified")
    private boolean documentsVerified = false;

    @jakarta.persistence.Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public Ambulance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getDriverLicenseNumber() {
        return driverLicenseNumber;
    }

    public void setDriverLicenseNumber(
            String driverLicenseNumber) {

        this.driverLicenseNumber =
                driverLicenseNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverContact() {
        return driverContact;
    }

    public void setDriverContact(String driverContact) {
        this.driverContact = driverContact;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(
            String currentLocation) {

        this.currentLocation = currentLocation;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(Integer etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            String verificationStatus) {

        this.verificationStatus =
                verificationStatus;
    }

    public boolean isDriverVerified() {
        return driverVerified;
    }

    public void setDriverVerified(
            boolean driverVerified) {

        this.driverVerified = driverVerified;
    }

    public boolean isVehicleVerified() {
        return vehicleVerified;
    }

    public void setVehicleVerified(
            boolean vehicleVerified) {

        this.vehicleVerified = vehicleVerified;
    }

    public boolean isDocumentsVerified() {
        return documentsVerified;
    }

    public void setDocumentsVerified(
            boolean documentsVerified) {

        this.documentsVerified =
                documentsVerified;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(
            LocalDateTime verifiedAt) {

        this.verifiedAt = verifiedAt;
    }
}