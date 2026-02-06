# Phase 2 수정 지시 [Agent 3]

## 대상 브랜치
`feature/phase2-db-schedule`

## 기준 리뷰
- `agent-3/.agent/reviews/REVIEW-RESULT-P2-AGENT3.md`
- 최신 판정: `⚠️ Request Changes` (Critical 0 / Major 0 / Minor 1)
- 외부 블로커: PostgreSQL 실환경 Flyway 증빙 미완료(검증 테스트 2건 skipped)

## 필수 후속 조치
1. PostgreSQL 실환경 검증을 수행해 skipped 상태를 해소한다.
- 환경 변수 설정:
  - `AGENT3_FLYWAY_PG_URL`
  - `AGENT3_FLYWAY_PG_USER`
  - `AGENT3_FLYWAY_PG_PASSWORD`
- 실행 명령:
  - `cd backend && ./gradlew test --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'`
- 통과 기준:
  - `cleanDb_validateAndMigrate_succeeds` PASS
  - `legacyHistory_validateRepairMigrate_succeeds` PASS
  - 테스트 결과 XML에서 `skipped="0"` 확인

2. 증빙 로그/결과를 리뷰 요청서에 첨부한다.
- 파일: `agent-3/.agent/reviews/REVIEW-REQUEST-P2-AGENT3.md`
- 필수 포함:
  - 실행 커맨드
  - PASS 결과 요약
  - `skipped=0` 근거
  - 최종 Flyway 버전 맵(`V1~최신`)

3. Minor 항목은 병합 차단 아님(선택).
- `MedicationValidationService`의 소유권 검증 쿼리를 `findByIdAndElderId` 단일 쿼리로 리팩토링 권장
- 본 라운드에서는 블로커 해소를 우선한다.

4. 재리뷰 요청 후 `REVIEW-RESULT-P2-AGENT3.md`를 `✅ Approve`로 갱신한다.

## 병합 게이트
- Agent 3이 Phase 2 첫 병합 게이트다.
- Agent 3 승인/머지 전에는 Agent 1/4/2 순차 병합 진행 불가.
