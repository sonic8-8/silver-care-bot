# Phase 6 작업 지시 [Agent 3]

## 브랜치
- `feature/phase6-lcd-data-quality-be`

## 목표
- LCD 이벤트 수집/처리의 데이터 정합성과 실패 응답 일관성을 강화한다.

## 작업 범위
1. 이벤트 검증/실패 처리 정합성 보강
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/request/ReportRobotEventsRequest.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotEventService.java`
- 요구:
  - `action/type` 조합의 유효성 검증 강화
  - 잘못된 payload 입력 시 400 응답 코드/메시지 일관성 유지
  - `TAKE/LATER/CONFIRM/EMERGENCY` 분기별 부수효과(기록/알림) 회귀 점검

2. 저장 계층 품질 보강
- 대상:
  - `backend/src/main/java/site/silverbot/domain/robot/RobotLcdEvent*.java`
  - `backend/src/main/resources/db/migration/*` (필요 시)
- 요구:
  - 이벤트 조회/집계에 필요한 인덱스/쿼리 경로 점검
  - 스키마 변경 시 Flyway 비파괴 마이그레이션 적용

3. 테스트 보강
- 대상:
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java`
- 요구:
  - 잘못된 액션 payload -> 400
  - `LATER` 알림 생성, `TAKE` 복약 처리 회귀 없음 검증

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P6-AGENT3.md` 작성
