# Phase 3 작업 지시서 (Coordinator)

## 프로젝트명
동행

## 목적
Phase 3(Medium) 착수 전, Phase 2 잔여 3개 게이트를 먼저 종료하고 이후 Phase 3 도메인 작업을 병렬 진행한다.

## 브랜치/담당
| Agent | 브랜치 | 담당 |
|---|---|---|
| Agent 1 | `feature/phase3-activity-report-be` | Activity/Report Backend + 게이트(대시보드 복약 요약 API 정합) |
| Agent 2 | `feature/phase3-history-report-fe` | Schedule/Dashboard/History Frontend + 게이트 핵심 UI |
| Agent 3 | `feature/phase3-db-patrol-ai` | Phase 3 DB/Patrol/Conversation/Search Backend |
| Agent 4 | `feature/phase3-contract-realtime` | Contract/Realtime 통합 + 게이트(알림 무한스크롤, 대시보드 실시간 훅) |

## 0단계 게이트 (Phase 2 잔여)
종료 조건(모두 충족 필수):
1. 일정 관리 Frontend(`/elders/:id/schedule`) 구현 완료
2. 대시보드 실시간 구독(`/topic/robot/{robotId}/status`, `/topic/elder/{elderId}/status`) 반영
3. 알림 목록 무한 스크롤 UX 보강 및 검증 완료

역할 분담:
- Agent 1: 대시보드 복약 요약 API가 아침/저녁 UI 요구사항을 충족하도록 계약 보완 및 테스트 갱신
- Agent 2: 일정 화면 완성 + 대시보드 실시간 상태 반영 UI 구현
- Agent 4: 알림 무한스크롤 + 실시간 공통 훅/구독 안정화
- Agent 3: 0단계 동안 Phase 3 DB 설계 초안/마이그레이션 계획만 준비(본 구현 착수 대기)

## 1단계 (Phase 3 본작업)
0단계 종료 후 착수:
- PLAN 3.1~3.8 구현 시작
- 세부 작업은 `WORK-INSTRUCTION-P3-AGENT{N}.md` 기준

## 공통 규칙
1. 작업 경로는 본인 워크트리(`sh/agent-N/`)만 사용.
2. 브랜치 명시 push 필수: `git push origin <현재브랜치명>`.
3. 프로젝트 명칭은 문서/UI/커밋 본문에서 `동행`으로 통일.
4. 기능 단위 작은 커밋 + 테스트 통과 후 push.
5. 작업 완료 시 리뷰 요청서 작성:
   - `agent-N/.agent/reviews/REVIEW-REQUEST-P3-AGENTN.md`

## 머지 순서
### 0단계(게이트)
1. Agent 1 (대시보드 API 계약 보완)
2. Agent 4 (실시간/알림 공통 훅 + 무한스크롤)
3. Agent 2 (일정/대시보드 UI 통합)

### 1단계(Phase 3)
1. Agent 3 (DB + Patrol/AI Data)
2. Agent 1 (Activity + Weekly Report BE)
3. Agent 4 (Contract/Realtime Integration)
4. Agent 2 (History + Report FE)

## Definition of Done (공통)
- 담당 PLAN 항목 구현 완료 + 테스트 근거 제시
- 백엔드: `./gradlew test` (최소 변경 범위 + 핵심 도메인)
- 프론트: `npm run test -- --run` + `npm run build`
- API 계약/타입 정합성 확인
- 리뷰 요청서에 변경 파일/테스트 결과/우려사항 기록

## Fix Round 1 협업 지시 (2026-02-07)
P3 1차 리뷰 결과 기준으로 아래 항목은 Agent 간 계약 정렬이 필요하다.

1. Activity/Report 계약 기준 고정 (Agent 1 ↔ Agent 3)
- 기준 소스는 Agent 3의 Phase 3 DDL(`activity_type`, `ai_report`)로 고정한다.
- Agent 1은 해당 기준으로 enum/SQL/DTO/테스트를 일괄 정렬한다.
- Agent 3는 DDL 계약 변경이 필요하면 먼저 Agent 0 승인 후 문서(`docs/api-specification.md`)를 동기화한다.

2. Dashboard Realtime + Mock 소유권 정렬 (Agent 2 ↔ Agent 4)
- `frontend/src/shared/websocket/**`, `frontend/src/mocks/**`는 Agent 4 계약을 기준으로 사용한다.
- Agent 2는 대시보드 실시간 로직을 Agent 4 공통 훅에 맞춰 연동하고, mock 변경은 Agent 4 반영본을 소비한다.
- Agent 4는 필요한 공통 훅 API(구독 이벤트/중복제거 규칙)와 mock 동작(null 초기화 처리 포함)을 명시/반영한다.

3. 보안 경계 공통 원칙 (Agent 1, Agent 3 공통)
- `ROLE_ROBOT` principal은 보호자/요양보호사 전용 조회 경로의 사용자 소유권 검사로 해석하면 안 된다.
- 사용자 principal 해석은 USER role에서만 허용하고, 로봇 토큰은 전용 서비스 경로로만 처리한다.
