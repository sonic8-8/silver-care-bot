# 병렬 작업 분배 전략

> **버전**: v1.0
> **작성일**: 2026-02-02
> **기반 문서**: [PLAN.md](./PLAN.md)

---

## 1. 핵심 원칙

### Kent Beck의 병렬 작업 원칙

| 원칙 | 설명 | 적용 |
|------|------|------|
| **Independence** | 서로 의존하지 않는 작업 분리 | 도메인 경계로 분리 |
| **Tiny Steps** | 작은 단위로 쪼개기 | 1개 API = 1 커밋 |
| **Always Shippable** | 언제든 머지 가능 | 각 에이전트 결과물 독립 동작 |
| **Contract First** | 인터페이스 먼저 합의 | Phase 0에서 공통 규격 정의 |

### 병렬화 가능 조건

```
✅ 병렬 가능: 서로 다른 파일/모듈 수정
✅ 병렬 가능: 같은 도메인의 BE/FE (인터페이스 합의 후)
❌ 순차 필요: 공통 Entity → 이를 사용하는 Service
❌ 순차 필요: 인증 → 인증 필요한 API
```

---

## 2. Phase 0: 인프라 설정 (병렬)

> **목표**: 4개 에이전트가 독립적으로 개발 환경 구축
> **예상 소요**: 각 에이전트 동시 작업

### Agent 분배

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Phase 0: 인프라 설정                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Agent 1    │  │  Agent 2    │  │  Agent 3    │  │  Agent 4    │ │
│  │  BE-INFRA   │  │  FE-INFRA   │  │  DB-SCHEMA  │  │  CONTRACTS  │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤ │
│  │ Spring Boot │  │ Vite+React  │  │ Flyway 설정  │  │ API 응답 형식│ │
│  │ PostgreSQL  │  │ Tailwind    │  │ ENUM 생성   │  │ Error 규격  │ │
│  │ Security    │  │ Router      │  │ 7개 Entity  │  │ MSW 핸들러  │ │
│  │ REST Docs   │  │ TanStack Q  │  │ Repository  │  │ Axios 설정  │ │
│  │ Docker      │  │ Zustand     │  │             │  │ 공통 타입   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                     │
│  의존성: 없음 (모두 독립 작업 가능)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent 1: Backend Infrastructure

**디렉토리**: `/backend`

```markdown
## 작업 목록

- [ ] Spring Boot 프로젝트 생성 (Gradle, Java 17)
- [ ] `application.yml` 설정
  - [ ] PostgreSQL 연결
  - [ ] JPA/Hibernate 설정
  - [ ] JWT secret 환경변수
- [ ] Spring Security 기본 설정
  - [ ] SecurityConfig.java
  - [ ] CORS 설정
  - [ ] 인증 제외 경로 설정
- [ ] Spring REST Docs 설정
  - [ ] AsciiDoc 설정
  - [ ] 테스트 상위 클래스
- [ ] Docker Compose
  - [ ] PostgreSQL 컨테이너
  - [ ] App 컨테이너
  - [ ] 네트워크 설정

## 산출물
- `/backend/build.gradle`
- `/backend/src/main/resources/application.yml`
- `/backend/src/main/java/.../config/SecurityConfig.java`
- `/backend/docker-compose.yml`
```

### Agent 2: Frontend Infrastructure

**디렉토리**: `/frontend`

```markdown
## 작업 목록

- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정
  - [ ] `tailwind.config.js`
  - [ ] 커스텀 색상 팔레트
  - [ ] cva + tailwind-merge
- [ ] Framer Motion 설치
- [ ] React Router 설정
  - [ ] 라우트 정의
  - [ ] Layout 컴포넌트
- [ ] TanStack Query 설정
  - [ ] QueryClient 설정
  - [ ] 기본 옵션 (staleTime, gcTime)
- [ ] Zustand 기본 구조
- [ ] Vitest + RTL 설정

## 산출물
- `/frontend/package.json`
- `/frontend/vite.config.ts`
- `/frontend/tailwind.config.js`
- `/frontend/src/app/router.tsx`
- `/frontend/src/app/providers.tsx`
```

### Agent 3: Database Schema

**디렉토리**: `/backend/src/main/resources/db/migration`

```markdown
## 작업 목록

- [ ] Flyway 설정
- [ ] V1__create_enums.sql
  - [ ] user_role (WORKER, FAMILY)
  - [ ] elder_status (SAFE, WARNING, DANGER)
  - [ ] robot_connection_status (CONNECTED, DISCONNECTED)
  - [ ] lcd_mode (IDLE, GREETING, MEDICATION, ...)
  - [ ] command_type (MOVE_TO, SPEAK, ...)
  - [ ] emergency_type, resolution_type
- [ ] V2__create_core_tables.sql
  - [ ] USER, ELDER, EMERGENCY_CONTACT
  - [ ] ROBOT, ROOM
  - [ ] EMERGENCY, ROBOT_COMMAND
- [ ] Entity 클래스 생성 (7개)
  - [ ] User.java
  - [ ] Elder.java
  - [ ] EmergencyContact.java
  - [ ] Robot.java
  - [ ] Room.java
  - [ ] Emergency.java
  - [ ] RobotCommand.java
- [ ] Repository 인터페이스 생성 (7개)

## 산출물
- `/backend/src/main/resources/db/migration/V1__*.sql`
- `/backend/src/main/resources/db/migration/V2__*.sql`
- `/backend/src/main/java/.../domain/*/Entity.java`
- `/backend/src/main/java/.../domain/*/Repository.java`
```

### Agent 4: Contracts & Mocks

**디렉토리**: `/backend` + `/frontend`

```markdown
## 작업 목록

### Backend
- [ ] ApiResponse<T> 공통 응답 형식
- [ ] ErrorResponse 에러 응답 형식
- [ ] GlobalExceptionHandler
  - [ ] 400 Bad Request
  - [ ] 401 Unauthorized
  - [ ] 403 Forbidden
  - [ ] 404 Not Found
  - [ ] 500 Internal Server Error

### Frontend
- [ ] 공통 타입 정의 (`/shared/types/`)
  - [ ] api.types.ts (ApiResponse, ErrorResponse)
  - [ ] user.types.ts
  - [ ] elder.types.ts
  - [ ] robot.types.ts
- [ ] Axios 인스턴스 설정
  - [ ] baseURL
  - [ ] 토큰 인터셉터 (placeholder)
  - [ ] 에러 핸들링
- [ ] MSW 설정
  - [ ] browser.ts
  - [ ] server.ts
  - [ ] 핸들러 디렉토리 구조

## 산출물
- `/backend/src/main/java/.../api/common/ApiResponse.java`
- `/backend/src/main/java/.../api/common/ErrorResponse.java`
- `/frontend/src/shared/types/*.ts`
- `/frontend/src/shared/api/axios.ts`
- `/frontend/src/mocks/browser.ts`
```

---

## 3. Phase 1: 핵심 기능 (도메인별 병렬)

> **목표**: 도메인별 Full-Stack 구현
> **의존성**: Phase 0 완료 후 시작

### 의존성 그래프

```
                    ┌─────────────┐
                    │   Phase 0   │
                    │  (병렬 완료) │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Agent 1    │ │  Agent 3    │ │  Agent 4    │
    │    AUTH     │ │   ROBOT     │ │  WEBSOCKET  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │    ┌──────────┴──────────┐    │
           │    │                     │    │
           ▼    ▼                     ▼    ▼
    ┌─────────────────────────────────────────────┐
    │                  Agent 2                    │
    │            ELDER + EMERGENCY                │
    │    (인증 필요, 로봇 상태 참조 가능)           │
    └─────────────────────────────────────────────┘
```

### Agent 1: Auth 도메인 (선행 작업)

**우선순위**: ⭐⭐⭐ Critical (다른 도메인이 의존)

```markdown
## 작업 범위: PLAN.md 1.2 + 1.3

### Backend (TDD 필수)
- [ ] POST /api/auth/signup - 회원가입
- [ ] POST /api/auth/login - 로그인
- [ ] POST /api/auth/refresh - 토큰 갱신
- [ ] POST /api/auth/robot/login - 로봇 인증
- [ ] JwtAuthenticationFilter
- [ ] Security 설정 (permitAll, authenticated)

### Frontend
- [ ] 로그인 페이지 (/login)
- [ ] 회원가입 페이지 (/signup)
- [ ] useAuth 훅 (TDD 필수)
- [ ] AuthStore (Zustand)
- [ ] ProtectedRoute
- [ ] 역할별 라우팅 분기
- [ ] Axios 인터셉터 (토큰 자동 첨부)

## 완료 조건
- [ ] 회원가입 → 로그인 → 보호된 API 호출 E2E 동작
- [ ] WORKER: /elders로 리다이렉트
- [ ] FAMILY: /elders/:elderId로 직행
```

### Agent 2: Elder + Emergency 도메인

**의존성**: Auth 완료 후 (또는 Mock 인증으로 시작)

```markdown
## 작업 범위: PLAN.md 1.4 + 1.5 + 1.9 + 1.10

### Backend (TDD 필수)
- [ ] CRUD: /api/elders
- [ ] CRUD: /api/elders/{elderId}/contacts
- [ ] POST /api/robots/{robotId}/emergency
- [ ] GET /api/emergencies
- [ ] PATCH /api/emergencies/{id}/resolve

### Frontend
- [ ] 노인 선택 페이지 (/elders)
- [ ] 노인 카드 + 상태 뱃지
- [ ] 긴급연락처 관리 UI
- [ ] 긴급 상황 페이지 (/emergency/:id)
- [ ] 풀스크린 경고 UI

## 완료 조건
- [ ] 노인 CRUD 완전 동작
- [ ] 긴급 상황 발생 → 보호자 확인 → 해제 플로우
```

### Agent 3: Robot 도메인

**의존성**: Auth 완료 후 (또는 Mock 인증으로 시작)

```markdown
## 작업 범위: PLAN.md 1.6 + 1.7 + 1.8

### Backend (TDD 필수)
- [ ] GET /api/robots/{robotId}/status
- [ ] POST /api/robots/{robotId}/commands
- [ ] POST /api/robots/{robotId}/sync (Heartbeat)
- [ ] GET /api/robots/{robotId}/lcd
- [ ] 오프라인 판정 스케줄러 (2분)
- [ ] 오프라인 알림 스케줄러 (30분)

### Frontend
- [ ] 로봇 제어 페이지 (/elders/:id/robot)
- [ ] 배터리/연결 상태 표시
- [ ] 이동 명령 버튼
- [ ] TTS 메시지 입력
- [ ] LCD 모드 변경
- [ ] LCD 미러링 페이지

## 완료 조건
- [ ] 명령 전송 → 로봇 응답 시뮬레이션
- [ ] 2분 미수신 → 오프라인 판정
```

### Agent 4: WebSocket 인프라

**의존성**: BE-INFRA 완료 후

```markdown
## 작업 범위: PLAN.md 1.11

### Backend
- [ ] STOMP + SockJS 설정
- [ ] WebSocket 인증 (JWT)
- [ ] 5개 토픽 정의
  - [ ] /topic/robot/{robotId}/status
  - [ ] /topic/robot/{robotId}/lcd
  - [ ] /topic/elder/{elderId}/status
  - [ ] /topic/user/{userId}/notifications
  - [ ] /topic/emergency
- [ ] 메시지 브로커 설정

### Frontend
- [ ] SockJS + STOMP 클라이언트
- [ ] useWebSocket 훅 (TDD 필수)
  - [ ] 자동 재연결 로직
  - [ ] 구독/해제 관리
- [ ] 연결 상태 표시 컴포넌트

## 완료 조건
- [ ] 서버 → 클라이언트 실시간 메시지 수신
- [ ] 연결 끊김 시 자동 재연결 (지수 백오프)
```

---

## 4. Phase 1 병렬화 전략

### 권장 순서

```
시간 →
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent 1 (AUTH):
[████████████████] BE Auth → [████████████████] FE Auth
        ↓ 완료 시점에 다른 Agent가 인증 사용 가능

Agent 2 (ELDER):
        [████████████████████████████████████████████]
        BE Elder (Mock Auth) → FE Elder → BE Emergency → FE Emergency

Agent 3 (ROBOT):
        [████████████████████████████████████████████]
        BE Robot (Mock Auth) → FE Robot → BE Scheduler

Agent 4 (WEBSOCKET):
[████████████████████████████] BE WebSocket → FE WebSocket
                              ↓ 완료 시점에 다른 Agent가 실시간 기능 통합

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Mock 전략 (의존성 우회)

Agent 2, 3이 Auth 완료 전에 작업하려면:

```java
// 테스트용 Mock Security Context
@WithMockUser(username = "test@test.com", roles = {"WORKER"})
class ElderControllerTest { ... }
```

```typescript
// MSW Mock 인증 핸들러
http.post('/api/auth/login', () => {
  return HttpResponse.json({
    accessToken: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  });
});
```

---

## 5. Phase 2-3 병렬화

### Phase 2 도메인 분배

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Agent 1    │  │  Agent 2    │  │  Agent 3    │  │  Agent 4    │
│ MEDICATION  │  │  SCHEDULE   │  │NOTIFICATION │  │  DASHBOARD  │
├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤
│ BE: 복약 API │  │ BE: 일정 API │  │ BE: 알림 API │  │ BE: 대시보드 │
│ FE: 복약 UI  │  │ FE: 캘린더   │  │ FE: 알림 벨  │  │ FE: 홈 화면  │
│ 복용 기록    │  │ 음성 일정   │  │ 설정 페이지  │  │ 요약 카드   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### Phase 3 도메인 분배

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Agent 1    │  │  Agent 2    │  │  Agent 3    │  │  Agent 4    │
│  ACTIVITY   │  │  AI REPORT  │  │   PATROL    │  │   AI/CONV   │
├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤
│ 활동 로그    │  │ 주간 리포트  │  │ 순찰 결과    │  │ 대화 기록   │
│ 타임라인 UI  │  │ 차트/그래프  │  │ 순찰 피드    │  │ 검색 결과   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 6. 머지 전략

### 브랜치 구조

```
main
  └── develop
        ├── feature/phase0-be-infra      (Agent 1)
        ├── feature/phase0-fe-infra      (Agent 2)
        ├── feature/phase0-db-schema     (Agent 3)
        ├── feature/phase0-contracts     (Agent 4)
        │
        │   ← Phase 0 전체 머지 후 →
        │
        ├── feature/phase1-auth          (Agent 1)
        ├── feature/phase1-elder         (Agent 2)
        ├── feature/phase1-robot         (Agent 3)
        └── feature/phase1-websocket     (Agent 4)
```

### 머지 순서 (Phase 0)

```
1. Agent 3 (DB-SCHEMA) → develop
   └── Entity/Repository가 다른 모듈의 기반

2. Agent 1 (BE-INFRA) → develop
   └── DB 스키마 위에 설정 얹음

3. Agent 4 (CONTRACTS) → develop
   └── 공통 응답 형식 추가

4. Agent 2 (FE-INFRA) → develop
   └── 충돌 없음 (별도 디렉토리)
```

### 머지 순서 (Phase 1)

```
1. Agent 1 (AUTH) → develop ⭐ 최우선
   └── 다른 도메인이 인증 의존

2. Agent 4 (WEBSOCKET) → develop
   └── 실시간 기능 기반

3. Agent 2 (ELDER) + Agent 3 (ROBOT) → develop
   └── 순서 무관 (도메인 독립)
```

---

## 7. 충돌 방지 가이드

### 파일 소유권 명확화

| Agent | Backend 소유 | Frontend 소유 |
|-------|-------------|---------------|
| 1 | `config/Security*`, `api/auth/*` | `features/auth/*`, `pages/Login/*` |
| 2 | `api/elder/*`, `api/emergency/*` | `features/elder/*`, `pages/Elder*/*` |
| 3 | `api/robot/*`, `scheduler/*` | `features/robot/*`, `pages/Robot/*` |
| 4 | `config/WebSocket*`, `api/common/*` | `shared/*`, `mocks/*` |

### 공유 파일 수정 금지

```
⚠️ 다음 파일은 한 Agent만 수정:

/backend/
  └── build.gradle            → Agent 1 전담
  └── application.yml         → Agent 1 전담

/frontend/
  └── package.json            → Agent 2 전담
  └── src/app/router.tsx      → Agent 2 전담 (라우트 추가 시 PR로 요청)
```

### 라우트 추가 규칙

```typescript
// router.tsx 수정 시 주석으로 Agent 표시
export const routes = [
  // Agent 1: Auth
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  // Agent 2: Elder
  { path: '/elders', element: <ElderListPage /> },
  { path: '/elders/:id', element: <ElderDashboardPage /> },

  // Agent 3: Robot
  { path: '/elders/:id/robot', element: <RobotControlPage /> },
];
```

---

## 8. 체크포인트 (Sync Points)

### Phase 0 완료 기준

```markdown
## 모든 Agent 작업 완료 후 확인

- [ ] `docker-compose up` → PostgreSQL + App 정상 실행
- [ ] Flyway 마이그레이션 성공 (V1, V2)
- [ ] `npm run dev` → Frontend 정상 실행
- [ ] MSW Mock API 응답 확인
- [ ] 모든 Entity의 Repository 테스트 통과
```

### Phase 1 완료 기준

```markdown
## 통합 테스트

- [ ] 회원가입 → 로그인 → 노인 등록 → 로봇 명령 E2E
- [ ] 긴급 상황 발생 → WebSocket 알림 → 해제 E2E
- [ ] WORKER/FAMILY 역할별 라우팅 정상
- [ ] 오프라인 판정 스케줄러 동작 확인
```

---

## 9. 요약: 빠른 참조

### Phase 0 (동시 시작)

| Agent | 역할 | 디렉토리 | 핵심 산출물 |
|-------|------|----------|------------|
| 1 | BE-INFRA | `/backend` | Spring Boot, Security, Docker |
| 2 | FE-INFRA | `/frontend` | Vite, Tailwind, Router |
| 3 | DB-SCHEMA | `/backend/.../db/migration` | Flyway, Entity, Repository |
| 4 | CONTRACTS | `/backend` + `/frontend` | ApiResponse, Axios, MSW |

### Phase 1 (Auth 선행)

| Agent | 역할 | 의존성 | 핵심 산출물 |
|-------|------|--------|------------|
| 1 | AUTH | Phase 0 | JWT 인증, 로그인/회원가입 |
| 2 | ELDER | AUTH (Mock 가능) | 노인 CRUD, 긴급 상황 |
| 3 | ROBOT | AUTH (Mock 가능) | 로봇 제어, 오프라인 판정 |
| 4 | WEBSOCKET | Phase 0 | STOMP, 실시간 토픽 |

---

## 10. 커뮤니케이션 규칙

### 일일 싱크

```markdown
## 매일 작업 시작 전 공유

1. 어제 완료한 것
2. 오늘 할 것
3. 블로커 (다른 Agent 작업 필요)
```

### 블로커 해결

```markdown
## 의존성 문제 발생 시

1. Mock으로 우회 가능? → Mock 사용
2. 상대 Agent 작업 급함? → 슬랙으로 요청
3. 둘 다 아니면? → 다른 작업 먼저 진행
```

---

> **다음 단계**: 이 문서 승인 후 Phase 0 작업 시작
