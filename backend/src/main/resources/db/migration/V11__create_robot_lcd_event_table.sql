CREATE TABLE IF NOT EXISTS robot_lcd_event (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    elder_id BIGINT REFERENCES elder(id),
    event_type VARCHAR(40) NOT NULL,
    event_action VARCHAR(40),
    medication_id BIGINT,
    location VARCHAR(50),
    confidence FLOAT,
    payload JSONB,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_robot_lcd_event_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0))
);

CREATE INDEX IF NOT EXISTS idx_robot_lcd_event_robot_occurred ON robot_lcd_event(robot_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_robot_lcd_event_elder_occurred ON robot_lcd_event(elder_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_robot_lcd_event_action_occurred ON robot_lcd_event(event_action, occurred_at DESC, id DESC);
