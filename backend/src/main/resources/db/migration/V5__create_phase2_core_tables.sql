DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_frequency') THEN
        CREATE TYPE medication_frequency AS ENUM ('MORNING', 'EVENING', 'BOTH');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_time_of_day') THEN
        CREATE TYPE medication_time_of_day AS ENUM ('MORNING', 'EVENING');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_record_status') THEN
        CREATE TYPE medication_record_status AS ENUM ('TAKEN', 'MISSED', 'PENDING');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_record_method') THEN
        CREATE TYPE medication_record_method AS ENUM ('DISPENSER', 'BUTTON', 'MANUAL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_type') THEN
        CREATE TYPE schedule_type AS ENUM ('HOSPITAL', 'MEDICATION', 'PERSONAL', 'FAMILY', 'OTHER');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_source') THEN
        CREATE TYPE schedule_source AS ENUM ('MANUAL', 'VOICE', 'SYSTEM');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_status') THEN
        CREATE TYPE schedule_status AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('EMERGENCY', 'MEDICATION', 'SCHEDULE', 'ACTIVITY', 'SYSTEM');
    END IF;
END $$;

CREATE TABLE medication (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency medication_frequency NOT NULL,
    timing VARCHAR(50),
    color VARCHAR(20),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_medication_id_elder UNIQUE (id, elder_id),
    CONSTRAINT chk_medication_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_medication_elder_active ON medication(elder_id, is_active);

CREATE TABLE medication_record (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    medication_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    time_of_day medication_time_of_day NOT NULL,
    status medication_record_status NOT NULL,
    taken_at TIMESTAMP,
    method medication_record_method,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_medication_record_medication_elder
        FOREIGN KEY (medication_id, elder_id)
        REFERENCES medication(id, elder_id),
    CONSTRAINT uk_medication_record UNIQUE (medication_id, record_date, time_of_day)
);

CREATE INDEX idx_medication_record_elder_date ON medication_record(elder_id, record_date);
CREATE INDEX idx_medication_record_medication_date ON medication_record(medication_id, record_date);
CREATE INDEX idx_medication_record_medication_elder ON medication_record(medication_id, elder_id);

CREATE TABLE schedule (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    location VARCHAR(100),
    type schedule_type NOT NULL,
    source schedule_source NOT NULL,
    voice_original TEXT,
    normalized_text TEXT,
    confidence FLOAT,
    status schedule_status NOT NULL DEFAULT 'UPCOMING',
    remind_before_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_schedule_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
    CONSTRAINT chk_schedule_remind_minutes CHECK (remind_before_minutes >= 0)
);

CREATE INDEX idx_schedule_elder_date ON schedule(elder_id, scheduled_at);
CREATE INDEX idx_schedule_elder_source ON schedule(elder_id, source);
CREATE INDEX idx_schedule_status ON schedule(status);

CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    elder_id BIGINT REFERENCES elder(id),
    type notification_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT,
    action_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_user_unread ON notification(user_id, is_read, created_at DESC);
CREATE INDEX idx_notification_elder ON notification(elder_id);
