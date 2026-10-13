package arogyalive_backend.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String type;

    /*
     * Frontend calls this field "location".
     * We keep the existing MySQL column name "address"
     * so we do not have to manually rename the database column now.
     */
    @Column(name = "address", length = 255)
    private String location;

    @Column(length = 100)
    private String city;

    @Column(length = 20)
    private String contact;

    private Double distanceKm;

    @Column(length = 500)
    private String facilities;

    @Column(length = 255)
    private String opdTimings;

    private boolean emergencyAvailable;

    private boolean doctorAvailable;

    private boolean opdAvailable;

    private Double rating;

    private boolean isFlagship;

    @Column(length = 500)
    private String image;

    @Column(length = 255)
    private String imageAlt;

    @Column(length = 500)
    private String description;

    @ManyToMany
    @JoinTable(
        name = "hospital_specializations",
        joinColumns = @JoinColumn(name = "hospital_id"),
        inverseJoinColumns = @JoinColumn(name = "specialization_id")
    )
    private Set<Specialization> specializations = new HashSet<>();

    public Hospital() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
    }

    public String getOpdTimings() {
        return opdTimings;
    }

    public void setOpdTimings(String opdTimings) {
        this.opdTimings = opdTimings;
    }

    public boolean isEmergencyAvailable() {
        return emergencyAvailable;
    }

    public void setEmergencyAvailable(boolean emergencyAvailable) {
        this.emergencyAvailable = emergencyAvailable;
    }

    public boolean isDoctorAvailable() {
        return doctorAvailable;
    }

    public void setDoctorAvailable(boolean doctorAvailable) {
        this.doctorAvailable = doctorAvailable;
    }

    public boolean isOpdAvailable() {
        return opdAvailable;
    }

    public void setOpdAvailable(boolean opdAvailable) {
        this.opdAvailable = opdAvailable;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public boolean isFlagship() {
        return isFlagship;
    }

    public void setFlagship(boolean flagship) {
        isFlagship = flagship;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getImageAlt() {
        return imageAlt;
    }

    public void setImageAlt(String imageAlt) {
        this.imageAlt = imageAlt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Specialization> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(Set<Specialization> specializations) {
        this.specializations = specializations;
    }
}