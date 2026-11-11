-- =====================================================================
-- V3 — Create knowledge_items table
-- =====================================================================
-- The central entity of KnowledgeHub.
-- Each row is one "Knowledge Item" owned by a user.
--
-- Key design decisions:
--   - topic_id is NULLABLE: items can exist without a topic (INBOX items).
--     ON DELETE SET NULL: deleting a topic preserves items as uncategorised.
--   - type, status, difficulty use VARCHAR (not ENUM) so Java enum values
--     can be added without a DDL ALTER TABLE.
--   - status defaults to 'INBOX' — the Quick Capture default.
--   - content is LONGTEXT to support detailed markdown notes.
--   - url is VARCHAR(2048) to accommodate long URLs.
--   - rating is TINYINT: 1–5 scale, nullable until the user rates it.
-- =====================================================================

CREATE TABLE knowledge_items (
    id               BIGINT        AUTO_INCREMENT NOT NULL,
    user_id          BIGINT        NOT NULL,
    topic_id         BIGINT,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT,
    content          LONGTEXT,
    url              VARCHAR(2048),
    type             VARCHAR(30)   NOT NULL,
    difficulty       VARCHAR(20),
    status           VARCHAR(20)   NOT NULL DEFAULT 'INBOX',
    context          TEXT,
    rating           TINYINT,
    last_reviewed_at DATETIME,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME      NOT NULL,

    CONSTRAINT pk_knowledge_items          PRIMARY KEY (id),
    CONSTRAINT fk_knowledge_items_user     FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_knowledge_items_topic    FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
);

-- Indexes for common query patterns (all user-scoped)
CREATE INDEX idx_ki_user_id   ON knowledge_items (user_id);
CREATE INDEX idx_ki_topic_id  ON knowledge_items (topic_id);
CREATE INDEX idx_ki_status    ON knowledge_items (status);
CREATE INDEX idx_ki_type      ON knowledge_items (type);
CREATE INDEX idx_ki_created   ON knowledge_items (created_at);
