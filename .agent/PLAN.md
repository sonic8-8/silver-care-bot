# PLAN: 구현 계획서

> **버전**: v1.14
> **작성일**: 2026-02-02
> **최종 수정일**: 2026-02-08
> **기반 문서**: [PRD.md](./PRD.md), [database-erd.md](../docs/database-erd.md)

---

## 1. 개요

### 1.1 목표
독거노인 AI 반려로봇 웹 서비스의 풀스택 구현

### 1.2 기술 스택
| Layer | 기술 |
|-------|------|
| Frontend | React 19 + Vite 7, TypeScript, Tailwind CSS + cva, Framer Motion |
| State | TanStack Query (서버), Zustand (클라이언트) |
| Backend | Spring Boot 3.x, Java 17, Spring Data JPA, Spring Security + JWT |
| Database | PostgreSQL 15+, Flyway (마이그레이션) |
| Realtime | WebSocket + STOMP + SockJS |
| Infra | Docker, Jenkins, Nginx |

### 1.3 구현 원칙
- **TDD**: Backend 필수, Frontend 선택적 (훅/유틸 필수)
- **Tiny Steps**: 한 번에 하나의 작은 변경, 즉시 검증
- **API First**: Backend API 먼저 구현 → Frontend 연동

---

## 2. 구현 단계

### Phase 0: 프로젝트 설정
> 개발 환경 및 공통 설정

#### 0.1 Backend 초기 설정
- [x] Spring Boot 프로젝트 생성 (Gradle, Java 17)
- [x] PostgreSQL 연동 설정 (application.yml)
- [x] JPA + Hibernate 설정
- [x] Flyway 마이그레이션 설정
- [x] Spring Security 기본 설정
- [x] Spring REST Docs 설정
- [x] Docker Compose (PostgreSQL + App)
- [x] 공통 응답 형식 정의 (ApiResponse, ErrorResponse)
- [x] 글로벌 예외 처리 (GlobalExceptionHandler)

#### 0.2 Frontend 초기 설정
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] Tailwind CSS + cva + tailwind-merge 설정
- [x] Framer Motion 설치
- [x] React Router 설정
- [x] TanStack Query + Axios 설정
- [x] Zustand 스토어 구조 설정
- [x] MSW 설정 (API Mock)
- [x] Vitest + RTL 설정

#### 0.3 공통 설정
- [ ] ESLint + Prettier 설정
- [ ] Git hooks (husky + lint-staged)
- [ ] 환경변수 설정 (.env)

#### 0.4 Playground 컴포넌트 분리 (Frontend)
> Playground 프로토타입 코드를 실제 컴포넌트로 분리

##### 0.4.1 공유 UI 컴포넌트 (`/frontend/src/shared/ui/`)
- [x] `Button.tsx` - 공통 버튼 (variants: primary, secondary, danger, white, dark)
- [x] `Card.tsx` - 카드 컨테이너
- [x] `Header.tsx` - 페이지 헤더 (뒤로가기, 타이틀, 액션 버튼)
- [x] `Badge.tsx` - 상태 뱃지 (safe, warning, danger, neutral)
- [x] `Input.tsx` - 입력 필드 (라벨, 아이콘 지원)
- [x] `SectionHeader.tsx` - 섹션 제목 + 액션 버튼

##### 0.4.2 페이지 컴포넌트 분리 (`/frontend/src/pages/`)
- [x] `Login/LoginScreen.tsx` - 로그인 (보호자/로봇 탭)
- [x] `Signup/SignupScreen.tsx` - 회원가입
- [x] `Elders/ElderSelectScreen.tsx` - 노인 선택 (복지사 전용)
- [x] `Dashboard/DashboardScreen.tsx` - 홈 대시보드
- [x] `Settings/SettingsScreen.tsx` - 설정 (테마, 알림, 로봇 설정)
- [x] `Schedule/ScheduleScreen.tsx` - 일정 관리
- [x] `Robot/RobotControlScreen.tsx` - 로봇 제어
- [x] `Robot/RobotLCDScreen.tsx` - LCD 미러링 전체화면
- [x] `Medication/MedicationScreen.tsx` - 약 관리
- [x] `History/HistoryScreen.tsx` - 기록/AI 리포트
- [x] `Notification/NotificationScreen.tsx` - 알림 목록
- [x] `Emergency/EmergencyScreen.tsx` - 긴급 상황 풀스크린

##### 0.4.3 컨테이너 및 네비게이션
- [x] `GuardianAppContainer.tsx` - 메인 앱 컨테이너 (탭 네비게이션 포함)
- [x] `BottomNavigation.tsx` - 하단 탭바 컴포넌트

##### 0.4.4 LCD 컴포넌트 (`/frontend/src/features/robot-lcd/` 또는 `/frontend-lcd/`)
- [x] `RobotLCD.tsx` - 로봇 LCD 메인 컴포넌트 (이미 분리됨)
- [x] `Eye.tsx` - 눈 애니메이션 컴포넌트
- [x] `InfoChip.tsx` - 상태 정보 칩
- [x] `SimControls.tsx` - 시뮬레이션 컨트롤 (개발용)

##### 0.4.5 타입 정의 (`/frontend/src/shared/types/`)
- [x] `ui.types.ts` - UI 컴포넌트 공통 타입 (ButtonVariant, BadgeStatus 등)
- [x] `screen.types.ts` - 화면별 Props 타입

> ⚠️ **분리 원칙**:
> - 파일당 하나의 컴포넌트 원칙 준수
> - cva를 활용한 variant 정의
> - Props 타입 명시적 정의
> - Playground는 분리 후 삭제 또는 개발용으로 유지

---

### Phase 1: 핵심 기능 (Critical)
> 서비스 동작을 위한 최소 필수 기능

#### 1.1 데이터베이스 스키마
- [ ] PostgreSQL ENUM 타입 생성 (V1__create_enums.sql)
- [ ] USER 테이블 + Entity
- [ ] ELDER 테이블 + Entity
- [ ] EMERGENCY_CONTACT 테이블 + Entity
- [ ] ROBOT 테이블 + Entity
- [ ] ROOM 테이블 + Entity
- [ ] EMERGENCY 테이블 + Entity
- [ ] ROBOT_COMMAND 테이블 + Entity

#### 1.2 인증 (Auth) - Backend
- [ ] `POST /api/auth/signup` - 회원가입
  - [ ] Controller 테스트 작성 (RED)
  - [ ] Service + Repository 구현 (GREEN)
  - [ ] BCrypt 비밀번호 암호화
  - [ ] 역할(WORKER/FAMILY) 저장
  - [ ] REST Docs 스니펫 생성
- [ ] `POST /api/auth/login` - 로그인
  - [ ] JWT 토큰 생성 (Access 1h + Refresh 7d)
  - [ ] 토큰 응답 형식 정의
- [ ] `POST /api/auth/refresh` - 토큰 갱신
- [ ] `POST /api/auth/robot/login` - 로봇 인증
  - [ ] 시리얼번호 + 인증코드 검증
- [ ] JWT 필터 구현 (JwtAuthenticationFilter)
- [ ] Security 설정 (permitAll, authenticated)

#### 1.3 인증 (Auth) - Frontend
- [ ] 로그인 페이지 (`/login`)
  - [ ] 보호자/로봇 탭 UI
  - [ ] 이메일/비밀번호 폼
  - [ ] 유효성 검증
  - [ ] 로그인 API 연동
- [ ] 회원가입 페이지 (`/signup`)
  - [ ] 역할 선택 (WORKER/FAMILY)
  - [ ] 폼 입력 + 검증
- [ ] useAuth 훅 구현
  - [ ] 테스트 작성 (TDD 필수)
  - [ ] 토큰 저장/갱신 로직
- [ ] AuthStore (Zustand)
  - [ ] user 상태 관리
  - [ ] login/logout 액션
- [ ] ProtectedRoute 컴포넌트
- [ ] 역할별 라우팅 분기
  - [ ] WORKER: 로그인 성공 → `/elders`
  - [ ] FAMILY: 로그인 성공 → `/elders/:elderId` (직행)
- [ ] Axios 인터셉터 (토큰 자동 첨부, 401 처리)

#### 1.4 노인 관리 (Elder) - Backend
- [ ] `POST /api/elders` - 노인 등록
- [ ] `GET /api/elders` - 목록 조회 (담당 노인만)
- [ ] `GET /api/elders/{elderId}` - 상세 조회
- [ ] `PUT /api/elders/{elderId}` - 정보 수정
- [ ] `DELETE /api/elders/{elderId}` - 삭제
- [ ] 긴급연락처 API (하위 리소스)
  - [ ] `POST /api/elders/{elderId}/contacts` - 연락처 추가
  - [ ] `GET /api/elders/{elderId}/contacts` - 연락처 목록
  - [ ] `PUT /api/elders/{elderId}/contacts/{contactId}` - 연락처 수정
  - [ ] `DELETE /api/elders/{elderId}/contacts/{contactId}` - 연락처 삭제

#### 1.5 노인 관리 (Elder) - Frontend
- [ ] 노인 선택 페이지 (`/elders`) - 복지사 전용
  - [ ] 노인 카드 목록
  - [ ] 상태 뱃지 (SAFE/WARNING/DANGER)
  - [ ] 노인 추가 모달
  - [ ] 긴급연락처 관리 UI

#### 1.6 로봇 상태/제어 (Robot) - Backend
- [ ] `GET /api/robots/{robotId}/status` - 상태 조회
- [ ] `POST /api/robots/{robotId}/commands` - 명령 전송
  - [ ] 명령 유형: MOVE_TO, START_PATROL, RETURN_TO_DOCK, SPEAK, CHANGE_LCD_MODE
- [ ] `POST /api/robots/{robotId}/sync` - 상태 동기화 (Heartbeat)
  - [ ] 60초 주기 수신
  - [ ] last_sync_at 업데이트
- [ ] `GET /api/robots/{robotId}/lcd` - LCD 상태 조회
- [ ] 명령 큐 처리 로직

#### 1.7 로봇 연결 상태 관리 - Backend
- [ ] 오프라인 판정 스케줄러
  - [ ] 2분(120초) 동안 heartbeat 미수신 시 DISCONNECTED 처리
- [ ] 오프라인 알림 스케줄러
  - [ ] 30분 동안 오프라인 지속 시 보호자에게 알림 발송
- [ ] 연결 상태 변경 시 WebSocket 브로드캐스트

#### 1.8 로봇 상태/제어 (Robot) - Frontend
- [ ] 로봇 제어 페이지 (`/elders/:id/robot`)
  - [ ] 배터리/연결 상태 표시
  - [ ] 위치 정보 표시
  - [ ] 이동 명령 버튼 (방 선택)
  - [ ] TTS 메시지 입력
  - [ ] LCD 모드 변경
- [ ] LCD 미러링 페이지 (`/elders/:id/robot/lcd`)
  - [ ] 로봇 LCD 화면 프리뷰

#### 1.9 긴급 상황 (Emergency) - Backend
- [ ] `POST /api/robots/{robotId}/emergency` - 긴급 보고
  - [ ] 유형: FALL_DETECTED, NO_RESPONSE, SOS_BUTTON, UNUSUAL_PATTERN
- [ ] `GET /api/emergencies` - 긴급 상황 목록
- [ ] `GET /api/emergencies/{id}` - 긴급 상황 상세
- [ ] `PATCH /api/emergencies/{id}/resolve` - 긴급 해제
  - [ ] 해결 유형: FALSE_ALARM, RESOLVED, EMERGENCY_CALLED, FAMILY_CONTACTED
- [ ] 긴급 상황 발생 시 알림 생성

#### 1.10 긴급 상황 (Emergency) - Frontend
- [ ] 긴급 상황 페이지 (`/emergency/:id`)
  - [ ] 풀스크린 경고 UI
  - [ ] 119 전화 버튼
  - [ ] 해제 버튼 + 확인 다이얼로그
  - [ ] 긴급연락처 목록

#### 1.11 WebSocket 기반 구축
- [ ] Backend: STOMP + SockJS 설정
- [ ] Backend: WebSocket 토픽 정의
  - [ ] `/topic/robot/{robotId}/status` - 로봇 상태 업데이트
  - [ ] `/topic/robot/{robotId}/lcd` - LCD 화면 전환
  - [ ] `/topic/elder/{elderId}/status` - 노인 상태 변경
  - [ ] `/topic/user/{userId}/notifications` - 사용자별 알림
  - [ ] `/topic/emergency` - 긴급 알림 (브로드캐스트)
- [ ] Backend: WebSocket 인증 (JWT)
- [ ] Frontend: WebSocket 클라이언트 설정 (SockJS + STOMP)
- [ ] Frontend: useWebSocket 훅 구현
  - [ ] 자동 재연결 로직
  - [ ] 구독/해제 관리

---

### Phase 2: 주요 기능 (High)
> 서비스 가치를 높이는 핵심 기능

#### 2.0 Phase 2 병렬 작업 분배 (2026-02-06)

| Agent | 브랜치 | 담당 범위 |
|-------|--------|-----------|
| Agent 1 | `feature/phase2-medication-dashboard-be` | Medication Backend + Dashboard Backend |
| Agent 2 | `feature/phase2-medication-dashboard-fe` | Medication Frontend + Dashboard Frontend |
| Agent 3 | `feature/phase2-db-schedule` | DB 확장(Flyway/Entity) + Schedule Backend |
| Agent 4 | `feature/phase2-notification-realtime` | Notification Backend/Frontend + WebSocket 실시간 연동 |

#### 2.1 데이터베이스 확장
- [x] MEDICATION 테이블 + Entity
- [x] MEDICATION_RECORD 테이블 + Entity
- [x] SCHEDULE 테이블 + Entity
- [x] NOTIFICATION 테이블 + Entity

#### 2.2 복약 관리 (Medication) - Backend
- [x] `POST /api/elders/{elderId}/medications` - 약 등록
- [x] `GET /api/elders/{elderId}/medications` - 복용 현황
  - [x] 주간 복용률 계산
  - [x] 일별 상태 포함
- [x] `GET /api/elders/{elderId}/medications/{id}` - 약 상세
- [x] `PUT /api/elders/{elderId}/medications/{id}` - 약 수정
- [x] `DELETE /api/elders/{elderId}/medications/{id}` - 약 삭제
- [x] `POST /api/elders/{elderId}/medications/records` - 복용 기록
  - [x] 로봇에서 호출 (TAKEN/MISSED)

#### 2.3 복약 관리 (Medication) - Frontend
- [x] 약 관리 페이지 (`/elders/:id/medications`)
  - [x] 주간 복용률 차트
  - [x] 약 목록 카드
  - [x] 약 추가/수정 모달
  - [x] 일별 복용 상태 캘린더

#### 2.4 일정 관리 (Schedule) - Backend
- [x] `POST /api/elders/{elderId}/schedules` - 일정 등록
- [x] `GET /api/elders/{elderId}/schedules` - 일정 목록
  - [x] Query: startDate, endDate, type
- [x] `GET /api/elders/{elderId}/schedules/{id}` - 일정 상세
- [x] `PUT /api/elders/{elderId}/schedules/{id}` - 일정 수정
- [x] `DELETE /api/elders/{elderId}/schedules/{id}` - 일정 삭제
- [x] `POST /api/elders/{elderId}/schedules/voice` - 음성 일정 등록
  - [x] voice_original, normalized_text, confidence 저장

#### 2.5 일정 관리 (Schedule) - Frontend
- [x] 일정 관리 페이지 (`/elders/:id/schedule`)
  - [x] 주간 캘린더 뷰
  - [x] 리스트 뷰 전환
  - [x] 일정 추가/수정 모달
  - [x] 일정 유형별 색상 구분

#### 2.6 알림 시스템 (Notification) - Backend
- [x] `GET /api/notifications` - 알림 목록
  - [x] 페이지네이션
  - [x] 읽음/안읽음 필터
- [x] `GET /api/notifications/unread-count` - 안읽음 개수
- [x] `PATCH /api/notifications/{id}/read` - 읽음 처리
- [x] `PATCH /api/notifications/read-all` - 전체 읽음
- [x] `GET /api/users/me/settings` - 사용자 설정 조회
- [x] `PATCH /api/users/me/settings` - 알림 설정 변경
- [x] 알림 생성 서비스
  - [x] 긴급, 복약, 일정, 활동, 시스템 유형별 생성
- [x] WebSocket 실시간 알림 발송

#### 2.7 알림 시스템 (Notification) - Frontend
- [x] 알림 페이지 (`/notifications`)
  - [x] 알림 목록 (무한 스크롤)
  - [x] 읽음/안읽음 필터
  - [x] 전체 읽음 버튼
  - [x] 알림 클릭 시 해당 페이지 이동
- [x] 알림 벨 컴포넌트 (헤더)
  - [x] 안읽음 개수 뱃지
  - [x] 드롭다운 미리보기 (최근 5개)
  - [x] WebSocket 실시간 업데이트
- [x] 설정 페이지 (`/settings`)
  - [x] 프로필 정보 수정
  - [x] 알림 유형별 ON/OFF
  - [x] 테마 설정 (SYSTEM/LIGHT/DARK)

#### 2.8 대시보드 (Dashboard) - Frontend
- [x] 홈 대시보드 (`/elders/:id`)
  - [x] 오늘의 요약 카드
    - [x] 기상 시간
    - [ ] 복용 현황 (아침/저녁)
    - [x] 활동 상태
  - [x] 최근 알림 (5개)
  - [x] 주간 캘린더 위젯
  - [x] 로봇 상태 카드
    - [x] 배터리 (아이콘 + %)
    - [x] 연결 상태 (CONNECTED/DISCONNECTED)
    - [x] 현재 위치
    - [x] LCD 모드
  - [x] WebSocket 실시간 업데이트
    - [x] `/topic/robot/{robotId}/status` 구독
    - [x] `/topic/elder/{elderId}/status` 구독

#### 2.9 대시보드 (Dashboard) - Backend
- [x] `GET /api/elders/{elderId}/dashboard` - 대시보드 데이터
  - [x] 오늘의 요약
  - [x] 최근 알림
  - [x] 주간 일정
  - [x] 로봇 상태

---

### Phase 3: 부가 기능 (Medium)
> 서비스 완성도를 높이는 기능

#### 3.0 Phase 3 병렬 작업 분배 초안 (2026-02-07)

| Agent | 제안 브랜치 | 담당 범위 |
|-------|------------|-----------|
| Agent 1 | `feature/phase3-activity-report-be` | Activity API + Weekly AI Report API + Report Scheduler |
| Agent 2 | `feature/phase3-history-report-fe` | History 페이지(타임라인/리포트 탭) + 대시보드 순찰 결과 카드 |
| Agent 3 | `feature/phase3-db-patrol-ai` | Phase 3 DB 마이그레이션(Activity/Patrol/Conversation/Search/AI Report) + Patrol/Conversation/Search Backend |
| Agent 4 | `feature/phase3-contract-realtime` | Phase 3 API 계약 동기화 + FE 공통 훅/쿼리 + 통합 검증(WebSocket/알림 연계) |

선행 정리 작업:
- [x] `feature/phase2-*` 브랜치 로컬/원격 정리
- [x] `management/architect`를 `develop` 기준 최신화
- [x] Agent 1~4 Phase 3 브랜치 생성 및 워크트리 재할당
- [x] Phase 3 작업 지시서(`.agent/dispatch/WORK-INSTRUCTION-P3-AGENT*.md`) 배포

#### 3.0-b Phase 3 Round 2 착수 체크리스트 (2026-02-07)
- [x] `feature/phase3-*` 원격 브랜치 정리(삭제) 완료
- [x] 기존 브랜치명 재사용 정책 확정 (`--force-with-lease`)
- [x] Round 2 작업 지시서 재배포 (`COORDINATION-P3`, `WORK-INSTRUCTION-P3-AGENT*`)
- [x] Agent 1 계약 고정 완료 (Activity/Report/Dashboard)
- [x] Agent 4 계약 정렬 완료 (shared 타입/Mock/실시간 소비 규칙)
- [x] Round 2 구현/리뷰/머지 완료 (Agent 1 → Agent 4 → Agent 2, Agent 3 조건부 선행)

Phase 2 잔여 항목 처리 원칙 (Gate):
- [x] 일정 관리 Frontend (`/elders/:id/schedule`) 구현 완료
- [x] 대시보드 실시간 구독(`/topic/robot/{robotId}/status`, `/topic/elder/{elderId}/status`) 반영
- [x] 알림 목록 무한 스크롤 UX 보강 및 검증
- [x] `management/architect` 최종 문서 변경분 `develop` 병합
- 위 Gate 항목 완료 전에는 Phase 3 도메인 본작업(3.1+) 착수 보류

#### 3.1 데이터베이스 확장
- [x] ACTIVITY 테이블 + Entity
- [x] PATROL_RESULT 테이블 + Entity
- [x] PATROL_ITEM 테이블 + Entity
- [x] CONVERSATION 테이블 + Entity
- [x] SEARCH_RESULT 테이블 + Entity
- [x] AI_REPORT 테이블 + Entity

#### 3.2 활동 로그 (Activity) - Backend
- [x] `GET /api/elders/{elderId}/activities` - 일일 로그
  - [x] Query: date (기본값: 오늘)
- [x] `POST /api/robots/{robotId}/activities` - 활동 보고
  - [x] 유형: WAKE_UP, SLEEP, OUT_DETECTED, RETURN_DETECTED 등

#### 3.3 활동 로그 (Activity) - Frontend
- [x] 기록 페이지 (`/elders/:id/history`)
  - [x] 타임라인 뷰
  - [x] 날짜 선택기
  - [x] 활동 유형별 아이콘/색상
  - [x] 탭: 활동 로그 / AI 리포트

#### 3.4 AI 리포트 (Report) - Backend
- [x] `GET /api/elders/{elderId}/reports/weekly` - 주간 리포트
  - [x] 복용률
  - [x] 활동량
  - [x] 대화 키워드
  - [x] 추천사항
- [x] 주간 리포트 자동 생성 스케줄러 (매주 월요일)

#### 3.5 AI 리포트 (Report) - Frontend
- [x] 기록 페이지 리포트 탭
  - [x] 복용률 차트 (막대/라인)
  - [x] 활동량 그래프
  - [x] 대화 키워드 클라우드
  - [x] AI 추천사항 카드

#### 3.6 순찰 피드 (Patrol) - Backend
- [x] `GET /api/elders/{elderId}/patrol/latest` - 최근 순찰 결과
- [x] `GET /api/elders/{elderId}/patrol/history` - 순찰 히스토리
- [x] `POST /api/robots/{robotId}/patrol/report` - 순찰 보고
  - [x] 항목: GAS_VALVE, DOOR, OUTLET, WINDOW, MULTI_TAP
  - [x] 상태: ON, OFF, NORMAL, LOCKED, UNLOCKED, NEEDS_CHECK

#### 3.7 순찰 피드 (Patrol) - Frontend
- [x] 순찰 결과 카드 (대시보드)
  - [x] 가스밸브/창문/콘센트 상태 아이콘
  - [x] 경고 항목 하이라이트
  - [x] 마지막 순찰 시간

#### 3.8 AI 대화/검색 기록 - Backend
- [x] `GET /api/robots/{robotId}/conversations` - 대화 기록
- [x] `POST /api/robots/{robotId}/conversations` - 대화 저장
- [x] `GET /api/robots/{robotId}/search-results` - 검색 결과
- [x] `POST /api/robots/{robotId}/search-results` - 검색 결과 저장

---

### Phase 4: 고급 기능 (Low)
> MVP 이후 추가 검토

#### 4.0 Phase 4 착수 준비 (2026-02-07)
- [x] Phase 3 기능(3.1~3.8) 구현 및 `develop` 반영 확인
- [x] API 기준 문서(`docs/api-specification.md`)와 핵심 구현 범위 정합성 점검
- [x] 사용 종료 브랜치/워크트리 정리 (`feature/phase3-*`, `agent-1~4`)
- [x] Agent 1~4 Phase 4 브랜치 생성 및 Worktree 재할당
- [x] Phase 4 작업 지시서/DoD 배포 (`.agent/dispatch/WORK-INSTRUCTION-P4-AGENT*.md`, `COORDINATION-P4.md`)

권장 분배(충돌 최소화):

| Agent | 권장 브랜치 | 우선 구현 범위 |
|-------|-------------|----------------|
| Agent 1 | `feature/phase4-map-room-be` | Map 조회/Room CRUD 백엔드 API |
| Agent 2 | `feature/phase4-map-video-fe` | 지도 Canvas UI + 스냅샷 갤러리 UI |
| Agent 3 | `feature/phase4-video-location-be` | 스냅샷 저장/조회 + 로봇 위치 갱신 API/DB |
| Agent 4 | `feature/phase4-contract-realtime-map` | API 계약/Mock/WebSocket 위치 브로드캐스트 |

#### 4.1 안심 지도 (Map)
- [x] `GET /api/elders/{elderId}/map` - 안심 지도 데이터 조회
- [x] `GET /api/robots/{robotId}/rooms` - 방 목록 조회
- [x] `POST /api/robots/{robotId}/rooms` - 방 등록
- [x] `PUT /api/robots/{robotId}/rooms/{roomId}` - 방 수정
- [x] `DELETE /api/robots/{robotId}/rooms/{roomId}` - 방 삭제
- [x] `PUT /api/robots/{robotId}/location` - 로봇 위치 업데이트
- [x] Frontend: Canvas 기반 맵 렌더링
- [x] Frontend: 로봇 위치 실시간 표시 (WebSocket)

#### 4.2 영상 스냅샷 (Video)
- [x] 순찰 시 이미지 캡처 저장
- [x] `GET /api/patrol/{patrolId}/snapshots` - 스냅샷 목록
- [x] Frontend: 스냅샷 갤러리 UI

#### 4.3 계약/Mock/실시간 정렬
- [x] Map/Video shared 타입 및 파서 정렬
- [x] Map/Video MSW 핸들러 정렬
- [x] 로봇 위치 실시간 훅 및 테스트 정렬

---

### Phase 5: 로봇 LCD 화면
> Robot React App (별도 빌드)

#### 5.0 Phase 5 착수 준비 계획 (2026-02-07)
- [x] merge 완료된 `feature/phase4-*` 원격 브랜치 정리
- [x] `feature/phase4-*` 로컬 브랜치 정리 및 Worktree 재할당
- [x] Agent 1~4용 `feature/phase5-*` 브랜치 생성 (`origin/develop` 기준)
- [x] Agent 1~4 Worktree를 `feature/phase5-*`로 전환
- [x] Phase 5 작업 지시서/DoD 배포 (`COORDINATION-P5`, `WORK-INSTRUCTION-P5-AGENT*`)

#### 5.1 LCD 프로젝트 설정
- [x] Vite 프로젝트 설정 (별도 디렉토리: `/frontend-lcd`)
- [ ] Tailwind CSS + Framer Motion 설정
- [ ] 전체화면 레이아웃 (1024x600)
- [x] 대형 폰트 + 터치 최적화 (64px+, 터치 영역 64px+)
- [ ] WCAG AAA 접근성 (대비율 7:1)
- [x] WebSocket 연결 (서버 → LCD)

#### 5.2 LCD 공통 컴포넌트
- [ ] RobotFace 컴포넌트 (눈 애니메이션)
  - [ ] 자동 깜빡임
  - [ ] 표정 변화 (neutral, happy, sleep)
- [ ] StatusBar 컴포넌트 (시계, WiFi, 배터리)
- [x] LargeButton 컴포넌트 (터치 최적화)

#### 5.3 LCD 화면 구현
- [ ] IDLE 모드 - 평상시
  - [x] 메인 메시지 + 서브 메시지
  - [x] 다음 일정 표시
  - [x] neutral 표정
- [ ] GREETING 모드 - 기상/귀가
  - [ ] 인사말 + 날씨 정보
  - [ ] happy 표정
- [ ] MEDICATION 모드 - 약 시간
  - [x] 초대형 버튼 2개 (복용완료/나중에)
  - [ ] happy 표정
  - [x] 버튼 클릭 → 서버 API 호출
- [ ] SCHEDULE 모드 - 일정 알림
  - [x] 일정 카드 (제목, 시간, 장소)
  - [x] 확인 버튼
  - [ ] neutral 표정
- [ ] LISTENING 모드 - 음성 인식
  - [x] 파동 애니메이션 (Framer Motion)
  - [ ] neutral 표정
- [ ] EMERGENCY 모드 - 긴급 상황
  - [x] 배경 빨간색 점멸
  - [ ] 119 버튼 + 괜찮아요 버튼
  - [ ] neutral 표정
- [ ] SLEEP 모드 - 충전 중
  - [x] 충전 상태 표시 (배터리 %)
  - [x] sleep 표정 (눈 감김)

#### 5.4 LCD Backend/API/계약 정렬
- [x] `GET /api/robots/{robotId}/lcd` 구현 및 계약 정렬 (`message/subMessage` string 보장)
- [x] `POST /api/robots/{robotId}/lcd-mode` 구현 및 권한 검증 정렬
- [x] `POST /api/robots/{robotId}/events` 구현 (`TAKE/LATER` 처리, `medicationId` 규칙 반영)
- [x] WebSocket `/topic/robot/{robotId}/lcd` 브로드캐스트 및 파서 정렬
- [x] `frontend/src/shared/*`, `frontend/src/mocks/*` LCD 계약/Mock 정렬 반영

#### 5.5 병렬 작업/머지 상태
- [x] Agent 1~4 리뷰 Approve 완료
- [x] `feature/phase5-*` 4개 브랜치 `origin/develop` 반영 완료
- [x] `management/architect` 최신 지시서 반영 후 `origin/develop` 반영 완료

### Phase 6: 출시 안정화 및 마감
> Phase 5 LCD 기능을 운영 가능한 수준으로 하드닝하고 브랜치/워크트리를 최종 정리

#### 6.0 Phase 6 착수 준비 (2026-02-08)
- [x] merge 완료된 `feature/phase5-*` 원격 브랜치 정리
- [x] `feature/phase5-*` 로컬 브랜치 정리 및 Worktree 재할당
- [x] Agent 1~4용 `feature/phase6-*` 브랜치 생성 (`origin/develop` 기준)
- [x] Agent 1~4 Worktree를 `feature/phase6-*`로 전환
- [x] Phase 6 작업 지시서/DoD 배포 (`COORDINATION-P6`, `WORK-INSTRUCTION-P6-AGENT*`)

#### 6.1 LCD UI 접근성/표현 고도화 (Frontend-LCD)
- [x] 1024x600 우선 레이아웃 + 모바일 fallback 정리
- [x] WCAG AAA 대비율/가독성 점검 및 색상 토큰 보정
- [x] `RobotFace`(blink/emotion) 및 `StatusBar`(시계/WiFi/배터리) 컴포넌트 도입
- [x] `GREETING/EMERGENCY` 모드 표현 보강(날씨 슬롯/119 버튼 등)

#### 6.2 LCD Backend 안정화 (Backend)
- [x] `/api/robots/{robotId}/lcd`, `/lcd-mode`, `/events` 회귀 테스트 보강
- [x] LCD 이벤트 처리(특히 `TAKE/LATER`) 에러 시나리오 정합성 점검
- [x] REST Docs/테스트 스냅샷 최신화

#### 6.3 계약/Mock/통합 검증
- [x] `frontend/src/shared/*`, `frontend/src/mocks/*` LCD 계약 타입/파서 회귀 점검
- [x] LCD WebSocket payload 파서/훅 통합 테스트 보강
- [x] Phase 6 머지 전 교차 검증 체크리스트(Agent 2/4, Agent 1/3) 완료

#### 6.4 Phase 6 통합/운영 정리
- [x] Agent 1~4 P6 리뷰 Approve 및 FIX 지시서 반영 완료
- [x] `feature/phase6-*` 4개 브랜치가 `origin/develop`에 포함됨
- [x] `management/architect`가 `origin/develop`에 포함됨
- [ ] merge 완료된 `feature/phase6-*` 원격 브랜치 정리
- [ ] `feature/phase6-*` 로컬 브랜치 정리 및 Worktree 재할당
- [ ] sync.sh 실행하여 Team Repo 동기화

---

## 3. 테스트 전략

### 3.1 Backend (필수)
| 레벨 | 도구 | 커버리지 목표 |
|------|------|--------------|
| Unit | JUnit5 + Mockito | 80% |
| Integration | @SpringBootTest | 주요 플로우 |
| API Docs | Spring REST Docs | 모든 엔드포인트 |

### 3.2 Frontend (선택적)
| 대상 | TDD 필수 | 도구 |
|------|---------|------|
| 커스텀 훅 (useAuth, useWebSocket) | ✅ | Vitest + RTL |
| 유틸 함수 | ✅ | Vitest |
| Zustand 스토어 | ✅ | Vitest |
| UI 컴포넌트 | ⚠️ 선택 | Vitest + RTL |
| E2E (로그인, 긴급알림) | Critical Path | Playwright |

### 3.3 접근성 검증
| 대상 | 기준 | 검증 방법 |
|------|------|----------|
| 보호자 웹앱 | WCAG AA | Lighthouse 90+ |
| 로봇 LCD | WCAG AAA | 수동 검증 (대비율 7:1, 폰트 24px+) |

---

## 4. 비기능 요구사항 구현

### 4.1 성능
| 요구사항 | 구현 |
|----------|------|
| API 응답 500ms | JPA 쿼리 최적화, 인덱스 |
| WebSocket 1초 | STOMP 브로커 설정 |
| 동시 접속 100명 | 커넥션 풀 설정 |

### 4.2 보안
| 요구사항 | 구현 |
|----------|------|
| 비밀번호 암호화 | BCrypt (strength: 10) |
| JWT | Access 1h, Refresh 7d |
| HTTPS/WSS | Nginx SSL 설정 |

### 4.3 로봇 연결
| 요구사항 | 구현 |
|----------|------|
| Heartbeat 60초 | `/api/robots/{id}/sync` 호출 |
| 오프라인 판정 2분 | 스케줄러 30초 주기 체크 |
| 오프라인 알림 30분 | 스케줄러에서 알림 생성 |

---

## 5. 진행 상황

| Phase | 상태 | 진행률 |
|-------|------|--------|
| Phase 0 | 🔄 진행 중 | 90% |
| Phase 1 | ✅ 완료 (머지 기준) | 100% |
| Phase 2 | 🔄 진행 중 (핵심 게이트 완료, 일부 위젯 보강 잔여) | 95% |
| Phase 3 | ✅ 구현 완료 (동기화/운영 정리 대기) | 100% |
| Phase 4 | ✅ 구현 완료 (Map/Room/Location/Snapshot + 계약 정렬) | 100% |
| Phase 5 | ✅ 완료 (LCD 핵심 기능 + P6 하드닝 반영 완료) | 100% |
| Phase 6 | ✅ 구현/병합 완료 (운영 정리만 잔여) | 95% |

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-02 | 초안 작성. PRD v2.0 기반 6 Phase 구현 계획 |
| v1.1 | 2026-02-02 | PRD 대비 누락 항목 보완: WebSocket 토픽 5개 명시, Framer Motion 추가, 오프라인 판정/알림 로직, 긴급연락처 API 상세화, 접근성 검증 계획, Flyway 명시, 역할별 라우팅 상세화, 대시보드 Backend API 추가 |
| v1.2 | 2026-02-03 | Phase 0.4 추가: Playground 컴포넌트 분리 계획 (공유 UI 6개, 페이지 12개, LCD 4개, 타입 정의) |
| v1.3 | 2026-02-06 | Phase 1 브랜치 정리 및 Phase 2 병렬 분배/브랜치 전략 반영 |
| v1.4 | 2026-02-07 | Phase 2 구현 체크리스트 업데이트(완료/잔여 반영), Phase 3 병렬 분배 초안/브랜치 정리 계획 추가 |
| v1.5 | 2026-02-07 | Phase 2 Gate/Phase 3 구현 체크리스트 반영, 공통 마감(`management/architect`→`develop`) 체크 항목 추가 |
| v1.6 | 2026-02-07 | Phase 3 Round 2 착수 체크리스트 및 재분배 계획 반영 (브랜치 정리/재사용 정책 포함) |
| v1.7 | 2026-02-07 | Phase 3 Round 2 완료 반영: 3.2~3.5/3.7 체크 완료, Round 2 계약 고정/정렬/병합 완료 체크 반영 |
| v1.8 | 2026-02-07 | Phase 4 착수 준비 체크리스트(브랜치 정리/재할당/지시서 배포) 반영 및 진행률 정합화 |
| v1.9 | 2026-02-07 | Phase 4 구현 완료 체크 반영(Map/Room/Location/Snapshot/계약 정렬), Phase 5 착수 준비 계획(브랜치 정리/재할당) 추가 |
| v1.10 | 2026-02-07 | Phase 5 착수 준비 실제 반영: Phase 4 브랜치 정리(로컬/원격), Phase 5 브랜치 생성 및 Worktree 전환 체크 완료 |
| v1.11 | 2026-02-07 | Phase 5 지시서 배포 완료 반영(`COORDINATION-P5`, `WORK-INSTRUCTION-P5-AGENT*`) |
| v1.12 | 2026-02-07 | Phase 5 구현/머지 반영: LCD UI/API/이벤트/계약 체크리스트 갱신, 진행률 및 남은 고도화 항목 업데이트 |
| v1.13 | 2026-02-08 | Phase 6 착수 반영: Phase 5 브랜치 로컬 정리/Worktree 재할당 완료, Phase 6 하드닝 계획 및 체크리스트 추가 |
| v1.14 | 2026-02-08 | Phase 6 완료 반영: UI/Backend/계약 하드닝 체크 완료, `origin/develop` 병합 상태 및 운영 잔여 작업(브랜치 정리/동기화) 갱신 |
