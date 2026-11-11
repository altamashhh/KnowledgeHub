-- =====================================================================
-- V5 — Create knowledge_item_tags join table
-- =====================================================================
-- Many-to-many: one knowledge item can have many tags;
-- one tag can be applied to many knowledge items.
--
-- Composite primary key (knowledge_item_id, tag_id) prevents duplicate
-- associations without a separate surrogate key.
--
-- Both FKs use ON DELETE CASCADE:
--   - Deleting an item removes all its tag associations.
--   - Deleting a tag removes it from all items (items are preserved).
-- =====================================================================

CREATE TABLE knowledge_item_tags (
    knowledge_item_id BIGINT NOT NULL,
    tag_id            BIGINT NOT NULL,

    CONSTRAINT pk_knowledge_item_tags PRIMARY KEY (knowledge_item_id, tag_id),
    CONSTRAINT fk_kit_knowledge_item  FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_kit_tag             FOREIGN KEY (tag_id)            REFERENCES tags            (id) ON DELETE CASCADE
);
