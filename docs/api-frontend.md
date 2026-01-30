# 🖥️ 프론트엔드 팀 API 가이드

> **대상**: React 웹앱 개발자  
> **버전**: v1.0.0 | **작성일**: 2026-01-29  
> **전체 명세**: [api-specification.md](./api-specification.md)

---

## 1. 개요

실버케어 웹앱은 보호자/복지사가 어르신 상태를 모니터링하는 앱입니다.

### 통신 URL
| 용도 | URL |
|------|-----|
| REST API | `https://i14c104.p.ssafy.io/api/` |
| WebSocket | `wss://i14c104.p.ssafy.io/ws` |

### 인증
모든 API 요청에 JWT 토큰 포함:
```js
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## 2. 인증 API

### POST `/api/auth/login`
> 로그인

```js
// Request
{ email: "user@example.com", password: "password123" }

// Response
{
  success: true,
  data: {
    accessToken: "eyJhbG...",
    refreshToken: "eyJhbG...",
    expiresIn: 3600,
    user: { id: 1, name: "김복지", email: "...", role: "WORKER" }
  }
}
```

### POST `/api/auth/signup`
> 회원가입

```js
// Request
{
  name: "김복지",
  email: "user@example.com",
  password: "password123",
  phone: "010-1234-5678",
  role: "WORKER"  // WORKER | FAMILY
}
```

### POST `/api/auth/refresh`
> 토큰 갱신

```js
// Request
{ refreshToken: "eyJhbG..." }
```

---

## 3. 노인 관리 API

### GET `/api/elders`
> 담당 노인 목록 (대시보드용)

```js
// Response
{
  elders: [
    {
      id: 1,
      name: "김옥분",
      age: 80,
      status: "SAFE",      // SAFE | WARNING | DANGER
      lastActivity: "2026-01-29T10:23:00+09:00",
      location: "거실",
      robotConnected: true
    }
  ],
  summary: { total: 4, safe: 2, warning: 1, danger: 1 }
}
```

### GET `/api/elders/{elderId}`
> 노인 상세 정보

```js
// Response
{
  id: 1,
  name: "김옥분",
  age: 80,
  status: "SAFE",
  todaySummary: {
    wakeUpTime: "07:30",
    medicationStatus: { taken: 1, total: 2 },
    activityLevel: "NORMAL"
  },
  robot: {
    id: 1,
    batteryLevel: 85,
    networkStatus: "CONNECTED",
    currentLocation: "거실",
    dispenserRemaining: 3
  },
  emergencyContacts: [
    { priority: 1, name: "김자녀", phone: "010-1234-5678", relation: "자녀" }
  ]
}
```

---

## 4. 로봇 상태 API

### GET `/api/robots/{robotId}/status`
> 로봇 현재 상태

```js
// Response
{
  id: 1,
  batteryLevel: 85,
  isCharging: false,
  networkStatus: "CONNECTED",
  currentLocation: "거실",
  lcdMode: "IDLE",
  dispenser: { remaining: 3, capacity: 7, daysUntilEmpty: 2 },
  settings: {
    morningMedicationTime: "08:00",
    eveningMedicationTime: "19:00",
    ttsVolume: 70
  }
}
```

### POST `/api/robots/{robotId}/commands`
> 로봇 제어 명령

```js
// Request - 이동 명령
{ command: "MOVE_TO", params: { location: "LIVING_ROOM" } }

// Request - 순찰 시작
{ command: "START_PATROL" }

// Request - 충전 독 복귀
{ command: "RETURN_TO_DOCK" }

// Request - TTS 메시지
{ command: "SPEAK", params: { message: "안녕하세요" } }
```

**location 값**: `LIVING_ROOM` | `KITCHEN` | `BEDROOM` | `BATHROOM` | `ENTRANCE` | `DOCK`

### GET `/api/robots/{robotId}/lcd`
> LCD 미러링 현재 화면

```js
// Response
{
  mode: "IDLE",       // IDLE | GREETING | MEDICATION | SCHEDULE | LISTENING | EMERGENCY | SLEEP
  emotion: "neutral", // neutral | happy | angry | sleep
  message: "",
  subMessage: "",
  nextSchedule: { label: "병원 방문", time: "14:00" }
}
```

---

## 5. 복약 관리 API

### GET `/api/elders/{elderId}/medications`
> 복약 현황 조회

```js
// Response
{
  weeklyStatus: { taken: 5, missed: 1, total: 6, rate: 83.3 },
  dailyStatus: [
    { day: "MON", morning: "TAKEN", evening: "TAKEN" },
    { day: "TUE", morning: "TAKEN", evening: "MISSED" }
  ],
  medications: [
    { id: 1, name: "고혈압약", dosage: "1정", frequency: "MORNING", timing: "식후 30분" }
  ],
  dispenser: { remaining: 3, capacity: 7, needsRefill: true }
}
```

### POST `/api/elders/{elderId}/medications`
> 약 추가

```js
// Request
{
  name: "혈압약",
  dosage: "1정",
  frequency: "MORNING",  // MORNING | EVENING | BOTH
  timing: "식후 30분",
  startDate: "2026-01-29"
}
```

---

## 6. 일정 관리 API

### GET `/api/elders/{elderId}/schedules`
> 일정 목록

**Query**: `?startDate=2026-01-01&endDate=2026-01-31`

```js
// Response
{
  schedules: [
    {
      id: 1,
      title: "병원 예약",
      datetime: "2026-01-29T14:00:00+09:00",
      type: "HOSPITAL",    // HOSPITAL | MEDICATION | PERSONAL | FAMILY
      source: "MANUAL",    // MANUAL | VOICE | SYSTEM
      status: "UPCOMING"
    }
  ],
  voiceSchedules: [
    {
      id: 2,
      title: "손자 생일 케이크",
      voiceOriginal: "손자 생일 케이크 사달라고..."
    }
  ]
}
```

### POST `/api/elders/{elderId}/schedules`
> 일정 등록

```js
// Request
{
  title: "병원 예약",
  description: "내과 정기검진",
  datetime: "2026-01-29T14:00:00+09:00",
  location: "서울대병원",
  type: "HOSPITAL",
  remindBefore: 120  // 분 단위
}
```

---

## 7. 알림 API

### GET `/api/notifications`
> 알림 목록

**Query**: `?unreadOnly=true&elderId=1`

```js
// Response
{
  unreadCount: 3,
  notifications: [
    {
      id: 1,
      type: "EMERGENCY",   // EMERGENCY | MEDICATION | SCHEDULE | ACTIVITY | SYSTEM
      title: "낙상 감지",
      message: "거실에서 낙상 감지됨",
      elderId: 1,
      elderName: "김옥분",
      isRead: false,
      createdAt: "2026-01-29T10:23:00+09:00",
      actionUrl: "/emergency/1"
    }
  ]
}
```

### PATCH `/api/notifications/{id}/read`
> 알림 읽음 처리

### POST `/api/notifications/read-all`
> 모든 알림 읽음

---

## 8. 활동 로그 & AI 리포트

### GET `/api/elders/{elderId}/activities`
> 활동 로그

**Query**: `?date=2026-01-29`

```js
// Response
{
  date: "2026-01-29",
  activities: [
    {
      id: 1,
      type: "WAKE_UP",     // WAKE_UP | SLEEP | MEDICATION_TAKEN | PATROL_COMPLETE | OUT_DETECTED
      title: "기상 감지",
      description: "침실에서 움직임 감지",
      timestamp: "2026-01-29T07:30:00+09:00"
    }
  ]
}
```

### GET `/api/elders/{elderId}/reports/weekly`
> AI 주간 리포트

```js
// Response
{
  period: { start: "2026-01-20", end: "2026-01-26" },
  summary: "이번 주는 전반적으로 안정적인 상태입니다...",
  metrics: {
    medicationRate: { value: 92, change: -1.2, trend: "DOWN" },
    emotionStatus: { value: "POSITIVE", keywords: ["평온함"] },
    activityLevel: { value: "NORMAL", averageSteps: 2500 }
  },
  topKeywords: [
    { word: "손자", count: 23 },
    { word: "건강", count: 18 }
  ],
  recommendations: [
    "수분 섭취를 더 자주 권유하세요."
  ]
}
```

---

## 9. 순찰 피드

### GET `/api/elders/{elderId}/patrol/latest`
> 최근 순찰 결과

```js
// Response
{
  lastPatrolAt: "2026-01-29T09:35:00+09:00",
  items: [
    { target: "GAS_VALVE", label: "가스밸브", status: "NORMAL" },
    { target: "DOOR", label: "현관문", status: "LOCKED" }
  ]
}
```

---

## 10. 설정 API

### GET `/api/users/me/settings`
> 사용자 설정

```js
// Response
{
  notifications: {
    emergency: true,
    medication: true,
    daily: false,
    email: false
  },
  theme: "SYSTEM"  // SYSTEM | LIGHT | DARK
}
```

### PATCH `/api/users/me/settings`
> 설정 변경

```js
// Request
{
  notifications: { emergency: true, medication: true },
  theme: "DARK"
}
```

### PATCH `/api/robots/{robotId}/settings`
> 로봇 설정 변경

```js
// Request
{
  morningMedicationTime: "08:00",
  eveningMedicationTime: "19:00",
  ttsVolume: 70
}
```

---

## 11. WebSocket 연결

### 연결 방법
```js
const ws = new WebSocket(`wss://i14c104.p.ssafy.io/ws?token=${accessToken}`);

ws.onopen = () => {
  // 관심 노인 구독
  ws.send(JSON.stringify({
    type: "SUBSCRIBE",
    payload: { elderIds: [1, 2, 3] }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleWebSocketMessage(message);
};
```

### 수신 메시지 타입

#### `EMERGENCY_ALERT` - 긴급 상황 (최우선 처리)
```js
{
  type: "EMERGENCY_ALERT",
  payload: {
    emergencyId: 123,
    elderId: 1,
    elderName: "김옥분",
    type: "FALL_DETECTED",
    location: "거실"
  }
}
```

#### `NOTIFICATION` - 일반 알림
```js
{
  type: "NOTIFICATION",
  payload: {
    id: 456,
    type: "MEDICATION",
    title: "약 복용 완료",
    elderId: 1
  }
}
```

#### `ROBOT_STATUS_UPDATE` - 로봇 상태 변경
```js
{
  type: "ROBOT_STATUS_UPDATE",
  payload: {
    robotId: 1,
    batteryLevel: 84,
    currentLocation: "주방",
    lcdMode: "IDLE"
  }
}
```

#### `ELDER_STATUS_UPDATE` - 노인 상태 변경
```js
{
  type: "ELDER_STATUS_UPDATE",
  payload: {
    elderId: 1,
    status: "SAFE",
    lastActivity: "2026-01-29T10:25:00+09:00"
  }
}
```

#### `LCD_MODE_CHANGE` - LCD 화면 변경 (미러링용)
```js
{
  type: "LCD_MODE_CHANGE",
  payload: {
    robotId: 1,
    mode: "MEDICATION",
    emotion: "neutral",
    message: "할머니~ 약 드실 시간이에요!"
  }
}
```

### 송신 메시지

#### `SUBSCRIBE` - 구독
```js
{ type: "SUBSCRIBE", payload: { elderIds: [1, 2] } }
```

#### `PING` - 연결 유지 (30초마다)
```js
{ type: "PING" }
```

---

## 12. 에러 처리

### 공통 에러 응답
```js
{
  success: false,
  error: {
    code: "UNAUTHORIZED",
    message: "인증이 필요합니다"
  }
}
```

### 에러 코드
| HTTP | code | 설명 |
|------|------|------|
| 400 | `INVALID_REQUEST` | 잘못된 요청 |
| 401 | `UNAUTHORIZED` | 인증 필요 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |

### axios 인터셉터 예시
```js
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 시도 또는 로그아웃
      return refreshTokenAndRetry(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 13. React Query 사용 예시

```js
// 노인 목록 조회
const { data: elders } = useQuery({
  queryKey: ['elders'],
  queryFn: () => api.get('/api/elders').then(res => res.data.data)
});

// 복약 현황 조회
const { data: medications } = useQuery({
  queryKey: ['medications', elderId],
  queryFn: () => api.get(`/api/elders/${elderId}/medications`).then(res => res.data.data)
});

// 일정 등록
const mutation = useMutation({
  mutationFn: (schedule) => api.post(`/api/elders/${elderId}/schedules`, schedule),
  onSuccess: () => queryClient.invalidateQueries(['schedules', elderId])
});
```

---

## 📞 문의

- 전체 API 명세: [api-specification.md](./api-specification.md)
- 백엔드 담당자에게 문의
