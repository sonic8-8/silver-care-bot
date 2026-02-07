# Fix Instruction - P3 Agent 1

## 대상 브랜치
- `feature/phase3-activity-report-be`

## 리뷰 판정
- `Request Changes / Reject` (Critical 2, Major 1)

## 필수 수정 사항
1. 보호자 조회 API 권한 경계 보강 (Critical)
- 대상:
  - `backend/src/main/java/site/silverbot/api/activity/controller/ActivityController.java`
  - `backend/src/main/java/site/silverbot/api/report/controller/ReportController.java`
  - `backend/src/main/java/site/silverbot/api/activity/service/ActivityService.java` (또는 사용자 principal 해석부)
- 조치:
  - 보호자/요양보호사 조회 API에 `@PreAuthorize("hasAnyRole('WORKER','FAMILY')")` 적용
  - `ROLE_ROBOT` principal이 사용자 소유권 검사 경로로 들어오면 즉시 403 처리

2. `ai_report` 저장/조회 SQL을 Agent 3 DDL 계약으로 정렬 (Critical)
- 대상:
  - `backend/src/main/java/site/silverbot/api/report/repository/ReportJdbcRepository.java`
  - Report 도메인 DTO/매퍼/서비스
- 조치:
  - `period_start`, `period_end`, `metrics(JSONB)`, `top_keywords(JSONB)`, `recommendations(JSONB)` 기준으로 SQL/매핑 교체
  - JSON 직렬화/역직렬화(ObjectMapper) 규칙을 코드와 테스트에 명시

3. Activity enum을 DB 계약과 통일 (Major)
- 대상:
  - `backend/src/main/java/site/silverbot/api/activity/model/ActivityType.java`
  - 요청 DTO/컨트롤러/테스트 fixture
- 조치:
  - Agent 3 `activity_type` enum 계약과 값/표기 완전 일치
  - 잘못된 enum 값 입력 시 검증/예외 동작 테스트 추가

## 검증 명령
```bash
cd backend
./gradlew test --tests "site.silverbot.api.activity.controller.ActivityControllerTest" \
  --tests "site.silverbot.api.report.controller.ReportControllerTest" \
  --tests "site.silverbot.api.dashboard.controller.DashboardControllerTest"
```

## 완료 기준
- 위 3개 이슈가 모두 해결되고 리뷰 코멘트에 재현 경로를 닫았음을 명시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P3-AGENT1.md` 업데이트 후 push
