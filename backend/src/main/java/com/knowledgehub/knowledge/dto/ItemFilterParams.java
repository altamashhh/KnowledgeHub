package com.knowledgehub.knowledge.dto;

import com.knowledgehub.knowledge.Difficulty;
import com.knowledgehub.knowledge.ItemStatus;
import com.knowledgehub.knowledge.ItemType;

/**
 * Immutable value object carrying all search and filter parameters
 * submitted to {@code GET /api/v1/items}.
 *
 * <p>All fields are nullable — a null value means "no filter applied"
 * for that dimension. The service layer composes a JPA {@code Specification}
 * only for non-null fields.</p>
 *
 * <ul>
 *   <li>{@code keyword} — case-insensitive LIKE search across title,
 *       description, content, and context</li>
 *   <li>{@code status}  — exact match on {@link ItemStatus}</li>
 *   <li>{@code type}    — exact match on {@link ItemType}</li>
 *   <li>{@code difficulty} — exact match on {@link Difficulty}</li>
 *   <li>{@code topicId}   — exact match on the item's topic FK</li>
 *   <li>{@code tagName}   — case-insensitive match on any associated tag name</li>
 * </ul>
 */
public class ItemFilterParams {

    private final String keyword;
    private final ItemStatus status;
    private final ItemType type;
    private final Difficulty difficulty;
    private final Long topicId;
    private final String tagName;

    private ItemFilterParams(Builder builder) {
        this.keyword = builder.keyword;
        this.status = builder.status;
        this.type = builder.type;
        this.difficulty = builder.difficulty;
        this.topicId = builder.topicId;
        this.tagName = builder.tagName;
    }

    public String getKeyword() {
        return keyword;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public ItemType getType() {
        return type;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public Long getTopicId() {
        return topicId;
    }

    public String getTagName() {
        return tagName;
    }

    /**
     * Returns {@code true} if no filter or keyword has been supplied,
     * i.e. this is a plain paginated list request with no search criteria.
     */
    public boolean isEmpty() {
        return keyword == null
                && status == null
                && type == null
                && difficulty == null
                && topicId == null
                && tagName == null;
    }

    // ─────────────────────────────────────────────
    // Builder
    // ─────────────────────────────────────────────

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private String keyword;
        private ItemStatus status;
        private ItemType type;
        private Difficulty difficulty;
        private Long topicId;
        private String tagName;

        private Builder() {}

        public Builder keyword(String keyword) {
            this.keyword = (keyword != null && keyword.isBlank()) ? null : keyword;
            return this;
        }

        public Builder status(ItemStatus status) {
            this.status = status;
            return this;
        }

        public Builder type(ItemType type) {
            this.type = type;
            return this;
        }

        public Builder difficulty(Difficulty difficulty) {
            this.difficulty = difficulty;
            return this;
        }

        public Builder topicId(Long topicId) {
            this.topicId = topicId;
            return this;
        }

        public Builder tagName(String tagName) {
            this.tagName = (tagName != null && tagName.isBlank()) ? null : tagName;
            return this;
        }

        public ItemFilterParams build() {
            return new ItemFilterParams(this);
        }
    }
}
