# Phase 2 수정 지시 [Agent 3]

## 대상 브랜치
`feature/phase2-db-schedule`

## 기준 리뷰
- `agent-3/.agent/reviews/REVIEW-RESULT-P2-AGENT3.md`
- 최신 판정: `⚠️ Request Changes` (Critical 0 / Major 2 / Minor 0)
- 참고: 동일 문서 내 "후속 조치 결과"에 주요 수정 반영 완료 메모 존재

## 필수 후속 조치
1. 후속 수정 반영분을 커밋/푸시하고 재리뷰 가능한 단일 상태로 고정한다.
- `git status` clean 확보
- `git push origin feature/phase2-db-schedule`

2. Flyway 전환 안정성 증빙을 보강한다.
- clean DB 기준 `flyway validate + migrate` 실행 결과 첨부
- legacy 이력 DB 기준 `validate -> (필요 시 repair) -> migrate` 실행 절차/결과 첨부
- `V1~최신` 최종 버전 맵을 리뷰 요청서에 명시

3. `medication_record` 교차 무결성(DB 제약 + 서비스 검증) 반영 사실을 테스트 로그로 입증한다.
- 관련 테스트 명/결과를 `REVIEW-REQUEST-P2-AGENT3.md`에 명시

4. 재리뷰 요청 후 `REVIEW-RESULT-P2-AGENT3.md`를 Approve 상태로 갱신한다.

## 병합 게이트
- Agent 3이 Phase 2 첫 병합 게이트다.
- Agent 3 승인/머지 전에는 Agent 1/4/2 순차 병합 진행 불가.
