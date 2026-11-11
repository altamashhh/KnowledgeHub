package com.knowledgehub.topic;

import com.knowledgehub.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a user-owned topic (e.g., "Data Structures", "Spring Boot").
 *
 * <p>Topics are the primary organisational unit for Knowledge Items.
 * The unique constraint {@code (user_id, name)} means a user cannot have two
 * topics with the same name, but two different users can both have a topic
 * called "Java".</p>
 *
 * <p>Cascade behaviour: deleting a topic sets {@code topic_id = NULL} on its
 * knowledge items via {@code ON DELETE SET NULL} in V2 migration. The items
 * themselves are preserved.</p>
 */
@Entity
@Table(
        name = "topics",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_topics_user_name", columnNames = {"user_id", "name"})
        }
)
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Owner of this topic. LAZY fetch — we rarely need the full User
     * object when working with topics.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Optional hex colour code for UI display (e.g., "#4A90E2"). */
    @Column(length = 20)
    private String color;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ─────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────

    protected Topic() {
        // JPA requires a no-arg constructor
    }

    public Topic(User user, String name) {
        this.user = user;
        this.name = name;
    }

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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
        if (!(o instanceof Topic other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Topic{id=" + id + ", name='" + name + "'}";
    }
}
