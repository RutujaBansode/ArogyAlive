package arogyalive_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import arogyalive_backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            /*
             * Allow requests coming from the React frontend.
             */
            .cors(Customizer.withDefaults())

            /*
             * JWT-based API does not use browser sessions.
             */
            .csrf(csrf -> csrf.disable())

            /*
             * Authentication is stateless because we use JWT.
             */
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            /*
             * Authorization rules.
             */
            .authorizeHttpRequests(auth -> auth

                    /*
                     * CORS preflight.
                     */
                    .requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()

                    /*
                     * Authentication endpoints are public.
                     */
                    .requestMatchers(
                            "/api/auth/register",
                            "/api/auth/login"
                    ).permitAll()

                    /*
                     * Spring error endpoint.
                     */
                    .requestMatchers("/error").permitAll()

                    /*
                     * -------------------------------------------------
                     * Public read-only APIs
                     * -------------------------------------------------
                     *
                     * These GET requests are needed by the existing
                     * public browsing pages such as Find a Doctor.
                     *
                     * IMPORTANT:
                     * This only makes GET requests public.
                     * POST / PUT / DELETE / PATCH remain protected.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/doctors/**",
                            "/api/hospitals/**",
                            "/api/specializations/**",
                            "/api/hospital-specializations/**",
                            "/api/health-concerns/**"
                    ).permitAll()

                    /*
                     * -------------------------------------------------
                     * Ambulance APIs remain protected
                     * -------------------------------------------------
                     *
                     * This is intentionally BEFORE any broad rule.
                     * Therefore ambulance data and operations still
                     * require JWT authentication.
                     */
                    .requestMatchers(
                            "/api/ambulances/**",
                            "/api/ambulance-documents/**"
                    ).authenticated()

                    /*
                     * All other API operations require authentication.
                     */
                    .anyRequest().authenticated()
            )

            /*
             * Read JWT before Spring's standard authentication filter.
             */
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    /**
     * BCrypt password hashing.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration for the React/Vite frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        /*
         * JWT is sent in the Authorization header,
         * not through cookies.
         */
        configuration.setAllowCredentials(false);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}