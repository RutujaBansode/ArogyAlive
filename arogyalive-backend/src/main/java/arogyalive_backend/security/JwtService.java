package arogyalive_backend.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import arogyalive_backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Generate a JWT token for a logged-in user.
     */
    public String generateToken(User user) {

        Date issuedAt = new Date();
        Date expiration = new Date(
                issuedAt.getTime() + expirationMs
        );

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract the email stored in the token.
     */
    public String extractUsername(String token) {

        return extractAllClaims(token)
                .getSubject();
    }

    /**
     * Extract the user ID stored in the token.
     */
    public Long extractUserId(String token) {

        Number userId = extractAllClaims(token)
                .get("userId", Number.class);

        return userId != null
                ? userId.longValue()
                : null;
    }

    /**
     * Extract the user's role from the token.
     */
    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    /**
     * Check whether the token belongs to the supplied user
     * and has not expired.
     */
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        try {

            String username = extractUsername(token);

            return username != null
                    && username.equalsIgnoreCase(
                            userDetails.getUsername())
                    && !isTokenExpired(token);

        } catch (JwtException | IllegalArgumentException ex) {

            return false;
        }
    }

    /**
     * Check whether the token has expired.
     */
    public boolean isTokenExpired(String token) {

        try {

            Date expiration = extractAllClaims(token)
                    .getExpiration();

            return expiration.before(new Date());

        } catch (JwtException | IllegalArgumentException ex) {

            return true;
        }
    }

    /**
     * Parse and return all JWT claims.
     */
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Convert the Base64 encoded secret from
     * application.properties into a signing key.
     */
    private SecretKey getSigningKey() {

        byte[] keyBytes = Decoders.BASE64URL.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}