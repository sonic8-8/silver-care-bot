# Phase 4 Round 2 수정 지시 [Agent 3]

## 브랜치
- `feature/phase4-video-location-be`

## 리뷰 결과
- `REVIEW-RESULT-P4-AGENT3.md`: **Request Changes (Major 1, Minor 1)**

## 필수 수정 (Major)
1. `PUT /api/robots/{robotId}/location`에 호출자 검증을 추가한다.
- 위치: `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java`
- 위치: `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
- 최소 요구:
  - 인증만으로 통과 금지
  - `ROLE_ROBOT`일 때 path `robotId`와 principal `robotId` 불일치 시 403
  - 사용자 토큰 허용 시, 해당 로봇 소유권 검증 실패 시 403
2. 서비스 레벨에서 검증되도록 구현한다(컨트롤러 단순 체크만으로 종료 금지).

## 권장 수정 (Minor)
1. 스냅샷 조회 정렬(`captured_at DESC, id DESC`)과 인덱스를 정렬키까지 맞춘다.
- 현재: `(patrol_result_id, captured_at DESC)`
- 권장: `(patrol_result_id, captured_at DESC, id DESC)`
- Flyway 신규 migration으로 비파괴 반영

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.api.robot.service.PatrolServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 수정 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P4-AGENT3.md` 갱신
