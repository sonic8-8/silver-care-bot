CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme theme_mode NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE elder (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    birth_date DATE,
    gender gender,
    address VARCHAR(255),
    status elder_status NOT NULL DEFAULT 'SAFE',
    last_activity_at TIMESTAMP,
    last_location VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_elder_user_id ON elder(user_id);
CREATE INDEX idx_elder_status ON elder(status);

CREATE TABLE emergency_contact (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relation VARCHAR(30),
    priority INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_emergency_contact_elder_priority ON emergency_contact(elder_id, priority);

CREATE TABLE robot (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT UNIQUE REFERENCES elder(id),
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    auth_code VARCHAR(10),
    battery_level INT NOT NULL DEFAULT 100,
    is_charging BOOLEAN NOT NULL DEFAULT FALSE,
    network_status network_status NOT NULL DEFAULT 'DISCONNECTED',
    current_location VARCHAR(50),
    current_x FLOAT,
    current_y FLOAT,
    current_heading INT,
    lcd_mode lcd_mode NOT NULL DEFAULT 'IDLE',
    lcd_emotion lcd_emotion NOT NULL DEFAULT 'NEUTRAL',
    lcd_message VARCHAR(255),
    lcd_sub_message VARCHAR(255),
    dispenser_remaining INT NOT NULL DEFAULT 0,
    dispenser_capacity INT NOT NULL DEFAULT 7,
    morning_medication_time TIME NOT NULL DEFAULT '08:00',
    evening_medication_time TIME NOT NULL DEFAULT '19:00',
    tts_volume INT NOT NULL DEFAULT 70,
    patrol_start_time TIME NOT NULL DEFAULT '09:00',
    patrol_end_time TIME NOT NULL DEFAULT '18:00',
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_robot_serial_number ON robot(serial_number);
CREATE INDEX idx_robot_elder_id ON robot(elder_id);

CREATE TABLE room (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    room_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    room_type room_type,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (robot_id, room_id)
);

CREATE INDEX idx_room_robot_id ON room(robot_id);

CREATE TABLE emergency (
    id BIGSERIAL PRIMARY KEY,
    elder_id BIGINT NOT NULL REFERENCES elder(id),
    robot_id BIGINT REFERENCES robot(id),
    type emergency_type NOT NULL,
    location VARCHAR(50),
    confidence FLOAT,
    sensor_data JSONB,
    resolution emergency_resolution NOT NULL DEFAULT 'PENDING',
    resolution_note TEXT,
    detected_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_emergency_elder_pending ON emergency(elder_id) WHERE resolution = 'PENDING';
CREATE INDEX idx_emergency_detected ON emergency(detected_at DESC);

CREATE TABLE robot_command (
    id BIGSERIAL PRIMARY KEY,
    robot_id BIGINT NOT NULL REFERENCES robot(id),
    command_id VARCHAR(50) NOT NULL UNIQUE,
    command command_type NOT NULL,
    params JSONB,
    status command_status NOT NULL DEFAULT 'PENDING',
    result JSONB,
    issued_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_robot_command_pending ON robot_command(robot_id) WHERE status = 'PENDING';
CREATE INDEX idx_robot_command_issued ON robot_command(issued_at DESC);
