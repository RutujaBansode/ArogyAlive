package arogyalive_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "health_concern_specializations",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"health_concern_id", "specialization_id"}
        )
    }
)
public class HealthConcernSpecialization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_concern_id", nullable = false)
    private HealthConcern healthConcern;

    @ManyToOne
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;

    @Column(nullable = false)
    private boolean recommended = true;

    public HealthConcernSpecialization() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HealthConcern getHealthConcern() {
        return healthConcern;
    }

    public void setHealthConcern(HealthConcern healthConcern) {
        this.healthConcern = healthConcern;
    }

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public void setRecommended(boolean recommended) {
        this.recommended = recommended;
    }
}