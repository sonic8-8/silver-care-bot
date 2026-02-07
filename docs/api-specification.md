# 📡 AI 반려로봇 API 명세서

> **버전**: v1.3.3  
> **작성일**: 2026-01-29  
> **대상**: 백엔드, 프론트엔드, 임베디드, AI 개발자

---

## 1. 개요

### 1.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐│
│  │     동행      │  REST   │   Backend    │  REST   │   Robot System       ││
│  │  Web App     │◀───────▶│   (Spring)   │◀───────▶│ ┌──────────────────┐ ││
│  │  (React)     │         │              │         │ │ Jetson Orin Nano │ ││
│  └──────────────┘         │              │ WebSocket││ (AI/LLM + 통신)   │ ││
│                           │              │◀────────▶│ │       │          │ ││
│                           │              │         │ │  ┌────┴────┐     │ ││
│                           │              │         │ │  │ Arduino │     │ ││
│                           │              │         │ │  │(모터/센서)│     │ ││
│                           │              │         │ │  └─────────┘     │ ││
│                           └──────────────┘         │ └──────────────────┘ ││
│                                  │                 └──────────────────────┘│
│                                  ▼                                          │
│                           ┌──────────────┐                                  │
│                           │ PostgreSQL   │                                  │
│                           │   Database   │                                  │
│                           └──────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **Note**: 백엔드 관점에서 로봇은 **Jetson Orin Nano만 통신 대상**입니다.  
> Arduino는 Jetson 내부에서 Serial/I2C 통신으로 모터/센서를 제어합니다.

### 1.2 AI 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Jetson Orin Nano                              │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐     │   │
│  │  │     Vision AI       │    │          Speech AI               │     │   │
│  │  │  ┌───────────────┐  │    │  ┌─────────────────────────┐    │     │   │
│  │  │  │ YOLO v8 nano  │  │    │  │ OpenWakeWord (호출)      │    │     │   │
│  │  │  │ (객체 탐지)    │  │    │  │         ↓               │    │     │   │
│  │  │  └───────────────┘  │    │  │ Whisper (STT)            │    │     │   │
│  │  │  ┌───────────────┐  │    │  │         ↓               │    │     │   │
│  │  │  │ SORT          │  │    │  │ GPT-5-nano (LLM)         │    │     │   │
│  │  │  │ (객체 추적)    │  │    │  │         ↓               │    │     │   │
│  │  │  └───────────────┘  │    │  │ FastSpeech2 (TTS)        │    │     │   │
│  │  │  ┌───────────────┐  │    │  └─────────────────────────┘    │     │   │
│  │  │  │ 커스텀 모델    │  │    └─────────────────────────────────┘     │   │
│  │  │  │ (상태 판단)    │  │                                            │   │
│  │  │  └───────────────┘  │                                            │   │
│  │  └─────────────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Vision AI 모델 스택

| 타입 | 용도 | 모델 |
|------|------|------|
| 비전 | 객체 탐지 | YOLO v8 nano |
| 비전 | 객체 추적 | SORT |
| 비전 | 상태 판단 | 커스텀 모델 |

#### Speech AI 모델 스택

| 타입 | 용도 | 모델 |
|------|------|------|
| Speech | 웨이크워드 감지 | OpenWakeWord |
| STT | 음성 → 텍스트 | whisper-large-v3-turbo |
| LLM | 대화, 명령 분석 | OPENAI (GPT-5-nano) |
| TTS | 텍스트 → 음성 | FastSpeech2 |

#### Vision AI 기능

| 기능 | 입력 | 출력 | 우선순위 |
|------|------|------|----------|
| 객체 추종 | 센서 데이터 | 거리, 각도 | 🔴 High |
| 정찰 기능 | 센서 데이터 | ON/OFF 상태 (가스밸브, 창문, 멀티탭) | 🔴 High |
| 기상/취침 감지 | 센서 데이터 | WAKE / SLEEP | 🔴 High |
| 낙상 판단 | 센서 데이터 | 낙상 여부 | 🔻 후순위 |
| 투약 여부 | 센서 데이터 | 복용 확인 | 🔻 후순위 |

> **정찰 결과 웹앱 표시**:
> - ON (confidence ≥ 80%): "안전" 🟢
> - OFF (confidence ≥ 80%): "확인 필요" 🟡

#### Speech AI 기능

| 기능 | Intent | CommandType | 설명 |
|------|--------|-------------|------|
| **LCD 화면 전환** | - | - | 호출어 감지 시 화면 전환 |
| 일반 대화 | `CHAT` | `null` | 일상 대화, 감정 분석 (대부분 NEUTRAL) |
| 웹 검색/날씨 | `COMMAND` | `SEARCH` | 날씨, 웹 검색 결과 조회 |
| 일정 등록 | `COMMAND` | `SCHEDULE` | 음성으로 일정 등록 |
| 로봇 이동 | `COMMAND` | `MOVE` | 로봇 이동 명령 |

> **⚠️ 감정 분석 후순위**: 음성 인식 정확도 이슈로 대부분 `NEUTRAL`로 처리

### 1.3 통신 방식

| 통신 유형 | 프로토콜 | 용도 |
|----------|---------|------|
| **REST API** | HTTP/HTTPS | CRUD 작업, 상태 조회, 명령 전송 |
| **WebSocket** | WS/WSS | 실시간 상태 업데이트, 긴급 알림, LCD 미러링 |

### 1.4 우선순위 정의

| Phase | 우선순위 | 기능 |
|-------|---------|------|
| **Phase 1** | 🔴 Critical | 인증, 노인/로봇 등록, 로봇 상태, 긴급 상황 |
| **Phase 2** | 🟡 High | 복약 관리, 알림, 일정 관리, Vision AI, Speech AI |
| **Phase 3** | 🟢 Medium | AI 리포트, 활동 로그, 순찰 피드, Visual SLAM |
| **Phase 4** | 🔵 Low | 안심 지도, 고급 분석 |
| **후순위** | 🔻 Deferred | 낙상 판단, 투약 여부 (Vision), 감정 분석 (Speech), 디스펜서 |

---

## 2. 공통 규격

### 2.1 Base URL

| 환경 | URL |
|------|-----|
| **Client (Web App)** | `https://i14c104.p.ssafy.io/` |
| **API Endpoint** | `https://i14c104.p.ssafy.io/api/` |
| **WebSocket** | `wss://i14c104.p.ssafy.io/ws` |

> **배포 구조**: EC2 + Nginx 리버스 프록시

```nginx
# Nginx 설정 예시 (WebSocket 지원 필요)
location /api {
    proxy_pass http://localhost:8080;
}

location /ws {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 2.2 인증 헤더

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 2.3 공통 응답 형식

**성공 응답**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-29T15:30:00+09:00"
}
```

**에러 응답**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "timestamp": "2026-01-29T15:30:00+09:00"
}
```

### 2.4 공통 에러 코드

| HTTP Status | 에러 코드 | 설명 |
|-------------|----------|------|
| 400 | `INVALID_REQUEST` | 잘못된 요청 형식 |
| 401 | `UNAUTHORIZED` | 인증 실패 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 데이터 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 3. REST API 명세

---

### 3.1 인증 (Auth) 🔴 Phase 1

#### POST `/api/auth/login`
> 보호자/복지사 로그인

**Request**
```json
{
  "email": "worker@example.com",
  "password": "password123"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "name": "김복지",
      "email": "worker@example.com",
      "role": "WORKER",
      "phone": "010-1234-5678"
    }
  }
}
```

---

#### POST `/api/auth/robot/login`
> 로봇 기기 인증

**Request**
```json
{
  "serialNumber": "ROBOT-2026-X82",
  "authCode": "9999"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "robot": {
      "id": 1,
      "serialNumber": "ROBOT-2026-X82",
      "elderId": 2,
      "elderName": "김옥분"
    }
  }
}
```

---

#### POST `/api/auth/signup`
> 회원가입

**Request**
```json
{
  "name": "김복지",
  "email": "worker@example.com",
  "password": "password123",
  "phone": "010-1234-5678",
  "role": "WORKER"
}
```

| role | 설명 |
|------|------|
| `WORKER` | 복지사 |
| `FAMILY` | 가족/보호자 |

---

#### POST `/api/auth/refresh`
> 토큰 갱신

**Request**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 3.2 노인 관리 (Elder) 🔴 Phase 1

#### GET `/api/elders`
> 담당 노인 목록 조회 (복지사용)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "elders": [
      {
        "id": 1,
        "name": "김옥분",
        "age": 80,
        "status": "SAFE",
        "lastActivity": "2026-01-29T10:23:00+09:00",
        "location": "거실",
        "robotConnected": true
      },
      {
        "id": 2,
        "name": "박영자",
        "age": 82,
        "status": "DANGER",
        "lastActivity": "2026-01-29T10:18:00+09:00",
        "location": "거실",
        "emergencyType": "FALL_DETECTED"
      }
    ],
    "summary": {
      "total": 4,
      "safe": 2,
      "warning": 1,
      "danger": 1
    }
  }
}
```

| status | 설명 |
|--------|------|
| `SAFE` | 안전 (정상 활동 중) |
| `WARNING` | 주의 (외출 중, 장시간 미활동 등) |
| `DANGER` | 위험 (낙상, 긴급 상황) |

---

#### GET `/api/elders/{elderId}`
> 특정 노인 상세 정보

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "김옥분",
    "age": 80,
    "status": "SAFE",
    "lastActivity": "2026-01-29T10:23:00+09:00",
    "todaySummary": {
      "wakeUpTime": "07:30",
      "medicationStatus": {
        "taken": 1,
        "total": 2
      },
      "activityLevel": "NORMAL"
    },
    "robot": {
      "id": 1,
      "serialNumber": "ROBOT-2026-X82",
      "batteryLevel": 85,
      "networkStatus": "CONNECTED",
      "currentLocation": "거실",
      "dispenserRemaining": 3
    },
    "emergencyContacts": [
      {
        "priority": 1,
        "name": "김자녀",
        "phone": "010-1234-5678",
        "relation": "자녀"
      }
    ]
  }
}
```

---

#### POST `/api/elders`
> 노인 등록

**Request**
```json
{
  "name": "김옥분",
  "birthDate": "1946-05-15",
  "gender": "FEMALE",
  "address": "서울시 강남구...",
  "emergencyContacts": [
    {
      "name": "김자녀",
      "phone": "010-1234-5678",
      "relation": "자녀",
      "priority": 1
    }
  ]
}
```

---

### 3.3 로봇 상태 및 제어 (Robot) 🔴 Phase 1

#### GET `/api/robots/{robotId}/status`
> 로봇 현재 상태 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "serialNumber": "ROBOT-2026-X82",
    "batteryLevel": 85,
    "isCharging": false,
    "networkStatus": "CONNECTED",
    "currentLocation": "거실",
    "lcdMode": "IDLE",
    "lastSyncAt": "2026-01-29T10:23:00+09:00",
    "dispenser": {
      "remaining": 3,
      "capacity": 7,
      "daysUntilEmpty": 2
    },
    "settings": {
      "morningMedicationTime": "08:00",
      "eveningMedicationTime": "19:00",
      "ttsVolume": 70,
      "patrolTimeRange": {
        "start": "09:00",
        "end": "18:00"
      }
    }
  }
}
```

---

#### POST `/api/robots/{robotId}/commands`
> 로봇 제어 명령 전송

**Request**
```json
{
  "command": "MOVE_TO",
  "params": {
    "location": "LIVING_ROOM"
  }
}
```

| command | params | 설명 |
|---------|--------|------|
| `MOVE_TO` | `{ location: string }` | 특정 위치로 이동 |
| `START_PATROL` | - | 순찰 시작 |
| `RETURN_TO_DOCK` | - | 충전 독으로 복귀 |
| `SPEAK` | `{ message: string }` | TTS 메시지 출력 |
| `CHANGE_LCD_MODE` | `{ mode: string }` | LCD 화면 변경 |

**location 값**
```
LIVING_ROOM, KITCHEN, BEDROOM, BATHROOM, ENTRANCE, DOCK
```

---

#### GET `/api/robots/{robotId}/lcd`
> LCD 미러링 현재 화면 조회 (웹앱 프리뷰용)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "mode": "IDLE",
    "emotion": "neutral",
    "message": "",
    "subMessage": "",
    "nextSchedule": {
      "label": "병원 방문",
      "time": "14:00"
    },
    "lastUpdatedAt": "2026-01-29T10:23:00+09:00"
  }
}
```

| mode | 설명 |
|------|------|
| `IDLE` | 대기 상태 |
| `GREETING` | 인사 (기상/귀가) |
| `MEDICATION` | 복약 알림 |
| `SCHEDULE` | 일정 알림 |
| `LISTENING` | 음성 인식 중 |
| `EMERGENCY` | 긴급 상황 |
| `SLEEP` | 충전/수면 모드 |

---

#### POST `/api/robots/{robotId}/lcd-mode`
> LCD 화면 모드 변경 (Python AI 서비스 → 서버)

**Request**
```json
{
  "mode": "LISTENING",
  "emotion": "neutral",
  "message": "",
  "subMessage": ""
}
```

| emotion | 설명 |
|---------|------|
| `neutral` | 평상시, 긴급 상황 |
| `happy` | 인사, 복약 완료, 일정 알림 |
| `sleep` | 충전 중 |

> **MVP emotion**: 3가지만 사용

**서버 동작:**
1. LCD 상태 DB 업데이트
2. WebSocket으로 `/topic/robot/{robotId}/lcd`에 push

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "mode": "LISTENING",
    "emotion": "neutral",
    "updatedAt": "2026-01-30T10:30:00+09:00"
  }
}
```

---

### 3.4 복약 관리 (Medication) 🟡 Phase 2

#### GET `/api/elders/{elderId}/medications`
> 복약 목록 및 현황 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "weeklyStatus": {
      "taken": 5,
      "missed": 1,
      "total": 6,
      "rate": 83.3
    },
    "dailyStatus": [
      { "day": "MON", "morning": "TAKEN", "evening": "TAKEN" },
      { "day": "TUE", "morning": "TAKEN", "evening": "TAKEN" },
      { "day": "WED", "morning": "TAKEN", "evening": "MISSED" },
      { "day": "THU", "morning": "PENDING", "evening": "PENDING" }
    ],
    "medications": [
      {
        "id": 1,
        "name": "고혈압약",
        "dosage": "1정",
        "frequency": "MORNING",
        "timing": "식후 30분",
        "color": "white"
      },
      {
        "id": 2,
        "name": "당뇨약",
        "dosage": "1정씩",
        "frequency": "BOTH",
        "timing": "식후 30분",
        "color": "yellow"
      }
    ],
    "dispenser": {
      "remaining": 3,
      "capacity": 7,
      "needsRefill": true,
      "daysUntilEmpty": 2
    }
  }
}
```

| frequency | 설명 |
|-----------|------|
| `MORNING` | 아침만 |
| `EVENING` | 저녁만 |
| `BOTH` | 아침/저녁 모두 |

| 복용 상태 | 설명 |
|----------|------|
| `TAKEN` | 복용 완료 |
| `MISSED` | 미복용 |
| `PENDING` | 아직 시간 안 됨 |

---

#### POST `/api/elders/{elderId}/medications`
> 약 추가

**Request**
```json
{
  "name": "혈압약",
  "dosage": "1정",
  "frequency": "MORNING",
  "timing": "식후 30분",
  "startDate": "2026-01-29",
  "endDate": null
}
```

---

#### POST `/api/elders/{elderId}/medications/records`
> 복약 기록 (로봇 → 서버)

**Request** *(로봇에서 전송)*
```json
{
  "medicationId": 1,
  "status": "TAKEN",
  "takenAt": "2026-01-29T08:15:00+09:00",
  "method": "DISPENSER"
}
```

| method | 설명 |
|--------|------|
| `DISPENSER` | 디스펜서 자동 |
| `BUTTON` | LCD 버튼 확인 |
| `MANUAL` | 보호자 수동 입력 |

---

### 3.5 일정 관리 (Schedule) 🟡 Phase 2

#### GET `/api/elders/{elderId}/schedules`
> 일정 목록 조회

**Query Params**
- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "title": "병원 예약",
        "description": "내과 정기검진",
        "datetime": "2026-01-29T14:00:00+09:00",
        "location": "서울대병원",
        "type": "HOSPITAL",
        "source": "MANUAL",
        "status": "UPCOMING",
        "remindBefore": 120
      },
      {
        "id": 2,
        "title": "손자 생일 케이크 사기",
        "datetime": "2026-01-22T00:00:00+09:00",
        "type": "PERSONAL",
        "source": "VOICE",
        "voiceOriginal": "손자 생일 케이크 사달라고 해야겠어",
        "status": "COMPLETED"
      }
    ],
    "voiceSchedules": [
      {
        "id": 2,
        "title": "손자 생일 케이크 사기",
        "datetime": "2026-01-22T00:00:00+09:00",
        "voiceOriginal": "손자 생일 케이크 사달라고 해야겠어"
      }
    ]
  }
}
```

| type | 설명 |
|------|------|
| `HOSPITAL` | 병원 |
| `MEDICATION` | 복약 (자동 생성) |
| `PERSONAL` | 개인 일정 |
| `FAMILY` | 가족 방문 |
| `OTHER` | 기타 |

| source | 설명 |
|--------|------|
| `MANUAL` | 보호자 수동 등록 |
| `VOICE` | 어르신 음성 등록 |
| `SYSTEM` | 시스템 자동 (복약 등) |

---

#### POST `/api/elders/{elderId}/schedules`
> 일정 등록

**Request**
```json
{
  "title": "병원 예약",
  "description": "내과 정기검진",
  "datetime": "2026-01-29T14:00:00+09:00",
  "location": "서울대병원",
  "type": "HOSPITAL",
  "remindBefore": 120
}
```

---

#### POST `/api/elders/{elderId}/schedules/voice`
> 음성 일정 등록 (로봇 AI → 서버)

**Request** *(Jetson Orin에서 처리 후 전송)*
```json
{
  "voiceOriginal": "손자아아 생일 케이크으 사달라고 해야게써",
  "parsedData": {
    "normalizedText": "손자 생일 케이크 사달라고 해야겠어",
    "title": "손자 생일 케이크 사기",
    "datetime": "2026-01-22T00:00:00+09:00",
    "type": "PERSONAL",
    "confidence": 0.92,
    "intent": "COMMAND",
    "commandType": "SCHEDULE"
  },
  "recordedAt": "2026-01-20T15:30:00+09:00"
}
```

| intent | commandType | 설명 |
|--------|-------------|------|
| `CHAT` | `null` | 일반 대화 |
| `COMMAND` | `SEARCH` | 웹 검색, 날씨 조회 |
| `COMMAND` | `SCHEDULE` | 일정 등록 |
| `COMMAND` | `MOVE` | 로봇 이동 명령 |

---

### 3.6 알림 (Notification) 🟡 Phase 2

#### GET `/api/notifications`
> 알림 목록 조회

**Query Params**
- `unreadOnly`: true/false (기본: false)
- `elderId`: 특정 노인 필터 (선택)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "unreadCount": 3,
    "notifications": [
      {
        "id": 1,
        "type": "EMERGENCY",
        "title": "낙상 감지",
        "message": "거실에서 낙상 감지됨. 즉시 확인이 필요합니다.",
        "elderId": 1,
        "elderName": "김옥분",
        "isRead": false,
        "createdAt": "2026-01-29T10:23:00+09:00",
        "actionUrl": "/emergency/1"
      },
      {
        "id": 2,
        "type": "MEDICATION",
        "title": "약 복용 완료",
        "message": "아침 약(고혈압약) 복용을 완료했습니다.",
        "elderId": 1,
        "elderName": "김옥분",
        "isRead": false,
        "createdAt": "2026-01-29T08:15:00+09:00"
      }
    ]
  }
}
```

| type | 설명 |
|------|------|
| `EMERGENCY` | 긴급 (낙상, 미응답 등) |
| `MEDICATION` | 복약 관련 |
| `SCHEDULE` | 일정 알림 |
| `ACTIVITY` | 활동 (기상, 외출 등) |
| `SYSTEM` | 시스템 (배터리, 연결 등) |

---

#### PATCH `/api/notifications/{notificationId}/read`
> 알림 읽음 처리

---

#### PATCH `/api/notifications/read-all`
> 모든 알림 읽음 처리

---

### 3.7 활동 로그 및 AI 리포트 (History) 🟢 Phase 3

#### GET `/api/elders/{elderId}/activities`
> 활동 로그 조회

**Query Params**
- `date`: 날짜 (YYYY-MM-DD)
  - 로컬 날짜 기준으로 해석 (UTC 변환 전제 아님)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "date": "2026-01-29",
    "activities": [
      {
        "id": 1,
        "type": "WAKE_UP",
        "title": "기상 감지",
        "description": "침실에서 움직임 감지",
        "timestamp": "2026-01-29T07:30:00+09:00",
        "location": "침실"
      },
      {
        "id": 2,
        "type": "MEDICATION_TAKEN",
        "title": "아침 약 복용",
        "description": "디스펜서 작동 완료",
        "timestamp": "2026-01-29T08:15:00+09:00"
      },
      {
        "id": 3,
        "type": "PATROL_COMPLETE",
        "title": "순찰 완료",
        "description": "가스밸브, 전열기구 정상",
        "timestamp": "2026-01-29T09:30:00+09:00"
      },
      {
        "id": 4,
        "type": "OUT_DETECTED",
        "title": "외출 감지",
        "description": "현관문 열림 확인됨",
        "timestamp": "2026-01-29T10:00:00+09:00"
      }
    ]
  }
}
```

> `activities[].title`, `activities[].description`, `activities[].location`은 상황에 따라 `null`일 수 있습니다.

| type | 설명 |
|------|------|
| `WAKE_UP` | 기상 |
| `SLEEP` | 취침 |
| `MEDICATION_TAKEN` | 복약 완료 |
| `MEDICATION_MISSED` | 복약 누락 |
| `PATROL_COMPLETE` | 순찰 완료 |
| `OUT_DETECTED` | 외출 감지 |
| `RETURN_DETECTED` | 귀가 감지 |
| `CONVERSATION` | 대화 |
| `EMERGENCY` | 긴급 상황 |

---

#### GET `/api/elders/{elderId}/reports/weekly`
> AI 주간 리포트 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-20",
      "end": "2026-01-26"
    },
    "summary": "이번 주는 전반적으로 안정적인 상태입니다. 복약 순응도가 지난주 대비 5% 상승했습니다.",
    "metrics": {
      "medicationRate": {
        "value": 92,
        "change": -1.2,
        "trend": "DOWN"
      },
      "emotionStatus": {
        "value": "POSITIVE",
        "keywords": ["평온함", "기쁨"]
      },
      "activityLevel": {
        "value": "NORMAL",
        "averageSteps": 2500
      },
      "sleepQuality": {
        "averageHours": 7.2,
        "trend": "STABLE"
      }
    },
    "topKeywords": [
      { "word": "손자", "count": 23 },
      { "word": "건강", "count": 18 },
      { "word": "날씨", "count": 12 },
      { "word": "식사", "count": 8 }
    ],
    "recommendations": [
      "수분 섭취를 더 자주 권유하세요.",
      "오후 산책 시간을 추가하면 좋겠습니다."
    ],
    "generatedAt": "2026-01-27T00:00:00+09:00"
  }
}
```

---

### 3.8 순찰 피드 (Patrol) 🟢 Phase 3

#### GET `/api/elders/{elderId}/patrol/latest`
> 최근 순찰 결과 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "lastPatrolAt": "2026-01-29T09:35:00+09:00",
    "items": [
      {
        "id": 1,
        "target": "GAS_VALVE",
        "label": "가스밸브",
        "status": "NORMAL",
        "checkedAt": "2026-01-29T09:30:00+09:00",
        "imageUrl": null
      },
      {
        "id": 2,
        "target": "DOOR",
        "label": "현관문",
        "status": "LOCKED",
        "checkedAt": "2026-01-29T09:32:00+09:00"
      },
      {
        "id": 3,
        "target": "OUTLET",
        "label": "콘센트",
        "status": "NORMAL",
        "checkedAt": "2026-01-29T09:35:00+09:00"
      }
    ]
  }
}
```

> 순찰 이력이 없는 경우 `lastPatrolAt`은 `null`이고 `items`는 빈 배열일 수 있습니다.

| target | 설명 |
|--------|------|
| `GAS_VALVE` | 가스밸브 |
| `DOOR` | 현관문 |
| `OUTLET` | 콘센트 |
| `WINDOW` | 창문 |
| `APPLIANCE` | 전열기구 (임베디드 `patrol/report` 계약) |
| `MULTI_TAP` | 멀티탭 |

> `APPLIANCE`(임베디드 순찰 보고)와 `MULTI_TAP`(Vision AI 정찰 결과)가 병행될 수 있으므로 소비 측 파서는 둘 다 허용해야 합니다.

| status | 설명 |
|--------|------|
| `NORMAL` | 정상 |
| `LOCKED` | 잠김 (문/창문) |
| `UNLOCKED` | 열림 (문/창문) |
| `ON` | 켜짐 (가전) |
| `OFF` | 꺼짐 (가전) |
| `NEEDS_CHECK` | 확인 필요 |

---

#### POST `/api/robots/{robotId}/patrol/report`
> 순찰 결과 보고 (로봇 → 서버)

**Request**
```json
{
  "patrolId": "patrol-20260129-0930",
  "startedAt": "2026-01-29T09:30:00+09:00",
  "completedAt": "2026-01-29T09:35:00+09:00",
  "items": [
    {
      "target": "GAS_VALVE",
      "status": "NORMAL",
      "confidence": 0.95
    },
    {
      "target": "DOOR",
      "status": "LOCKED",
      "confidence": 0.98
    }
  ]
}
```

| target | 설명 |
|--------|------|
| `GAS_VALVE` | 가스밸브 |
| `DOOR` | 현관문 |
| `OUTLET` | 콘센트 |
| `WINDOW` | 창문 |
| `APPLIANCE` | 전열기구 |

| status | 설명 |
|--------|------|
| `NORMAL` | 정상 |
| `LOCKED` | 잠김 |
| `UNLOCKED` | 열림 |
| `NEEDS_CHECK` | 확인 필요 |

---

### 3.9 안심 지도 (Map) 🔵 Phase 4

#### GET `/api/elders/{elderId}/map`
> 안심 지도 데이터 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "mapId": "map-elder-1-v3",
    "lastUpdatedAt": "2026-01-28T12:00:00+09:00",
    "rooms": [
      {
        "id": "room-1",
        "name": "침실",
        "type": "BEDROOM",
        "bounds": { "x": 0, "y": 0, "width": 300, "height": 250 }
      },
      {
        "id": "room-2",
        "name": "거실",
        "type": "LIVING_ROOM",
        "bounds": { "x": 300, "y": 0, "width": 400, "height": 300 }
      },
      {
        "id": "room-3",
        "name": "화장실",
        "type": "BATHROOM",
        "bounds": { "x": 0, "y": 250, "width": 150, "height": 150 }
      },
      {
        "id": "room-4",
        "name": "주방",
        "type": "KITCHEN",
        "bounds": { "x": 300, "y": 300, "width": 200, "height": 200 }
      }
    ],
    "robotPosition": {
      "x": 450,
      "y": 150,
      "roomId": "room-2",
      "heading": 45
    },
    "mapHtml": "<div class='room-layout'>...</div>"
  }
}
```

---

#### POST `/api/robots/{robotId}/map`
> 맵 데이터 업로드 (로봇 Visual SLAM → 서버)

**Request** *(multipart/form-data)*

| 필드 | 타입 | 설명 |
|------|------|------|
| `mapImage` | File (PGM) | 맵 이미지 (~300KB) |
| `mapConfig` | File (YAML) | 맵 설정 파일 |
| `rooms` | JSON String | 방 정보 배열 (선택) |

**YAML 설정 파일 예시:**
```yaml
image: maptest1.pgm
resolution: 0.05
origin: [-4.11898, -3.58054, 0.0]
negate: 0
occupied_thresh: 0.5
free_thresh: 0.196
```

**rooms JSON 예시:**
```json
[
  { "id": "LIVING_ROOM", "name": "거실", "x": 100, "y": 200 },
  { "id": "KITCHEN", "name": "주방", "x": 300, "y": 150 },
  { "id": "BEDROOM", "name": "침실", "x": 450, "y": 300 }
]
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "mapId": "map-001",
    "uploadedAt": "2026-01-30T11:50:00+09:00",
    "rooms": [
      { "id": "LIVING_ROOM", "name": "거실" },
      { "id": "KITCHEN", "name": "주방" }
    ]
  }
}
```

---

#### PUT `/api/robots/{robotId}/location`
> 로봇 위치 업데이트 (로봇 → 서버, 2초 간격 권장)

**Request**
```json
{
  "x": 450,
  "y": 150,
  "roomId": "LIVING_ROOM",
  "heading": 45,
  "timestamp": "2026-01-29T10:23:00+09:00"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "received": true,
    "serverTime": "2026-01-29T10:23:01+09:00"
  }
}
```

---

#### GET `/api/robots/{robotId}/rooms`
> 방 목록 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "rooms": [
      { "id": "LIVING_ROOM", "name": "거실", "x": 100, "y": 200 },
      { "id": "KITCHEN", "name": "주방", "x": 300, "y": 150 },
      { "id": "BEDROOM", "name": "침실", "x": 450, "y": 300 }
    ]
  }
}
```

---

#### POST `/api/robots/{robotId}/rooms`
> 방 등록 (현재 로봇 위치 기준)

**Request**
```json
{
  "name": "거실",
  "useCurrentLocation": true
}
```

또는 좌표 직접 지정:
```json
{
  "id": "LIVING_ROOM",
  "name": "거실",
  "x": 450,
  "y": 150,
  "useCurrentLocation": false
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "LIVING_ROOM",
    "name": "거실",
    "x": 450,
    "y": 150,
    "createdAt": "2026-01-30T12:00:00+09:00"
  }
}
```

---

#### PUT `/api/robots/{robotId}/rooms/{roomId}`
> 방 정보 수정

**Request**
```json
{
  "name": "안방"
}
```

---

#### DELETE `/api/robots/{robotId}/rooms/{roomId}`
> 방 삭제

**Response** `204 No Content`

---

### 3.10 긴급 상황 (Emergency) 🔴 Phase 1

#### POST `/api/robots/{robotId}/emergency`
> 긴급 상황 보고 (로봇 → 서버)

**Request**
```json
{
  "type": "FALL_DETECTED",
  "location": "거실",
  "detectedAt": "2026-01-29T10:23:00+09:00",
  "confidence": 0.92,
  "sensorData": {
    "accelerometer": { "x": 0.2, "y": 9.8, "z": 0.1 },
    "impactForce": 2.5
  }
}
```

| type | 설명 |
|------|------|
| `FALL_DETECTED` | 낙상 감지 |
| `NO_RESPONSE` | 응답 없음 (N분 이상) |
| `SOS_BUTTON` | SOS 버튼 누름 |
| `UNUSUAL_PATTERN` | 비정상 행동 패턴 |

---

#### PATCH `/api/emergencies/{emergencyId}/resolve`
> 긴급 상황 해제

**Request**
```json
{
  "resolution": "FALSE_ALARM",
  "note": "어르신이 직접 괜찮다고 응답함"
}
```

| resolution | 설명 |
|------------|------|
| `FALSE_ALARM` | 오인 감지 |
| `RESOLVED` | 상황 해결됨 |
| `EMERGENCY_CALLED` | 119 신고 완료 |
| `FAMILY_CONTACTED` | 보호자 연락 완료 |

---

### 3.11 설정 (Settings)

#### GET `/api/users/me/settings`
> 사용자 설정 조회

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": {
      "emergency": true,
      "medication": true,
      "daily": false,
      "email": false
    },
    "theme": "SYSTEM"
  }
}
```

---

#### PATCH `/api/users/me/settings`
> 사용자 설정 변경

**Request**
```json
{
  "notifications": {
    "emergency": true,
    "medication": true,
    "daily": false,
    "email": false
  },
  "theme": "DARK"
}
```

---

#### PATCH `/api/robots/{robotId}/settings`
> 로봇 설정 변경

**Request**
```json
{
  "morningMedicationTime": "08:00",
  "eveningMedicationTime": "19:00",
  "ttsVolume": 70,
  "patrolTimeRange": {
    "start": "09:00",
    "end": "18:00"
  }
}
```

---

### 3.12 AI API (Speech AI) 🟡 Phase 2

#### POST `/api/robots/{robotId}/conversations`
> 대화 기록 저장 (로봇 AI → 서버)

**Request**
```json
{
  "voiceOriginal": "오느을 날씨이 좋네요오",
  "parsedData": {
    "normalizedText": "오늘 날씨 좋네요",
    "intent": "CHAT",
    "commandType": null,
    "confidence": 0.88,
    "duration": 120,
    "sentiment": "NEUTRAL",
    "keywords": ["날씨", "좋다"]
  },
  "recordedAt": "2026-01-30T10:30:00+09:00"
}
```

| 필드 | 설명 |
|------|------|
| `voiceOriginal` | STT 원본 결과 (깨진 텍스트 포함) |
| `normalizedText` | LLM이 정규화한 텍스트 |

| sentiment | 설명 |
|-----------|------|
| `POSITIVE` | 긍정적 |
| `NEUTRAL` | 중립 (대부분 이 값으로 처리) |
| `NEGATIVE` | 부정적 |

> ⚠️ **감정 분석 후순위**: 음성 인식 정확도 이슈로 대부분 `NEUTRAL`로 저장됨

---

#### POST `/api/robots/{robotId}/search-results`
> 검색 결과 저장 (로봇 AI → 서버)

**Request**
```json
{
  "voiceOriginal": "오느을 날씨가아 어때애?",
  "parsedData": {
    "normalizedText": "오늘 날씨가 어때?",
    "intent": "COMMAND",
    "commandType": "SEARCH",
    "confidence": 0.92,
    "duration": 8,
    "sentiment": "NEUTRAL",
    "keywords": ["날씨"]
  },
  "recordedAt": "2026-01-30T10:30:00+09:00",
  "searchedData": {
    "type": "WEATHER",
    "content": "오늘 서울 날씨는 맑음, 최고 5도, 최저 -3도입니다."
  }
}
```

| searchedData.type | 설명 |
|-------------------|------|
| `WEATHER` | 날씨 조회 |
| `WEB_SEARCH` | 웹 검색 |

---

### 3.13 AI API (Vision AI) 🟡 Phase 2

#### POST `/api/robots/{robotId}/patrol-results`
> 정찰 결과 저장 (로봇 Vision AI → 서버)

**Request**
```json
{
  "patrolledAt": "2026-01-30T09:30:00+09:00",
  "results": [
    { "target": "GAS_VALVE", "status": "ON", "confidence": 0.92, "label": "안전" },
    { "target": "WINDOW", "status": "OFF", "confidence": 0.85, "label": "확인 필요" },
    { "target": "MULTI_TAP", "status": "ON", "confidence": 0.88, "label": "안전" }
  ],
  "overallStatus": "WARNING"
}
```

| target | 설명 |
|--------|------|
| `GAS_VALVE` | 가스밸브 |
| `WINDOW` | 창문 |
| `MULTI_TAP` | 멀티탭 |

| status | 웹앱 표시 | 조건 |
|--------|----------|------|
| `ON` | 안전 🟢 | confidence ≥ 80% |
| `OFF` | 확인 필요 🟡 | confidence ≥ 80% |

| overallStatus | 설명 |
|---------------|------|
| `SAFE` | 모든 항목 안전 |
| `WARNING` | 하나 이상 확인 필요 |

---

#### POST `/api/robots/{robotId}/sleep-wake`
> 기상/취침 감지 기록 (로봇 Vision AI → 서버)

**Request**
```json
{
  "status": "WAKE",
  "detectedAt": "2026-01-30T07:30:00+09:00",
  "confidence": 0.91
}
```

| status | 설명 |
|--------|------|
| `WAKE` | 기상 감지 |
| `SLEEP` | 취침 감지 (누울 경우) |

---

### 3.14 복약 알림 (Medication Reminder) 🔻 후순위

> ⚠️ 디스펜서 연동은 후순위 기능입니다.

#### POST `/api/robots/{robotId}/medication-reminder`
> 복약 알림 시작 (로봇 → 서버)

**Request**
```json
{
  "elderId": 1,
  "medicationId": 1,
  "startedAt": "2026-01-30T08:00:00+09:00"
}
```

---

#### POST `/api/robots/{robotId}/medication-response`
> 어르신 복약 응답 기록 (로봇 → 서버)

**Request**
```json
{
  "elderId": 1,
  "medicationId": 1,
  "action": "TAKE",
  "respondedAt": "2026-01-30T08:05:00+09:00"
}
```

| action | 설명 | 후속 처리 |
|--------|------|----------|
| `TAKE` | 지금 먹을게요 | 디스펜서 약 배출 → 복약 완료 기록 |
| `LATER` | 나중에요 | N분 후 다시 알림 |

---

## 4. WebSocket 명세

### 4.1 연결

```
WebSocket URL: wss://i14c104.p.ssafy.io/ws
Connection: Authorization header 또는 query param token
```

**연결 예시**
```javascript
const ws = new WebSocket('wss://i14c104.p.ssafy.io/ws?token=eyJhbG...');
```

### 4.2 메시지 형식

```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... },
  "timestamp": "2026-01-29T10:23:00+09:00"
}
```

### 4.3 서버 → 클라이언트 메시지

#### `ROBOT_STATUS_UPDATE`
> 로봇 상태 실시간 업데이트

```json
{
  "type": "ROBOT_STATUS_UPDATE",
  "payload": {
    "robotId": 1,
    "elderId": 1,
    "batteryLevel": 84,
    "networkStatus": "CONNECTED",
    "currentLocation": "주방",
    "lcdMode": "IDLE"
  }
}
```

---

#### `LCD_MODE_CHANGE`
> LCD 화면 모드 변경 (서버 → LCD 웹앱)

**구독 토픽**: `/topic/robot/{robotId}/lcd`

> LCD 웹앱(React)은 이 토픽을 구독하여 실시간으로 화면을 전환합니다.
> Python AI가 `POST /api/robots/{robotId}/lcd-mode` 호출 시 서버가 이 메시지를 push합니다.

```json
{
  "type": "LCD_MODE_CHANGE",
  "payload": {
    "robotId": 1,
    "mode": "MEDICATION",
    "emotion": "happy",
    "message": "할머니~ 약 드실 시간이에요!",
    "subMessage": "아침약 (고혈압, 당뇨)"
  }
}
```

| emotion | 설명 |
|---------|------|
| `neutral` | 평상시, 긴급 상황 |
| `happy` | 인사, 복약 완료, 일정 알림 |
| `sleep` | 충전 중 |

---

#### `EMERGENCY_ALERT`
> 긴급 상황 알림 (최우선 처리)

```json
{
  "type": "EMERGENCY_ALERT",
  "payload": {
    "emergencyId": 123,
    "elderId": 1,
    "elderName": "김옥분",
    "type": "FALL_DETECTED",
    "location": "거실",
    "detectedAt": "2026-01-29T10:23:00+09:00"
  }
}
```

---

#### `NOTIFICATION`
> 일반 알림

```json
{
  "type": "NOTIFICATION",
  "payload": {
    "id": 456,
    "type": "MEDICATION",
    "title": "약 복용 완료",
    "message": "아침 약 복용이 완료되었습니다.",
    "elderId": 1
  }
}
```

---

#### `ELDER_STATUS_UPDATE`
> 노인 상태 변경

```json
{
  "type": "ELDER_STATUS_UPDATE",
  "payload": {
    "elderId": 1,
    "status": "SAFE",
    "lastActivity": "2026-01-29T10:25:00+09:00",
    "location": "주방"
  }
}
```

---

### 4.4 클라이언트 → 서버 메시지

#### `SUBSCRIBE`
> 특정 노인/로봇 구독

```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "elderIds": [1, 2, 3],
    "robotIds": [1]
  }
}
```

---

#### `PING`
> 연결 유지

```json
{
  "type": "PING"
}
```

**응답**
```json
{
  "type": "PONG"
}
```

---

## 5. 로봇 → 서버 전용 API

> 로봇(임베디드/AI)에서만 사용하는 API

### 5.1 상태 동기화

#### POST `/api/robots/{robotId}/sync`
> 로봇 상태 일괄 동기화 (주기적 heartbeat)

**Request**
```json
{
  "batteryLevel": 85,
  "isCharging": false,
  "networkStrength": -45,
  "currentLocation": {
    "roomId": "room-2",
    "x": 450,
    "y": 150,
    "heading": 45
  },
  "lcdState": {
    "mode": "IDLE",
    "emotion": "neutral",
    "message": ""
  },
  "dispenser": {
    "remaining": 3
  },
  "sensors": {
    "temperature": 24.5,
    "humidity": 45
  },
  "timestamp": "2026-01-29T10:23:00+09:00"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "pendingCommands": [
      {
        "commandId": "cmd-123",
        "command": "MOVE_TO",
        "params": { "location": "KITCHEN" },
        "issuedAt": "2026-01-29T10:22:00+09:00"
      }
    ],
    "scheduleReminders": [
      {
        "scheduleId": 1,
        "title": "병원 방문",
        "datetime": "2026-01-29T14:00:00+09:00",
        "remindAt": "2026-01-29T12:00:00+09:00"
      }
    ],
    "medications": [
      {
        "medicationId": 2,
        "scheduledAt": "2026-01-29T19:00:00+09:00",
        "name": "저녁약 (당뇨)"
      }
    ],
    "serverTime": "2026-01-29T10:23:01+09:00"
  }
}
```

---

### 5.2 이벤트 보고

#### POST `/api/robots/{robotId}/events`
> 이벤트 보고 (활동 감지 등)

**Request**
```json
{
  "events": [
    {
      "type": "WAKE_UP",
      "detectedAt": "2026-01-29T07:30:00+09:00",
      "location": "침실",
      "confidence": 0.88
    },
    {
      "type": "OUT_DETECTED",
      "detectedAt": "2026-01-29T10:00:00+09:00",
      "location": "현관"
    }
  ]
}
```

| type | 설명 |
|------|------|
| `WAKE_UP` | 기상 감지 |
| `SLEEP` | 취침 감지 |
| `OUT_DETECTED` | 외출 감지 |
| `RETURN_DETECTED` | 귀가 감지 |

> 대화 기록은 `POST /api/robots/{robotId}/conversations` API를 사용합니다.

---

### 5.3 명령 응답

#### POST `/api/robots/{robotId}/commands/{commandId}/ack`
> 명령 수행 결과 보고

**Request**
```json
{
  "status": "COMPLETED",
  "completedAt": "2026-01-29T10:25:00+09:00",
  "result": {
    "arrivedLocation": "KITCHEN",
    "travelTime": 30
  }
}
```

| status | 설명 |
|--------|------|
| `RECEIVED` | 명령 수신 |
| `IN_PROGRESS` | 수행 중 |
| `COMPLETED` | 완료 |
| `FAILED` | 실패 |
| `CANCELLED` | 취소됨 |

---

## 6. 데이터 모델 요약

### 6.1 핵심 엔티티

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATA MODELS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User (1) ───────< Elder (N) ───────< Robot (1)                 │
│    │                  │                  │                       │
│    │                  ├──< Medication    ├──< PatrolResult       │
│    │                  ├──< Schedule      ├──< Event              │
│    │                  ├──< Activity      └──< Command            │
│    │                  └──< Emergency                             │
│    │                                                             │
│    └──< Notification                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Enum 정리

| Enum | 값 |
|------|-----|
| `UserRole` | WORKER, FAMILY |
| `ElderStatus` | SAFE, WARNING, DANGER |
| `RobotLcdMode` | IDLE, GREETING, MEDICATION, SCHEDULE, LISTENING, EMERGENCY, SLEEP |
| `Emotion` | neutral, happy, sleep (MVP) |
| `MedicationFrequency` | MORNING, EVENING, BOTH |
| `MedicationStatus` | TAKEN, MISSED, PENDING |
| `ScheduleType` | HOSPITAL, MEDICATION, PERSONAL, FAMILY, OTHER |
| `ScheduleSource` | MANUAL, VOICE, SYSTEM |
| `NotificationType` | EMERGENCY, MEDICATION, SCHEDULE, ACTIVITY, SYSTEM |
| `ActivityType` | WAKE_UP, SLEEP, MEDICATION_TAKEN, MEDICATION_MISSED, PATROL_COMPLETE, OUT_DETECTED, RETURN_DETECTED, CONVERSATION, EMERGENCY |
| `PatrolReportTarget` | GAS_VALVE, DOOR, OUTLET, WINDOW, APPLIANCE |
| `PatrolResultTarget` | GAS_VALVE, WINDOW, MULTI_TAP |
| `PatrolFeedTarget` | GAS_VALVE, DOOR, OUTLET, WINDOW, APPLIANCE, MULTI_TAP |
| `PatrolReportStatus` | NORMAL, LOCKED, UNLOCKED, NEEDS_CHECK |
| `PatrolResultStatus` | ON, OFF |
| `PatrolOverallStatus` | SAFE, WARNING |
| `EmergencyType` | FALL_DETECTED, NO_RESPONSE, SOS_BUTTON, UNUSUAL_PATTERN |
| `CommandType` | MOVE_TO, START_PATROL, RETURN_TO_DOCK, SPEAK, CHANGE_LCD_MODE |
| `CommandStatus` | RECEIVED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED |
| `Intent` | CHAT, COMMAND |
| `VoiceCommandType` | SEARCH, SCHEDULE, MOVE |
| `Sentiment` | POSITIVE, NEUTRAL, NEGATIVE |
| `SearchType` | WEATHER, WEB_SEARCH |
| `SleepWakeStatus` | WAKE, SLEEP |
| `MedicationAction` | TAKE, LATER |

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-29 | 초안 작성 |
| 1.1.0 | 2026-01-30 | AI 시스템 아키텍처 추가 (Vision AI, Speech AI), 모델 스택 정보 추가, 새로운 AI API 추가 (conversations, search-results, patrol-results, sleep-wake), Visual SLAM API 수정 (맵 업로드 PGM/YAML, 방 관리 CRUD), 후순위 기능 표시 (낙상, 투약, 감정 분석, 디스펜서) |
| 1.2.0 | 2026-01-30 | MVP 단순화: Emotion을 neutral, happy, sleep 3가지로 축소 |
| 1.3.0 | 2026-01-30 | LCD 화면 전환 아키텍처 수정: REST API + WebSocket 기반으로 변경, `POST /api/robots/{robotId}/lcd-mode` API 추가, WebSocket 토픽 `/topic/robot/{robotId}/lcd` 명세 추가 |
| 1.3.1 | 2026-01-30 | Speech AI API에 `normalizedText` 필드 추가 (STT 원본 → 정규화된 텍스트) |
| 1.3.2 | 2026-02-07 | Phase 3 계약 정합성 보정: `lastPatrolAt`/`activities` nullable 규칙 명시, `date` 쿼리 로컬 날짜 해석 기준 추가 |
| 1.3.3 | 2026-02-07 | `api-embedded.md`/`api-ai.md` 우선 기준 반영: Speech AI 기능표에 LCD 전환 추가, 로봇 이벤트 타입 정렬, 순찰 target 계약(`APPLIANCE`/`MULTI_TAP`) 병행 규칙 명시, 임베디드 담당 API 목록 보강 |

---

## 8. 부록: 팀별 담당 API

### 임베디드 (로봇)
- `POST /api/auth/robot/login`
- `POST /api/robots/{robotId}/sync`
- `POST /api/robots/{robotId}/events`
- `POST /api/robots/{robotId}/emergency`
- `POST /api/elders/{elderId}/medications/records`
- `POST /api/robots/{robotId}/patrol/report`
- `PUT /api/robots/{robotId}/location`
- `POST /api/robots/{robotId}/map`
- `GET /api/robots/{robotId}/rooms`
- `POST /api/robots/{robotId}/rooms`
- `PUT /api/robots/{robotId}/rooms/{roomId}`
- `DELETE /api/robots/{robotId}/rooms/{roomId}`
- `POST /api/robots/{robotId}/commands/{commandId}/ack`
- `POST /api/robots/{robotId}/lcd-mode`
- WebSocket 연결 및 수신

### AI (Jetson Orin) - Vision AI
- `POST /api/robots/{robotId}/patrol-results` (정찰 결과)
- `POST /api/robots/{robotId}/sleep-wake` (기상/취침 감지)
- `POST /api/robots/{robotId}/map` (맵 업로드)
- 객체 추종 (센서 → 거리, 각도)

### AI (Jetson Orin) - Speech AI
- `POST /api/robots/{robotId}/lcd-mode` (LCD 화면 전환) ⭐ 신규
- `POST /api/robots/{robotId}/conversations` (대화 기록)
- `POST /api/robots/{robotId}/search-results` (검색 결과)
- `POST /api/elders/{elderId}/schedules/voice` (음성 일정)
- `POST /api/elders/{elderId}/medications/records` (복약 기록)

### 백엔드 (Spring)
- 모든 REST API 구현
- WebSocket 서버 구현
- 방 관리 CRUD (`/api/robots/{robotId}/rooms`)

### 프론트엔드 (React)
- 모든 GET API 호출
- 일부 POST/PATCH API (사용자 입력)
- 방 등록 UI (현재 로봇 위치 기준)
- WebSocket 클라이언트 구현

