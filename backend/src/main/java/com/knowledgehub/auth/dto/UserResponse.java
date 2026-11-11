package com.knowledgehub.auth.dto;

import com.knowledgehub.user.User;

import java.time.LocalDateTime;

/**
 * Safe user response representation.
 * NEVER exposes password, password hash, or sensitive security credentials.
 */
public class UserResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final LocalDateTime createdAt;

    public UserResponse(Long id, String name, String email, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
