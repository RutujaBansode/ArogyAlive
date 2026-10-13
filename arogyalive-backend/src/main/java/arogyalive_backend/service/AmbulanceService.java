package arogyalive_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import arogyalive_backend.entity.Ambulance;
import arogyalive_backend.entity.User;
import arogyalive_backend.repository.AmbulanceRepository;
import arogyalive_backend.repository.UserRepository;

@Service
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final UserRepository userRepository;

    public AmbulanceService(
            AmbulanceRepository ambulanceRepository,
            UserRepository userRepository) {

        this.ambulanceRepository = ambulanceRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // REGISTRATION
    // =========================================================

    /**
     * Register a new ambulance for the currently authenticated
     * ambulance-driver account.
     *
     * The owner is NOT taken from the request body.
     * It is obtained from the authenticated JWT user.
     */
    @Transactional
    public Ambulance registerAmbulance(
            Ambulance ambulance,
            String authenticatedEmail) {

        validateAmbulanceRegistration(ambulance);

        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        requireActiveUser(authenticatedUser);

        requireAmbulanceDriver(authenticatedUser);

        /*
         * One ambulance-driver account can own only one ambulance.
         */
        if (ambulanceRepository.existsByOwner_Id(
                authenticatedUser.getId())) {

            throw new IllegalArgumentException(
                    "This ambulance driver account already has a registered ambulance."
            );
        }

        // -----------------------------------------------------
        // Normalize values before saving.
        // -----------------------------------------------------

        ambulance.setDriverName(
                ambulance.getDriverName().trim()
        );

        ambulance.setDriverContact(
                ambulance.getDriverContact().trim()
        );

        ambulance.setDriverLicenseNumber(
                ambulance.getDriverLicenseNumber()
                        .trim()
                        .toUpperCase()
        );

        ambulance.setVehicleNumber(
                ambulance.getVehicleNumber()
                        .trim()
                        .toUpperCase()
        );

        ambulance.setType(
                ambulance.getType().trim()
        );

        ambulance.setCurrentLocation(
                ambulance.getCurrentLocation().trim()
        );

        // -----------------------------------------------------
        // Duplicate checks.
        // -----------------------------------------------------

        if (ambulanceRepository.existsByVehicleNumber(
                ambulance.getVehicleNumber())) {

            throw new IllegalArgumentException(
                    "Vehicle number is already registered."
            );
        }

        if (ambulanceRepository.existsByDriverContact(
                ambulance.getDriverContact())) {

            throw new IllegalArgumentException(
                    "Driver contact number is already registered."
            );
        }

        if (ambulanceRepository.existsByDriverLicenseNumber(
                ambulance.getDriverLicenseNumber())) {

            throw new IllegalArgumentException(
                    "Driving licence number is already registered."
            );
        }

        /*
         * IMPORTANT:
         *
         * The owner comes only from the authenticated user.
         * We ignore any owner/userId information that may have
         * been sent by the frontend.
         */
        ambulance.setOwner(authenticatedUser);

        // -----------------------------------------------------
        // Safe initial state.
        // -----------------------------------------------------

        ambulance.setVerificationStatus("PENDING");
        ambulance.setAvailable(false);
        ambulance.setActive(true);

        ambulance.setDriverVerified(false);
        ambulance.setVehicleVerified(false);
        ambulance.setDocumentsVerified(false);

        /*
         * These values are controlled by the backend.
         */
        ambulance.setDistanceKm(0.0);
        ambulance.setEtaMinutes(0);

        return ambulanceRepository.save(ambulance);
    }

    // =========================================================
    // USER / OWNER LOOKUPS
    // =========================================================

    /**
     * Get the User represented by the authenticated JWT.
     */
    @Transactional(readOnly = true)
    public User getAuthenticatedUser(
            String authenticatedEmail) {

        return getUserByEmail(authenticatedEmail);
    }

    /**
     * Get the ambulance owned by the currently authenticated
     * ambulance driver.
     */
    @Transactional(readOnly = true)
    public Ambulance getMyAmbulance(
            String authenticatedEmail) {

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);
        requireAmbulanceDriver(user);

        return ambulanceRepository
                .findByOwner_Id(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No ambulance is registered for this driver account."
                        )
                );
    }

    /**
     * Check whether a user already owns an ambulance.
     */
    @Transactional(readOnly = true)
    public boolean hasAmbulance(
            String authenticatedEmail) {

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);
        requireAmbulanceDriver(user);

        return ambulanceRepository.existsByOwner_Id(
                user.getId()
        );
    }

    // =========================================================
    // SECURE AMBULANCE ACCESS
    // =========================================================

    /**
     * Get a specific ambulance.
     *
     * Ambulance driver:
     *     can access ONLY their own ambulance.
     *
     * Admin:
     *     can access any ambulance.
     */
    @Transactional(readOnly = true)
    public Ambulance getAmbulanceById(
            Long ambulanceId,
            String authenticatedEmail) {

        validateId(ambulanceId);

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);

        Ambulance ambulance =
                ambulanceRepository.findById(ambulanceId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ambulance not found."
                                )
                        );

        /*
         * Admin can access any ambulance.
         */
        if (isAdmin(user)) {
            return ambulance;
        }

        /*
         * Ambulance driver can access only their own ambulance.
         */
        requireAmbulanceDriver(user);

        if (ambulance.getOwner() == null
                || !user.getId().equals(
                        ambulance.getOwner().getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to access this ambulance."
            );
        }

        return ambulance;
    }

    /**
     * Get all ambulances.
     *
     * Admin only.
     */
    @Transactional(readOnly = true)
    public List<Ambulance> getAllAmbulances(
            String authenticatedEmail) {

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);
        requireAdmin(user);

        return ambulanceRepository.findAll();
    }

    /**
     * Get all ambulances that are currently available.
     *
     * This is used by the patient/emergency-dispatch side.
     *
     * Only ambulances satisfying all three conditions are
     * returned:
     *
     *     available = true
     *     active = true
     *     verificationStatus = VERIFIED
     */
    @Transactional(readOnly = true)
    public List<Ambulance> getAvailableAmbulances() {

        return ambulanceRepository.findAll()
                .stream()
                .filter(Ambulance::isAvailable)
                .filter(Ambulance::isActive)
                .filter(ambulance ->
                        "VERIFIED".equalsIgnoreCase(
                                ambulance.getVerificationStatus()
                        )
                )
                .toList();
    }

    // =========================================================
    // AVAILABILITY
    // =========================================================

    /**
     * Update ambulance availability.
     *
     * Driver:
     *     can update only their own ambulance.
     *
     * Admin:
     *     can update any ambulance.
     *
     * An ambulance cannot be marked available unless it has
     * been verified.
     */
    @Transactional
    public Ambulance updateAvailability(
            Long ambulanceId,
            boolean available,
            String authenticatedEmail) {

        validateId(ambulanceId);

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);

        Ambulance ambulance =
                ambulanceRepository.findById(ambulanceId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ambulance not found."
                                )
                        );

        /*
         * Non-admin users must own the ambulance.
         */
        if (!isAdmin(user)) {

            requireAmbulanceDriver(user);

            ensureOwnership(
                    ambulance,
                    user
            );
        }

        /*
         * Availability=true is allowed only after verification.
         */
        if (available
                && !"VERIFIED".equalsIgnoreCase(
                        ambulance.getVerificationStatus())) {

            throw new IllegalArgumentException(
                    "Ambulance cannot be marked available until it is verified."
            );
        }

        /*
         * Suspended/inactive ambulances cannot be available.
         */
        if (available && !ambulance.isActive()) {

            throw new IllegalArgumentException(
                    "Inactive or suspended ambulance cannot be marked available."
            );
        }

        ambulance.setAvailable(available);

        return ambulanceRepository.save(ambulance);
    }

    // =========================================================
    // ADMIN HELPERS
    // =========================================================

    /**
     * Check whether the authenticated user is an admin.
     */
    @Transactional(readOnly = true)
    public boolean isAuthenticatedAdmin(
            String authenticatedEmail) {

        User user = getUserByEmail(authenticatedEmail);

        requireActiveUser(user);

        return isAdmin(user);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    /**
     * Server-side registration validation.
     */
    private void validateAmbulanceRegistration(
            Ambulance ambulance) {

        if (ambulance == null) {

            throw new IllegalArgumentException(
                    "Ambulance registration data is required."
            );
        }

        // Driver name
        if (isBlank(ambulance.getDriverName())) {

            throw new IllegalArgumentException(
                    "Driver name is required."
            );
        }

        // Driver contact
        if (isBlank(ambulance.getDriverContact())) {

            throw new IllegalArgumentException(
                    "Driver contact number is required."
            );
        }

        String contact =
                ambulance.getDriverContact().trim();

        if (!contact.matches(
                "^[6-9][0-9]{9}$")) {

            throw new IllegalArgumentException(
                    "Driver contact must be a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
            );
        }

        // Driving licence
        if (isBlank(
                ambulance.getDriverLicenseNumber())) {

            throw new IllegalArgumentException(
                    "Driving licence number is required."
            );
        }

        // Vehicle number
        if (isBlank(
                ambulance.getVehicleNumber())) {

            throw new IllegalArgumentException(
                    "Vehicle number is required."
            );
        }

        // Ambulance type
        if (isBlank(
                ambulance.getType())) {

            throw new IllegalArgumentException(
                    "Ambulance type is required."
            );
        }

        String type =
                ambulance.getType().trim();

        if (!type.equals("Basic Life Support")
                && !type.equals("Advanced Life Support")
                && !type.equals("ICU Ambulance")) {

            throw new IllegalArgumentException(
                    "Invalid ambulance type."
            );
        }

        // Current location
        if (isBlank(
                ambulance.getCurrentLocation())) {

            throw new IllegalArgumentException(
                    "Current location is required."
            );
        }

        // Service price
        if (ambulance.getPrice() == null) {

            throw new IllegalArgumentException(
                    "Service price is required."
            );
        }

        if (ambulance.getPrice() <= 0) {

            throw new IllegalArgumentException(
                    "Service price must be greater than 0."
            );
        }
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    /**
     * Find a user by the email extracted from the JWT.
     */
    private User getUserByEmail(
            String authenticatedEmail) {

        if (isBlank(authenticatedEmail)) {

            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        return userRepository.findByEmail(
                authenticatedEmail.trim().toLowerCase()
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "Authenticated user was not found."
                )
        );
    }

    /**
     * Require an active account.
     */
    private void requireActiveUser(
            User user) {

        if (user == null) {

            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        if (!user.isActive()) {

            throw new IllegalArgumentException(
                    "This account is inactive."
            );
        }
    }

    /**
     * Require AMBULANCE role.
     */
    private void requireAmbulanceDriver(
            User user) {

        if (!"ambulance".equalsIgnoreCase(
                user.getRole())) {

            throw new IllegalArgumentException(
                    "Only an ambulance driver account can perform this operation."
            );
        }
    }

    /**
     * Require ADMIN role.
     */
    private void requireAdmin(
            User user) {

        if (!isAdmin(user)) {

            throw new IllegalArgumentException(
                    "Administrator access is required."
            );
        }
    }

    /**
     * Check ADMIN role.
     */
    private boolean isAdmin(
            User user) {

        return user != null
                && user.getRole() != null
                && "admin".equalsIgnoreCase(
                        user.getRole()
                );
    }

    /**
     * Ensure the ambulance belongs to the user.
     */
    private void ensureOwnership(
            Ambulance ambulance,
            User user) {

        if (ambulance == null) {

            throw new IllegalArgumentException(
                    "Ambulance not found."
            );
        }

        if (ambulance.getOwner() == null) {

            throw new IllegalArgumentException(
                    "This ambulance has no assigned owner."
            );
        }

        if (!ambulance.getOwner()
                .getId()
                .equals(user.getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to access this ambulance."
            );
        }
    }

    /**
     * Validate an ambulance ID.
     */
    private void validateId(
            Long ambulanceId) {

        if (ambulanceId == null
                || ambulanceId <= 0) {

            throw new IllegalArgumentException(
                    "Valid ambulance ID is required."
            );
        }
    }

    /**
     * Check blank string.
     */
    private boolean isBlank(
            String value) {

        return value == null
                || value.trim().isEmpty();
    }
}