-- =====================================================================
-- V4 — Create tags table
-- =====================================================================
-- Tags are user-scoped labels applied to knowledge items.
-- A tag name must be unique per user — two users can both have a
-- "Java" tag, but a single user cannot have two "Java" tags.
-- Tags are created automatically on first use (no separate create-tag flow).
-- Deleting a user cascades to their tags.
-- =====================================================================

CREATE TABLE tags (
    id         BIGINT      AUTO_INCREMENT NOT NULL,
    user_id    BIGINT      NOT NULL,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL,

    CONSTRAINT pk_tags           PRIMARY KEY (id),
    CONSTRAINT fk_tags_user      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_tags_user_name UNIQUE (user_id, name)
);

-- Index on user_id: tag queries are always scoped to a user
CREATE INDEX idx_tags_user_id ON tags (user_id);
