# SCRATCHPAD

> 현재 작업 중인 사고 과정 및 판단 기록

---

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
