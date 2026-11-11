-- =====================================================================
-- V1 — Create users table
-- =====================================================================
-- Stores registered KnowledgeHub users.
-- email is the unique login identifier.
-- password_hash stores only the bcrypt hash — never plaintext.
-- All other tables reference this table via user_id FK.
-- =====================================================================

CREATE TABLE users (
    id          BIGINT       AUTO_INCREMENT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- Index on email: used for login lookup
CREATE INDEX idx_users_email ON users (email);
