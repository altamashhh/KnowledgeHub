package com.knowledgehub.tag.dto;

import com.knowledgehub.tag.Tag;

/**
 * Safe Tag DTO response payload.
 */
public class TagResponse {

    private final Long id;
    private final String name;

    public TagResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public static TagResponse fromEntity(Tag tag) {
        if (tag == null) {
            return null;
        }
        return new TagResponse(tag.getId(), tag.getName());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
