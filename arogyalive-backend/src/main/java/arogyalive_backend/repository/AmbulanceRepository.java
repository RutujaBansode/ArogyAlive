package arogyalive_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import arogyalive_backend.entity.Ambulance;
import arogyalive_backend.entity.User;

public interface AmbulanceRepository
        extends JpaRepository<Ambulance, Long> {

    /*
     * Existing duplicate checks.
     */
    boolean existsByVehicleNumber(
            String vehicleNumber
    );

    boolean existsByDriverContact(
            String driverContact
    );

    boolean existsByDriverLicenseNumber(
            String driverLicenseNumber
    );

    /*
     * Find the ambulance owned by a specific User.
     */
    Optional<Ambulance> findByOwner(
            User owner
    );

    /*
     * Find an ambulance directly using the User ID.
     */
    Optional<Ambulance> findByOwner_Id(
            Long userId
    );

    /*
     * Check whether a user already owns an ambulance.
     */
    boolean existsByOwner_Id(
            Long userId
    );
}