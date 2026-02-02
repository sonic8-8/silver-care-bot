# 데이터베이스 ERD

> **버전**: v2.0.0
> **작성일**: 2026-02-02
> **기반 문서**: [api-specification.md](./api-specification.md), [api-ai.md](./api-ai.md), [api-embedded.md](./api-embedded.md)

---

## 1. ERD 다이어그램

```mermaid
erDiagram
    USER ||--o{ ELDER : manages
    USER ||--o{ NOTIFICATION : receives
    ELDER ||--|| ROBOT : has
    ELDER ||--o{ MEDICATION : takes
    ELDER ||--o{ MEDICATION_RECORD : has
    ELDER ||--o{ SCHEDULE : has
    ELDER ||--o{ ACTIVITY : logs
    ELDER ||--o{ EMERGENCY : triggers
    ELDER ||--o{ EMERGENCY_CONTACT : has
    ELDER ||--o{ AI_REPORT : has
    ROBOT ||--o{ ROOM : has
    ROBOT ||--o{ PATROL_RESULT : performs
    ROBOT ||--o{ ROBOT_COMMAND : receives
    ROBOT ||--o{ CONVERSATION : records
    ROBOT ||--o{ SEARCH_RESULT : records
    PATROL_RESULT ||--o{ PATROL_ITEM : contains

    USER {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        varchar phone
        enum role "WORKER, FAMILY"
        json notification_settings
        enum theme "SYSTEM, LIGHT, DARK"
        timestamp created_at
        timestamp updated_at
    }

    ELDER {
        bigint id PK
        bigint user_id FK
        varchar name
        date birth_date
        enum gender "MALE, FEMALE"
        varchar address
        enum status "SAFE, WARNING, DANGER"
        timestamp last_activity_at
        varchar last_location
        timestamp created_at
        timestamp updated_at
    }

    EMERGENCY_CONTACT {
        bigint id PK
        bigint elder_id FK
        varchar name
        varchar phone
        varchar relation
        int priority
        timestamp created_at
    }

    ROBOT {
        bigint id PK
        bigint elder_id FK UK
        varchar serial_number UK
        varchar auth_code
        int battery_level
        boolean is_charging
        enum network_status "CONNECTED, DISCONNECTED"
        varchar current_location
        float current_x
        float current_y
        int current_heading
        enum lcd_mode "IDLE, GREETING, MEDICATION, SCHEDULE, LISTENING, EMERGENCY, SLEEP"
        enum lcd_emotion "neutral, happy, sleep"
        varchar lcd_message
        varchar lcd_sub_message
        int dispenser_remaining
        int dispenser_capacity
        time morning_medication_time
        time evening_medication_time
        int tts_volume
        time patrol_start_time
        time patrol_end_time
        timestamp last_sync_at
        timestamp created_at
        timestamp updated_at
    }

    ROOM {
        bigint id PK
        bigint robot_id FK
        varchar room_id UK
        varchar name
        float x
        float y
        enum room_type "LIVING_ROOM, KITCHEN, BEDROOM, BATHROOM, ENTRANCE, DOCK"
        timestamp created_at
        timestamp updated_at
    }

    MEDICATION {
        bigint id PK
        bigint elder_id FK
        varchar name
        varchar dosage
        enum frequency "MORNING, EVENING, BOTH"
        varchar timing
        varchar color
        date start_date
        date end_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    MEDICATION_RECORD {
        bigint id PK
        bigint elder_id FK
        bigint medication_id FK
        date record_date
        enum time_of_day "MORNING, EVENING"
        enum status "TAKEN, MISSED, PENDING"
        timestamp taken_at
        enum method "DISPENSER, BUTTON, MANUAL"
        timestamp created_at
    }

    SCHEDULE {
        bigint id PK
        bigint elder_id FK
        varchar title
        text description
        timestamp scheduled_at
        varchar location
        enum type "HOSPITAL, MEDICATION, PERSONAL, FAMILY, OTHER"
        enum source "MANUAL, VOICE, SYSTEM"
        text voice_original
        text normalized_text
        float confidence
        enum status "UPCOMING, COMPLETED, CANCELLED"
        int remind_before_minutes
        timestamp created_at
        timestamp updated_at
    }

    ACTIVITY {
        bigint id PK
        bigint elder_id FK
        bigint robot_id FK
        enum type "WAKE_UP, SLEEP, MEDICATION_TAKEN, MEDICATION_MISSED, PATROL_COMPLETE, OUT_DETECTED, RETURN_DETECTED, EMERGENCY"
        varchar title
        text description
        varchar location
        float confidence
        timestamp detected_at
        timestamp created_at
    }

    EMERGENCY {
        bigint id PK
        bigint elder_id FK
        bigint robot_id FK
        enum type "FALL_DETECTED, NO_RESPONSE, SOS_BUTTON, UNUSUAL_PATTERN"
        varchar location
        float confidence
        json sensor_data
        enum resolution "PENDING, FALSE_ALARM, RESOLVED, EMERGENCY_CALLED, FAMILY_CONTACTED"
        text resolution_note
        timestamp detected_at
        timestamp resolved_at
        timestamp created_at
    }

    NOTIFICATION {
        bigint id PK
        bigint user_id FK
        bigint elder_id FK
        enum type "EMERGENCY, MEDICATION, SCHEDULE, ACTIVITY, SYSTEM"
        varchar title
        text message
        varchar action_url
        boolean is_read
        timestamp created_at
    }

    PATROL_RESULT {
        bigint id PK
        bigint robot_id FK
        bigint elder_id FK
        varchar patrol_id UK
        enum overall_status "SAFE, WARNING"
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }

    PATROL_ITEM {
        bigint id PK
        bigint patrol_result_id FK
        enum target "GAS_VALVE, DOOR, OUTLET, WINDOW, MULTI_TAP"
        varchar label
        enum status "ON, OFF, NORMAL, LOCKED, UNLOCKED, NEEDS_CHECK"
        float confidence
        varchar image_url
        timestamp checked_at
    }

    ROBOT_COMMAND {
        bigint id PK
        bigint robot_id FK
        varchar command_id UK
        enum command "MOVE_TO, START_PATROL, RETURN_TO_DOCK, SPEAK, CHANGE_LCD_MODE"
        json params
        enum status "PENDING, RECEIVED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED"
        json result
        timestamp issued_at
        timestamp completed_at
        timestamp created_at
    }

    CONVERSATION {
        bigint id PK
        bigint robot_id FK
        bigint elder_id FK
        text voice_original
        text normalized_text
        enum intent "CHAT, COMMAND"
        enum command_type "SEARCH, SCHEDULE, MOVE"
        float confidence
        int duration_seconds
        enum sentiment "POSITIVE, NEUTRAL, NEGATIVE"
        json keywords
        timestamp recorded_at
        timestamp created_at
    }

    SEARCH_RESULT {
        bigint id PK
        bigint robot_id FK
        bigint elder_id FK
        bigint conversation_id FK
        enum search_type "WEATHER, WEB_SEARCH"
        text query
        text content
        timestamp searched_at
        timestamp created_at
    }

    AI_REPORT {
        bigint id PK
        bigint elder_id FK
        date report_date
        date period_start
        date period_end
        text summary
        json metrics
        json top_keywords
        json recommendations
        timestamp generated_at
        timestamp created_at
    }
```

---

## 2. 테이블 상세

### 2.1 USER (사용자)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 사용자 ID |
| `name` | VARCHAR(50) | NOT NULL | 이름 |
| `email` | VARCHAR(100) | UK, NOT NULL | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | BCrypt 암호화된 비밀번호 |
| `phone` | VARCHAR(20) | | 연락처 |
| `role` | ENUM | NOT NULL | WORKER(복지사), FAMILY(가족) |
| `notification_settings` | JSONB | DEFAULT '{}' | 알림 설정 |
| `theme` | ENUM | DEFAULT 'SYSTEM' | SYSTEM, LIGHT, DARK |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**notification_settings JSON 구조:**
```json
{
  "emergency": true,
  "medication": true,
  "daily": false,
  "email": false
}
```

---

### 2.2 ELDER (어르신)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 어르신 ID |
| `user_id` | BIGINT | FK (USER) | 담당 사용자 |
| `name` | VARCHAR(50) | NOT NULL | 이름 |
| `birth_date` | DATE | | 생년월일 |
| `gender` | ENUM | | MALE, FEMALE |
| `address` | VARCHAR(255) | | 주소 |
| `status` | ENUM | DEFAULT 'SAFE' | SAFE, WARNING, DANGER |
| `last_activity_at` | TIMESTAMP | | 마지막 활동 시간 |
| `last_location` | VARCHAR(50) | | 마지막 위치 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_elder_user_id` ON (user_id)
- `idx_elder_status` ON (status)

---

### 2.3 EMERGENCY_CONTACT (긴급 연락처)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 연락처 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `name` | VARCHAR(50) | NOT NULL | 이름 |
| `phone` | VARCHAR(20) | NOT NULL | 연락처 |
| `relation` | VARCHAR(30) | | 관계 (자녀, 이웃 등) |
| `priority` | INT | DEFAULT 1 | 우선순위 (1=최우선) |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**인덱스:**
- `idx_emergency_contact_elder_priority` ON (elder_id, priority)

---

### 2.4 ROBOT (로봇)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 로봇 ID |
| `elder_id` | BIGINT | FK (ELDER), UK | 담당 어르신 (1:1) |
| `serial_number` | VARCHAR(50) | UK, NOT NULL | 시리얼 번호 |
| `auth_code` | VARCHAR(10) | | 인증 코드 |
| `battery_level` | INT | DEFAULT 100 | 배터리 (0-100) |
| `is_charging` | BOOLEAN | DEFAULT FALSE | 충전 중 여부 |
| `network_status` | ENUM | DEFAULT 'DISCONNECTED' | CONNECTED, DISCONNECTED |
| `current_location` | VARCHAR(50) | | 현재 위치 (방 이름) |
| `current_x` | FLOAT | | 현재 X 좌표 |
| `current_y` | FLOAT | | 현재 Y 좌표 |
| `current_heading` | INT | | 현재 방향 (0-359도) |
| `lcd_mode` | ENUM | DEFAULT 'IDLE' | LCD 화면 모드 |
| `lcd_emotion` | ENUM | DEFAULT 'neutral' | LCD 표정 (MVP: neutral, happy, sleep) |
| `lcd_message` | VARCHAR(255) | | LCD 메인 메시지 |
| `lcd_sub_message` | VARCHAR(255) | | LCD 서브 메시지 |
| `dispenser_remaining` | INT | DEFAULT 0 | 디스펜서 잔량 |
| `dispenser_capacity` | INT | DEFAULT 7 | 디스펜서 용량 |
| `morning_medication_time` | TIME | DEFAULT '08:00' | 아침 복약 시간 |
| `evening_medication_time` | TIME | DEFAULT '19:00' | 저녁 복약 시간 |
| `tts_volume` | INT | DEFAULT 70 | TTS 볼륨 (0-100) |
| `patrol_start_time` | TIME | DEFAULT '09:00' | 순찰 시작 시간 |
| `patrol_end_time` | TIME | DEFAULT '18:00' | 순찰 종료 시간 |
| `last_sync_at` | TIMESTAMP | | 마지막 동기화 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_robot_serial_number` ON (serial_number)
- `idx_robot_elder_id` ON (elder_id)

---

### 2.5 ROOM (방)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 방 ID |
| `robot_id` | BIGINT | FK (ROBOT), NOT NULL | 로봇 |
| `room_id` | VARCHAR(50) | UK(robot_id, room_id) | 방 식별자 (LIVING_ROOM 등) |
| `name` | VARCHAR(50) | NOT NULL | 방 이름 (거실 등) |
| `x` | FLOAT | NOT NULL | X 좌표 |
| `y` | FLOAT | NOT NULL | Y 좌표 |
| `room_type` | ENUM | | LIVING_ROOM, KITCHEN, BEDROOM, BATHROOM, ENTRANCE, DOCK |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_room_robot_id` ON (robot_id)
- `uk_room_robot_room_id` UNIQUE ON (robot_id, room_id)

---

### 2.6 MEDICATION (약)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 약 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `name` | VARCHAR(100) | NOT NULL | 약 이름 |
| `dosage` | VARCHAR(50) | | 용량 (예: "1정") |
| `frequency` | ENUM | NOT NULL | MORNING, EVENING, BOTH |
| `timing` | VARCHAR(50) | | 복용 시점 (예: "식후 30분") |
| `color` | VARCHAR(20) | | 약 색상 |
| `start_date` | DATE | | 복용 시작일 |
| `end_date` | DATE | | 복용 종료일 (NULL=무기한) |
| `is_active` | BOOLEAN | DEFAULT TRUE | 활성 여부 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_medication_elder_active` ON (elder_id, is_active)

---

### 2.7 MEDICATION_RECORD (복약 기록)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 기록 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `medication_id` | BIGINT | FK (MEDICATION), NOT NULL | 약 |
| `record_date` | DATE | NOT NULL | 날짜 |
| `time_of_day` | ENUM | NOT NULL | MORNING, EVENING |
| `status` | ENUM | NOT NULL | TAKEN, MISSED, PENDING |
| `taken_at` | TIMESTAMP | | 복용 시간 |
| `method` | ENUM | | DISPENSER, BUTTON, MANUAL |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**인덱스:**
- `idx_medication_record_elder_date` ON (elder_id, record_date)
- `idx_medication_record_medication_date` ON (medication_id, record_date)
- `uk_medication_record` UNIQUE ON (medication_id, record_date, time_of_day)

---

### 2.8 SCHEDULE (일정)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 일정 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `title` | VARCHAR(100) | NOT NULL | 제목 |
| `description` | TEXT | | 설명 |
| `scheduled_at` | TIMESTAMP | NOT NULL | 일정 시간 |
| `location` | VARCHAR(100) | | 장소 |
| `type` | ENUM | NOT NULL | HOSPITAL, MEDICATION, PERSONAL, FAMILY, OTHER |
| `source` | ENUM | NOT NULL | MANUAL, VOICE, SYSTEM |
| `voice_original` | TEXT | | 원본 음성 텍스트 (STT) |
| `normalized_text` | TEXT | | LLM 정규화 텍스트 |
| `confidence` | FLOAT | | 음성 인식 신뢰도 |
| `status` | ENUM | DEFAULT 'UPCOMING' | UPCOMING, COMPLETED, CANCELLED |
| `remind_before_minutes` | INT | DEFAULT 60 | 사전 알림 (분) |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_schedule_elder_date` ON (elder_id, scheduled_at)
- `idx_schedule_elder_source` ON (elder_id, source)
- `idx_schedule_status` ON (status)

---

### 2.9 ACTIVITY (활동 로그)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 활동 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `robot_id` | BIGINT | FK (ROBOT) | 로봇 |
| `type` | ENUM | NOT NULL | 활동 유형 |
| `title` | VARCHAR(100) | | 제목 |
| `description` | TEXT | | 설명 |
| `location` | VARCHAR(50) | | 위치 |
| `confidence` | FLOAT | | 신뢰도 (0-1) |
| `detected_at` | TIMESTAMP | NOT NULL | 감지 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**activity_type ENUM:**
- `WAKE_UP` - 기상
- `SLEEP` - 취침
- `MEDICATION_TAKEN` - 복약 완료
- `MEDICATION_MISSED` - 복약 누락
- `PATROL_COMPLETE` - 순찰 완료
- `OUT_DETECTED` - 외출 감지
- `RETURN_DETECTED` - 귀가 감지
- `EMERGENCY` - 긴급 상황

**인덱스:**
- `idx_activity_elder_detected` ON (elder_id, detected_at DESC)
- `idx_activity_type` ON (type)

---

### 2.10 EMERGENCY (긴급 상황)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 긴급 상황 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `robot_id` | BIGINT | FK (ROBOT) | 로봇 |
| `type` | ENUM | NOT NULL | FALL_DETECTED, NO_RESPONSE, SOS_BUTTON, UNUSUAL_PATTERN |
| `location` | VARCHAR(50) | | 발생 위치 |
| `confidence` | FLOAT | | 신뢰도 |
| `sensor_data` | JSONB | | 센서 데이터 |
| `resolution` | ENUM | DEFAULT 'PENDING' | 해결 상태 |
| `resolution_note` | TEXT | | 해결 메모 |
| `detected_at` | TIMESTAMP | NOT NULL | 감지 시간 |
| `resolved_at` | TIMESTAMP | | 해결 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**sensor_data JSON 예시:**
```json
{
  "accelerometer": { "x": 0.2, "y": 9.8, "z": 0.1 },
  "impactForce": 2.5
}
```

**인덱스:**
- `idx_emergency_elder_pending` ON (elder_id) WHERE resolution = 'PENDING'
- `idx_emergency_detected` ON (detected_at DESC)

---

### 2.11 NOTIFICATION (알림)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 알림 ID |
| `user_id` | BIGINT | FK (USER), NOT NULL | 수신 사용자 |
| `elder_id` | BIGINT | FK (ELDER) | 관련 어르신 |
| `type` | ENUM | NOT NULL | EMERGENCY, MEDICATION, SCHEDULE, ACTIVITY, SYSTEM |
| `title` | VARCHAR(100) | NOT NULL | 제목 |
| `message` | TEXT | | 메시지 |
| `action_url` | VARCHAR(255) | | 액션 URL |
| `is_read` | BOOLEAN | DEFAULT FALSE | 읽음 여부 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**인덱스:**
- `idx_notification_user_unread` ON (user_id, is_read, created_at DESC)
- `idx_notification_elder` ON (elder_id)

---

### 2.12 PATROL_RESULT (순찰 결과)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 순찰 결과 ID |
| `robot_id` | BIGINT | FK (ROBOT), NOT NULL | 로봇 |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `patrol_id` | VARCHAR(50) | UK | 순찰 고유 ID |
| `overall_status` | ENUM | NOT NULL | SAFE, WARNING |
| `started_at` | TIMESTAMP | NOT NULL | 시작 시간 |
| `completed_at` | TIMESTAMP | | 완료 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**인덱스:**
- `idx_patrol_result_robot` ON (robot_id, completed_at DESC)
- `idx_patrol_result_elder` ON (elder_id)

---

### 2.13 PATROL_ITEM (순찰 항목)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 항목 ID |
| `patrol_result_id` | BIGINT | FK (PATROL_RESULT), NOT NULL | 순찰 결과 |
| `target` | ENUM | NOT NULL | 순찰 대상 |
| `label` | VARCHAR(50) | | 라벨 (예: "가스밸브") |
| `status` | ENUM | NOT NULL | 상태 |
| `confidence` | FLOAT | | 신뢰도 |
| `image_url` | VARCHAR(255) | | 이미지 URL |
| `checked_at` | TIMESTAMP | NOT NULL | 확인 시간 |

**patrol_target ENUM:**
- `GAS_VALVE` - 가스밸브
- `DOOR` - 현관문
- `OUTLET` - 콘센트
- `WINDOW` - 창문
- `MULTI_TAP` - 멀티탭

**patrol_item_status ENUM:**
- `ON` - 켜짐 (가스밸브/멀티탭: 안전)
- `OFF` - 꺼짐 (확인 필요)
- `NORMAL` - 정상
- `LOCKED` - 잠김 (문/창문)
- `UNLOCKED` - 열림 (문/창문)
- `NEEDS_CHECK` - 확인 필요

---

### 2.14 ROBOT_COMMAND (로봇 명령)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 명령 ID |
| `robot_id` | BIGINT | FK (ROBOT), NOT NULL | 로봇 |
| `command_id` | VARCHAR(50) | UK | 명령 고유 ID |
| `command` | ENUM | NOT NULL | 명령 유형 |
| `params` | JSONB | | 명령 파라미터 |
| `status` | ENUM | DEFAULT 'PENDING' | 상태 |
| `result` | JSONB | | 실행 결과 |
| `issued_at` | TIMESTAMP | NOT NULL | 발행 시간 |
| `completed_at` | TIMESTAMP | | 완료 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**command ENUM:**
- `MOVE_TO` - 이동
- `START_PATROL` - 순찰 시작
- `RETURN_TO_DOCK` - 충전 독 복귀
- `SPEAK` - TTS 메시지
- `CHANGE_LCD_MODE` - LCD 화면 변경

**command_status ENUM:**
- `PENDING` - 대기
- `RECEIVED` - 수신
- `IN_PROGRESS` - 수행 중
- `COMPLETED` - 완료
- `FAILED` - 실패
- `CANCELLED` - 취소됨

**인덱스:**
- `idx_robot_command_pending` ON (robot_id) WHERE status = 'PENDING'
- `idx_robot_command_issued` ON (issued_at DESC)

---

### 2.15 CONVERSATION (대화 기록)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 대화 ID |
| `robot_id` | BIGINT | FK (ROBOT), NOT NULL | 로봇 |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `voice_original` | TEXT | | STT 원본 결과 |
| `normalized_text` | TEXT | | LLM 정규화 텍스트 |
| `intent` | ENUM | | CHAT, COMMAND |
| `command_type` | ENUM | | SEARCH, SCHEDULE, MOVE |
| `confidence` | FLOAT | | 인식 신뢰도 |
| `duration_seconds` | INT | | 음성 길이 (초) |
| `sentiment` | ENUM | DEFAULT 'NEUTRAL' | POSITIVE, NEUTRAL, NEGATIVE |
| `keywords` | JSONB | | 키워드 배열 |
| `recorded_at` | TIMESTAMP | NOT NULL | 녹음 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**intent ENUM:**
- `CHAT` - 일반 대화
- `COMMAND` - 명령

**command_type ENUM:**
- `SEARCH` - 검색/날씨 조회
- `SCHEDULE` - 일정 등록
- `MOVE` - 로봇 이동

**인덱스:**
- `idx_conversation_elder_recorded` ON (elder_id, recorded_at DESC)
- `idx_conversation_intent` ON (intent)

---

### 2.16 SEARCH_RESULT (검색 결과)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 검색 결과 ID |
| `robot_id` | BIGINT | FK (ROBOT), NOT NULL | 로봇 |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `conversation_id` | BIGINT | FK (CONVERSATION) | 관련 대화 |
| `search_type` | ENUM | NOT NULL | WEATHER, WEB_SEARCH |
| `query` | TEXT | | 검색 쿼리 |
| `content` | TEXT | | 검색 결과 |
| `searched_at` | TIMESTAMP | NOT NULL | 검색 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**search_type ENUM:**
- `WEATHER` - 날씨 조회
- `WEB_SEARCH` - 웹 검색

**인덱스:**
- `idx_search_result_elder` ON (elder_id, searched_at DESC)

---

### 2.17 AI_REPORT (AI 리포트)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 리포트 ID |
| `elder_id` | BIGINT | FK (ELDER), NOT NULL | 어르신 |
| `report_date` | DATE | NOT NULL | 리포트 날짜 |
| `period_start` | DATE | NOT NULL | 분석 기간 시작 |
| `period_end` | DATE | NOT NULL | 분석 기간 종료 |
| `summary` | TEXT | | 요약 |
| `metrics` | JSONB | | 지표 데이터 |
| `top_keywords` | JSONB | | 주요 키워드 |
| `recommendations` | JSONB | | 추천사항 |
| `generated_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성일 |

**metrics JSON 예시:**
```json
{
  "medicationRate": { "value": 92, "change": -1.2, "trend": "DOWN" },
  "emotionStatus": { "value": "POSITIVE", "keywords": ["평온함"] },
  "activityLevel": { "value": "NORMAL", "averageSteps": 2500 },
  "sleepQuality": { "averageHours": 7.2, "trend": "STABLE" }
}
```

**인덱스:**
- `idx_ai_report_elder_date` ON (elder_id, report_date DESC)
- `uk_ai_report_elder_period` UNIQUE ON (elder_id, period_start, period_end)

---

## 3. Enum 정의 (PostgreSQL)

```sql
-- User 관련
CREATE TYPE user_role AS ENUM ('WORKER', 'FAMILY');
CREATE TYPE theme_mode AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- Elder 관련
CREATE TYPE elder_status AS ENUM ('SAFE', 'WARNING', 'DANGER');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');

-- Robot 관련
CREATE TYPE network_status AS ENUM ('CONNECTED', 'DISCONNECTED');
CREATE TYPE lcd_mode AS ENUM ('IDLE', 'GREETING', 'MEDICATION', 'SCHEDULE', 'LISTENING', 'EMERGENCY', 'SLEEP');
CREATE TYPE lcd_emotion AS ENUM ('neutral', 'happy', 'sleep');

-- Room 관련
CREATE TYPE room_type AS ENUM ('LIVING_ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'ENTRANCE', 'DOCK');

-- Medication 관련
CREATE TYPE medication_frequency AS ENUM ('MORNING', 'EVENING', 'BOTH');
CREATE TYPE medication_status AS ENUM ('TAKEN', 'MISSED', 'PENDING');
CREATE TYPE medication_method AS ENUM ('DISPENSER', 'BUTTON', 'MANUAL');

-- Schedule 관련
CREATE TYPE schedule_type AS ENUM ('HOSPITAL', 'MEDICATION', 'PERSONAL', 'FAMILY', 'OTHER');
CREATE TYPE schedule_source AS ENUM ('MANUAL', 'VOICE', 'SYSTEM');
CREATE TYPE schedule_status AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- Activity 관련
CREATE TYPE activity_type AS ENUM (
  'WAKE_UP', 'SLEEP', 'MEDICATION_TAKEN', 'MEDICATION_MISSED',
  'PATROL_COMPLETE', 'OUT_DETECTED', 'RETURN_DETECTED', 'EMERGENCY'
);

-- Emergency 관련
CREATE TYPE emergency_type AS ENUM ('FALL_DETECTED', 'NO_RESPONSE', 'SOS_BUTTON', 'UNUSUAL_PATTERN');
CREATE TYPE emergency_resolution AS ENUM ('PENDING', 'FALSE_ALARM', 'RESOLVED', 'EMERGENCY_CALLED', 'FAMILY_CONTACTED');

-- Notification 관련
CREATE TYPE notification_type AS ENUM ('EMERGENCY', 'MEDICATION', 'SCHEDULE', 'ACTIVITY', 'SYSTEM');

-- Patrol 관련
CREATE TYPE patrol_target AS ENUM ('GAS_VALVE', 'DOOR', 'OUTLET', 'WINDOW', 'MULTI_TAP');
CREATE TYPE patrol_item_status AS ENUM ('ON', 'OFF', 'NORMAL', 'LOCKED', 'UNLOCKED', 'NEEDS_CHECK');
CREATE TYPE patrol_overall_status AS ENUM ('SAFE', 'WARNING');

-- Command 관련
CREATE TYPE command_type AS ENUM ('MOVE_TO', 'START_PATROL', 'RETURN_TO_DOCK', 'SPEAK', 'CHANGE_LCD_MODE');
CREATE TYPE command_status AS ENUM ('PENDING', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Conversation 관련
CREATE TYPE conversation_intent AS ENUM ('CHAT', 'COMMAND');
CREATE TYPE conversation_command_type AS ENUM ('SEARCH', 'SCHEDULE', 'MOVE');
CREATE TYPE sentiment AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- Search 관련
CREATE TYPE search_type AS ENUM ('WEATHER', 'WEB_SEARCH');
```

---

## 4. 관계 요약

```
USER (1) ────< ELDER (N)                    [1:N - 한 사용자가 여러 어르신 담당]
              │
              ├──1:1── ROBOT                [1:1 - 어르신당 로봇 하나]
              │         ├──< ROOM           [1:N - 로봇당 여러 방 등록]
              │         ├──< PATROL_RESULT ──< PATROL_ITEM
              │         ├──< ROBOT_COMMAND
              │         ├──< CONVERSATION
              │         └──< SEARCH_RESULT
              │
              ├──< MEDICATION ──< MEDICATION_RECORD
              ├──< SCHEDULE
              ├──< ACTIVITY
              ├──< EMERGENCY
              ├──< EMERGENCY_CONTACT
              └──< AI_REPORT

USER (1) ────< NOTIFICATION (N)             [1:N - 사용자별 알림]
```

---

## 5. 테이블 개수

| 분류 | 테이블 | 개수 |
|------|--------|------|
| Core | USER, ELDER, EMERGENCY_CONTACT | 3 |
| Robot | ROBOT, ROOM | 2 |
| Health | MEDICATION, MEDICATION_RECORD | 2 |
| Schedule | SCHEDULE | 1 |
| Activity | ACTIVITY, EMERGENCY | 2 |
| Notification | NOTIFICATION | 1 |
| Patrol | PATROL_RESULT, PATROL_ITEM | 2 |
| Command | ROBOT_COMMAND | 1 |
| AI | CONVERSATION, SEARCH_RESULT, AI_REPORT | 3 |
| **Total** | | **17** |

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-29 | 초안 작성 (14개 테이블) |
| 2.0.0 | 2026-02-02 | API 문서 기반 재설계. CONVERSATION, SEARCH_RESULT, ROOM 테이블 추가. ROBOT에 lcd_sub_message, 좌표 필드 추가. PATROL_ITEM target에 MULTI_TAP 추가. SCHEDULE에 normalized_text, confidence 추가. PostgreSQL ENUM 정의 추가. (17개 테이블) |
