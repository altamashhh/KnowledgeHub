package com.knowledgehub.knowledge.dto;

import com.knowledgehub.knowledge.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

/**
 * Request payload for creating a Knowledge Item via Quick Capture.
 *
 * <p>Only {@code title} is required. All other fields are optional.
 * Default rules applied if omitted:
 * <ul>
 *   <li>If {@code url} provided → type defaults to {@code WEBSITE}</li>
 *   <li>If text/content provided without URL → type defaults to {@code NOTE}</li>
 *   <li>Status defaults to {@code INBOX}</li>
 *   <li>{@code topic}, {@code difficulty}, {@code rating} default to {@code null}</li>
 * </ul>
 * </p>
 */
public class CreateKnowledgeItemRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 2048, message = "URL must not exceed 2048 characters")
    private String url;

    private String content;

    private String description;

    private String context;

    private ItemType type;

    private Long topicId;

    private Set<String> tagNames;

    public CreateKnowledgeItemRequest() {
    }

    public CreateKnowledgeItemRequest(String title) {
        this.title = title;
    }

    public CreateKnowledgeItemRequest(String title, String url, String context) {
        this.title = title;
        this.url = url;
        this.context = context;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public Set<String> getTagNames() {
        return tagNames;
    }

    public void setTagNames(Set<String> tagNames) {
        this.tagNames = tagNames;
    }
}
