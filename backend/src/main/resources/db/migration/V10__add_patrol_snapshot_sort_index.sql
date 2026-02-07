CREATE INDEX IF NOT EXISTS idx_patrol_snapshot_result_captured_id
    ON patrol_snapshot (patrol_result_id, captured_at DESC, id DESC);
