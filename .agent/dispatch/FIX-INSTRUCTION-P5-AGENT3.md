# Phase 5 Round 2 수정 지시 [Agent 3]

## 브랜치
- `feature/phase5-lcd-events-be`

## 리뷰 결과
- `REVIEW-RESULT-P5-AGENT3.md`: **Request Changes (Major 1, Minor 1)**

## 필수 수정 (Major)
1. `action=TAKE`에서 `medicationId` 필수 검증
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/request/ReportRobotEventsRequest.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotEventService.java`
- 요구:
  - `action=TAKE` && `medicationId == null`이면 `400` 실패 처리
  - 무음 성공 금지(카운트/활동 로그만 증가하는 상태 제거)

2. 처리 순서 정합성 보장
- `medicationTakenCount` 증가 및 `MEDICATION_TAKEN` activity 기록은
  복약 기록 upsert 성공 이후에만 반영

## 필수 수정 (Minor)
1. 테스트 보강
- 대상:
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java`
- 케이스:
  - `TAKE + medicationId 누락` -> `400`
  - `LATER` 요청 시 알림 생성 검증(타입/메시지/targetPath)

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.PatrolServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 수정 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P5-AGENT3.md` 갱신
