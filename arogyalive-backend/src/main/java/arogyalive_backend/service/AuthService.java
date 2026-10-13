package arogyalive_backend.service;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import arogyalive_backend.dto.auth.AuthResponse;
import arogyalive_backend.dto.auth.LoginRequest;
import arogyalive_backend.dto.auth.RegisterRequest;
import arogyalive_backend.dto.auth.UserResponse;
import arogyalive_backend.entity.User;
import arogyalive_backend.repository.UserRepository;
import arogyalive_backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.auth.admin-registration-key}")
    private String adminRegistrationKey;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Register a new user.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        validateRegistrationRequest(request);

        String name = request.getName().trim();
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();
        String phone = normalizePhone(request.getPhone());
        String role = normalizeRole(request.getRole());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        /*
         * Only someone who knows the configured admin key
         * can create an admin account.
         */
        if ("admin".equals(role)) {

            if (request.getAdminKey() == null
                    || request.getAdminKey().trim().isEmpty()) {

                throw new IllegalArgumentException(
                        "Admin registration key is required."
                );
            }

            if (!request.getAdminKey().equals(adminRegistrationKey)) {

                throw new IllegalArgumentException(
                        "Invalid admin registration key."
                );
            }
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(role);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                token,
                toUserResponse(savedUser)
        );
    }

    /**
     * Login an existing user.
     */
    public AuthResponse login(LoginRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Login request is required."
            );
        }

        if (isBlank(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        if (isBlank(request.getPassword())) {
            throw new IllegalArgumentException(
                    "Password is required."
            );
        }

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "This account is inactive. Please contact the administrator."
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                toUserResponse(user)
        );
    }

    /**
     * Convert User entity into a safe response object.
     *
     * Password is intentionally never returned.
     */
    private UserResponse toUserResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive()
        );
    }

    /**
     * Validate registration input.
     */
    private void validateRegistrationRequest(
            RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request is required."
            );
        }

        if (isBlank(request.getName())) {
            throw new IllegalArgumentException(
                    "Name is required."
            );
        }

        if (request.getName().trim().length() < 2) {
            throw new IllegalArgumentException(
                    "Name must contain at least 2 characters."
            );
        }

        if (isBlank(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        String email = normalizeEmail(request.getEmail());

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new IllegalArgumentException(
                    "Please provide a valid email address."
            );
        }

        if (isBlank(request.getPassword())) {
            throw new IllegalArgumentException(
                    "Password is required."
            );
        }

        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }

        if (request.getRole() == null
                || request.getRole().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User role is required."
            );
        }

        String role = normalizeRole(request.getRole());

        if (!role.equals("patient")
                && !role.equals("doctor")
                && !role.equals("receptionist")
                && !role.equals("admin")
                && !role.equals("ambulance")) {

            throw new IllegalArgumentException(
                    "Invalid user role."
            );
        }

        if (!isBlank(request.getPhone())) {

            String phone = request.getPhone().trim();

            /*
             * Store phone as the supplied digits.
             * We are not forcing +91 here because your
             * existing User entity is generic.
             */
            if (!phone.matches("^[0-9+()\\- ]{7,20}$")) {

                throw new IllegalArgumentException(
                        "Please provide a valid phone number."
                );
            }
        }
    }

    /**
     * Convert role to lowercase and remove extra spaces.
     */
    private String normalizeRole(String role) {

        if (role == null) {
            return null;
        }

        return role.trim()
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Normalize email consistently for lookup and storage.
     */
    private String normalizeEmail(String email) {

        if (email == null) {
            return null;
        }

        return email.trim()
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Normalize phone.
     */
    private String normalizePhone(String phone) {

        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        return phone.trim();
    }

    /**
     * Check whether text is null/empty.
     */
    private boolean isBlank(String value) {

        return value == null
                || value.trim().isEmpty();
    }
}