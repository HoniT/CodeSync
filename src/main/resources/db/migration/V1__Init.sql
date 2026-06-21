
-- User table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Document table (the actual room the users will join and edit)
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    access_code VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_saved_at TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_document_creator
        FOREIGN KEY (creator_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_document_access_code ON documents(access_code);
