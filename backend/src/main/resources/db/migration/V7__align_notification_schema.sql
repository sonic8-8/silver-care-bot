DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('EMERGENCY', 'MEDICATION', 'SCHEDULE', 'ACTIVITY', 'SYSTEM');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.tables
         WHERE table_schema = current_schema()
           AND table_name = 'notification'
    ) THEN
        CREATE TABLE notification (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            elder_id BIGINT REFERENCES elder(id) ON DELETE CASCADE,
            type notification_type NOT NULL,
            title VARCHAR(120) NOT NULL,
            message TEXT NOT NULL,
            target_path VARCHAR(255),
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            read_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT now()
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'notification'
           AND column_name = 'action_url'
    ) THEN
        ALTER TABLE notification RENAME COLUMN action_url TO target_path;
    END IF;
END $$;

ALTER TABLE notification
    ADD COLUMN IF NOT EXISTS target_path VARCHAR(255);

ALTER TABLE notification
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

UPDATE notification
   SET message = COALESCE(message, '')
 WHERE message IS NULL;

ALTER TABLE notification
    ALTER COLUMN message SET NOT NULL;

ALTER TABLE notification
    ALTER COLUMN title TYPE VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_notification_user_created ON notification(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_user_unread ON notification(user_id, is_read) WHERE is_read = FALSE;
