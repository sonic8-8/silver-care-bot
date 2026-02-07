## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase3-activity-report-be`
- 작업 범위: P3 Fix Round 3 (`agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P3.md`
- 프로젝트 명칭: `동행`

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/activity/repository/ActivityJdbcRepository.java` | 수정 | fallback 판별 로직을 SQLState 우선 + 메시지 보조 방식으로 안정화 |
| `backend/src/main/java/site/silverbot/api/report/repository/ReportJdbcRepository.java` | 수정 | fallback 판별 로직을 SQLState 우선 + 메시지 보조 방식으로 안정화 |
| `backend/src/test/java/site/silverbot/api/activity/repository/ActivityJdbcRepositoryTest.java` | 신규 | non-Postgres/ Postgres SQLState별 fallback 분기 단위 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/report/repository/ReportJdbcRepositoryTest.java` | 신규 | non-Postgres/ Postgres SQLState별 fallback 분기 단위 테스트 추가 |

### 주요 변경 사항
1. fallback 판별 안정화 (Activity)
- `isUnsupportedTypeCast(...)`에 SQLState 기반 분기 추가
  - non-Postgres 캐스팅 오류 상태(`HY004`, `22018`, `42S22`)는 fallback 허용
  - Postgres 계열 SQLState(`22P*`, `23P*`, `42P*`, `42704`, `42846`)는 fallback 금지
- SQLState가 없는 예외에 대해서만 기존 메시지 기반 판별을 보조로 사용

2. fallback 판별 안정화 (Report)
- `isUnsupportedTypeCast(...)`에 동일한 SQLState 기반 분기 전략 적용
- 캐스팅 실패 시 fallback 재시도 정책은 유지하되, Postgres SQLState에서는 즉시 예외를 전파

3. 회귀 방지 테스트 보강
- `ActivityJdbcRepositoryTest`
  - `HY004`에서는 fallback 재시도 수행 검증
  - `42704`에서는 fallback 없이 예외 전파 검증
- `ReportJdbcRepositoryTest`
  - `HY004`에서는 fallback 재시도 수행 검증
  - `42704`에서는 fallback 없이 예외 전파 검증

### 검증 포인트 (리뷰어 확인 요청)
- [ ] SQLState 우선 분기 로직이 Postgres 오탐 fallback을 차단하는지
- [ ] non-Postgres 캐스팅 오류에서 fallback 재시도 동작이 유지되는지
- [ ] 기존 enum/jsonb 계약(`activity_type`, `ai_report`) 회귀가 없는지
- [ ] 컨트롤러 레벨 기존 동작이 회귀하지 않았는지

### 테스트 명령어
```bash
# 1) 신규 repository 단위 테스트 + 핵심 컨트롤러 회귀
cd backend
GRADLE_USER_HOME='/mnt/c/Users/SSAFY/Desktop/S14P11C104/sh/.gradle-cache' \
./gradlew test \
  --tests 'site.silverbot.api.activity.repository.ActivityJdbcRepositoryTest' \
  --tests 'site.silverbot.api.report.repository.ReportJdbcRepositoryTest' \
  --tests 'site.silverbot.api.activity.controller.ActivityControllerTest' \
  --tests 'site.silverbot.api.report.controller.ReportControllerTest' \
  --tests 'site.silverbot.api.dashboard.controller.DashboardControllerTest' \
  --console=plain

# 2) PostgreSQL 실환경 타입 바인딩 통합 테스트
AGENT1_PG_URL='jdbc:postgresql://localhost:5432/silverbot' \
AGENT1_PG_USER='postgres' \
AGENT1_PG_PASSWORD='postgres' \
GRADLE_USER_HOME='/mnt/c/Users/SSAFY/Desktop/S14P11C104/sh/.gradle-cache' \
./gradlew test --tests 'site.silverbot.api.repository.PostgresTypeBindingIntegrationTest' --rerun-tasks --console=plain
```

### 테스트 실행 결과
- repository + 컨트롤러 회귀: ✅ `BUILD SUCCESSFUL` (2m 17s)
- `PostgresTypeBindingIntegrationTest`: ✅ `BUILD SUCCESSFUL` (1m 9s)

### 우려 사항 / 특별 검토 요청
- SQLState 목록은 현재 관측된 케이스 중심으로 구성되어 있어, 추가 DB 벤더 도입 시 상태코드 확장이 필요할 수 있습니다.
