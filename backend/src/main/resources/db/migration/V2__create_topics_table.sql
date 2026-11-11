-- =====================================================================
-- V2 — Create topics table
-- =====================================================================
-- Topics are user-scoped containers for knowledge items.
-- A user can have multiple topics, but topic names must be unique
-- per user (a user cannot have two topics both named "Java").
-- Deleting a user cascades to their topics.
-- Deleting a topic does NOT delete its knowledge items —
-- the FK on knowledge_items is ON DELETE SET NULL.
-- =====================================================================

CREATE TABLE topics (
    id          BIGINT       AUTO_INCREMENT NOT NULL,
    user_id     BIGINT       NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    color       VARCHAR(20),
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,

    CONSTRAINT pk_topics          PRIMARY KEY (id),
    CONSTRAINT fk_topics_user     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_topics_user_name UNIQUE (user_id, name)
);

-- Index on user_id: all topic queries are scoped to a user
CREATE INDEX idx_topics_user_id ON topics (user_id);
