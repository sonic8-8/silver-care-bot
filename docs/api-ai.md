# 🧠 AI 팀 API 가이드

> **대상**: Jetson Orin Nano AI/LLM 개발자  
> **버전**: v1.0.0 | **작성일**: 2026-01-29  
> **전체 명세**: [api-specification.md](./api-specification.md)

---

## 1. 개요

AI 모듈은 Jetson Orin Nano에서 실행되며, 음성 인식, 감정 분석, 일정 파싱 등을 처리합니다.  
처리된 데이터는 **임베디드 모듈을 통해** 백엔드 서버로 전송됩니다.

```
┌────────────────────────────────────────────────┐
│               Jetson Orin Nano                 │
│  ┌──────────────┐      ┌──────────────────┐   │
│  │   AI Module  │─────▶│  Embedded Module │───────▶ Backend
│  │  (LLM/STT)   │      │   (통신 담당)     │   │
│  └──────────────┘      └──────────────────┘   │
└────────────────────────────────────────────────┘
```

### 데이터 흐름
1. AI 모듈이 음성/센서 데이터 처리
2. 처리 결과를 임베디드 모듈에 전달 (내부 통신)
3. 임베디드 모듈이 서버 API 호출

---

## 2. AI 모듈 담당 기능

| 기능 | 입력 | 출력 | 관련 API |
|------|------|------|----------|
| 음성 → 일정 파싱 | 음성 텍스트 | 일정 데이터 | `POST /schedules/voice` |
| 감정 분석 | 대화 텍스트 | 감정 키워드 | `POST /events` |
| 낙상 판단 | 센서 데이터 | 낙상 여부 | `POST /emergency` |
| 음성 명령 인식 | 음성 텍스트 | 명령 타입 | 내부 처리 |

---

## 3. 음성 일정 등록

### POST `/api/elders/{elderId}/schedules/voice`

어르신의 음성을 분석하여 일정으로 변환한 데이터를 서버에 전송합니다.

**AI 처리 흐름**
```
음성 입력 → STT → LLM 파싱 → 구조화된 데이터 → API 전송
```

**Request** (임베디드 모듈이 전송)
```json
{
  "voiceOriginal": "손자 생일 케이크 사달라고 해야겠어",
  "parsedData": {
    "title": "손자 생일 케이크 사기",
    "datetime": "2026-01-22T00:00:00+09:00",
    "type": "PERSONAL",
    "confidence": 0.92
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

## 4. 대화/감정 분석

### POST `/api/robots/{robotId}/events`

대화 내용을 분석하여 감정 상태와 키워드를 추출합니다.

**AI 처리 흐름**
```
대화 텍스트 → 감정 분석 모델 → sentiment + keywords 추출
```

**Request**
```json
{
  "events": [
    {
      "type": "CONVERSATION",
      "detectedAt": "2026-01-29T07:45:00+09:00",
      "data": {
        "duration": 120,
        "sentiment": "POSITIVE",
        "keywords": ["좋은 아침", "날씨", "손자"]
      }
    }
  ]
}
```

### 감정 분류

| sentiment | 기준 |
|-----------|------|
| `POSITIVE` | 기쁨, 감사, 웃음 |
| `NEUTRAL` | 일상 대화 |
| `NEGATIVE` | 슬픔, 불안, 외로움 |

### 키워드 추출 규칙

- 명사 위주 추출
- 감정 관련 형용사 포함
- 가족/건강/날씨 관련 단어 우선

---

## 5. 긴급 상황 판단

### POST `/api/robots/{robotId}/emergency`

센서 데이터를 분석하여 낙상 등 긴급 상황을 판단합니다.

**AI 처리 흐름**
```
IMU 센서 → 낙상 감지 모델 → confidence 계산 → 긴급 보고
```

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

## 6. 음성 명령 인식

어르신의 음성 명령을 인식하여 로봇 동작을 결정합니다.

### 명령 분류

| 의도 | 예시 음성 | 동작 |
|------|----------|------|
| 이동 요청 | "주방으로 가줘" | MOVE_TO 명령 |
| 날씨 질문 | "오늘 날씨 어때?" | TTS 응답 |
| 일정 확인 | "오늘 일정 있어?" | 일정 조회 + TTS |
| 누구야 | "너 이름이 뭐야?" | 로봇 이름 응답 |
| 도움 요청 | "도와줘" | SOS 모드 전환 |

### 호출어 감지

- 기본 호출어: 로봇 이름 (설정 가능)
- 호출어 감지 시 → LCD `LISTENING` 모드 전환
- 5초 내 추가 음성 없으면 → `IDLE` 복귀

---

## 7. LCD 화면 결정 로직

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

### 감정에 따른 표정 결정

| 상황 | emotion |
|------|---------|
| 평상시 | `neutral` |
| 인사/복약 완료 | `happy` |
| 긴급 상황 | `angry` 또는 기본 |
| 충전 중 | `sleep` |

---

## 8. 임베디드 모듈과의 인터페이스

AI 모듈과 임베디드 모듈 간 내부 통신 규격 (구현 시 조정 가능)

### 출력 데이터 형식

**일정 파싱 결과**
```python
{
    "type": "SCHEDULE_PARSED",
    "data": {
        "voiceOriginal": "...",
        "parsedData": { ... },
        "recordedAt": "..."
    }
}
```

**감정 분석 결과**
```python
{
    "type": "EMOTION_ANALYZED",
    "data": {
        "sentiment": "POSITIVE",
        "keywords": ["..."],
        "duration": 120
    }
}
```

**낙상 감지 결과**
```python
{
    "type": "FALL_DETECTED",
    "data": {
        "confidence": 0.92,
        "location": "거실",
        "sensorData": { ... }
    }
}
```

**LCD 모드 변경 요청**
```python
{
    "type": "LCD_MODE_REQUEST",
    "data": {
        "mode": "MEDICATION",
        "emotion": "neutral",
        "message": "할머니~ 약 드실 시간이에요!"
    }
}
```

---

## 9. 모델 요구사항

| 모델 | 용도 | 권장 |
|------|------|------|
| STT | 음성→텍스트 | Whisper (small/medium) |
| LLM | 일정 파싱/대화 | LLaMA 3 8B 또는 Gemma 2B |
| 감정 분석 | 텍스트 감정 | KoBERT 또는 LLM 활용 |
| 낙상 감지 | IMU 데이터 | 커스텀 경량 모델 |

---

## 📞 문의

- 전체 API 명세: [api-specification.md]
- 임베디드 팀 API: [api-embedded.md]
