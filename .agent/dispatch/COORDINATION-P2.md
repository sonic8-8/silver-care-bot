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

---

## P2 리뷰 라운드 4 상태 (2026-02-07)

| Agent | 리뷰 상태 | 병합 가능 여부 | 메모 |
|---|---|---|---|
| Agent 1 | ✅ Approve | 조건부 가능 | Agent 3 선행 머지 후 병합 |
| Agent 2 | ✅ Approve | 조건부 가능 | Agent 4 선행 머지 후 최종 병합 |
| Agent 3 | ⚠️ Request Changes | 불가 | 실환경 Flyway 증빙 + 원격 브랜치 코드 미반영(`origin`이 `b7eb871`) |
| Agent 4 | ✅ Approve | 조건부 가능 | Agent 3, Agent 1 선행 머지 후 병합 |

---

## C-01. Flyway 버전 통합 (Open)
목표: 중복 버전(`V3`, `V4`) 충돌을 제거하고 병합 가능한 단일 마이그레이션 체인을 확정한다.

실행 순서:
1. Agent 3가 구현 코드를 원격 브랜치(`feature/phase2-db-schedule`)에 먼저 반영한다.
2. Agent 3가 PostgreSQL 실환경에서 `FlywayMigrationVerificationTest` 2건을 skip 없이 PASS로 증빙한다.
3. Agent 4는 Agent 3의 `V5` 기준으로 `V6` 결합 검증을 재확인한다.
4. Agent 3 Approve 획득 후 머지 순서(3 -> 1 -> 4 -> 2)로 통합한다.

완료 조건:
- 최종 코드베이스에 동일 버전 번호를 가진 서로 다른 스크립트가 존재하지 않는다.
- clean DB + legacy 이력 DB 검증이 `skipped=0` 근거와 함께 리뷰 문서에 기록된다.

## C-02. `frontend/src/shared/types/**` 소유권 조율 (Closed)
상태: 완료 (Agent 2 리뷰 결과에서 feature-local type 전환으로 충돌 해소 확인)

종료 조건 확인:
- Agent 2 브랜치에서 `shared/types` 중복 변경 제거 확인
- Agent 2 리뷰 상태 `Approve` 확인
