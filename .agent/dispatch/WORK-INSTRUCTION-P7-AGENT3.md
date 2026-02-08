# Phase 7 작업 지시 [Agent 3]

## 브랜치
- `feature/phase7-robot-ingest-be`

## 목표
- 문서 대비 누락된 Robot API를 구현하고 `sync`/`patrol` 계약 불일치를 해소한다.

## 작업 범위
1. Robot 미구현 API 구현
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/**`
  - `backend/src/main/java/site/silverbot/api/map/**`
- 요구:
  - `POST /api/robots/{robotId}/map` (multipart 업로드)
  - `POST /api/robots/{robotId}/commands/{commandId}/ack`
  - `POST /api/robots/{robotId}/patrol-results`
  - `POST /api/robots/{robotId}/sleep-wake`
  - `POST /api/robots/{robotId}/medication-reminder` (후순위)
  - `POST /api/robots/{robotId}/medication-response` (후순위)

2. Sync 응답 확장
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/response/RobotSyncResponse.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
- 요구:
  - `pendingCommands` 외 `scheduleReminders`, `medications`, `serverTime` 추가
  - 기존 로봇 heartbeat 동작 회귀 없음

3. Patrol target 호환성
- 대상:
  - `backend/src/main/java/site/silverbot/domain/patrol/PatrolTarget.java`
  - `backend/src/main/java/site/silverbot/api/robot/request/ReportPatrolRequest.java` 관련 파서
- 요구:
  - `APPLIANCE`, `MULTI_TAP` 동시 허용
  - 기존 저장/조회/통계 경로 회귀 없음

4. 테스트/마이그레이션
- 대상:
  - `backend/src/test/java/site/silverbot/api/robot/**`
  - `backend/src/main/resources/db/migration/*` (필요 시)
- 요구:
  - 신규 API + sync/patrol 회귀 테스트 추가
  - 스키마 변경 시 Flyway 비파괴 마이그레이션

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P7-AGENT3.md` 작성
