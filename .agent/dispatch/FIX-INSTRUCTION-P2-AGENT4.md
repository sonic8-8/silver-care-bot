# Phase 2 수정 지시 [Agent 4]

## 대상 브랜치
`feature/phase2-notification-realtime`

## 기준 리뷰
- `agent-4/.agent/reviews/REVIEW-RESULT-P2-AGENT4.md`
- 최신 판정: `⚠️ Request Changes` (Critical 0 / Major 2 / Minor 1)
- 참고: 동일 문서 내 "후속 업데이트(수정 반영 완료)" 메모 존재

## 필수 후속 조치
1. 후속 수정 반영분을 커밋/푸시하고 재리뷰 가능한 단일 상태로 고정한다.
- `git status` clean 확보
- `git push origin feature/phase2-notification-realtime`

2. Agent 3 최종안과 Flyway 버전 맵을 동기화한다(C-01 follow).
- `V5`(Agent 3) + `V6`(Agent 4) 결합 시 충돌 없음을 확인
- 최종 버전 맵/검증 결과를 `REVIEW-REQUEST-P2-AGENT4.md`에 명시

3. 재리뷰 요청 후 `REVIEW-RESULT-P2-AGENT4.md`를 Approve 상태로 갱신한다.

## 병합 게이트
- Agent 4는 Agent 3, Agent 1 머지 완료 후 병합한다.
