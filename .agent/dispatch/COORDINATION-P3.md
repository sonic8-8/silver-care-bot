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
