# Phase 7 작업 지시서 (Coordinator)

## 목적
- `docs/api-ai.md`, `docs/api-embedded.md`, `docs/api-specification.md` 기준의 미구현 API/계약 불일치를 해소한다.
- 기존 Phase 6 결과를 유지하면서 Auth/Robot/WebSocket 계약을 운영 가능한 수준으로 정렬한다.

## 기준
- 기준 브랜치: `origin/develop` (`118bec9`)
- 기준 문서:
  - `docs/api-ai.md`
  - `docs/api-embedded.md`
  - `docs/api-specification.md` (읽기 전용, 수정 금지)

## 브랜치 정책
- Agent 1: `feature/phase7-auth-settings-be`
- Agent 2: `feature/phase7-frontend-contract-fe`
- Agent 3: `feature/phase7-robot-ingest-be`
- Agent 4: `feature/phase7-contract-websocket`
- 공통 Push 규칙: `git push -u origin <현재브랜치>`

## 공통 제약
- `docs/api-specification.md` 직접 수정 금지.
- 타 Agent 소유 파일 직접 수정 금지(필요 시 Agent 0 조정).
- 계약 변경(필드 추가/타입 변경)은 Agent 4 제안 → Agent 0 승인 후 진행.
- 신규 API 추가 시 REST Docs/테스트를 반드시 함께 갱신.

## 소유권 경계
- Agent 1 (Auth/Settings Backend):
  - `backend/src/main/java/site/silverbot/api/auth/**`
  - `backend/src/main/java/site/silverbot/api/robot/controller/RobotSettingsController.java` (신규 가능)
  - `backend/src/main/java/site/silverbot/api/robot/service/*Settings*Service.java` (신규 가능)
  - `backend/src/test/java/site/silverbot/api/auth/**`
- Agent 2 (Frontend 계약 소비/UI):
  - `frontend/src/features/auth/**`
  - `frontend/src/features/robot-control/**` (존재 시)
  - `frontend/src/pages/Emergency/**`
  - `frontend/src/shared/types/**` (Agent 4와 조정 필요)
- Agent 3 (Robot Ingestion Backend):
  - `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/**`
  - `backend/src/main/java/site/silverbot/api/map/**`
  - `backend/src/main/java/site/silverbot/domain/patrol/**`
  - `backend/src/test/java/site/silverbot/api/robot/**`
- Agent 4 (Contracts/WebSocket/Mock):
  - `frontend/src/shared/types/**`
  - `frontend/src/mocks/**`
  - `frontend-lcd/src/**`
  - `backend/src/main/java/site/silverbot/websocket/**`
  - `backend/src/main/java/site/silverbot/api/emergency/service/EmergencyService.java` (WS 발행 연결 시)

## 교차 조정 포인트
1. Agent 1 ↔ Agent 2/4
- Auth 응답(`user`, `robot`, `refreshToken`) 계약 변경 시 FE 타입/파서 동시 반영.

2. Agent 3 ↔ Agent 4
- `sync` 응답 확장(`scheduleReminders`, `medications`, `serverTime`)의 타입/Mock/테스트 동시 반영.
- Patrol target (`APPLIANCE`, `MULTI_TAP`) 허용 규칙을 FE 파서와 정렬.

3. Agent 3 ↔ Agent 1
- `commands/{commandId}/ack` 상태 전이 규칙이 기존 명령 생성 로직과 충돌하지 않도록 공통 enum 확인.

4. Agent 4 ↔ 전체
- WebSocket 계약(STOMP 기준/호환 레이어) 결정안을 작성하고 Agent 0 승인 후 반영.

## 머지 순서 (권장)
1. Agent 3 (미구현 Robot API + Sync 확장)
2. Agent 1 (Auth/Settings 계약 정렬)
3. Agent 4 (계약/Mock/WebSocket 정렬)
4. Agent 2 (Frontend 소비/긴급 UI 정렬)
5. Agent 0 (`management/architect` -> `develop`)

## 완료 기준 (Phase 7 Round 1)
- Agent 1~4 각각 `REVIEW-REQUEST-P7-AGENT{N}.md` 작성 완료
- 새 세션 리뷰 `REVIEW-RESULT-P7-AGENT{N}.md` Approve 확보
- 머지 순서대로 `develop` 반영 완료
