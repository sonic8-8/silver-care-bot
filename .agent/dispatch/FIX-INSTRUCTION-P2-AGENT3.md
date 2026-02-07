# Phase 2 수정 지시 [Agent 3]

## 대상 브랜치
`feature/phase2-db-schedule`

## 기준 리뷰
- `agent-3/.agent/reviews/REVIEW-RESULT-P2-AGENT3.md`
- 최신 판정: `⚠️ Request Changes` (Critical 0 / Major 0 / Minor 1)
- 현재 상태:
  - 원격 반영 완료: `origin/feature/phase2-db-schedule` HEAD = `ae4b73d`
  - Agent 0 재검증 완료(2026-02-07): `FlywayMigrationVerificationTest` PASS
    - 결과 XML: `backend/build/test-results/test/TEST-site.silverbot.migration.FlywayMigrationVerificationTest.xml`
    - 요약: `tests="2" skipped="0" failures="0" errors="0"`
  - 잔여 이슈: 리뷰 결과 문서 상단 판정이 `Request Changes`로 남아 있어 상태 동기화 필요

## 필수 후속 조치
1. 코드 추가 수정 없음(기능/테스트 게이트 충족).

2. 리뷰 상태 문서를 최종 상태로 동기화한다.
- 대상: `agent-3/.agent/reviews/REVIEW-RESULT-P2-AGENT3.md`
- 조치: 상단 판정을 `✅ Approve`로 갱신하고, 아래 증빙을 요약 반영
  - 원격 반영 커밋: `ae4b73d`
  - Flyway 검증 결과: `tests=2, skipped=0, failures=0, errors=0`

3. 증빙 로그/결과를 리뷰 요청서에도 고정한다.
- 파일: `agent-3/.agent/reviews/REVIEW-REQUEST-P2-AGENT3.md`
- 필수 포함:
  - 실행 커맨드
  - PASS 결과 요약
  - `skipped=0` 근거
  - 최종 Flyway 버전 맵(`V1~최신`)
  - 원격 반영 커밋 해시(`origin/feature/phase2-db-schedule`)

4. Minor 항목은 병합 차단 아님(선택).
- `MedicationValidationService`의 소유권 검증 쿼리를 `findByIdAndElderId` 단일 쿼리로 리팩토링 권장
- 필요 시 후속 리팩토링으로 분리한다.

5. 상태 동기화가 끝나면 Agent 0에 병합 시작 신호를 전달한다.

## 병합 게이트
- Agent 3이 Phase 2 첫 병합 게이트다.
- Agent 3 승인/머지 전에는 Agent 1/4/2 순차 병합 진행 불가.
