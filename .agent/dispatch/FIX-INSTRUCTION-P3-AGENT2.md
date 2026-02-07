# Fix Instruction - P3 Agent 2 (Round 6)

## 대상 브랜치
- `feature/phase3-history-report-fe`

## 리뷰 판정
- `Request Changes` (Major 1)

## 필수 수정 사항
1. `YYYY-MM-DD` 파싱 타임존 오프셋 버그 수정 (Major, Blocking)
- 대상:
  - `frontend/src/pages/History/HistoryScreen.tsx`
  - `frontend/src/features/history/api/historyApi.ts`
- 문제:
  - `new Date('YYYY-MM-DD')`를 사용해 UTC 기준 파싱이 발생, 미국 등 UTC-시간대에서 날짜가 하루 전으로 밀림
- 조치:
  - 날짜 문자열은 `new Date(year, month - 1, day)` 방식으로 로컬 파싱 통일
  - 주 시작/종료일 계산도 동일 로컬 파싱 기준 적용
  - 명세 기준: `date` Query는 로컬 날짜 기준 (`agent-0/docs/api-specification.md` 3.7 섹션)

2. 회귀 테스트 보강 (Required)
- 대상:
  - `HistoryScreen`/history API 관련 테스트
- 조치:
  - 로컬 타임존에서 `YYYY-MM-DD` 표시/주간 범위 계산이 보존되는 케이스 추가
  - 가능하면 UTC-시간대 회귀 시나리오 1건 포함

## 검증 명령
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

## 완료 기준
- Major 1건(날짜 파싱 타임존 이슈) 해소 확인
- `agent-2/.agent/reviews/REVIEW-REQUEST-P3-AGENT2.md` 업데이트 후 push
