package arogyalive_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import arogyalive_backend.entity.Ambulance;
import arogyalive_backend.service.AmbulanceService;

@RestController
@RequestMapping("/api/ambulances")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    public AmbulanceController(
            AmbulanceService ambulanceService) {

        this.ambulanceService = ambulanceService;
    }

    // =========================================================
    // REGISTER AMBULANCE
    // =========================================================

    /**
     * Register a new ambulance for the authenticated
     * ambulance-driver account.
     *
     * The owner is determined from the JWT.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerAmbulance(
            @RequestBody Ambulance ambulance,
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            Ambulance saved =
                    ambulanceService.registerAmbulance(
                            ambulance,
                            authentication.getName()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    ex.getMessage()
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to register ambulance."
                            )
                    );
        }
    }

    // =========================================================
    // GET MY AMBULANCE
    // =========================================================

    /**
     * Return the ambulance belonging to the currently
     * authenticated ambulance driver.
     *
     * This endpoint does not require the frontend to know
     * the ambulance ID.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyAmbulance(
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            Ambulance ambulance =
                    ambulanceService.getMyAmbulance(
                            authentication.getName()
                    );

            return ResponseEntity.ok(ambulance);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    ex.getMessage()
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load your ambulance."
                            )
                    );
        }
    }

    // =========================================================
    // CHECK WHETHER DRIVER HAS AN AMBULANCE
    // =========================================================

    /**
     * Returns whether the authenticated ambulance driver
     * already owns an ambulance.
     */
    @GetMapping("/me/exists")
    public ResponseEntity<?> hasMyAmbulance(
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            boolean exists =
                    ambulanceService.hasAmbulance(
                            authentication.getName()
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "exists",
                            exists
                    )
            );

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    ex.getMessage()
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to check ambulance ownership."
                            )
                    );
        }
    }

    // =========================================================
    // GET ALL AMBULANCES
    // =========================================================

    /**
     * Admin-only endpoint.
     *
     * The service verifies that the authenticated user
     * has ADMIN role.
     */
    @GetMapping
    public ResponseEntity<?> getAllAmbulances(
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            List<Ambulance> ambulances =
                    ambulanceService.getAllAmbulances(
                            authentication.getName()
                    );

            return ResponseEntity.ok(ambulances);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    ex.getMessage()
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load ambulances."
                            )
                    );
        }
    }

    // =========================================================
    // GET AVAILABLE AMBULANCES
    // =========================================================

    /**
     * Returns only ambulances that are:
     *
     * 1. available
     * 2. active
     * 3. VERIFIED
     *
     * Authentication is required by SecurityConfig.
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableAmbulances(
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            List<Ambulance> ambulances =
                    ambulanceService
                            .getAvailableAmbulances();

            return ResponseEntity.ok(ambulances);

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load available ambulances."
                            )
                    );
        }
    }

    // =========================================================
    // GET AMBULANCE BY ID
    // =========================================================

    /**
     * Driver:
     *     can access only their own ambulance.
     *
     * Admin:
     *     can access any ambulance.
     *
     * The service performs the ownership check.
     */
    @GetMapping("/{ambulanceId}")
    public ResponseEntity<?> getAmbulanceById(
            @PathVariable Long ambulanceId,
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            Ambulance ambulance =
                    ambulanceService.getAmbulanceById(
                            ambulanceId,
                            authentication.getName()
                    );

            return ResponseEntity.ok(ambulance);

        } catch (IllegalArgumentException ex) {

            String message = ex.getMessage();

            if (message != null
                    && (
                            message.toLowerCase()
                                    .contains("not authorized")
                            || message.toLowerCase()
                                    .contains("access")
                    )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        message
                                )
                        );
            }

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    message
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load ambulance."
                            )
                    );
        }
    }

    // =========================================================
    // UPDATE AVAILABILITY
    // =========================================================

    /**
     * Driver:
     *     can update only their own ambulance.
     *
     * Admin:
     *     can update any ambulance.
     *
     * An ambulance cannot be made available unless verified.
     */
    @PutMapping("/{ambulanceId}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long ambulanceId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {

            requireAuthentication(authentication);

            if (request == null
                    || !request.containsKey("available")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "The 'available' field is required."
                                )
                        );
            }

            Object value =
                    request.get("available");

            if (!(value instanceof Boolean)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "The 'available' field must be true or false."
                                )
                        );
            }

            boolean available =
                    (Boolean) value;

            Ambulance updated =
                    ambulanceService.updateAvailability(
                            ambulanceId,
                            available,
                            authentication.getName()
                    );

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException ex) {

            String message = ex.getMessage();

            if (message != null
                    && (
                            message.toLowerCase()
                                    .contains("not authorized")
                            || message.toLowerCase()
                                    .contains("only an ambulance")
                            || message.toLowerCase()
                                    .contains("administrator")
                    )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        message
                                )
                        );
            }

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    message
                            )
                    );

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to update ambulance availability."
                            )
                    );
        }
    }

    // =========================================================
    // AUTHENTICATION HELPER
    // =========================================================

    /**
     * Verify that Spring Security has authenticated
     * the request.
     */
    private void requireAuthentication(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "Authentication is required."
            );
        }

        /*
         * Spring's AnonymousAuthenticationToken can also report
         * itself as authenticated, so make sure this is not the
         * anonymous principal.
         */
        if ("anonymousUser".equals(
                authentication.getName())) {

            throw new IllegalArgumentException(
                    "Authentication is required."
            );
        }
    }
}