# 🤖 임베디드 팀 API 가이드

> **대상**: Jetson Orin Nano 개발자  
> **버전**: v1.0.0 | **작성일**: 2026-01-29  
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

> ⚠️ `accessToken`을 저장하고 모든 요청에 헤더로 포함:
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

**Response**
```json
{
  "success": true,
  "data": {
    "pendingCommands": [
      {
        "commandId": "cmd-123",
        "command": "MOVE_TO",
        "params": { "location": "KITCHEN" }
      }
    ],
    "scheduleReminders": [
      {
        "scheduleId": 1,
        "title": "병원 방문",
        "datetime": "2026-01-29T14:00:00+09:00"
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
> 활동 감지, 대화 등 이벤트 발생 시 전송

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
      "type": "CONVERSATION",
      "detectedAt": "2026-01-29T07:45:00+09:00",
      "data": {
        "duration": 120,
        "sentiment": "POSITIVE",
        "keywords": ["좋은 아침", "날씨"]
      }
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
| `CONVERSATION` | 대화 |

---

## 5. 긴급 상황 보고

### POST `/api/robots/{robotId}/emergency`
> ⚠️ **최우선 처리** - 낙상 등 감지 즉시 호출

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

## 6. 복약 기록

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

---

## 9. 위치 업데이트

### POST `/api/robots/{robotId}/position`
> 로봇 위치 변경 시 (이동 중 또는 도착 시)

**Request**
```json
{
  "x": 450,
  "y": 150,
  "roomId": "room-2",
  "heading": 45,
  "timestamp": "2026-01-29T10:23:00+09:00"
}
```

---

## 10. 맵 업로드

### POST `/api/robots/{robotId}/map/upload`
> Visual SLAM 맵 생성 후 업로드 (multipart/form-data)

**Request**
```
Content-Type: multipart/form-data

mapImage: [Binary - PNG/JPG]
metadata: {
  "capturedAt": "2026-01-28T12:00:00+09:00",
  "slamVersion": "v2.1",
  "resolution": { "width": 1024, "height": 768 }
}
```

---

## 11. WebSocket 연결

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
| `ROBOT_COMMAND` | 이동/순찰 등 명령 |
| `SCHEDULE_REMINDER` | 일정 알림 |
| `PONG` | 연결 유지 응답 |

### 송신 메시지

#### `PING` - 연결 유지 (30초마다)
```json
{ "type": "PING" }
```

---

## 12. LCD 모드 정리

| mode | 설명 | 트리거 |
|------|------|--------|
| `IDLE` | 대기 | 기본 상태 |
| `GREETING` | 인사 | 기상/귀가 감지 |
| `MEDICATION` | 복약 알림 | 서버 스케줄 또는 명령 |
| `SCHEDULE` | 일정 알림 | 서버 명령 |
| `LISTENING` | 음성 인식 | 호출어 감지 |
| `EMERGENCY` | 긴급 상황 | 낙상/SOS 감지 |
| `SLEEP` | 충전 모드 | 충전 독 도킹 |

---

## 13. 오프라인 대응

서버 연결이 끊겼을 때:
1. 로컬에 이벤트/상태 캐싱
2. 기본 LCD 모드 유지
3. 재연결 시 캐싱된 데이터 일괄 전송
4. 긴급 상황은 로컬에서 자체 처리 후 재연결 시 보고

---

## 📞 문의

- 전체 API 명세: [api-specification.md](./api-specification.md)
- 백엔드 담당자에게 문의
