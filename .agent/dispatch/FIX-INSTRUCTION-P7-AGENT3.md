# Phase 7 수정 지시 [Agent 3]

## 브랜치
- `feature/phase7-robot-ingest-be`

## 리뷰 결과
- `agent-3/.agent/reviews/REVIEW-RESULT-P7-AGENT3.md`: **Request Changes (Major 2, Minor 1)**

## API 기준 확인
- `agent-0/docs/api-specification.md` 5.1/5.3
  - `POST /api/robots/{robotId}/sync`
  - `POST /api/robots/{robotId}/commands/{commandId}/ack`
  - `sync` 응답 필드(`pendingCommands`, `scheduleReminders`, `medications`, `serverTime`) 계약 유지

## 지시 사항
1. `sync` 권한 검증 보강 (Major)
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
  - 관련 권한 유틸/검증 메서드
- 조치:
  - `sync()` 시작 시 소유 사용자 또는 로봇 본인 principal만 허용
  - 비소유 사용자/불일치 robot principal 접근을 명시적으로 차단(403)

2. `ack` 상태 전이 정합성 수정 (Major)
- 대상: `backend/src/main/java/site/silverbot/api/robot/service/RobotCommandService.java`
- 조치:
  - `PENDING -> RECEIVED`만 허용
  - `IN_PROGRESS/COMPLETED/FAILED/CANCELLED`는 `RECEIVED` 또는 `IN_PROGRESS`에서만 허용
  - `PENDING -> COMPLETED` 같은 전이를 400으로 차단

3. 실패 경로 테스트 보강 (Minor)
- 대상: `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` (및 서비스 테스트)
- 조치:
  - `sync`: 비소유자/불일치 principal 실패 케이스
  - `ack`: `PENDING -> COMPLETED` 실패 케이스
  - `map`: 잘못된 확장자/잘못된 rooms JSON/권한 실패 케이스

4. 계약 회귀 금지
- `sync` 응답 확장 필드(`scheduleReminders`, `medications`, `serverTime`)는 유지
- 기존 heartbeat/명령 소비 흐름 회귀 없도록 검증

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain --rerun-tasks \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P7-AGENT3.md` 갱신
