package com.knowledgehub.tag;

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

import java.time.LocalDateTime;

/**
 * JPA entity representing a user-owned tag.
 *
 * <p>Tags are short, free-text labels (e.g., "HashMap", "Java", "DSA") that
 * can be applied to multiple knowledge items. They are user-scoped: two users
 * can both have a "Java" tag, but a single user cannot have two "Java" tags.</p>
 *
 * <p>Tags are created automatically on first use in the service layer —
 * there is no separate "create tag" workflow for the user.</p>
 *
 * <p>Tags do not have an {@code updatedAt} column because they are immutable
 * once created. Renaming a tag is out of scope for MVP.</p>
 */
@Entity
@Table(
        name = "tags",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tags_user_name", columnNames = {"user_id", "name"})
        }
)
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String name;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────

    protected Tag() {
        // JPA requires a no-arg constructor
    }

    public Tag(User user, String name) {
        this.user = user;
        this.name = name;
    }

    // ─────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tag other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Tag{id=" + id + ", name='" + name + "'}";
    }
}
