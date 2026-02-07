# Phase 6 작업 지시 [Agent 1]

## 브랜치
- `feature/phase6-lcd-hardening-be`

## 목표
- LCD 조회/모드 변경 API의 회귀 위험을 줄이고 권한/응답 정합성을 강화한다.

## 작업 범위
1. LCD API 회귀 테스트 보강
- 대상:
  - `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java`
  - `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java`
- 요구:
  - `GET /api/robots/{robotId}/lcd` 권한(소유 worker/비소유 worker/robot principal) 회귀 케이스 보강
  - `POST /api/robots/{robotId}/lcd-mode` 권한/응답(`message/subMessage` string 보장) 회귀 케이스 보강

2. LCD 서비스 안정성 보강
- 대상:
  - `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java`
  - `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotLcdModeRequest.java`
- 요구:
  - 빈 문자열/누락 입력 시 정규화 규칙 유지(`null -> ""`)
  - 감정/모드 입력값 처리의 방어 로직 점검(예외 메시지/상태코드 일관성)

3. 문서화/검증
- REST Docs 스니펫 회귀 없음 확인

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P6-AGENT1.md` 작성
