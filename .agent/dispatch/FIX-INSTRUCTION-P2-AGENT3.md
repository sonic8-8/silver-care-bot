# Phase 2 수정 지시 [Agent 3]

## 대상 브랜치
`feature/phase2-db-schedule`

## 기준 리뷰
- `agent-3/.agent/reviews/REVIEW-RESULT-P2-AGENT3.md`
- 판정: `⚠️ Request Changes` (Major 2)

## 필수 수정 항목
1. Flyway 버전 전환 전략 확정 및 안전화
- 파일:
  - `backend/src/main/resources/db/migration/V4__add_robot_offline_notified_at.sql`
  - `backend/src/main/resources/db/migration/V5__create_phase2_core_tables.sql`
- 목적: 버전 충돌 해소와 기존 환경 이력 호환을 동시에 보장한다.
- 필수 조건:
  - 중복 버전(`V3` 다중 파일) 상태를 종료한다.
  - `robot.offline_notified_at` 추가는 재실행 안전성을 확보한다(예: `IF NOT EXISTS`).
  - 기존 환경 이력 전환 절차(`flyway validate/repair` 필요 조건)를 리뷰 요청서에 명시한다.
- 추가 조건: 본 변경이 Agent 4의 알림 테이블 마이그레이션 버전 계획과 충돌하지 않도록 `COORDINATION-P2.md`의 `C-01`을 기준으로 정렬한다.

2. `medication_record` 교차 엔터티 무결성 강제
- 파일: `backend/src/main/resources/db/migration/V5__create_phase2_core_tables.sql`
- `(medication_id, elder_id)` 정합성 제약을 DB 레벨에서 강제한다.
- 권장 구현:
  - `medication`에 `(id, elder_id)` 유니크 제약 추가
  - `medication_record (medication_id, elder_id)` -> `medication (id, elder_id)` 복합 FK 추가
- 서비스 레이어에서도 `medication.elder.id == elderId` 검증을 보강한다.

## 테스트/검증
```bash
cd backend
./gradlew test
```

추가로 아래 검증을 포함한다.
- clean DB에서 `flyway validate + migrate` 성공
- 이력 전환 시나리오(기존 이력 가정) 검증 결과/절차 문서화
- 교차 엔터티 불일치 insert 차단 확인

## 완료 보고
1. 수정 커밋/푸시 후 `agent-3/.agent/reviews/REVIEW-REQUEST-P2-AGENT3.md` 갱신
2. 최종 Flyway 버전 맵(V1~최신)을 표로 첨부
3. 재리뷰 요청
