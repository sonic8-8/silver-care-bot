# Phase 2 작업 지시서 (Coordinator)

## 목적
Phase 2(High) 기능을 4개 병렬 트랙으로 구현하고, 충돌 최소화/머지 순서 고정으로 통합 리스크를 낮춘다.

## 브랜치/담당
| Agent | 브랜치 | 담당 |
|---|---|---|
| Agent 1 | `feature/phase2-medication-dashboard-be` | Medication Backend + Dashboard Backend |
| Agent 2 | `feature/phase2-medication-dashboard-fe` | Medication Frontend + Dashboard Frontend |
| Agent 3 | `feature/phase2-db-schedule` | DB 확장 + Schedule Backend |
| Agent 4 | `feature/phase2-notification-realtime` | Notification Backend/Frontend + WebSocket 실시간 |

## 공통 규칙
1. 작업 경로는 본인 워크트리(`sh/agent-N/`)만 사용.
2. 브랜치 명시 push 필수: `git push origin <현재브랜치명>`.
3. 공유 파일 변경은 소유권 규칙 준수.
4. 기능 단위로 작은 커밋, 테스트 통과 후 push.
5. 작업 완료 시 리뷰 요청서 작성:
   - `agent-N/.agent/reviews/REVIEW-REQUEST-P2-AGENTN.md`

## Phase 2 머지 순서
1. Agent 3 (DB + Schedule BE)
2. Agent 1 (Medication BE + Dashboard BE)
3. Agent 4 (Notification + Realtime)
4. Agent 2 (Medication FE + Dashboard FE)

## Definition of Done (공통)
- PLAN.md Phase 2 담당 항목 구현/테스트 완료.
- 백엔드: `./gradlew test` 통과(최소 변경 범위 테스트 + 도메인 핵심 테스트).
- 프론트: `npm run test -- --run` 또는 변경 범위 테스트 통과.
- API 계약/타입 정합성 확인.
- 리뷰 요청서에 변경 파일/테스트 결과/우려사항 기록.
