package arogyalive_backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import arogyalive_backend.entity.User;
import arogyalive_backend.repository.UserRepository;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(() ->
                new UsernameNotFoundException(
                        "User not found with email: " + email
                )
        );

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(normalizeRole(user.getRole()))
                .disabled(!user.isActive())
                .build();
    }

    private String normalizeRole(String role) {

        if (role == null || role.trim().isEmpty()) {
            return "USER";
        }

        String normalized = role.trim().toUpperCase();

        /*
         * Spring Security roles are normally represented
         * internally without the ROLE_ prefix when using
         * .roles(...).
         */
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }

        return normalized;
    }
}