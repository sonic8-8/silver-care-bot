## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase3-activity-report-be`
- 작업 범위: P3 Fix Round 2 (`agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P3.md`
- 프로젝트 명칭: `동행`

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/activity/repository/ActivityJdbcRepository.java` | 수정 | Postgres enum(`activity_type`) INSERT 명시 캐스팅 + 비-Postgres fallback |
| `backend/src/main/java/site/silverbot/api/report/repository/ReportJdbcRepository.java` | 수정 | Postgres `jsonb`(metrics/top_keywords/recommendations) INSERT 명시 캐스팅 + 비-Postgres fallback |
| `backend/src/test/java/site/silverbot/api/repository/PostgresTypeBindingIntegrationTest.java` | 신규 | PostgreSQL 실환경에서 enum/jsonb 바인딩 검증 통합 테스트 추가 |

### 주요 변경 사항
1. Activity enum 바인딩 정합성
- `INSERT INTO activity ... CAST(:type AS activity_type)` 적용
- 기존 H2 기반 테스트 환경 호환을 위해 캐스팅 미지원 DB에서는 fallback SQL(`:type`) 재시도 로직 추가

2. Report jsonb 바인딩 정합성
- `metrics`, `top_keywords`, `recommendations`를 `CAST(:... AS jsonb)`로 명시 캐스팅
- 캐스팅 미지원 DB에서는 fallback SQL로 재시도하고, 테이블 미존재 시 기존 정책대로 무시(return)

3. 회귀 방지 통합 테스트 추가
- PostgreSQL 연결 시:
  - `ActivityJdbcRepository.insert(...)`가 enum 컬럼에 정상 저장되는지 검증
  - `ReportJdbcRepository.saveWeeklyReport(...)`가 jsonb 컬럼에 정상 저장되는지 검증
- 환경변수 미설정 시 `assumeTrue`로 skip 처리

### 검증 포인트 (리뷰어 확인 요청)
- [ ] Postgres 경로에서 enum/jsonb 캐스팅이 실제 타입 미스매치를 방지하는지
- [ ] H2/비-Postgres 경로 fallback이 과도하게 예외를 삼키지 않는지
- [ ] Agent 3 DDL 기준(`activity_type`, `ai_report` jsonb 계약)과 불일치가 없는지
- [ ] 기존 컨트롤러 동작 회귀가 없는지

### 테스트 명령어
```bash
# 1) 지시된 컨트롤러 회귀 테스트
cd backend
GRADLE_USER_HOME='/mnt/c/Users/SSAFY/Desktop/S14P11C104/sh/.gradle-cache' \
./gradlew test \
  --tests 'site.silverbot.api.activity.controller.ActivityControllerTest' \
  --tests 'site.silverbot.api.report.controller.ReportControllerTest' \
  --tests 'site.silverbot.api.dashboard.controller.DashboardControllerTest' \
  --console=plain

# 2) PostgreSQL 실환경 타입 바인딩 통합 테스트
# (docker compose postgres 기동 후)
AGENT1_PG_URL='jdbc:postgresql://localhost:5432/silverbot' \
AGENT1_PG_USER='postgres' \
AGENT1_PG_PASSWORD='postgres' \
GRADLE_USER_HOME='/mnt/c/Users/SSAFY/Desktop/S14P11C104/sh/.gradle-cache' \
./gradlew test --tests 'site.silverbot.api.repository.PostgresTypeBindingIntegrationTest' --rerun-tasks --console=plain
```

### 테스트 실행 결과
- 컨트롤러 3종: ✅ `BUILD SUCCESSFUL`
- `PostgresTypeBindingIntegrationTest`: ✅ 2 tests, 0 skipped, 0 failed (`build/test-results/test/TEST-site.silverbot.api.repository.PostgresTypeBindingIntegrationTest.xml`)

### 우려 사항 / 특별 검토 요청
- fallback 분기(`isUnsupportedTypeCast`) 메시지 기반 판별이 DB 벤더별 예외 메시지 변화에 민감할 수 있어, 더 엄격한 분기 기준(SQLState 기반)으로 고도화가 필요한지 검토 요청
