# Phase 5 Round 2 수정 지시 [Agent 1]

## 브랜치
- `feature/phase5-lcd-backend-be`

## 리뷰 결과
- `REVIEW-RESULT-P5-AGENT1.md`: **Request Changes (Major 1)**

## 필수 수정
1. LCD 응답 계약에서 `message/subMessage` non-null 보장
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
  - `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotLcdModeRequest.java` (필요 시)
- 요구:
  - `GET /api/robots/{robotId}/lcd` 응답에서 `message`, `subMessage`가 `null`이면 `""`로 정규화
  - `POST /api/robots/{robotId}/lcd-mode` 응답도 동일 규칙 적용
  - WebSocket `LCD_MODE_CHANGE` payload도 동일 규칙 적용

2. 테스트 보강
- 대상:
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java`
  - `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` (필요 시)
- 케이스:
  - 기본 LCD 조회 응답에서 `message/subMessage` non-null 보장
  - LCD 모드 변경 응답 및 브로드캐스트 payload non-null 보장

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

## 산출물
- 수정 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P5-AGENT1.md` 갱신
