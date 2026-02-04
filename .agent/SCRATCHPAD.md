# SCRATCHPAD

> 현재 작업 중인 사고 과정 및 판단 기록

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

---

## 2026-02-04: Agent 4 - 공통 응답 규격 최종 점검

### 문제
- MSW 응답, frontend 공통 타입, response 유틸이 backend `ApiResponse/ErrorResponse` 규격과 완전히 맞는지 최종 검증 필요

### 판단
- backend `ApiResponse.success()`는 `data: null` 가능하므로 frontend `ApiResponse<T>`의 `data`를 nullable로 맞추는 것이 안전
- 런타임에서 응답 envelope 검증 범위를 `success`만이 아니라 `timestamp`, `error(code/message)`까지 확인하도록 강화
- MSW 핸들러는 기존에 `{ success, data, timestamp }`(성공) / `{ success, error, timestamp }`(실패) 형식으로 이미 정렬되어 있어 유지

### 실행
1. `git worktree add ../agent-4 -b feature/phase0-contracts`로 Agent 4 worktree 생성
2. `pwd` 확인: `/mnt/c/Users/SSAFY/Desktop/S14P11C104/sh/agent-4`
3. 점검 파일 확인
   - `frontend/src/mocks/handlers/*.ts`
   - `frontend/src/shared/types/api.types.ts`
   - `frontend/src/shared/api/response.ts`
   - `backend/src/main/java/site/silverbot/api/common/*`
4. 수정
   - `ApiResponse<T>.data`를 `T | null`로 변경
   - `response.ts`에 `isApiResult` 추가 및 envelope 검사 강화
   - `axios.ts`에서 로컬 검사 함수 제거 후 `isApiResult/isErrorResponse` 재사용
   - `response.test.ts`에 null payload 케이스/shape validation 케이스 추가

### 테스트
- 실행: `npm run test:run -- src/shared/api/response.test.ts`
- 결과: 실패 (`vitest: not found`)
- 원인: 로컬 의존성 미설치 상태(node_modules 내 vitest 부재)

### 결과
- 공통 응답 타입과 유틸을 backend 계약에 맞게 정렬 완료
- MSW 핸들러 응답 형식 점검 완료 (추가 수정 불필요)

## 2026-02-04: Agent 4 - 코드리뷰 반영 (RobotLCD 중복 정리)

### 문제
- 코드리뷰 지적: `frontend/src/pages/Playground/RobotLCD.tsx`가 중복 로직 정리 미반영
- 코드리뷰 지적: `.agent/PLAN.md` 0.4.4 체크박스 현행화 필요

### 판단
- 기존 `pages/Playground/RobotLCD.tsx`를 직접 로직 보관 파일로 두면 역할/위치가 모호하므로
  `features/robot-lcd`로 본체 이동 + Playground에서는 thin wrapper만 유지
- PLAN은 실제 분리 완료 상태를 반영해 `RobotLCD.tsx`만 체크 처리

### 실행
1. `frontend/src/features/robot-lcd/RobotLCD.tsx`로 본체 파일 이동
2. `frontend/src/pages/Playground/RobotLCD.tsx`를 thin wrapper로 교체
3. `.agent/PLAN.md` 0.4.4에서 `RobotLCD.tsx` 체크박스 `[x]` 반영

### 결과
- Playground 경로에는 중복 로직이 아닌 wrapper만 남음
- LCD 메인 컴포넌트 위치가 PLAN 구조와 일치
- PLAN 0.4.4 진행상태가 최신화됨
