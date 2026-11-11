package com.knowledgehub.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

/**
 * Utility for generating, parsing, and validating JWT tokens using JJWT 0.12.x.
 *
 * <p>Token claims:
 * <ul>
 *   <li>{@code sub} (Subject): user ID string</li>
 *   <li>{@code email}: user email address</li>
 *   <li>{@code iat} (Issued At): issuance timestamp</li>
 *   <li>{@code exp} (Expiration): expiration timestamp</li>
 * </ul>
 * </p>
 */
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generate a signed JWT token for the given user.
     *
     * @param userId user ID
     * @param email  user email
     * @return signed JWT token string
     */
    public String generateToken(Long userId, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate a JWT token's signature and expiration.
     *
     * @param token JWT token string
     * @return true if valid and unexpired, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Invalid signature, expired token, or malformed token
            return false;
        }
    }

    /**
     * Extract user ID from token claims.
     */
    public Long extractUserId(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extract email address from token claims.
     */
    public String extractEmail(String token) {
        Claims claims = parseClaims(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract expiration timestamp as LocalDateTime.
     */
    public LocalDateTime extractExpiration(String token) {
        Claims claims = parseClaims(token);
        Instant instant = claims.getExpiration().toInstant();
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
