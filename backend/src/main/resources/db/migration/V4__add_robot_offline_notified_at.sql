ALTER TABLE robot
    ADD COLUMN IF NOT EXISTS offline_notified_at TIMESTAMP;
