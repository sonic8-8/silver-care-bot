# 🧠 AI 팀 API 가이드

> **대상**: Jetson Orin Nano AI/LLM 개발자
> **버전**: v1.3.0 | **작성일**: 2026-01-30
> **전체 명세**: [api-specification.md](./api-specification.md)

---

## 1. 개요

AI 모듈은 Jetson Orin Nano에서 실행되며, **Vision AI**와 **Speech AI**로 구분됩니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Jetson Orin Nano                              │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐     │
│  │     Vision AI       │    │          Speech AI               │     │
│  │  ┌───────────────┐  │    │  ┌─────────────────────────┐    │     │
│  │  │ YOLO v8 nano  │  │    │  │ OpenWakeWord (호출)      │    │     │
│  │  │ (객체 탐지)    │  │    │  │         ↓               │    │     │
│  │  └───────────────┘  │    │  │ Whisper (STT)            │    │     │
│  │  ┌───────────────┐  │    │  │         ↓               │    │     │
│  │  │ SORT          │  │    │  │ GPT-5-nano (LLM)         │    │     │
│  │  │ (객체 추적)    │  │    │  │         ↓               │    │     │
│  │  └───────────────┘  │    │  │ FastSpeech2 (TTS)        │    │     │
│  │  ┌───────────────┐  │    │  └─────────────────────────┘    │     │
│  │  │ 커스텀 모델    │  │    └─────────────────────────────────┘     │
│  │  │ (상태 판단)    │  │                                            │
│  │  └───────────────┘  │                                            │
│  └─────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 통신 URL
| 용도 | URL |
|------|-----|
| REST API | `https://i14c104.p.ssafy.io/api/` |
| WebSocket | `wss://i14c104.p.ssafy.io/ws` |

---

## 2. 모델 스택

### Vision AI

| 타입 | 용도 | 모델 |
|------|------|------|
| 비전 | 객체 탐지 | YOLO v8 nano |
| 비전 | 객체 추적 | SORT |
| 비전 | 상태 판단 | 커스텀 모델 |

### Speech AI

| 타입 | 용도 | 모델 |
|------|------|------|
| Speech | 웨이크워드 감지 | OpenWakeWord |
| STT | 음성 → 텍스트 | whisper-large-v3-turbo |
| LLM | 대화, 명령 분석 | OPENAI (GPT-5-nano) |
| TTS | 텍스트 → 음성 | FastSpeech2 |

---

## 3. 기능별 우선순위

### Vision AI 기능

| 기능 | 입력 | 출력 | 우선순위 | 관련 API |
|------|------|------|----------|----------|
| 객체 추종 | 센서 데이터 | 거리, 각도 | 🔴 High | 내부 처리 |
| 정찰 기능 | 센서 데이터 | ON/OFF 상태 | 🔴 High | `POST /patrol-results` |
| 기상/취침 감지 | 센서 데이터 | WAKE / SLEEP | 🔴 High | `POST /sleep-wake` |
| 낙상 판단 | 센서 데이터 | 낙상 여부 | 🔻 후순위 | `POST /emergency` |
| 투약 여부 | 센서 데이터 | 복용 확인 | 🔻 후순위 | - |

> **정찰 결과 웹앱 표시**:
> - ON (confidence ≥ 80%): "안전" 🟢
> - OFF (confidence ≥ 80%): "확인 필요" 🟡

### Speech AI 기능

| 기능 | Intent | CommandType | 설명 | 관련 API |
|------|--------|-------------|------|----------|
| **LCD 화면 전환** | - | - | 호출어 감지 시 화면 전환 | `POST /lcd-mode` ⭐ |
| 일반 대화 | `CHAT` | `null` | 일상 대화 | `POST /conversations` |
| 웹 검색/날씨 | `COMMAND` | `SEARCH` | 날씨, 웹 검색 | `POST /search-results` |
| 일정 등록 | `COMMAND` | `SCHEDULE` | 음성으로 일정 등록 | `POST /schedules/voice` |
| 로봇 이동 | `COMMAND` | `MOVE` | 로봇 이동 명령 | 내부 처리 |

> **감정 분석 후순위**: 음성 인식 정확도 이슈로 대부분 `NEUTRAL`로 처리

---

## 4. Vision AI API

### POST `/api/robots/{robotId}/patrol-results`
> 정찰 결과 저장

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

### POST `/api/robots/{robotId}/sleep-wake`
> 기상/취침 감지 기록

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

### POST `/api/robots/{robotId}/map`
> 맵 데이터 업로드 (Visual SLAM)

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
  { "id": "KITCHEN", "name": "주방", "x": 300, "y": 150 }
]
```

---

## 5. Speech AI API

### POST `/api/robots/{robotId}/conversations`
> 대화 기록 저장

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

| intent | commandType | 설명 |
|--------|-------------|------|
| `CHAT` | `null` | 일반 대화 |
| `COMMAND` | `SEARCH` | 웹 검색, 날씨 조회 |
| `COMMAND` | `SCHEDULE` | 일정 등록 |
| `COMMAND` | `MOVE` | 로봇 이동 명령 |

| sentiment | 설명 |
|-----------|------|
| `POSITIVE` | 긍정적 |
| `NEUTRAL` | 중립 (대부분 이 값으로 처리) |
| `NEGATIVE` | 부정적 |

> **감정 분석 후순위**: 음성 인식 정확도 이슈로 대부분 `NEUTRAL`로 저장됨

---

### POST `/api/robots/{robotId}/search-results`
> 검색 결과 저장

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

### POST `/api/elders/{elderId}/schedules/voice`
> 음성 일정 등록

**AI 처리 흐름**
```
음성 입력 → STT → LLM 정규화(normalization) → 구조화된 데이터 → API 전송
```

**Request**
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

### 파싱 규칙

**일정 타입 분류**
| 키워드 | type |
|--------|------|
| 병원, 진료, 검진 | `HOSPITAL` |
| 손자, 자녀, 가족 | `FAMILY` |
| 약, 복용 | `MEDICATION` |
| 기타 | `PERSONAL` |

**날짜/시간 추출 예시**
| 음성 | 파싱 결과 |
|------|----------|
| "내일 오후 2시" | 다음날 14:00 |
| "다음 주 월요일" | 다음 주 월요일 00:00 |
| "22일에" | 해당 월 22일 00:00 |
| "모레 아침" | 2일 후 08:00 |

**confidence 기준**
| 값 | 의미 | 처리 |
|----|------|------|
| ≥ 0.8 | 높은 확신 | 자동 등록 |
| 0.5~0.8 | 중간 | 확인 질문 후 등록 |
| < 0.5 | 낮음 | 재요청 |

---

### POST `/api/elders/{elderId}/medications/records`
> 복약 기록 (음성 확인 시)

**Request**
```json
{
  "medicationId": 1,
  "status": "TAKEN",
  "takenAt": "2026-01-29T08:15:00+09:00",
  "method": "BUTTON"
}
```

| method | 설명 |
|--------|------|
| `DISPENSER` | 디스펜서 자동 |
| `BUTTON` | LCD 버튼 확인 |
| `MANUAL` | 보호자 수동 입력 |

---

## 6. 긴급 상황 판단 (후순위)

### POST `/api/robots/{robotId}/emergency`
> 센서 데이터를 분석하여 낙상 등 긴급 상황을 판단

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

### 낙상 판단 기준

| 지표 | 임계값 | 설명 |
|------|--------|------|
| 충격 강도 | > 2.0g | 급격한 가속도 변화 |
| 자세 변화 | > 60° | 급격한 기울기 변화 |
| 이후 움직임 | < 0.1g (10초) | 충격 후 움직임 없음 |

### confidence 계산

```python
def calculate_fall_confidence(impact, posture_change, stillness):
    score = 0
    if impact > 2.0:
        score += 0.4
    if posture_change > 60:
        score += 0.3
    if stillness > 10:
        score += 0.3
    return min(score, 1.0)
```

---

## 7. 음성 명령 인식

어르신의 음성 명령을 인식하여 로봇 동작을 결정합니다.

### 명령 분류

| Intent | CommandType | 예시 음성 | 동작 |
|--------|-------------|----------|------|
| `COMMAND` | `MOVE` | "주방으로 가줘" | MOVE_TO 명령 |
| `COMMAND` | `SEARCH` | "오늘 날씨 어때?" | 날씨 조회 + TTS |
| `COMMAND` | `SCHEDULE` | "내일 병원 예약해줘" | 일정 등록 |
| `CHAT` | `null` | "너 이름이 뭐야?" | 일반 대화 응답 |

### 호출어 감지 (OpenWakeWord)

- 기본 호출어: 로봇 이름 (설정 가능)
- 호출어 감지 시 → LCD `LISTENING` 모드 전환
- 5초 내 추가 음성 없으면 → `IDLE` 복귀

---

## 8. LCD 화면 결정 로직

AI 분석 결과에 따라 적절한 LCD 화면을 결정합니다.

### 화면 전환 우선순위

```
1. EMERGENCY (최우선) - 낙상/SOS 감지
2. MEDICATION - 복약 시간 도래
3. SCHEDULE - 일정 알림
4. GREETING - 기상/귀가 감지
5. LISTENING - 호출어 감지
6. IDLE - 기본 상태
```

### 감정에 따른 표정 결정 (MVP)

| emotion | 상황 |
|---------|------|
| `neutral` | 평상시, 긴급 상황 |
| `happy` | 인사, 복약 완료, 일정 알림 |
| `sleep` | 충전 중 |

> **MVP 범위**: 표정은 3가지로 단순화. Phase 2 이후 확장 가능

---

## 9. LCD 화면 전환 아키텍처

> **중요**: LCD 디스플레이는 **React 웹앱**으로 구현되어 EC2 서버에서 호스팅됩니다.
> 따라서 LCD 화면 전환은 **서버를 경유**해야 합니다.

### 실제 아키텍처

```
┌─────────────┐    REST API    ┌─────────────┐   WebSocket    ┌─────────────┐
│  Python AI  │ ─────────────▶ │  Spring Boot │ ─────────────▶ │  LCD 웹앱   │
│  (Jetson)   │                │    (EC2)     │                │   (React)   │
└─────────────┘                └─────────────┘                └─────────────┘
   호출어 감지                    상태 저장 + push               화면 전환
```

| 구간 | 방식 | 지연 |
|------|------|------|
| Python AI → 서버 | REST API | ~50-100ms |
| 서버 → LCD 웹앱 | WebSocket push | ~50-100ms |
| **전체** | - | **~100-200ms** |

---

### POST `/api/robots/{robotId}/lcd-mode`
> Python AI 서비스가 LCD 화면 전환 요청 시 호출

**Request**
```json
{
  "mode": "LISTENING",
  "emotion": "neutral",
  "message": "",
  "subMessage": ""
}
```

**서버 동작:**
1. LCD 상태 DB 업데이트
2. WebSocket으로 `/topic/robot/{robotId}/lcd`에 push

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "mode": "LISTENING",
    "updatedAt": "2026-01-30T10:30:00+09:00"
  }
}
```

---

### LCD 모드 및 표정

| mode | emotion | 트리거 |
|------|---------|--------|
| `LISTENING` | `neutral` | 호출어 감지 |
| `IDLE` | `neutral` | 5초 내 음성 없음 |
| `GREETING` | `happy` | 기상/귀가 감지 |
| `MEDICATION` | `happy` | 복약 시간 |
| `SCHEDULE` | `happy` | 일정 알림 |
| `EMERGENCY` | `neutral` | 긴급 상황 |
| `SLEEP` | `sleep` | 충전 독 도킹 |

> **MVP emotion**: `neutral`, `happy`, `sleep` 3가지만 사용

---

### 호출어 감지 → LCD 전환 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│  "은봇아!" 호출                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Python AI: 마이크에서 호출어 감지 (OpenWakeWord)            │
│         ↓                                                       │
│  2. Python AI → 서버: POST /api/robots/{id}/lcd-mode            │
│         { "mode": "LISTENING", "emotion": "neutral" }           │
│         ↓                                                       │
│  3. 서버: DB 업데이트 + WebSocket push                          │
│         ↓                                                       │
│  4. LCD 웹앱: WebSocket 메시지 수신 → 화면 전환                  │
│         ↓                                                       │
│  5. Python AI: STT 처리 시작                                    │
│         ↓                                                       │
│  [사용자 음성 입력]                                              │
│         ↓                                                       │
│  6. Python AI: STT → LLM 분석                                   │
│         ↓                                                       │
│  7. Python AI → 서버: 분석 결과에 따른 API 호출                  │
│         - 대화: POST /conversations                             │
│         - 일정: POST /schedules/voice                           │
│         - 검색: POST /search-results                            │
│         ↓                                                       │
│  8. Python AI → 서버: POST /api/robots/{id}/lcd-mode            │
│         { "mode": "IDLE", "emotion": "neutral" }                │
│         ↓                                                       │
│  9. LCD 웹앱: 화면 복귀                                          │
│                                                                 │
│  ⏱️ 호출어 감지 → LCD 반응: ~100-200ms                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Python AI 서비스 구현 예시

```python
import requests

class RobotAPI:
    def __init__(self, base_url: str, robot_id: int, token: str):
        self.base_url = base_url
        self.robot_id = robot_id
        self.headers = {"Authorization": f"Bearer {token}"}

    def change_lcd_mode(self, mode: str, emotion: str = "neutral",
                        message: str = "", sub_message: str = ""):
        """LCD 화면 전환 요청"""
        response = requests.post(
            f"{self.base_url}/api/robots/{self.robot_id}/lcd-mode",
            json={
                "mode": mode,
                "emotion": emotion,
                "message": message,
                "subMessage": sub_message
            },
            headers=self.headers
        )
        return response.json()

    def on_wakeword_detected(self):
        """호출어 감지 시 호출"""
        self.change_lcd_mode("LISTENING", "neutral")

    def on_conversation_end(self):
        """대화 종료 시 호출"""
        self.change_lcd_mode("IDLE", "neutral")
```

---

### WebSocket 구독 (LCD 웹앱)

LCD 웹앱(React)은 서버와 WebSocket 연결 후 토픽을 구독합니다:

**구독 토픽**: `/topic/robot/{robotId}/lcd`

**수신 메시지 형식**:
```json
{
  "mode": "LISTENING",
  "emotion": "neutral",
  "message": "",
  "subMessage": "",
  "updatedAt": "2026-01-30T10:30:00+09:00"
}
```

**React 구현 예시**:
```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useLcdWebSocket = (robotId: number, onLcdChange: (state: LcdState) => void) => {
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/robot/${robotId}/lcd`, (message) => {
          const lcdState = JSON.parse(message.body);
          onLcdChange(lcdState);
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, [robotId, onLcdChange]);
};
```

---

## 10. 담당 API 요약

### Vision AI

| API | 메서드 | 설명 |
|-----|--------|------|
| `/api/robots/{robotId}/patrol-results` | POST | 정찰 결과 |
| `/api/robots/{robotId}/sleep-wake` | POST | 기상/취침 감지 |
| `/api/robots/{robotId}/map` | POST | 맵 업로드 |
| `/api/robots/{robotId}/emergency` | POST | 긴급 상황 (후순위) |

### Speech AI

| API | 메서드 | 설명 |
|-----|--------|------|
| `/api/robots/{robotId}/lcd-mode` | POST | LCD 화면 전환 ⭐ |
| `/api/robots/{robotId}/conversations` | POST | 대화 기록 |
| `/api/robots/{robotId}/search-results` | POST | 검색 결과 |
| `/api/elders/{elderId}/schedules/voice` | POST | 음성 일정 |
| `/api/elders/{elderId}/medications/records` | POST | 복약 기록 |

---

## 📞 문의

- 전체 API 명세: [api-specification.md](./api-specification.md)
- 임베디드 팀 API: [api-embedded.md](./api-embedded.md)
- 백엔드 담당자에게 문의
