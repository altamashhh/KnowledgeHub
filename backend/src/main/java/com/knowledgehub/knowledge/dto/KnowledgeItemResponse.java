package com.knowledgehub.knowledge.dto;

import com.knowledgehub.knowledge.Difficulty;
import com.knowledgehub.knowledge.ItemStatus;
import com.knowledgehub.knowledge.ItemType;
import com.knowledgehub.knowledge.KnowledgeItem;
import com.knowledgehub.tag.dto.TagResponse;
import com.knowledgehub.topic.dto.TopicResponse;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Outbound response representation for a Knowledge Item.
 */
public class KnowledgeItemResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String content;
    private final String url;
    private final ItemType type;
    private final ItemStatus status;
    private final Difficulty difficulty;
    private final String context;
    private final Integer rating;
    private final TopicResponse topic;
    private final Set<TagResponse> tags;
    private final LocalDateTime lastReviewedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public KnowledgeItemResponse(Long id, String title, String description, String content,
                                 String url, ItemType type, ItemStatus status,
                                 Difficulty difficulty, String context, Integer rating,
                                 TopicResponse topic, Set<TagResponse> tags,
                                 LocalDateTime lastReviewedAt, LocalDateTime createdAt,
                                 LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.content = content;
        this.url = url;
        this.type = type;
        this.status = status;
        this.difficulty = difficulty;
        this.context = context;
        this.rating = rating;
        this.topic = topic;
        this.tags = tags;
        this.lastReviewedAt = lastReviewedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static KnowledgeItemResponse fromEntity(KnowledgeItem item) {
        if (item == null) {
            return null;
        }

        TopicResponse topicDto = TopicResponse.fromEntity(item.getTopic());

        Set<TagResponse> tagDtos = (item.getTags() != null)
                ? item.getTags().stream().map(TagResponse::fromEntity).collect(Collectors.toSet())
                : Collections.emptySet();

        return new KnowledgeItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getContent(),
                item.getUrl(),
                item.getType(),
                item.getStatus(),
                item.getDifficulty(),
                item.getContext(),
                item.getRating(),
                topicDto,
                tagDtos,
                item.getLastReviewedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getContent() {
        return content;
    }

    public String getUrl() {
        return url;
    }

    public ItemType getType() {
        return type;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public String getContext() {
        return context;
    }

    public Integer getRating() {
        return rating;
    }

    public TopicResponse getTopic() {
        return topic;
    }

    public Set<TagResponse> getTags() {
        return tags;
    }

    public LocalDateTime getLastReviewedAt() {
        return lastReviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
