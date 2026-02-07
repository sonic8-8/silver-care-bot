CREATE INDEX IF NOT EXISTS idx_robot_lcd_event_robot_action_occurred
    ON robot_lcd_event(robot_id, event_action, occurred_at DESC, id DESC);
