DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM (
            'WAKE_UP',
            'SLEEP',
            'MEDICATION_TAKEN',
            'MEDICATION_MISSED',
            'PATROL_COMPLETE',
            'OUT_DETECTED',
            'RETURN_DETECTED',
            'CONVERSATION',
            'EMERGENCY'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patrol_target') THEN
        CREATE TYPE patrol_target AS ENUM ('GAS_VALVE', 'DOOR', 'OUTLET', 'WINDOW', 'MULTI_TAP');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patrol_item_status') THEN
        CREATE TYPE patrol_item_status AS ENUM ('ON', 'OFF', 'NORMAL', 'LOCKED', 'UNLOCKED', 'NEEDS_CHECK');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patrol_overall_status') THEN
        CREATE TYPE patrol_overall_status AS ENUM ('SAFE', 'WARNING');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_intent') THEN
        CREATE TYPE conversation_intent AS ENUM ('CHAT', 'COMMAND');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_command_type') THEN
        CREATE TYPE conversation_command_type AS ENUM ('SEARCH', 'SCHEDULE', 'MOVE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_sentiment') THEN
        CREATE TYPE conversation_sentiment AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'search_type') THEN
        CREATE TYPE search_type AS ENUM ('WEATHER', 'WEB_SEARCH');
    END IF;
END $$;

CREATE TABLE activity (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    robot_id BIGINT REFERENCES robot(id),
    type activity_type NOT NULL,
    title VARCHAR(100),
    description TEXT,
    location VARCHAR(50),
    confidence FLOAT,
    detected_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_activity_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0))
);

CREATE INDEX idx_activity_elder_detected ON activity(elder_id, detected_at DESC);
CREATE INDEX idx_activity_type ON activity(type);

CREATE TABLE patrol_result (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    patrol_id VARCHAR(50) NOT NULL UNIQUE,
    overall_status patrol_overall_status NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_patrol_result_robot ON patrol_result(robot_id, completed_at DESC);
CREATE INDEX idx_patrol_result_elder ON patrol_result(elder_id);

CREATE TABLE patrol_item (
    id BIGSERIAL PRIMARY KEY,
    patrol_result_id BIGINT NOT NULL REFERENCES patrol_result(id),
    target patrol_target NOT NULL,
    label VARCHAR(50),
    status patrol_item_status NOT NULL,
    confidence FLOAT,
    image_url VARCHAR(255),
    checked_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_patrol_item_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0))
);

CREATE INDEX idx_patrol_item_result_checked ON patrol_item(patrol_result_id, checked_at DESC);

CREATE TABLE conversation (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    voice_original TEXT,
    normalized_text TEXT,
    intent conversation_intent,
    command_type conversation_command_type,
    confidence FLOAT,
    duration_seconds INT,
    sentiment conversation_sentiment NOT NULL DEFAULT 'NEUTRAL',
    keywords JSONB,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_conversation_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
    CONSTRAINT chk_conversation_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

CREATE INDEX idx_conversation_elder_recorded ON conversation(elder_id, recorded_at DESC);
CREATE INDEX idx_conversation_intent ON conversation(intent);
CREATE INDEX idx_conversation_robot_recorded ON conversation(robot_id, recorded_at DESC);

CREATE TABLE search_result (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    conversation_id BIGINT REFERENCES conversation(id),
    search_type search_type NOT NULL,
    query TEXT,
    content TEXT,
    searched_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_result_elder ON search_result(elder_id, searched_at DESC);
CREATE INDEX idx_search_result_robot ON search_result(robot_id, searched_at DESC);

CREATE TABLE ai_report (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    report_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary TEXT,
    metrics JSONB,
    top_keywords JSONB,
    recommendations JSONB,
    generated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_ai_report_elder_period UNIQUE (elder_id, period_start, period_end),
    CONSTRAINT chk_ai_report_period CHECK (period_end >= period_start)
);

CREATE INDEX idx_ai_report_elder_date ON ai_report(elder_id, report_date DESC);
