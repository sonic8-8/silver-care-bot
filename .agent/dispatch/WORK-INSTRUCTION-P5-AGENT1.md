# Phase 5 Round 1 작업 지시 [Agent 1]

## 브랜치
- `feature/phase5-lcd-backend-be`

## 목표
1. LCD 조회/모드변경 API 정렬
- `GET /api/robots/{robotId}/lcd` 응답 필드 계약 정합
- `POST /api/robots/{robotId}/lcd-mode` 구현

2. 보안/소유권 검증
- 로봇/AI 호출 주체 검증을 서비스 레벨에서 강제
- 임의 `robotId` 변경 시도 차단(403)

3. WebSocket 브로드캐스트 보장
- 모드 변경 시 `/topic/robot/{robotId}/lcd`에 `LCD_MODE_CHANGE` push

## 제약
- `POST /api/robots/{robotId}/events` 본체 구현은 Agent 3 소유
- 공통 계약 타입/파서는 Agent 4 기준 우선

## 테스트
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P5-AGENT1.md` 작성/갱신
