package com.knowledgehub.topic.dto;

import com.knowledgehub.topic.Topic;

/**
 * Safe Topic DTO response payload.
 */
public class TopicResponse {

    private final Long id;
    private final String name;
    private final String description;
    private final String color;

    public TopicResponse(Long id, String name, String description, String color) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
    }

    public static TopicResponse fromEntity(Topic topic) {
        if (topic == null) {
            return null;
        }
        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getColor()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getColor() {
        return color;
    }
}
