# SCRATCHPAD

> 현재 작업 중인 사고 과정 및 판단 기록

---

## 2026-02-05: Phase 1 AUTH 리뷰 수정 반영 (Agent 1)

### 문제
- FIX-INSTRUCTIONS-P1-AGENT1.md 기준 Major 2, Minor 2 수정 필요

### 판단
- 컴파일 오류(변수명 중복) 우선 해결
- refresh 쿠키 `secure`는 환경/요청 스킴 기반 분기
- refreshToken은 HttpOnly 쿠키 운영으로 프론트 저장 제거
- REST Docs에 `Set-Cookie` 헤더 문서화 추가

### 실행
- `AuthServiceTest.java` 변수명 충돌 수정
- `AuthController.java` refresh 쿠키 secure 분기 적용
- `authStore.ts` refreshToken 상태/저장 제거
- `AuthControllerTest.java` responseHeaders에 `Set-Cookie` 문서화 추가

### 결과
- 컴파일 이슈 해소 및 쿠키 동작/문서화 정합성 개선

### 추가 수정 (리뷰 v4 반영)
**문제**:
- authStore 테스트가 refreshToken localStorage 저장을 기대 (정책 불일치)
- 프록시 환경에서 `request.isSecure()`가 false일 수 있음

**판단**:
- 테스트는 accessToken만 저장하는 현재 정책에 맞춤
- 프록시 환경 대응을 위해 forward header 전략 추가

**실행**:
- `authStore.test.ts`에서 refreshToken 기대값 제거
- `application.yml`에 `server.forward-headers-strategy: framework` 추가

**결과**:
- 테스트 기대값이 정책과 정합, 프록시 환경 쿠키 secure 판정 개선

**테스트 시도**:
- `frontend`: `npm install` 및 `npm run test` 실행
- 결과: npm registry DNS 실패(EAI_AGAIN)로 설치/테스트 불가

**테스트 재시도 (사용자 설치 후)**:
- `frontend`: `npm run test`
- 결과: PASS (Test Files 3 passed, Tests 11 passed)

## 2026-02-04: Agent 1 - docker-compose PostgreSQL + App 구성

### 문제
- 루트 `docker-compose.yml`에서 PostgreSQL 서비스가 없어 `PostgreSQL + App` 구성이 완결되지 않음
- Backend에 DB 접속 환경변수 주입이 필요함

### 판단
- Agent 1 소유 범위(인프라) 내에서 루트 `docker-compose.yml`만 수정
- 기존 포트 매핑(`backend 8082`, `frontend 8081`)은 유지
- DB 값은 `application.yml` 기본값과 일치하도록 `silverbot/postgres/postgres` 사용

### 실행
- `sh/main`에서 `git worktree add ../agent-1 -b feature/phase0-be-infra`로 Agent 1 worktree 생성
- `sh/agent-1`에서 `docker-compose.yml` 수정:
  - `postgres` 서비스 추가 (`postgres:15`)
  - `backend` 환경변수 추가 (`DB_HOST/PORT/NAME/USERNAME/PASSWORD`)
  - `backend` → `postgres` `depends_on`(healthcheck 기반) 추가
  - `app-net` 네트워크 연결 및 `postgres-data` 볼륨 추가

### 결과
- 루트 Compose 기준으로 PostgreSQL + Backend + Frontend 구성 완료
- 인프라 범위 외 파일 수정 없음

### 코드리뷰 반영 (2026-02-04)
- 리뷰 의견: `postgres`의 `5432:5432` 고정 노출은 로컬 DB와 충돌 위험
- 판단: Backend는 내부 네트워크(`postgres:5432`)로 접속하므로 호스트 포트 노출 불필요
- 실행: `docker-compose.yml`에서 `postgres` `ports` 제거
- 결과: 포트 충돌 리스크 제거, 서비스 간 통신 영향 없음

---

## 2026-02-03: 세션 시작 (Agent 2)

### 현재 상태 확인
- 브랜치 규칙 확인: `feature/phase{N}-{domain}`
- 역할: Agent 2 (FE-INFRA / ELDER)
- 워크플로우 문서 확인 필요: `.agent/PRD.md`, `.agent/RULES.md`, `.agent/PLAN.md`, `.agent/PARALLEL-WORK.md`

### 판단
- 작업은 Agent 2 전용 브랜치에서만 진행
- 사용자 요청: Phase 0.2 → 0.4 → Phase 1 순서로 진행
- 프론트엔드 기존 프로젝트 유무 확인 후 계획 수립

### 실행
- `git switch -c feature/phase0-fe-infra` (브랜치 생성)
- `.agent/PARALLEL-WORK.md`, `.agent/PLAN.md` 확인

### 다음 단계
- `.agent/RULES.md`, `.agent/PRD.md` 확인
- `/frontend` 기존 프로젝트 구조 및 설정 파일 확인

---

## 2026-02-03: Phase 0.2 FE-INFRA 정리

### 확인
- `/frontend` 기존 Vite/React/TS 프로젝트 존재
- `tailwind.config.js`, `vite.config.ts`, `msw`, `vitest` 설정 이미 존재
- 기존 `App.tsx`에서 Router/QueryClient를 직접 구성

### 판단
- CLAUDE.md 기준 `src/app/` 구조로 정리 필요
- Router/Providers 분리하여 이후 페이지 확장 대응
- Root 화면은 placeholder `HomeScreen`으로 분리 (파일당 1 컴포넌트)

### 실행
- `frontend/src/app/App.tsx`, `frontend/src/app/router.tsx`, `frontend/src/app/providers.tsx` 생성
- `frontend/src/pages/Home/HomeScreen.tsx` 생성
- `frontend/src/main.tsx` import 경로 변경
- 기존 `frontend/src/App.tsx` 삭제

### 결과
- FE 인프라 구조를 규칙에 맞게 정리 완료

---

## 2026-02-03: Phase 0.4 페이지 컴포넌트 분리 (1차)

### 판단
- 공유 UI(Agent 4) 미완료 상태 → 직접 UI import 없이 페이지 뼈대 먼저 분리
- 라우트는 PLAN 기준 경로로 선등록
- 버튼 최소 48px 등 RULES 준수

### 실행
- 페이지 컴포넌트 12개 생성 (`/frontend/src/pages/**`)
- 컨테이너/하단탭 컴포넌트 생성 (`/frontend/src/pages/_components/**`)
- `frontend/src/app/router.tsx`에 페이지 라우트 추가

### 결과
- Phase 0.4 페이지 구조 골격 완료 (공유 UI 연동은 이후)

## 2026-02-03: 세션 시작 (Agent 4)

### 현재 상태 확인
- 브랜치 규칙 확인: `feature/phase{N}-{domain}`
- 역할: Agent 4 (CONTRACTS / WEBSOCKET)
- 워크플로우 문서 확인: `CLAUDE.md`, `.agent/PLAN.md`, `.agent/PARALLEL-WORK.md`, `.agent/RULES.md`

### 판단
- Agent 4 Phase 0 작업은 `feature/phase0-contracts` 브랜치에서 진행 필요
- 병렬 작업 규칙에 따라 소유 파일(`shared/*`, `mocks/*`, `api/common/*`, `config/WebSocket*`)만 수정

### 실행
- `git switch -c feature/phase0-contracts`
- `git switch feature/phase0-contracts` (브랜치 전환 확인)

### 다음 단계
- 사용자 승인에 따라 Phase 0 계약/Mock/공통 타입 작업 착수

### 문제: 공통 응답 형식/에러 처리 규격 구현 필요

**판단**:
- `docs/api-specification.md`의 공통 응답 형식을 소스 오브 트루스로 사용
- Backend는 `ApiResponse`, `ErrorResponse`, `ErrorCode`, `GlobalExceptionHandler`로 구성
- Frontend는 타입과 MSW 응답을 동일 포맷으로 정렬

**실행**:
- Backend: `api/common` 패키지에 공통 응답/에러 클래스와 글로벌 핸들러 추가
- Frontend: `shared/types` 타입 정의, `shared/api/axios.ts` 인스턴스 추가
- MSW: auth/elder 핸들러를 success/data/timestamp 구조로 수정

**결과**:
- 공통 응답 포맷과 에러 코드 정렬 완료
- MSW 응답이 API 스펙과 일치하도록 업데이트

### 추가 진행 (Agent 1 인프라 가정)

**판단**:
- Spring Security가 추가되었다고 가정하고 인증/권한 예외 핸들링 포함
- 공통 타입/axios 접근성 개선을 위한 배럴 파일 추가

**실행**:
- `GlobalExceptionHandler`에 `AuthenticationException`, `AccessDeniedException` 처리 추가
- `shared/types/index.ts`, `shared/api/index.ts` 배럴 파일 추가
- `ErrorResponse.timestamp` 필수로 정렬

### 진행 2: MSW 확장 + API 응답 유틸

**판단**:
- 로봇/긴급 API는 FE 작업에 필요한 최소 모킹이 필요
- 공통 응답 타입을 다루는 유틸은 테스트가 필요 (TDD 준수)

**실행**:
- MSW: `robot.ts`, `emergency.ts` 핸들러 추가 + index 등록
- MSW: auth 핸들러에 refresh/robot login 추가
- API: `response.ts`에 `ApiError`, `unwrapApiResponse`, 타입 가드 추가
- 테스트: `response.test.ts` 작성

**결과**:
- Phase 0 계약/Mock 범위 확장 완료

### Phase 0.4: 공유 UI 컴포넌트 (Agent 4)

**판단**:
- 공통 UI는 `shared/ui`에 모으고, cva + Tailwind로 variant 정의
- 버튼 최소 48px 터치 타겟 준수

**실행**:
- `shared/ui`: Button, Card, Header, Badge, Input, SectionHeader 추가
- `shared/types`: ui.types.ts, screen.types.ts 추가 + index export

**결과**:
- 공유 UI 컴포넌트/타입 정의 완료 (Agent 2 작업 선행 조건 충족)

## 2026-02-03: 세션 시작 (Agent 1)

### 현재 상태 확인
- 브랜치 규칙 확인: `feature/phase{N}-{domain}`
- 역할: Agent 1 (BE-INFRA / AUTH)
- 워크플로우 문서 확인: `CLAUDE.md`, `.agent/PLAN.md`, `.agent/PARALLEL-WORK.md`, `.agent/RULES.md`

### 판단
- 작업은 Agent 1 전용 브랜치에서만 진행해야 함
- Phase 0 시작 가능성이 높아 `feature/phase0-be-infra` 브랜치 생성

### 실행
- `git checkout -b feature/phase0-be-infra`

### 다음 단계
- 사용자 승인 후 Phase 0 BE-INFRA 범위 작업 진행

---

## 2026-02-03: Phase 0 BE-INFRA 작업 시작

### 문제: BE 인프라 기본 설정 부재
- `application.yml` 없음 (기본 `application.properties`만 존재)
- Spring Security/CORS 설정 미구현
- Flyway/REST Docs 기본 설정 및 테스트 베이스 미비
- 테스트 환경 DB 분리 필요 (PostgreSQL 의존 제거)

### 판단
- `application.yml` 추가 + 환경변수 기반 DB 설정
- 테스트 프로파일(`application-test.yml`)로 H2 사용
- Security 기본 설정(Stateless, CORS, permitAll 경로) 우선 적용
- REST Docs는 build.gradle + test base class로 최소 구성

### 실행 계획
1. `backend/build.gradle` 의존성 보강 (security, flyway, security-test, asciidoctor)
2. `backend/src/main/resources/application.yml` 추가
3. `backend/src/test/resources/application-test.yml` 추가
4. `SecurityConfig` 생성
5. REST Docs 테스트 베이스 추가
6. `backend/docker-compose.yml` 추가

### 실행 결과
- build.gradle 보강 완료 (security, flyway, restdocs asciidoctor, security-test)
- `application.yml`/`application-test.yml` 생성
- `SecurityConfig` 추가 (CORS/Stateless/permitAll)
- REST Docs 테스트 베이스(`RestDocsSupport`) 추가
- `backend/docker-compose.yml` 추가

### 테스트
- `./gradlew test` 실행 실패
  - 에러: `JAVA_HOME is not set and no 'java' command could be found in your PATH.`
  - 원인: 로컬 JDK 미설치/환경변수 미설정

### 브랜치 확인
- 현재 브랜치가 `feature/phase0-fe-infra`로 표시됨
- `feature/phase0-be-infra`로 전환 완료

### 테스트 재시도 (JDK 설치 후)
- `java -version` 확인: OpenJDK 17.0.18
- `./gradlew test` 실패
  - 에러: `/home/seaung13/.gradle/wrapper/...` lock 디렉토리 생성 실패
  - 조치: `GRADLE_USER_HOME`를 프로젝트 내부로 지정
- 재시도 결과: Gradle 배포판 다운로드 중 네트워크 에러
  - 에러: `java.net.SocketException: Operation not permitted`

## 2026-02-03: 세션 시작 (Agent 3)

### 현재 상태 확인
- 브랜치 규칙 확인: `feature/phase{N}-{domain}`
- 역할: Agent 3 (DB-SCHEMA / ROBOT)
- 워크플로우 문서 확인: `CLAUDE.md`, `.agent/PLAN.md`, `.agent/PARALLEL-WORK.md`, `.agent/RULES.md`, `.agent/HANDOFF.md`

### 판단
- 병렬 작업 중이므로 내 역할(Agent 3) 전용 브랜치에서만 작업
- Phase 0 DB 스키마 작업을 우선 수행

### 실행
- `git checkout -b feature/phase0-db-schema`

### 다음 단계
- DB 스키마(V1/V2 마이그레이션) 및 Entity/Repository 생성 작업 착수

### 진행 중 판단/결정
- Postgres 예약어 회피 위해 `USER` 대신 `users` 테이블명 사용
- enum 값은 JPA `EnumType.STRING`과 일치하도록 대문자 표기
- Phase 0 범위 내 핵심 7개 테이블(사용자/어르신/긴급연락처/로봇/방/긴급/로봇명령)만 생성

## 2026-02-02: 새 세션 시작

### HANDOFF 확인

**인계 내용 요약:**
- 날짜: 2026-01-29 세션에서 인계
- 완료된 작업:
  - API 명세서 작성 (`docs/api-*.md`)
  - 데이터베이스 ERD 설계 (`docs/database-erd.md`)
  - Docker 인프라 설정
  - PRD 작성 방향 논의 시작

**다음 작업:**
- PRD 작성 (실제 서비스 구현용)
- PRD 작성 전 5가지 결정 필요

### PRD 작성 전 결정 필요 사항

| # | 질문 | 상태 |
|---|------|------|
| 1 | 개발 범위 | ✅ FE + BE 통합 |
| 2 | 우선순위 | ⏳ PRD에서 정의 |
| 3 | 데이터베이스 | ✅ PostgreSQL |
| 4 | 팀 구성 | ✅ 혼자 개발 (1인 풀스택) |
| 5 | MVP 범위 | ✅ 로봇 연동(WebSocket) 포함 |

**참고 문서:**
- `docs/requirements-specification.md` - 요구사항 명세
- `docs/api-specification.md` - REST API 40+ 엔드포인트
- `docs/database-erd.md` - 14개 테이블 설계
- `docs/persona-scenario.md` - 페르소나 및 시나리오

---

## PRD v2.0 작성 완료

**작성 내용:**
1. **개요**: 목적, 사용자(복지사/가족/어르신/로봇), 시스템 아키텍처, 통신 방식
2. **기술 스택**:
   - FE: React + Vite, TypeScript, TanStack Query, Zustand, Framer Motion
   - BE: Spring Boot 3.x, PostgreSQL, Spring Security + JWT, WebSocket + STOMP
   - Infra: Docker, Jenkins, Nginx
3. **기능 요구사항 (4 Phase)**:
   - Phase 1 (Critical): 인증, 노인 관리, 로봇 상태/제어, 긴급 상황
   - Phase 2 (High): 복약 관리, 일정 관리, 알림, 대시보드
   - Phase 3 (Medium): 활동 로그, AI 리포트, 순찰 피드
   - Phase 4 (Low): 안심 지도, 영상 스냅샷
4. **화면 명세**: 보호자 웹앱 12개 + 로봇 LCD 7개 모드
5. **비기능 요구사항**: 성능, 보안, 로봇 연결, 접근성
6. **데이터 모델**: 10개 주요 테이블
7. **WebSocket 토픽**: 5개 토픽 정의

**다음 단계:**
- ⏳ 사용자 PRD 승인 대기
- PRD 승인 후 → PLAN.md 작성

---

## ERD 재설계 (2026-02-02)

### API 문서 분석 결과

**기존 ERD vs API 명세 차이점:**

1. **누락된 테이블:**
   - CONVERSATION (대화 기록) - `/api/robots/{robotId}/conversations`
   - SEARCH_RESULT (검색 결과) - `/api/robots/{robotId}/search-results`
   - ROOM (방 정보) - `/api/robots/{robotId}/rooms` CRUD

2. **사용자 결정:**
   - USER-ELDER: 1:N 관계 유지
   - AI 데이터: CONVERSATION + SEARCH_RESULT 분리
   - ROOM: 별도 테이블로 분리

3. **수정 필요 사항:**
   - ROBOT: lcd_sub_message 추가
   - PATROL_ITEM.target: GAS_VALVE, WINDOW, MULTI_TAP, DOOR, OUTLET 통합
   - ROOM_MAP: rooms JSON → ROOM 테이블 FK로 변경

### ERD v2.0 작성 완료

**변경 사항 (14개 → 17개 테이블):**

| 분류 | 변경 | 내용 |
|------|------|------|
| 추가 | CONVERSATION | AI 대화 기록 (voiceOriginal, normalizedText, intent, commandType) |
| 추가 | SEARCH_RESULT | 검색/날씨 조회 결과 |
| 추가 | ROOM | 방 정보 (robot_id, room_id, name, x, y) |
| 수정 | ROBOT | lcd_sub_message, current_x/y/heading 추가 |
| 수정 | SCHEDULE | normalized_text, confidence 추가 |
| 수정 | PATROL_ITEM | target에 MULTI_TAP 추가 |
| 삭제 | ROOM_MAP | 삭제 (ROOM 테이블로 대체) |
| 삭제 | ROBOT_EVENT | 삭제 (ACTIVITY로 통합) |

**테이블 구성 (17개):**
- Core: USER, ELDER, EMERGENCY_CONTACT (3)
- Robot: ROBOT, ROOM (2)
- Health: MEDICATION, MEDICATION_RECORD (2)
- Schedule: SCHEDULE (1)
- Activity: ACTIVITY, EMERGENCY (2)
- Notification: NOTIFICATION (1)
- Patrol: PATROL_RESULT, PATROL_ITEM (2)
- Command: ROBOT_COMMAND (1)
- AI: CONVERSATION, SEARCH_RESULT, AI_REPORT (3)

---

## 역할별 화면 흐름 결정 (2026-02-02)

**결정 사항:**
1. **복지사 (WORKER)**: N명 어르신 관리 → 로그인 후 `/elders` (노인 선택) → 대시보드
2. **가족 (FAMILY)**: 1명 어르신만 등록 가능 → 로그인 후 바로 대시보드 이동

**이유:**
- 독거노인 돌봄 서비스 특성상 가족은 본인 부모님 1명만 관리
- 불필요한 화면 단계 제거로 UX 단순화
- 여러 어르신 관리가 필요하면 복지사 역할로 가입

---

## ✅ PRD v2.0 + ERD v2.0 작성 완료 (2026-02-02)

### 완료된 문서

| 문서 | 버전 | 위치 | 내용 |
|------|------|------|------|
| PRD | v2.0 | `.agent/PRD.md` | 서비스 구현용 기획서 (11개 섹션) |
| ERD | v2.0 | `docs/database-erd.md` | 17개 테이블, PostgreSQL ENUM 정의 |

### PRD v2.0 주요 내용
- **1. 개요**: 목적, 사용자(역할별 어르신 수), 아키텍처, 통신
- **2. 기술 스택**: React+Vite, Spring Boot, PostgreSQL
- **3. 기능 요구사항**: 4 Phase (Critical → High → Medium → Low)
- **4. 화면 명세**: 역할별 흐름 + 보호자 웹앱 12개 + 로봇 LCD 7개
- **5-10**: 비기능 요구사항, 데이터 모델, API 우선순위, WebSocket 토픽 등

### ERD v2.0 주요 변경
- 14개 → 17개 테이블 (+3)
- 추가: CONVERSATION, SEARCH_RESULT, ROOM
- 수정: ROBOT (좌표, lcd_sub_message), SCHEDULE (음성 인식), PATROL_ITEM (MULTI_TAP)
- 삭제: ROOM_MAP, ROBOT_EVENT

---

## ✅ 병렬 작업 분배 전략 수립 (2026-02-02)

### 사용자 요청
- 4개의 Codex 에이전트 병렬 실행 예정
- PLAN.md 기반 작업 분배 방안 필요
- MD 파일로 정리 요청

### 분석 과정

**1. PLAN.md 구조 분석:**
- Phase 0: 프로젝트 설정 (BE/FE/DB/공통)
- Phase 1-5: 기능 구현 (도메인별)

**2. 분배 전략 검토:**

| 전략 | 장점 | 단점 | 결론 |
|------|------|------|------|
| 레이어별 (BE/FE/DB/Test) | 명확한 분리 | API→Entity 의존성 병목 | ❌ 기각 |
| Phase별 순차 | 간단 | 병렬화 불가 | ❌ 기각 |
| 도메인별 Full-Stack | 독립성 높음 | 초기 설정 공유 필요 | ✅ 채택 |
| 하이브리드 | Phase 0 병렬 + 도메인별 | 복잡도 약간 증가 | ✅ 최종 선택 |

**3. Kent Beck 원칙 적용:**
- Independence: 도메인 경계로 분리
- Contract First: Phase 0에서 인터페이스 합의
- Tiny Steps: 1 API = 1 커밋
- Always Shippable: 각 Agent 결과물 독립 동작

### 산출물
- `.agent/PARALLEL-WORK.md` 작성 완료 (v1.0)

### 후속 작업
- CLAUDE.md 업데이트 (Tech Stack, 병렬 작업 규칙)
- RULES.md 업데이트 (병렬 작업 금지/필수 사항)
- ADR.md 업데이트 (ADR-011 추가)

---

## ✅ 워크플로우 문서 업데이트 (2026-02-02)

### 업데이트 대상 분석

| 파일 | 필요 변경 | 상태 |
|------|----------|------|
| `CLAUDE.md` | Tech Stack, 병렬 작업 섹션 | ✅ 완료 |
| `RULES.md` | 병렬 작업 금지/필수 사항 | ✅ 완료 |
| `ADR.md` | ADR-011 추가 | ✅ 완료 |
| `SCRATCHPAD.md` | 세션 작업 기록 | ✅ 완료 |

### CLAUDE.md 변경 내용
1. **Tech Stack > Backend**
   - Database: MySQL → PostgreSQL 15+
   - Migration: Flyway 추가
   - Realtime: WebSocket + STOMP + SockJS 추가
   - Infra: Jenkins, Nginx 추가

2. **파일 시스템 테이블**
   - `PARALLEL-WORK.md` 추가 (Who - 병렬 작업 분배)

3. **Git Convention**
   - 병렬 브랜치 패턴 추가: `feature/phase{N}-{domain}`

4. **신규 섹션: 🤖 병렬 작업 규칙**
   - Agent 식별자 (1~4)
   - 파일 소유권 규칙
   - 공유 파일 수정 규칙
   - 커밋 메시지 규칙 ([Agent N])
   - 머지 순서
   - 싱크 포인트 체크리스트
   - Mock 전략

### RULES.md 변경 내용
1. **금지 사항 > 병렬 작업**
   - 타 Agent 담당 파일 수정 금지
   - 공유 파일 동시 수정 금지
   - 의존성 미완료 작업 선행 금지
   - 싱크 포인트 미확인 머지 금지
   - Agent ID 없는 커밋 금지

2. **필수 사항 > 병렬 작업**
   - 커밋 메시지에 Agent ID 명시
   - 브랜치 네이밍 규칙 준수
   - 싱크 포인트 체크리스트 확인
   - Mock으로 의존성 우회
   - 일일 싱크 공유

### ADR-011 추가
- 제목: 4 Agent 병렬 작업 분배 전략
- 결정: 도메인별 분리, 하이브리드 접근
- 이유: Kent Beck 원칙 (Independence, Contract First)

### 다음 단계
- ⏳ PLAN.md 승인 대기
- 승인 후 → Phase 0 구현 시작 (4 Agent 병렬)

---

## 2026-02-04: Phase 0/0.4 반영 여부 리뷰

### 판단
- Phase 0 및 Phase 0.4 완료 여부는 실제 코드/설정 파일 기준으로 확인
- 완료 항목은 PLAN.md 체크리스트 갱신

### 실행
- `CLAUDE.md`, `.agent/PLAN.md`, `backend/`, `frontend/` 주요 설정 및 구성 확인
- Phase 0/0.4 체크리스트 상태 업데이트

### 결과
- Phase 0.1/0.2 및 0.4.1/0.4.2/0.4.3/0.4.5 체크 완료
- 0.3 공통 설정, 0.4.4 LCD 분리 항목은 미완료로 유지

---

## 2026-02-04: Phase 0.4.4 LCD 컴포넌트 분리 (Agent 3)

### 문제
- `frontend/src/pages/Playground/RobotLCD.tsx`에 Eye/InfoChip/SimControls/메인 로직이 단일 파일로 결합됨
- 요청 범위는 `features/robot-lcd`로 파일 분리이며 기존 Playground 파일은 수정 금지

### 판단
- 페이지/공유 디렉토리 수정 금지 조건을 지키기 위해 신규 디렉토리와 신규 파일만 생성
- 기존 로직을 그대로 유지하되 `any` 타입만 제거하고 명시적 타입으로 대체

### 실행
- `frontend/src/features/robot-lcd/` 생성
- `Eye.tsx`, `InfoChip.tsx`, `SimControls.tsx`, `RobotLCD.tsx` 분리 생성
- `index.ts`에서 export 정리
- `rg "\\bany\\b" frontend/src/features/robot-lcd -n`로 `any` 미사용 확인

### 결과
- LCD 관련 컴포넌트 분할 완료
- 기존 `frontend/src/pages/Playground/RobotLCD.tsx` 미수정 상태 유지

## 2026-02-06: Phase 1 AUTH 리뷰 반영 (FIX-INSTRUCTIONS-P1-AGENT1)

### 문제
- refresh 쿠키 `maxAge`가 `Duration.ofDays(7)` 하드코딩
- `JwtTokenProvider`의 `key` 타입이 `Key`여서 `verifyWith(...)` 타입 불일치 가능

### 판단
- Major 2건을 우선 반영
- Minor(PasswordEncoder 분리)는 구조 변경 범위가 커서 이번 수정에서는 제외

### 실행
- `AuthController`에 `JwtTokenProvider` 주입 추가
- refresh 쿠키 maxAge를 `Duration.ofMillis(jwtTokenProvider.getRefreshTokenExpiration())`로 변경
- `JwtTokenProvider`의 key 타입을 `SecretKey`로 변경
- `getRefreshTokenExpiration()` getter 추가

### 검증
- `GRADLE_USER_HOME=/tmp/.gradle-agent1 ./gradlew test` 실행
- 실패: `ApiResponse` record accessor 충돌 (`success()` static 메서드)로 컴파일 중단
- 조율 문서 기준 Agent 4 선행 머지 이슈와 일치

### 결과
- Agent 1 지시서 Major 2건 코드 반영 완료
- 전체 테스트는 Agent 4의 ApiResponse 수정 반영 후 재실행 필요

### 추가 이슈 발견 및 조치 (2026-02-06)
- Agent 4 의존(ApiResponse `ok()`)을 임시 반영한 통합 테스트에서 `AuthServiceTest` 3건 실패 확인
- 원인: BCrypt 해시 입력 길이 제한(72 bytes) 초과
- 조치: `User` refresh 토큰 해시 전 SHA-256 정규화 적용
  - `updateRefreshToken`: `BCrypt.hashpw(normalizeForBcrypt(token), ...)`
  - `validateRefreshToken`: `BCrypt.checkpw(normalizeForBcrypt(token), ...)`
- 재검증: Agent 4 ApiResponse를 임시 반영해 `./gradlew --no-daemon test` 실행 → `BUILD SUCCESSFUL`
- 검증 후 `ApiResponse.java`는 HEAD 상태로 원복 완료

### 문서화
- `.agent/reviews/REVIEW-REQUEST-P1-AGENT1.md`를 최신 수정 사항 기준으로 갱신
- Major 수정 2건 + refreshToken 72-byte 이슈 대응 + Agent4 선행머지 의존성/테스트 조건 명시

### 리뷰 Minor 3건 반영 (2026-02-06)
- `SecurityConfig` CORS allowed origins 파싱 시 trim + 빈 문자열 필터링 적용
- `authApi.signup`에서 accessToken 누락 시 빈 토큰 반환 대신 예외(`Invalid signup response`) 처리
- 미사용 `RefreshRequest` DTO 삭제
- 검증:
  - Frontend `npm run test -- --run` PASS (3 files, 11 tests)
  - Backend는 Agent4 `ApiResponse(ok)` 임시 반영 조건에서 `./gradlew --no-daemon test` PASS
- `.agent/reviews/REVIEW-REQUEST-P1-AGENT1.md`에 반영 내역/테스트 결과 업데이트
- 정리: `RefreshRequest` 신규 파일은 최종 변경 집합에서 제외(미사용 코드 미반영)
- `REVIEW-RESULT-P1-AGENT1.md`에 Agent 0 전달 메모 추가: Agent4 선머지 근거, 재검증 조건, Minor 반영 파일 명시

## 2026-02-06: Agent 0 v8 지시서 재확인 및 리뷰요청서 갱신
- 참조 문서: `agent-0/.agent/reviews/COORDINATION-P1.md`, `agent-0/.agent/reviews/FIX-INSTRUCTIONS-P1-AGENT1.md`
- v8 신규 요구 `/ws/** permitAll` 확인 결과: 이미 `SecurityConfig.PERMIT_ALL`에 반영되어 추가 코드 수정 불필요
- 병렬 워크플로우에 맞춰 `REVIEW-REQUEST-P1-AGENT1.md`에 "지시서 반영 상태(v8)" 섹션 추가
- Agent 0 전달 포인트: Agent 1 신규 요구사항은 모두 반영 완료
- `REVIEW-RESULT-P1-AGENT1.md` 보강: Agent0 전달 메모에 v8 신규 `/ws/** permitAll` 반영 완료 명시, RefreshRequest 문구 정리

## 2026-02-06: Agent 0 v9 지시서 반영
- 문서 확인: `agent-0/.agent/reviews/COORDINATION-P1.md`(v9), `agent-0/.agent/reviews/FIX-INSTRUCTIONS-P1-AGENT1.md`(v9)
- 판단: Agent 1 코드 수정 항목은 v9에서 모두 해결 상태, 신규 코드 수정 없음
- 실행: `REVIEW-REQUEST-P1-AGENT1.md`를 v9 기준으로 갱신
  - 섹션명 `지시서 반영 상태 (v9)`로 변경
  - "v9 추가 코드 수정 요구 없음" 항목 추가
  - 커밋/푸시만 남은 상태임을 우려사항에 명시
- v10 통합 지시서 기준 후속 작업: Agent1 커밋(67a2b02) 및 원격 push 완료 상태를 REVIEW-REQUEST에 반영
