# Phase 2 수정 지시 [Agent 1]

## 대상 브랜치
`feature/phase2-medication-dashboard-be`

## 기준 리뷰
- `agent-1/.agent/reviews/REVIEW-RESULT-P2-AGENT1.md`
- 판정: `⚠️ Request Changes` (Major 2, Minor 1)

## 필수 수정 항목
1. `DashboardJdbcRepository` 예외 은닉 범위 축소
- 파일: `backend/src/main/java/site/silverbot/api/dashboard/repository/DashboardJdbcRepository.java`
- 현재 `DataAccessException` 전체를 `List.of()`로 fallback 처리하는 로직을 수정한다.
- 허용 fallback은 "테이블 미존재" 등 병렬 의존으로 인한 예상 가능한 케이스로 제한하고, 그 외 예외(DB 연결 실패/문법 오류/타임아웃)는 반드시 재던져 장애를 표면화한다.
- 최소 3개 조회 메서드 모두 동일 정책으로 맞춘다.

2. 디스펜서 잔량 계산 시 유효 복약만 집계
- 파일: `backend/src/main/java/site/silverbot/api/medication/service/MedicationService.java`
- `dailyDoseCount` 집계 전 `LocalDate.now()` 기준 유효 기간 필터를 추가한다.
- 기준: `isActive=true` AND `startDate <= today` AND (`endDate == null` OR `endDate >= today`).
- 미래 시작/종료 완료 약이 `daysUntilEmpty`, `needsRefill` 계산에 포함되지 않도록 보장한다.

3. 약 수정 입력값 blank 방어
- 파일: `backend/src/main/java/site/silverbot/api/medication/service/MedicationService.java`
- `name`, `dosage`가 요청에 포함된 경우 `isBlank()` 입력을 허용하지 않는다.
- 정책은 "400 반환"으로 고정한다(기존값 유지 정책 사용 금지).
- 에러 메시지는 기존 validation 응답 규약과 일관되게 맞춘다.

## 테스트/검증
```bash
cd backend
./gradlew --no-daemon test \
  --tests "site.silverbot.api.medication.service.MedicationServiceTest" \
  --tests "site.silverbot.api.medication.controller.MedicationControllerTest" \
  --tests "site.silverbot.api.dashboard.controller.DashboardControllerTest" \
  --console=plain
```

추가로 아래 케이스를 테스트에 포함한다.
- 테이블 미존재 fallback 허용 + 비허용 DB 예외 재던짐
- 미래 시작 약/종료 약 집계 제외
- blank 수정 입력 400 응답

## 완료 보고
1. 수정 커밋/푸시 후 `agent-1/.agent/reviews/REVIEW-REQUEST-P2-AGENT1.md` 갱신
2. 변경 파일, 테스트 결과, 리스크를 명시해 재리뷰 요청
