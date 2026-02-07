CREATE TABLE patrol_snapshot (
    id BIGSERIAL PRIMARY KEY,
    patrol_result_id BIGINT NOT NULL REFERENCES patrol_result(id) ON DELETE CASCADE,
    target patrol_target NOT NULL,
    label VARCHAR(50),
    status patrol_item_status NOT NULL,
    confidence FLOAT,
    image_url VARCHAR(255) NOT NULL,
    captured_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_patrol_snapshot_confidence CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0))
);

CREATE INDEX idx_patrol_snapshot_result_captured ON patrol_snapshot(patrol_result_id, captured_at DESC);
