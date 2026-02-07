# Phase 6 작업 지시서 (Coordinator)

## 목적
- Phase 5에서 구현/머지된 LCD 기능을 운영 가능한 수준으로 하드닝한다.
- UI 접근성/표현 보강, Backend 이벤트 품질 보강, 계약/테스트 회귀 방지를 병렬로 처리한다.

## 기준
- 기준 브랜치: `origin/develop` (`b135ac7`)
- 기준 문서: `agent-0/docs/api-specification.md` (읽기 전용, 수정 금지)

## 브랜치 정책
- Agent 1: `feature/phase6-lcd-hardening-be`
- Agent 2: `feature/phase6-lcd-hardening-fe`
- Agent 3: `feature/phase6-lcd-data-quality-be`
- Agent 4: `feature/phase6-lcd-contract-e2e`
- 공통 Push 규칙: `git push -u origin <현재브랜치>`

## 공통 제약
- `docs/api-specification.md` 직접 수정 금지.
- 타 Agent 소유 파일 직접 수정 금지(필요 시 Agent 0 조정).
- 계약 변경(필드 추가/타입 변경)은 Agent 0 승인 후 진행.

## 소유권 경계
- Agent 1 (Backend LCD 제어):
  - `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
  - `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotLcdModeRequest.java`
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` (LCD 관련 케이스)
  - `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java`
- Agent 2 (Frontend-LCD UI/접근성):
  - `frontend-lcd/src/app/*`
  - `frontend-lcd/src/pages/*`
  - `frontend-lcd/src/features/lcd/components/*`
  - `frontend-lcd/src/features/lcd/hooks/useLcdController.ts`
- Agent 3 (Backend LCD 이벤트 정합성):
  - `backend/src/main/java/site/silverbot/api/robot/request/ReportRobotEventsRequest.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotEventService.java`
  - `backend/src/main/java/site/silverbot/domain/robot/RobotLcdEvent*.java`
  - `backend/src/main/resources/db/migration/*` (필요 시)
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` (events 관련 케이스)
- Agent 4 (계약/Mock/회귀 테스트):
  - `frontend-lcd/src/features/lcd/api/*`
  - `frontend-lcd/src/features/lcd/auth/*`
  - `frontend-lcd/src/features/lcd/types.ts`
  - `frontend/src/shared/types/*`
  - `frontend/src/mocks/*`

## 교차 조정 포인트
1. Agent 1 ↔ Agent 2/4
- `/lcd`, `/lcd-mode`, `/topic/robot/{robotId}/lcd` 응답 필드 계약 유지.
- `message/subMessage` string 보장 규칙 유지.

2. Agent 3 ↔ Agent 2/4
- `POST /api/robots/{robotId}/events` 액션(`TAKE/LATER/CONFIRM/EMERGENCY`) 처리 규칙과 400 실패 조건 정렬.

3. Agent 2 ↔ Agent 4
- `frontend-lcd` 파서/정규화 유틸은 Agent 4 기준 우선.
- Agent 2는 UI 표현/상호작용 중심, 계약 타입 변경은 Agent 4가 담당.

## 머지 순서 (권장)
1. Agent 3 (이벤트 정합성/DB)
2. Agent 1 (LCD Backend 하드닝)
3. Agent 4 (계약/Mock/테스트 정렬)
4. Agent 2 (UI 하드닝 최종 통합)
5. Agent 0 (`management/architect` -> `develop`)

## 완료 기준 (Phase 6 Round 1)
- Agent 1~4 각각 `REVIEW-REQUEST-P6-AGENT{N}.md` 작성 완료
- 새 세션 리뷰 `REVIEW-RESULT-P6-AGENT{N}.md` Approve 확보
- 위 머지 순서대로 `develop` 반영 완료
