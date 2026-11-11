package com.knowledgehub.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a registered KnowledgeHub user.
 *
 * <p>The table is named {@code users} (not {@code user}) because {@code USER}
 * is a reserved keyword in MySQL and many SQL dialects.</p>
 *
 * <p>Security notes:
 * <ul>
 *   <li>{@code passwordHash} stores only the bcrypt hash — never plaintext.</li>
 *   <li>This entity is intentionally NOT implementing Spring Security's
 *       {@code UserDetails}. A dedicated {@code UserDetailsServiceImpl}
 *       will wrap this entity in Phase 2 (Authentication), keeping the
 *       domain model free of framework interfaces.</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * BCrypt-hashed password. The plaintext password is NEVER stored.
     */
    @Column(nullable = false)
    private String passwordHash;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ─────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────

    protected User() {
        // JPA requires a no-arg constructor
    }

    public User(String name, String email, String passwordHash) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "User{id=" + id + ", email='" + email + "'}";
    }
}
