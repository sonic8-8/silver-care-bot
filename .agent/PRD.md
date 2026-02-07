# PRD: AI 반려로봇 웹 서비스

> **프로젝트명**: 동행 AI 반려로봇
> **작성일**: 2026-02-02
> **버전**: v2.0 (서비스 구현용)
> **개발자**: 1인 풀스택

---

## 1. 개요

### 1.1 목적

독거노인의 일상을 돌보는 AI 반려로봇과 연동되는 웹 서비스 개발.
보호자/복지사가 원격으로 어르신의 상태를 모니터링하고, 로봇과 실시간 통신할 수 있는 풀스택 애플리케이션.

### 1.2 사용자

| 사용자 | 역할 | 어르신 수 | 주요 활동 |
|--------|------|----------|----------|
| **복지사** (WORKER) | 다수 어르신 관리 | **N명** | 모니터링, 일정/약 관리, 긴급 대응 |
| **가족/보호자** (FAMILY) | 본인 부모님 관리 | **1명만** | 상태 확인, 원격 제어, 알림 수신 |
| **어르신** | 로봇과 상호작용 | - | LCD 화면으로 알림 확인, 음성 대화 |
| **로봇** (Jetson Orin) | AI + 센서 | - | 상태 보고, 명령 수신, LCD 화면 표시 |

> **가족 1명 제한 이유**: 독거노인 돌봄 서비스 특성상 가족은 본인 부모님 1명만 관리하는 것이 일반적. UX 단순화 및 역할 분리 명확화.

### 1.3 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐│
│  │  보호자 웹앱  │  REST   │   Backend    │  REST   │   Robot System       ││
│  │  (React)     │◀───────▶│ (Spring Boot)│◀───────▶│ ┌──────────────────┐ ││
│  └──────────────┘         │              │         │ │ Jetson Orin Nano │ ││
│                           │              │ WebSocket││ (AI/LLM + 통신)   │ ││
│  ┌──────────────┐         │              │◀────────▶│ │       │          │ ││
│  │  로봇 LCD    │  WS     │              │         │ │  ┌────┴────┐     │ ││
│  │  (React)     │◀───────▶│              │         │ │  │ Arduino │     │ ││
│  └──────────────┘         └──────────────┘         │ │  │(모터/센서)│     │ ││
│                                  │                 │ └──────────────────┘ ││
│                                  ▼                 └──────────────────────┘│
│                           ┌──────────────┐                                  │
│                           │  PostgreSQL  │                                  │
│                           └──────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 통신 방식

| 대상 | 프로토콜 | 용도 |
|------|----------|------|
| 로봇 ↔ 서버 | REST API | CRUD, 상태 동기화 (60초 heartbeat) |
| 로봇 ↔ 서버 | WebSocket | 실시간 이벤트 (긴급, LCD 전환) |
| 웹앱 ↔ 서버 | REST API | 데이터 조회/수정 |
| 웹앱 ↔ 서버 | WebSocket | 대시보드 실시간 업데이트 |

---

## 2. 기술 스택

### 2.1 Frontend

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | React + Vite | 19.x / 7.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + cva | 3.x |
| Animation | Framer Motion | 11.x |
| State (Server) | TanStack Query | 5.x |
| State (Client) | Zustand | 5.x |
| Routing | React Router | 7.x |
| HTTP Client | Axios | 1.x |
| Testing | Vitest + RTL + Playwright | - |

### 2.2 Backend

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | Spring Boot | 3.x |
| Language | Java | 17+ |
| ORM | Spring Data JPA | - |
| Database | PostgreSQL | 15+ |
| Security | Spring Security + JWT | - |
| WebSocket | Spring WebSocket + STOMP | - |
| Docs | Spring REST Docs | - |
| Build | Gradle | 8.x |
| Testing | JUnit5 + Mockito | - |

### 2.3 Infrastructure

| 카테고리 | 기술 |
|----------|------|
| Container | Docker + Docker Compose |
| CI/CD | Jenkins |
| Reverse Proxy | Nginx |
| Server | EC2 (SSAFY 제공) |

---

## 3. 기능 요구사항

### 3.1 Phase 1: 핵심 기능 (Critical)

> 서비스 동작을 위한 최소 필수 기능

#### 3.1.1 인증 (Auth)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| AUTH-01 | 회원가입 | 이메일, 비밀번호, 이름, 연락처, 역할(WORKER/FAMILY) | `POST /api/auth/signup` |
| AUTH-02 | 로그인 | JWT 토큰 발급 (Access + Refresh) | `POST /api/auth/login` |
| AUTH-03 | 로봇 인증 | 시리얼번호 + 인증코드로 로봇 로그인 | `POST /api/auth/robot/login` |
| AUTH-04 | 토큰 갱신 | Refresh Token으로 Access Token 재발급 | `POST /api/auth/refresh` |

#### 3.1.2 노인 관리 (Elder)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| ELDER-01 | 노인 등록 | 이름, 생년월일, 주소, 긴급연락처 | `POST /api/elders` |
| ELDER-02 | 목록 조회 | 담당 노인 목록 + 상태 요약 | `GET /api/elders` |
| ELDER-03 | 상세 조회 | 노인 상세정보 + 로봇 상태 | `GET /api/elders/{elderId}` |
| ELDER-04 | 정보 수정 | 건강정보, 연락처 수정 | `PUT /api/elders/{elderId}` |

#### 3.1.3 로봇 상태/제어 (Robot)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| ROBOT-01 | 상태 조회 | 배터리, 위치, LCD 모드 | `GET /api/robots/{robotId}/status` |
| ROBOT-02 | 명령 전송 | 이동, 순찰, TTS, LCD 변경 | `POST /api/robots/{robotId}/commands` |
| ROBOT-03 | 상태 동기화 | 60초 heartbeat (로봇 → 서버) | `POST /api/robots/{robotId}/sync` |
| ROBOT-04 | LCD 조회 | LCD 현재 화면 (웹앱 프리뷰) | `GET /api/robots/{robotId}/lcd` |

#### 3.1.4 긴급 상황 (Emergency)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| EMERG-01 | 긴급 보고 | 낙상, SOS, 미응답 (로봇 → 서버) | `POST /api/robots/{robotId}/emergency` |
| EMERG-02 | 긴급 해제 | 오인 감지, 상황 해결 | `PATCH /api/emergencies/{id}/resolve` |
| EMERG-03 | 실시간 알림 | WebSocket 긴급 알림 | `WS: EMERGENCY_ALERT` |

---

### 3.2 Phase 2: 주요 기능 (High)

> 서비스 가치를 높이는 핵심 기능

#### 3.2.1 복약 관리 (Medication)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| MED-01 | 약 등록 | 이름, 용량, 복용시간(아침/저녁) | `POST /api/elders/{elderId}/medications` |
| MED-02 | 복용 현황 | 주간 복용률, 일별 상태 | `GET /api/elders/{elderId}/medications` |
| MED-03 | 복용 기록 | 복용 완료/누락 (로봇 → 서버) | `POST /api/elders/{elderId}/medications/records` |
| MED-04 | 약 수정/삭제 | 약 정보 변경 | `PUT/DELETE /api/elders/{elderId}/medications/{id}` |

#### 3.2.2 일정 관리 (Schedule)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| SCHED-01 | 일정 등록 | 제목, 일시, 장소, 알림시간 | `POST /api/elders/{elderId}/schedules` |
| SCHED-02 | 일정 조회 | 기간별 일정 목록 | `GET /api/elders/{elderId}/schedules` |
| SCHED-03 | 음성 일정 | 어르신 음성 → AI 파싱 → 일정 등록 | `POST /api/elders/{elderId}/schedules/voice` |
| SCHED-04 | 일정 수정/삭제 | 일정 변경 | `PUT/DELETE /api/elders/{elderId}/schedules/{id}` |

#### 3.2.3 알림 시스템 (Notification)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| NOTI-01 | 알림 목록 | 전체 알림 히스토리 | `GET /api/notifications` |
| NOTI-02 | 읽음 처리 | 개별/전체 읽음 | `PATCH /api/notifications/{id}/read` |
| NOTI-03 | 실시간 알림 | WebSocket 푸시 | `WS: NOTIFICATION` |
| NOTI-04 | 알림 설정 | 유형별 ON/OFF | `PATCH /api/users/me/settings` |

#### 3.2.4 대시보드 (Dashboard)

| ID | 기능 | 설명 |
|----|------|------|
| DASH-01 | 오늘의 요약 | 기상시간, 복용현황, 활동상태 |
| DASH-02 | 최근 알림 | 최근 5개 알림 |
| DASH-03 | 주간 캘린더 | 이번 주 일정 |
| DASH-04 | 로봇 상태 | 배터리, 연결상태 (실시간) |
| DASH-05 | 실시간 업데이트 | WebSocket 상태 반영 |

---

### 3.3 Phase 3: 부가 기능 (Medium)

> 서비스 완성도를 높이는 기능

#### 3.3.1 활동 로그 (Activity)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| LOG-01 | 일일 로그 | 기상, 식사, 외출, 귀가 타임라인 | `GET /api/elders/{elderId}/activities` |
| LOG-02 | 날짜별 조회 | 과거 날짜 활동 기록 | `GET /api/elders/{elderId}/activities?date=` |

#### 3.3.2 AI 리포트 (Report)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| REPORT-01 | 주간 리포트 | 복용률, 활동량, 대화 키워드 요약 | `GET /api/elders/{elderId}/reports/weekly` |

#### 3.3.3 순찰 피드 (Patrol)

| ID | 기능 | 설명 | API |
|----|------|------|-----|
| PATROL-01 | 순찰 결과 | 가스밸브, 창문, 콘센트 상태 | `GET /api/elders/{elderId}/patrol/latest` |
| PATROL-02 | 순찰 보고 | Vision AI 결과 (로봇 → 서버) | `POST /api/robots/{robotId}/patrol/report` |

---

### 3.4 Phase 4: 고급 기능 (Low)

> MVP 이후 추가 검토

| ID | 기능 | 설명 |
|----|------|------|
| MAP-01 | 안심 지도 | Visual SLAM 맵 + 로봇 위치 표시 |
| VIDEO-01 | 영상 스냅샷 | 순찰 시 이미지 캡처 |

---

### 3.5 후순위 기능 (Deferred)

| 기능 | 이유 |
|------|------|
| 낙상 판단 (Vision) | AI 정확도 검증 필요 |
| 투약 여부 확인 (Vision) | 디스펜서 연동 복잡도 |
| 감정 분석 (Speech) | STT 정확도 이슈 |
| 디스펜서 자동 배출 | 하드웨어 연동 복잡도 |

---

## 4. 화면 명세

### 4.1 역할별 화면 흐름

#### 복지사 (WORKER)
- 여러 어르신 담당 가능 (N명)
- 로그인 후 → **노인 선택 화면** (`/elders`) → 대시보드

```
로그인 → /elders (노인 선택) → /elders/:id (대시보드) → 각 기능 화면
```

#### 가족 (FAMILY)
- **1명의 어르신만 등록 가능**
- 로그인 후 → **대시보드 바로 이동** (노인 선택 화면 스킵)

```
로그인 → /elders/:id (대시보드 바로 이동) → 각 기능 화면
```

> **설계 이유**: 독거노인 돌봄 서비스 특성상, 가족은 본인 부모님 1명만 관리하는 것이 일반적. 불필요한 화면 단계를 줄여 UX 단순화.

### 4.2 보호자 웹앱 화면

| # | 화면 | 경로 | 대상 | 설명 |
|---|------|------|------|------|
| 1 | 로그인 | `/login` | 공통 | 보호자/로봇 로그인 탭 |
| 2 | 회원가입 | `/signup` | 공통 | 보호자 계정 생성 (역할 선택) |
| 3 | 노인 선택 | `/elders` | **복지사만** | 담당 노인 목록 |
| 4 | 홈 대시보드 | `/elders/:id` | 공통 | 어르신 상태 요약 |
| 5 | 일정 관리 | `/elders/:id/schedule` | 공통 | 주간 캘린더/리스트 |
| 6 | 로봇 제어 | `/elders/:id/robot` | 공통 | 로봇 상태/명령 |
| 7 | 기록 | `/elders/:id/history` | 공통 | 활동 로그/AI 리포트 |
| 8 | 약 관리 | `/elders/:id/medications` | 공통 | 복약 현황 |
| 9 | 알림 | `/notifications` | 공통 | 알림 목록 |
| 10 | 설정 | `/settings` | 공통 | 프로필/알림 설정 |
| 11 | 긴급 상황 | `/emergency/:id` | 공통 | 풀스크린 경고 |
| 12 | LCD 미러링 | `/elders/:id/robot/lcd` | 공통 | 로봇 화면 프리뷰 |

### 4.3 로봇 LCD 화면

| # | 모드 | 트리거 | 표정 | UI |
|---|------|--------|------|-----|
| 1 | IDLE | 평상시 | neutral | 메시지 + 다음 일정 |
| 2 | GREETING | 기상/귀가 | happy | 인사말 + 날씨 |
| 3 | MEDICATION | 약 시간 | happy | 초대형 버튼 2개 |
| 4 | SCHEDULE | 일정 N분 전 | neutral | 일정 카드 |
| 5 | LISTENING | 음성 인식 | neutral | 파동 애니메이션 |
| 6 | EMERGENCY | 낙상 감지 | neutral | 배경 점멸 + 119 버튼 |
| 7 | SLEEP | 충전 중 | sleep | 충전 상태 |

---

## 5. 비기능 요구사항

### 5.1 성능

| ID | 요구사항 | 목표 |
|----|----------|------|
| NFR-01 | API 응답 시간 | 95% 요청 500ms 이내 |
| NFR-02 | WebSocket 지연 | 1초 이내 |
| NFR-03 | 동시 접속 | 100명 이상 |

### 5.2 보안

| ID | 요구사항 | 구현 |
|----|----------|------|
| NFR-04 | 비밀번호 | BCrypt 해싱 |
| NFR-05 | 인증 | JWT (Access 1h + Refresh 7d) |
| NFR-06 | 통신 | HTTPS + WSS |

### 5.3 로봇 연결

| ID | 요구사항 | 값 | 근거 |
|----|----------|-----|------|
| NFR-07 | Heartbeat | 60초 | MQTT/AWS IoT 권장 |
| NFR-08 | 오프라인 판정 | 2분 | Heartbeat 2회 미수신 |
| NFR-09 | 오프라인 알림 | 30분 후 | 보건복지부 가이드라인 |

### 5.4 접근성

| 앱 | 기준 | 세부 |
|----|------|------|
| 보호자 웹앱 | WCAG AA | 대비율 4.5:1, 터치 48px |
| 로봇 LCD | WCAG AAA | 대비율 7:1, 터치 64px, 폰트 24px+ |

---

## 6. 데이터 모델

### 6.1 ERD 개요

```
User (1) ───────< Elder (N) ───────< Robot (1)
  │                  │                  │
  │                  ├──< Medication    ├──< PatrolResult
  │                  ├──< Schedule      ├──< Event
  │                  ├──< Activity      └──< Command
  │                  └──< Emergency
  │
  └──< Notification
```

### 6.2 주요 테이블

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|----------|
| `users` | 사용자 | email, password, name, phone, role |
| `elders` | 노인 | name, birth_date, address, status |
| `user_elders` | 사용자-노인 연결 | user_id, elder_id |
| `robots` | 로봇 | serial_number, elder_id, battery, lcd_mode |
| `medications` | 약 정보 | elder_id, name, frequency, timing |
| `medication_logs` | 복용 기록 | medication_id, date, status, taken_at |
| `schedules` | 일정 | elder_id, title, datetime, type, source |
| `activities` | 활동 로그 | elder_id, type, timestamp, location |
| `notifications` | 알림 | user_id, type, title, is_read |
| `emergencies` | 긴급 상황 | elder_id, type, location, resolved |

> 상세 ERD: `docs/database-erd.md` 참조

---

## 7. API 우선순위

| Phase | 우선순위 | API 개수 | 주요 기능 |
|-------|---------|---------|----------|
| Phase 1 | Critical | ~15개 | 인증, 노인, 로봇 상태, 긴급 |
| Phase 2 | High | ~12개 | 복약, 일정, 알림 |
| Phase 3 | Medium | ~8개 | 활동 로그, 리포트, 순찰 |
| Phase 4 | Low | ~5개 | 안심 지도, 고급 분석 |

> 상세 API 명세: `docs/api-specification.md` 참조

---

## 8. WebSocket 토픽

| 토픽 | 용도 | 방향 |
|------|------|------|
| `/topic/robot/{robotId}/status` | 로봇 상태 업데이트 | 서버 → 클라이언트 |
| `/topic/robot/{robotId}/lcd` | LCD 화면 전환 | 서버 → 클라이언트 |
| `/topic/elder/{elderId}/status` | 노인 상태 변경 | 서버 → 클라이언트 |
| `/topic/user/{userId}/notifications` | 알림 | 서버 → 클라이언트 |
| `/topic/emergency` | 긴급 알림 (브로드캐스트) | 서버 → 클라이언트 |

---

## 9. 성공 지표

| 지표 | 목표 |
|------|------|
| Phase 1 완료 | 인증 + 노인/로봇 CRUD + 긴급 알림 동작 |
| Phase 2 완료 | 복약/일정 관리 + 대시보드 실시간 업데이트 |
| 로봇 연동 | WebSocket 양방향 통신 + LCD 전환 |
| 접근성 | Lighthouse Accessibility 90+ |
| 테스트 커버리지 | Backend 80% / Frontend 70% |

---

## 10. 범위 외 (Out of Scope)

- iOS/Android 네이티브 앱
- 실시간 영상 스트리밍
- 다국어 지원 (한국어만)
- 결제/구독 시스템

---

## 11. 참고 문서

| 문서 | 위치 |
|------|------|
| 요구사항 명세 | `docs/requirements-specification.md` |
| API 명세서 | `docs/api-specification.md` |
| DB ERD | `docs/database-erd.md` |
| 페르소나/시나리오 | `docs/persona-scenario.md` |
| UI 설계서 | `docs/ui-implementation-plan.md` |
| 의사결정 기록 | `.agent/ADR.md` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-01-22 | 초안 (UI 리디자인 중심) |
| v2.0 | 2026-02-02 | 서비스 구현용 PRD 재작성. FE+BE 통합, PostgreSQL, 로봇 WebSocket 연동 포함 |
