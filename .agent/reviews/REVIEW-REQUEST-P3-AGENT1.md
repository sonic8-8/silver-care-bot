## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase3-activity-report-be`
- 작업 범위: P3 Round 2 (`agent-0/.agent/dispatch/WORK-INSTRUCTION-P3-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P3.md`
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/activity/controller/ActivityController.java` | 신규 | Activity 조회/생성 API 엔드포인트 추가 |
| `backend/src/main/java/site/silverbot/api/activity/service/ActivityService.java` | 신규 | 권한/소유권 검증 포함 Activity 비즈니스 로직 추가 |
| `backend/src/main/java/site/silverbot/api/activity/request/CreateActivityRequest.java` | 신규 | 로봇 활동 생성 요청 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/activity/response/ActivityResponse.java` | 신규 | 단건 활동 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/activity/response/ActivityListResponse.java` | 신규 | 일자별 활동 목록 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/activity/model/ActivityType.java` | 신규 | Activity 타입 enum 추가 |
| `backend/src/main/java/site/silverbot/api/report/controller/ReportController.java` | 신규 | 주간 리포트 조회 API 추가 |
| `backend/src/main/java/site/silverbot/api/report/service/ReportService.java` | 신규 | 주간 리포트 계산/저장 조회 로직 추가 |
| `backend/src/main/java/site/silverbot/api/report/response/WeeklyReportResponse.java` | 신규 | 주간 리포트 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/scheduler/WeeklyReportScheduler.java` | 신규 | 주간 리포트 생성 스케줄러 추가 |
| `backend/src/main/java/site/silverbot/api/dashboard/response/DashboardTodaySummaryResponse.java` | 수정 | 복약 상태 타입을 문자열에서 구조화 객체로 변경 |
| `backend/src/main/java/site/silverbot/api/dashboard/response/DashboardMedicationStatusResponse.java` | 신규 | 대시보드 복약 요약 응답(아침/저녁/합계) 추가 |
| `backend/src/main/java/site/silverbot/api/dashboard/response/DashboardMedicationPeriodStatusResponse.java` | 신규 | 대시보드 시간대별 복약 응답 추가 |
| `backend/src/main/java/site/silverbot/api/dashboard/service/DashboardService.java` | 수정 | 아침/저녁 복약 집계 및 상태 라벨 계산 로직 추가 |
| `backend/src/test/java/site/silverbot/api/activity/controller/ActivityControllerTest.java` | 신규 | Activity API 권한/조회/생성 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/report/controller/ReportControllerTest.java` | 신규 | Weekly Report API 계산/저장 조회/권한 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/dashboard/controller/DashboardControllerTest.java` | 수정 | 구조화 복약 응답 계약 검증 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/dashboard/service/DashboardServiceTest.java` | 신규 | 대시보드 복약 상태 집계 서비스 테스트 추가 |

### 주요 변경 사항
1. PLAN 3.2 대응으로 `GET /api/elders/{elderId}/activities`, `POST /api/robots/{robotId}/activities`를 구현했습니다.
2. PLAN 3.4 대응으로 `GET /api/elders/{elderId}/reports/weekly`와 계산/저장 조회 로직, 주간 생성 스케줄러를 구현했습니다.
3. Dashboard 복약 상태를 문자열 단일값에서 `morning/evening/taken/total/label` 구조로 확장해 Agent 2가 즉시 소비 가능하게 계약을 고정했습니다.
4. Controller/Service 테스트를 추가해 권한, 소유권, 응답 계약, 계산 로직을 회귀 검증했습니다.

### Agent 2/4 연동용 응답 계약 요약
- `GET /api/elders/{elderId}/activities?date=YYYY-MM-DD`
  - `data.date`: 조회 기준일
  - `data.activities[]`: `{ id, elderId, robotId, type, title, description, location, detectedAt, createdAt }`
- `GET /api/elders/{elderId}/reports/weekly?weekStartDate=YYYY-MM-DD`
  - `data`: `{ weekStartDate, weekEndDate, medicationRate, activityCount, conversationKeywords[], recommendations[], generatedAt, source }`
  - `source`: `STORED | CALCULATED`
- `GET /api/elders/{elderId}/dashboard`
  - `data.todaySummary.medicationStatus`:
    - `morning`: `{ taken, total, status }`
    - `evening`: `{ taken, total, status }`
    - `taken`, `total`, `label`
  - `status`: `NONE | PENDING | TAKEN | MISSED`

### 검증 포인트 (리뷰어 확인 요청)
- [ ] Activity/Report API 접근 제어(`WORKER/FAMILY`, `ROBOT`)가 의도대로 동작하는지
- [ ] Dashboard 복약 요약 계약이 Agent 2 FE 요구사항에 맞는지
- [ ] 주간 리포트 계산식(복약률, 활동건수)과 저장 리포트 우선 반환 규칙이 타당한지
- [ ] 기존 코드 스타일/에러 처리/테스트 범위가 프로젝트 규칙에 부합하는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain
```

### 테스트 실행 결과
- `BUILD SUCCESSFUL` (2026-02-07, 로컬 `agent-1/backend`)

### 우려 사항 / 특별 검토 요청
- `ActivityType`, Dashboard 복약 상태 문자열(`NONE/PENDING/TAKEN/MISSED`)은 FE에서 enum으로 고정 소비 예정이므로 네이밍 변경 필요 여부를 우선 확인 부탁드립니다.
