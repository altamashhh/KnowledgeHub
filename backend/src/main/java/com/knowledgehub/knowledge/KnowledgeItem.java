package com.knowledgehub.knowledge;

import com.knowledgehub.tag.Tag;
import com.knowledgehub.topic.Topic;
import com.knowledgehub.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * JPA entity representing a single Knowledge Item — the central concept of KnowledgeHub.
 *
 * <h3>Quick Capture defaults (enforced by the service layer):</h3>
 * <ul>
 *   <li>URL provided → {@code type = WEBSITE}</li>
 *   <li>Text content only (no URL) → {@code type = NOTE}</li>
 *   <li>Status always defaults to {@code INBOX}</li>
 *   <li>{@code difficulty}, {@code topic}, {@code tags}, {@code rating} — null/empty at capture</li>
 * </ul>
 *
 * <h3>Enum storage strategy:</h3>
 * <p>{@code type}, {@code status}, and {@code difficulty} are stored as VARCHAR using
 * {@code @Enumerated(EnumType.STRING)}. This means adding a new enum value in Java
 * requires no database migration — the VARCHAR column accepts any string.</p>
 *
 * <h3>Topic relationship:</h3>
 * <p>{@code topic} is nullable. The database FK uses {@code ON DELETE SET NULL},
 * so deleting a topic preserves this item in an uncategorised state.</p>
 */
@Entity
@Table(name = "knowledge_items")
public class KnowledgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Owner of this item. Per-user isolation is enforced in the service layer
     * by always passing userId from the JWT principal to repository queries.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Optional topic assignment. Null when item is uncategorised (INBOX state)
     * or after the topic has been deleted (ON DELETE SET NULL).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(nullable = false, length = 255)
    private String title;

    /** Brief summary of the resource. Stored as TEXT in the database. */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Detailed notes, markdown, or code. Stored as LONGTEXT in the database. */
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    /** External URL of the resource. Nullable for NOTE-type items. */
    @Column(length = 2048)
    private String url;

    /**
     * Semantic type of this item.
     * Stored as VARCHAR(30) — never as MySQL ENUM.
     * Quick Capture default logic:
     *   URL present → WEBSITE, text-only → NOTE.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ItemType type;

    /**
     * Difficulty level. Nullable — not set at capture time.
     * Set during progressive enrichment (MVP-2).
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Difficulty difficulty;

    /**
     * Learning lifecycle status. Defaults to {@code INBOX}.
     * Stored as VARCHAR(20) — never as MySQL ENUM.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.INBOX;

    /**
     * "Why I saved this?" — preserved context from the moment of capture.
     * This is a first-class field, not an optional note.
     */
    @Column(columnDefinition = "TEXT")
    private String context;

    /**
     * User rating, 1–5. Nullable — not set at capture time (MVP-2 field).
     * Validation (1 ≤ rating ≤ 5) is enforced at the DTO/service layer.
     */
    @Column(columnDefinition = "TINYINT")
    private Integer rating;

    /**
     * Timestamp of the last review. Set by the service layer when
     * status transitions to {@code REVIEWED}.
     */
    private LocalDateTime lastReviewedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Tags associated with this item.
     * Many-to-many via the {@code knowledge_item_tags} join table.
     * Loaded lazily to avoid N+1 queries on list endpoints.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "knowledge_item_tags",
            joinColumns = @JoinColumn(name = "knowledge_item_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    // ─────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────

    protected KnowledgeItem() {
        // JPA requires a no-arg constructor
    }

    /**
     * Minimal constructor used by Quick Capture.
     * Sets status to INBOX and applies the type default based on whether
     * a URL is present (WEBSITE) or not (NOTE).
     */
    public KnowledgeItem(User user, String title, ItemType type) {
        this.user = user;
        this.title = title;
        this.type = type;
        this.status = ItemStatus.INBOX;
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

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getLastReviewedAt() {
        return lastReviewedAt;
    }

    public void setLastReviewedAt(LocalDateTime lastReviewedAt) {
        this.lastReviewedAt = lastReviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof KnowledgeItem other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "KnowledgeItem{id=" + id + ", title='" + title + "', status=" + status + "}";
    }
}
