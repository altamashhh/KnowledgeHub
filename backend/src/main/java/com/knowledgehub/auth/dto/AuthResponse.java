package com.knowledgehub.auth.dto;

import java.time.LocalDateTime;

/**
 * Authentication response returned upon successful login.
 * Contains the signed JWT token, expiration timestamp, and safe user profile.
 */
public class AuthResponse {

    private final String token;
    private final String tokenType = "Bearer";
    private final LocalDateTime expiresAt;
    private final UserResponse user;

    public AuthResponse(String token, LocalDateTime expiresAt, UserResponse user) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public UserResponse getUser() {
        return user;
    }
}
