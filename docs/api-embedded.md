# 🤖 임베디드 팀 API 가이드

> **대상**: Jetson Orin Nano 개발자
> **버전**: v1.3.0 | **작성일**: 2026-01-30
> **전체 명세**: [api-specification.md](./api-specification.md)

---

## 1. 개요

로봇(Jetson)은 백엔드와 **REST API + WebSocket**으로 통신합니다.

```
┌─────────────────────────────┐
│      Robot System           │
│  ┌───────────────────────┐  │
│  │   Jetson Orin Nano    │──────▶ Backend (REST/WebSocket)
│  │         │             │  │
│  │    ┌────┴────┐        │  │
│  │    │ Arduino │        │  │  ← 내부 Serial/I2C
│  │    └─────────┘        │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

> **Note**: 백엔드 관점에서 로봇은 **Jetson Orin Nano만 통신 대상**입니다.
> Arduino는 Jetson 내부에서 Serial/I2C 통신으로 모터/센서를 제어합니다.

### 통신 URL
| 용도 | URL |
|------|-----|
| REST API | `https://i14c104.p.ssafy.io/api/` |
| WebSocket | `wss://i14c104.p.ssafy.io/ws` |

---

## 2. 인증

### POST `/api/auth/robot/login`
> 로봇 기기 인증 (앱 시작 시 1회 호출)

**Request**
```json
{
  "serialNumber": "ROBOT-2026-X82",
  "authCode": "9999"
}
```

**Response**
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

> `accessToken`을 저장하고 모든 요청에 헤더로 포함:
> ```
> Authorization: Bearer {accessToken}
> ```

---

## 3. 주기적 상태 동기화

### POST `/api/robots/{robotId}/sync`
> **주기**: 10~30초마다 호출 권장

로봇 상태를 서버에 전송하고, 서버로부터 대기 중인 명령과 일정을 수신합니다.

**Request**
```json
{
  "batteryLevel": 85,
  "isCharging": false,
  "networkStrength": -45,
  "currentLocation": {
    "roomId": "LIVING_ROOM",
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

**Response**
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

## 4. 이벤트 보고

### POST `/api/robots/{robotId}/events`
> 활동 감지 이벤트 발생 시 전송

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

**이벤트 타입**
| type | 설명 |
|------|------|
| `WAKE_UP` | 기상 감지 |
| `SLEEP` | 취침 감지 |
| `OUT_DETECTED` | 외출 감지 |
| `RETURN_DETECTED` | 귀가 감지 |

> **Note**: 대화 기록은 AI 팀이 `POST /api/robots/{robotId}/conversations` 사용

---

## 5. 긴급 상황 보고

### POST `/api/robots/{robotId}/emergency`
> **최우선 처리** - 낙상 등 감지 즉시 호출

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

**긴급 타입**
| type | 설명 |
|------|------|
| `FALL_DETECTED` | 낙상 감지 |
| `NO_RESPONSE` | 응답 없음 |
| `SOS_BUTTON` | SOS 버튼 |
| `UNUSUAL_PATTERN` | 비정상 패턴 |

---

## 6. 복약 기록 (디스펜서 연동 시)

### POST `/api/elders/{elderId}/medications/records`
> 복약 완료/거부 시 전송

**Request**
```json
{
  "medicationId": 1,
  "status": "TAKEN",
  "takenAt": "2026-01-29T08:15:00+09:00",
  "method": "DISPENSER"
}
```

| status | 설명 |
|--------|------|
| `TAKEN` | 복용 완료 |
| `MISSED` | 미복용/거부 |

| method | 설명 |
|--------|------|
| `DISPENSER` | 디스펜서 자동 |
| `BUTTON` | LCD 버튼 확인 |

> 디스펜서 연동은 후순위 기능입니다.

---

## 7. 순찰 결과 보고

### POST `/api/robots/{robotId}/patrol/report`
> 순찰 완료 후 결과 전송

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

**순찰 대상**
| target | 설명 |
|--------|------|
| `GAS_VALVE` | 가스밸브 |
| `DOOR` | 현관문 |
| `OUTLET` | 콘센트 |
| `WINDOW` | 창문 |
| `APPLIANCE` | 전열기구 |

**상태**
| status | 설명 |
|--------|------|
| `NORMAL` | 정상 |
| `LOCKED` | 잠김 |
| `UNLOCKED` | 열림 |
| `NEEDS_CHECK` | 확인 필요 |

---

## 8. 명령 응답

### POST `/api/robots/{robotId}/commands/{commandId}/ack`
> 서버 명령 수행 결과 보고

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
| `RECEIVED` | 수신 |
| `IN_PROGRESS` | 수행 중 |
| `COMPLETED` | 완료 |
| `FAILED` | 실패 |
| `CANCELLED` | 취소됨 |

---

## 9. 위치 업데이트

### PUT `/api/robots/{robotId}/location`
> 로봇 위치 업데이트 (2초 간격 권장)

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

**Response**
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

## 10. 맵 업로드

### POST `/api/robots/{robotId}/map`
> Visual SLAM 맵 생성 후 업로드 (multipart/form-data)

**Request**

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

**Response**
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

## 11. 방 관리 API

### GET `/api/robots/{robotId}/rooms`
> 방 목록 조회

**Response**
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

### POST `/api/robots/{robotId}/rooms`
> 방 등록 (현재 로봇 위치 기준)

**Request** - 현재 위치 기준
```json
{
  "name": "거실",
  "useCurrentLocation": true
}
```

**Request** - 좌표 직접 지정
```json
{
  "id": "LIVING_ROOM",
  "name": "거실",
  "x": 450,
  "y": 150,
  "useCurrentLocation": false
}
```

**Response**
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

### PUT `/api/robots/{robotId}/rooms/{roomId}`
> 방 정보 수정

**Request**
```json
{
  "name": "안방"
}
```

### DELETE `/api/robots/{robotId}/rooms/{roomId}`
> 방 삭제

**Response** `204 No Content`

---

## 12. WebSocket 연결

### 연결
```python
import websocket

ws = websocket.WebSocket()
ws.connect("wss://i14c104.p.ssafy.io/ws?token={accessToken}")
```

### 수신 메시지

#### `LCD_MODE_CHANGE` - LCD 화면 변경 명령
```json
{
  "type": "LCD_MODE_CHANGE",
  "payload": {
    "mode": "MEDICATION",
    "emotion": "neutral",
    "message": "할머니~ 약 드실 시간이에요!",
    "subMessage": "아침약 (고혈압, 당뇨)"
  }
}
```

#### 기타 수신 메시지
| type | 설명 |
|------|------|
| `ROBOT_STATUS_UPDATE` | 로봇 상태 업데이트 |
| `ROBOT_COMMAND` | 이동/순찰 등 명령 |
| `SCHEDULE_REMINDER` | 일정 알림 |
| `EMERGENCY_ALERT` | 긴급 상황 알림 |
| `PONG` | 연결 유지 응답 |

### 송신 메시지

#### `SUBSCRIBE` - 특정 노인/로봇 구독
```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "elderIds": [1, 2, 3],
    "robotIds": [1]
  }
}
```

#### `PING` - 연결 유지 (30초마다)
```json
{ "type": "PING" }
```

---

## 13. LCD 모드 정리

| mode | emotion | 설명 | 트리거 |
|------|---------|------|--------|
| `IDLE` | `neutral` | 대기 | 기본 상태 |
| `GREETING` | `happy` | 인사 | 기상/귀가 감지 |
| `MEDICATION` | `happy` | 복약 알림 | 서버 스케줄 또는 AI 감지 |
| `SCHEDULE` | `happy` | 일정 알림 | 서버 명령 |
| `LISTENING` | `neutral` | 음성 인식 | 호출어 감지 |
| `EMERGENCY` | `neutral` | 긴급 상황 | 낙상/SOS 감지 |
| `SLEEP` | `sleep` | 충전 모드 | 충전 독 도킹 |

> **MVP emotion**: `neutral`, `happy`, `sleep` 3가지만 사용

---

## 14. LCD 화면 전환 아키텍처

> **상세 규격**: [api-ai.md 섹션 9](./api-ai.md#9-lcd-화면-전환-아키텍처) 참조

LCD 디스플레이는 **React 웹앱**으로 구현되어 있으므로, 화면 전환은 **서버를 경유**합니다.

### 아키텍처

```
Python AI (Jetson) ──REST API──▶ Spring Boot (EC2) ──WebSocket──▶ LCD 웹앱 (React)
```

### LCD 전환 API

**POST `/api/robots/{robotId}/lcd-mode`**

```json
{
  "mode": "LISTENING",
  "emotion": "neutral",
  "message": "",
  "subMessage": ""
}
```

### 호출어 → LCD 전환 흐름
```
"은봇아!" → Python AI 감지 → POST /lcd-mode → 서버 → WebSocket push → LCD 전환
                                            ↓
                                   전체 ~100-200ms
```

> **Note**: LCD 웹앱은 WebSocket으로 `/topic/robot/{robotId}/lcd` 토픽을 구독합니다.

---

## 15. 오프라인 대응

서버 연결이 끊겼을 때:
1. 로컬에 이벤트/상태 캐싱
2. 기본 LCD 모드 유지
3. 재연결 시 캐싱된 데이터 일괄 전송
4. 긴급 상황은 로컬에서 자체 처리 후 재연결 시 보고

---

## 16. 담당 API 요약

| API | 메서드 | 설명 |
|-----|--------|------|
| `/api/auth/robot/login` | POST | 로봇 인증 |
| `/api/robots/{robotId}/sync` | POST | 상태 동기화 |
| `/api/robots/{robotId}/events` | POST | 이벤트 보고 |
| `/api/robots/{robotId}/emergency` | POST | 긴급 상황 |
| `/api/robots/{robotId}/location` | PUT | 위치 업데이트 |
| `/api/robots/{robotId}/commands/{commandId}/ack` | POST | 명령 응답 |
| `/api/robots/{robotId}/patrol/report` | POST | 순찰 결과 |
| `/api/robots/{robotId}/map` | POST | 맵 업로드 |
| `/api/robots/{robotId}/rooms` | GET/POST | 방 목록/등록 |
| `/api/robots/{robotId}/rooms/{roomId}` | PUT/DELETE | 방 수정/삭제 |
| `/api/elders/{elderId}/medications/records` | POST | 복약 기록 |
| WebSocket | - | 실시간 연결 |

---

## 📞 문의

- 전체 API 명세: [api-specification.md](./api-specification.md)
- AI 팀 API: [api-ai.md](./api-ai.md)
- 백엔드 담당자에게 문의
