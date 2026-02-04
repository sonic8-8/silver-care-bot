# PLAN: 구현 계획서

> **버전**: v1.1
> **작성일**: 2026-02-02
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
- [ ] 공통 응답 형식 정의 (ApiResponse, ErrorResponse)
- [ ] 글로벌 예외 처리 (GlobalExceptionHandler)

#### 0.2 Frontend 초기 설정
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS + cva + tailwind-merge 설정
- [ ] Framer Motion 설치
- [ ] React Router 설정
- [ ] TanStack Query + Axios 설정
- [ ] Zustand 스토어 구조 설정
- [ ] MSW 설정 (API Mock)
- [ ] Vitest + RTL 설정

#### 0.3 공통 설정
- [ ] ESLint + Prettier 설정
- [ ] Git hooks (husky + lint-staged)
- [ ] 환경변수 설정 (.env)

#### 0.4 Playground 컴포넌트 분리 (Frontend)
> Playground 프로토타입 코드를 실제 컴포넌트로 분리

##### 0.4.1 공유 UI 컴포넌트 (`/frontend/src/shared/ui/`)
- [ ] `Button.tsx` - 공통 버튼 (variants: primary, secondary, danger, white, dark)
- [ ] `Card.tsx` - 카드 컨테이너
- [ ] `Header.tsx` - 페이지 헤더 (뒤로가기, 타이틀, 액션 버튼)
- [ ] `Badge.tsx` - 상태 뱃지 (safe, warning, danger, neutral)
- [ ] `Input.tsx` - 입력 필드 (라벨, 아이콘 지원)
- [ ] `SectionHeader.tsx` - 섹션 제목 + 액션 버튼

##### 0.4.2 페이지 컴포넌트 분리 (`/frontend/src/pages/`)
- [ ] `Login/LoginScreen.tsx` - 로그인 (보호자/로봇 탭)
- [ ] `Signup/SignupScreen.tsx` - 회원가입
- [ ] `Elders/ElderSelectScreen.tsx` - 노인 선택 (복지사 전용)
- [ ] `Dashboard/DashboardScreen.tsx` - 홈 대시보드
- [ ] `Settings/SettingsScreen.tsx` - 설정 (테마, 알림, 로봇 설정)
- [ ] `Schedule/ScheduleScreen.tsx` - 일정 관리
- [ ] `Robot/RobotControlScreen.tsx` - 로봇 제어
- [ ] `Robot/RobotLCDScreen.tsx` - LCD 미러링 전체화면
- [ ] `Medication/MedicationScreen.tsx` - 약 관리
- [ ] `History/HistoryScreen.tsx` - 기록/AI 리포트
- [ ] `Notification/NotificationScreen.tsx` - 알림 목록
- [ ] `Emergency/EmergencyScreen.tsx` - 긴급 상황 풀스크린

##### 0.4.3 컨테이너 및 네비게이션
- [ ] `GuardianAppContainer.tsx` - 메인 앱 컨테이너 (탭 네비게이션 포함)
- [ ] `BottomNavigation.tsx` - 하단 탭바 컴포넌트

##### 0.4.4 LCD 컴포넌트 (`/frontend/src/features/robot-lcd/` 또는 `/frontend-lcd/`)
- [x] `RobotLCD.tsx` - 로봇 LCD 메인 컴포넌트 (이미 분리됨)
- [ ] `Eye.tsx` - 눈 애니메이션 컴포넌트
- [ ] `InfoChip.tsx` - 상태 정보 칩
- [ ] `SimControls.tsx` - 시뮬레이션 컨트롤 (개발용)

##### 0.4.5 타입 정의 (`/frontend/src/shared/types/`)
- [ ] `ui.types.ts` - UI 컴포넌트 공통 타입 (ButtonVariant, BadgeStatus 등)
- [ ] `screen.types.ts` - 화면별 Props 타입

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

#### 2.1 데이터베이스 확장
- [ ] MEDICATION 테이블 + Entity
- [ ] MEDICATION_RECORD 테이블 + Entity
- [ ] SCHEDULE 테이블 + Entity
- [ ] NOTIFICATION 테이블 + Entity

#### 2.2 복약 관리 (Medication) - Backend
- [ ] `POST /api/elders/{elderId}/medications` - 약 등록
- [ ] `GET /api/elders/{elderId}/medications` - 복용 현황
  - [ ] 주간 복용률 계산
  - [ ] 일별 상태 포함
- [ ] `GET /api/elders/{elderId}/medications/{id}` - 약 상세
- [ ] `PUT /api/elders/{elderId}/medications/{id}` - 약 수정
- [ ] `DELETE /api/elders/{elderId}/medications/{id}` - 약 삭제
- [ ] `POST /api/elders/{elderId}/medications/records` - 복용 기록
  - [ ] 로봇에서 호출 (TAKEN/MISSED)

#### 2.3 복약 관리 (Medication) - Frontend
- [ ] 약 관리 페이지 (`/elders/:id/medications`)
  - [ ] 주간 복용률 차트
  - [ ] 약 목록 카드
  - [ ] 약 추가/수정 모달
  - [ ] 일별 복용 상태 캘린더

#### 2.4 일정 관리 (Schedule) - Backend
- [ ] `POST /api/elders/{elderId}/schedules` - 일정 등록
- [ ] `GET /api/elders/{elderId}/schedules` - 일정 목록
  - [ ] Query: startDate, endDate, type
- [ ] `GET /api/elders/{elderId}/schedules/{id}` - 일정 상세
- [ ] `PUT /api/elders/{elderId}/schedules/{id}` - 일정 수정
- [ ] `DELETE /api/elders/{elderId}/schedules/{id}` - 일정 삭제
- [ ] `POST /api/elders/{elderId}/schedules/voice` - 음성 일정 등록
  - [ ] voice_original, normalized_text, confidence 저장

#### 2.5 일정 관리 (Schedule) - Frontend
- [ ] 일정 관리 페이지 (`/elders/:id/schedule`)
  - [ ] 주간 캘린더 뷰
  - [ ] 리스트 뷰 전환
  - [ ] 일정 추가/수정 모달
  - [ ] 일정 유형별 색상 구분

#### 2.6 알림 시스템 (Notification) - Backend
- [ ] `GET /api/notifications` - 알림 목록
  - [ ] 페이지네이션
  - [ ] 읽음/안읽음 필터
- [ ] `GET /api/notifications/unread-count` - 안읽음 개수
- [ ] `PATCH /api/notifications/{id}/read` - 읽음 처리
- [ ] `PATCH /api/notifications/read-all` - 전체 읽음
- [ ] `GET /api/users/me/settings` - 사용자 설정 조회
- [ ] `PATCH /api/users/me/settings` - 알림 설정 변경
- [ ] 알림 생성 서비스
  - [ ] 긴급, 복약, 일정, 활동, 시스템 유형별 생성
- [ ] WebSocket 실시간 알림 발송

#### 2.7 알림 시스템 (Notification) - Frontend
- [ ] 알림 페이지 (`/notifications`)
  - [ ] 알림 목록 (무한 스크롤)
  - [ ] 읽음/안읽음 필터
  - [ ] 전체 읽음 버튼
  - [ ] 알림 클릭 시 해당 페이지 이동
- [ ] 알림 벨 컴포넌트 (헤더)
  - [ ] 안읽음 개수 뱃지
  - [ ] 드롭다운 미리보기 (최근 5개)
  - [ ] WebSocket 실시간 업데이트
- [ ] 설정 페이지 (`/settings`)
  - [ ] 프로필 정보 수정
  - [ ] 알림 유형별 ON/OFF
  - [ ] 테마 설정 (SYSTEM/LIGHT/DARK)

#### 2.8 대시보드 (Dashboard) - Frontend
- [ ] 홈 대시보드 (`/elders/:id`)
  - [ ] 오늘의 요약 카드
    - [ ] 기상 시간
    - [ ] 복용 현황 (아침/저녁)
    - [ ] 활동 상태
  - [ ] 최근 알림 (5개)
  - [ ] 주간 캘린더 위젯
  - [ ] 로봇 상태 카드
    - [ ] 배터리 (아이콘 + %)
    - [ ] 연결 상태 (CONNECTED/DISCONNECTED)
    - [ ] 현재 위치
    - [ ] LCD 모드
  - [ ] WebSocket 실시간 업데이트
    - [ ] `/topic/robot/{robotId}/status` 구독
    - [ ] `/topic/elder/{elderId}/status` 구독

#### 2.9 대시보드 (Dashboard) - Backend
- [ ] `GET /api/elders/{elderId}/dashboard` - 대시보드 데이터
  - [ ] 오늘의 요약
  - [ ] 최근 알림
  - [ ] 주간 일정
  - [ ] 로봇 상태

---

### Phase 3: 부가 기능 (Medium)
> 서비스 완성도를 높이는 기능

#### 3.1 데이터베이스 확장
- [ ] ACTIVITY 테이블 + Entity
- [ ] PATROL_RESULT 테이블 + Entity
- [ ] PATROL_ITEM 테이블 + Entity
- [ ] CONVERSATION 테이블 + Entity
- [ ] SEARCH_RESULT 테이블 + Entity
- [ ] AI_REPORT 테이블 + Entity

#### 3.2 활동 로그 (Activity) - Backend
- [ ] `GET /api/elders/{elderId}/activities` - 일일 로그
  - [ ] Query: date (기본값: 오늘)
- [ ] `POST /api/robots/{robotId}/activities` - 활동 보고
  - [ ] 유형: WAKE_UP, SLEEP, OUT_DETECTED, RETURN_DETECTED 등

#### 3.3 활동 로그 (Activity) - Frontend
- [ ] 기록 페이지 (`/elders/:id/history`)
  - [ ] 타임라인 뷰
  - [ ] 날짜 선택기
  - [ ] 활동 유형별 아이콘/색상
  - [ ] 탭: 활동 로그 / AI 리포트

#### 3.4 AI 리포트 (Report) - Backend
- [ ] `GET /api/elders/{elderId}/reports/weekly` - 주간 리포트
  - [ ] 복용률
  - [ ] 활동량
  - [ ] 대화 키워드
  - [ ] 추천사항
- [ ] 주간 리포트 자동 생성 스케줄러 (매주 월요일)

#### 3.5 AI 리포트 (Report) - Frontend
- [ ] 기록 페이지 리포트 탭
  - [ ] 복용률 차트 (막대/라인)
  - [ ] 활동량 그래프
  - [ ] 대화 키워드 클라우드
  - [ ] AI 추천사항 카드

#### 3.6 순찰 피드 (Patrol) - Backend
- [ ] `GET /api/elders/{elderId}/patrol/latest` - 최근 순찰 결과
- [ ] `GET /api/elders/{elderId}/patrol/history` - 순찰 히스토리
- [ ] `POST /api/robots/{robotId}/patrol/report` - 순찰 보고
  - [ ] 항목: GAS_VALVE, DOOR, OUTLET, WINDOW, MULTI_TAP
  - [ ] 상태: ON, OFF, NORMAL, LOCKED, UNLOCKED, NEEDS_CHECK

#### 3.7 순찰 피드 (Patrol) - Frontend
- [ ] 순찰 결과 카드 (대시보드)
  - [ ] 가스밸브/창문/콘센트 상태 아이콘
  - [ ] 경고 항목 하이라이트
  - [ ] 마지막 순찰 시간

#### 3.8 AI 대화/검색 기록 - Backend
- [ ] `GET /api/robots/{robotId}/conversations` - 대화 기록
- [ ] `POST /api/robots/{robotId}/conversations` - 대화 저장
- [ ] `GET /api/robots/{robotId}/search-results` - 검색 결과
- [ ] `POST /api/robots/{robotId}/search-results` - 검색 결과 저장

---

### Phase 4: 고급 기능 (Low)
> MVP 이후 추가 검토

#### 4.1 안심 지도 (Map)
- [ ] `GET /api/robots/{robotId}/map` - SLAM 맵 이미지 조회
- [ ] `GET /api/robots/{robotId}/rooms` - 방 목록 CRUD
- [ ] `POST /api/robots/{robotId}/rooms` - 방 등록
- [ ] `PUT /api/robots/{robotId}/rooms/{roomId}` - 방 수정
- [ ] `DELETE /api/robots/{robotId}/rooms/{roomId}` - 방 삭제
- [ ] Frontend: Canvas 기반 맵 렌더링
- [ ] Frontend: 로봇 위치 실시간 표시 (WebSocket)

#### 4.2 영상 스냅샷 (Video)
- [ ] 순찰 시 이미지 캡처 저장
- [ ] `GET /api/patrol/{patrolId}/snapshots` - 스냅샷 목록
- [ ] Frontend: 스냅샷 갤러리 UI

---

### Phase 5: 로봇 LCD 화면
> Robot React App (별도 빌드)

#### 5.1 LCD 프로젝트 설정
- [ ] Vite 프로젝트 설정 (별도 디렉토리: `/frontend-lcd`)
- [ ] Tailwind CSS + Framer Motion 설정
- [ ] 전체화면 레이아웃 (1024x600)
- [ ] 대형 폰트 + 터치 최적화 (64px+, 터치 영역 64px+)
- [ ] WCAG AAA 접근성 (대비율 7:1)
- [ ] WebSocket 연결 (서버 → LCD)

#### 5.2 LCD 공통 컴포넌트
- [ ] RobotFace 컴포넌트 (눈 애니메이션)
  - [ ] 자동 깜빡임
  - [ ] 표정 변화 (neutral, happy, sleep)
- [ ] StatusBar 컴포넌트 (시계, WiFi, 배터리)
- [ ] LargeButton 컴포넌트 (터치 최적화)

#### 5.3 LCD 화면 구현
- [ ] IDLE 모드 - 평상시
  - [ ] 메인 메시지 + 서브 메시지
  - [ ] 다음 일정 표시
  - [ ] neutral 표정
- [ ] GREETING 모드 - 기상/귀가
  - [ ] 인사말 + 날씨 정보
  - [ ] happy 표정
- [ ] MEDICATION 모드 - 약 시간
  - [ ] 초대형 버튼 2개 (복용완료/나중에)
  - [ ] happy 표정
  - [ ] 버튼 클릭 → 서버 API 호출
- [ ] SCHEDULE 모드 - 일정 알림
  - [ ] 일정 카드 (제목, 시간, 장소)
  - [ ] 확인 버튼
  - [ ] neutral 표정
- [ ] LISTENING 모드 - 음성 인식
  - [ ] 파동 애니메이션 (Framer Motion)
  - [ ] neutral 표정
- [ ] EMERGENCY 모드 - 긴급 상황
  - [ ] 배경 빨간색 점멸
  - [ ] 119 버튼 + 괜찮아요 버튼
  - [ ] neutral 표정
- [ ] SLEEP 모드 - 충전 중
  - [ ] 충전 상태 표시 (배터리 %)
  - [ ] sleep 표정 (눈 감김)

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
| Phase 0 | ⏳ 대기 | 0% |
| Phase 1 | ⏳ 대기 | 0% |
| Phase 2 | ⏳ 대기 | 0% |
| Phase 3 | ⏳ 대기 | 0% |
| Phase 4 | ⏳ 대기 | 0% |
| Phase 5 | ⏳ 대기 | 0% |

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-02 | 초안 작성. PRD v2.0 기반 6 Phase 구현 계획 |
| v1.1 | 2026-02-02 | PRD 대비 누락 항목 보완: WebSocket 토픽 5개 명시, Framer Motion 추가, 오프라인 판정/알림 로직, 긴급연락처 API 상세화, 접근성 검증 계획, Flyway 명시, 역할별 라우팅 상세화, 대시보드 Backend API 추가 |
| v1.2 | 2026-02-03 | Phase 0.4 추가: Playground 컴포넌트 분리 계획 (공유 UI 6개, 페이지 12개, LCD 4개, 타입 정의) |
