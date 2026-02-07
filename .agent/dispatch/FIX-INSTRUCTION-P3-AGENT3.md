# Fix Instruction - P3 Agent 3

## 대상 브랜치
- `feature/phase3-db-patrol-ai`

## 리뷰 판정
- `Request Changes` (Critical 1, Minor 1)

## 필수 수정 사항
1. `ROLE_ROBOT` 권한 경계 붕괴 차단 (Critical)
- 대상:
  - `backend/src/main/java/site/silverbot/api/common/service/CurrentUserService.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/PatrolService.java`
  - 관련 인증/인가 진입부
- 조치:
  - 사용자 소유권 검사 경로에서 `ROLE_ROBOT` principal 사용자 조회를 금지
  - 보호자 전용 조회 API(`GET /api/elders/{elderId}/patrol/*`)는 USER principal만 소유권 검사 수행
  - 로봇 토큰은 로봇 전용 API에서만 허용되도록 분기 명확화

2. 대시보드 테스트 fixture 정합성 보강 (Minor)
- 대상:
  - `backend/src/test/java/site/silverbot/api/dashboard/controller/DashboardControllerTest.java`
- 조치:
  - 테스트용 `schedule` DDL과 INSERT fixture 컬럼을 일치
  - 격리 환경에서도 재현 가능한 상태로 유지

## 추가 정렬 요청 (Agent 1 연계)
- `activity_type`, `ai_report` DDL이 P3 계약의 기준이다.
- 계약 변경 필요 시 Agent 0 승인 전까지 임의 변경 금지.
- 변경이 발생하면 Agent 1이 즉시 후속 정렬할 수 있도록 차이점을 리뷰 요청서에 명시.

## 검증 명령
```bash
cd backend
./gradlew test --tests "site.silverbot.api.robot.service.PatrolServiceTest" \
  --tests "site.silverbot.api.robot.controller.PatrolControllerTest" \
  --tests "site.silverbot.api.dashboard.controller.DashboardControllerTest"
```

## 완료 기준
- Critical 이슈 재현 경로 차단이 코드/테스트로 확인되어야 함
- `agent-3/.agent/reviews/REVIEW-REQUEST-P3-AGENT3.md` 업데이트 후 push
