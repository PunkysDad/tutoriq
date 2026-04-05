CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(255),
    last_name     VARCHAR(255),
    grade_level   INT,
    role          VARCHAR(50)  NOT NULL,
    parent_id     UUID REFERENCES users(id),
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY,
    user_id         UUID         NOT NULL REFERENCES users(id),
    tier            VARCHAR(50)  NOT NULL,
    status          VARCHAR(50)  NOT NULL,
    exchange_count  INT          NOT NULL DEFAULT 0,
    exchange_limit  INT          NOT NULL,
    started_at      TIMESTAMP    NOT NULL,
    expires_at      TIMESTAMP    NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE trial_usage (
    id                    UUID PRIMARY KEY,
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id),
    question_count        INT  NOT NULL DEFAULT 0,
    flashcard_sets_created INT NOT NULL DEFAULT 0,
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tutor_sessions (
    id          UUID PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES users(id),
    subject     VARCHAR(255),
    grade_level INT,
    started_at  TIMESTAMP    NOT NULL DEFAULT now(),
    ended_at    TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE tutor_messages (
    id         UUID PRIMARY KEY,
    session_id UUID         NOT NULL REFERENCES tutor_sessions(id),
    role       VARCHAR(50)  NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE chat_summaries (
    id           UUID PRIMARY KEY,
    user_id      UUID      NOT NULL REFERENCES users(id),
    summary_text TEXT,
    message_ids  TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE chat_tags (
    id         UUID PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES users(id),
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE chat_tag_links (
    id         UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES tutor_messages(id),
    tag_id     UUID NOT NULL REFERENCES chat_tags(id)
);

CREATE TABLE flashcard_decks (
    id         UUID PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES users(id),
    title      VARCHAR(255) NOT NULL,
    subject    VARCHAR(255),
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE flashcard_cards (
    id         UUID PRIMARY KEY,
    deck_id    UUID      NOT NULL REFERENCES flashcard_decks(id),
    question   TEXT      NOT NULL,
    answer     TEXT      NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE grade_subject_configs (
    id              UUID PRIMARY KEY,
    grade_band      VARCHAR(50)  NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    prompt_template TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now()
);
