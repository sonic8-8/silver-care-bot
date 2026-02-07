# Phase 5 Round 1 작업 지시 [Agent 3]

## 브랜치
- `feature/phase5-lcd-events-be`

## 목표
1. LCD 이벤트 수신 API 구현
- `POST /api/robots/{robotId}/events` 구현
- LCD 상호작용 이벤트(action/type/timestamp) 저장

2. 액션 처리 로직 구현
- 복약 액션(`TAKE`, `LATER`) 서버 처리 경로 구현
- 기존 복약/알림 흐름과 충돌 없이 연계

3. DB 마이그레이션/검증
- 이벤트 저장을 위한 Flyway migration 추가(비파괴)
- 인덱스/조회 키 최소 보강

## 제약
- LCD 모드 변경 API(`/lcd-mode`) 본체는 Agent 1 소유
- payload enum/계약은 Agent 4와 먼저 고정 후 구현

## 테스트
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.controller.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.PatrolServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P5-AGENT3.md` 작성/갱신
