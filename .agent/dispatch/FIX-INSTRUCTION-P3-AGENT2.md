# Fix Instruction - P3 Agent 2

## 대상 브랜치
- `feature/phase3-history-report-fe`

## 리뷰 판정
- `Request Changes` (Major 2, Minor 1)

## 필수 수정 사항
1. 대시보드 실시간 로직을 Agent 4 공통 계약으로 정렬 (Major)
- 대상:
  - `frontend/src/features/dashboard/hooks/useDashboardRealtime.ts`
  - `frontend/src/pages/Dashboard/DashboardScreen.tsx`
- 조치:
  - 커스텀 소켓 직접 구성 대신 Agent 4 공통 realtime 훅/유틸 계약 사용
  - 재연결 정책, dedup 규칙, 이벤트 파싱 기준을 Agent 4 구현과 일치시킬 것

2. 파일 소유권 위반 제거: `frontend/src/mocks/**` 직접 수정 정리 (Major)
- 대상:
  - `frontend/src/mocks/handlers/elder.ts` (현재 Agent 2 변경분)
- 조치:
  - Agent 2 브랜치에서 mock 직접 변경분 제거 또는 Agent 4 반영본으로 대체
  - mock 동작 수정이 필요하면 Agent 4에 요청하고, Agent 2는 소비 코드만 정렬

3. null 초기화 시나리오 보강 (Minor)
- 대상:
  - 스케줄 수정 플로우 테스트/핸들러 연동 코드
- 조치:
  - `undefined`와 `null`을 구분해 명시적 초기화가 반영되도록 처리
  - 관련 테스트에서 `description/location/remindBeforeMinutes` null 업데이트 케이스 검증

## 협업 지시
- Agent 4와 먼저 계약 확정 후 구현 진행:
  - 공통 realtime 훅 시그니처/이벤트 타입
  - mock 핸들러 null 처리 규칙
- 협업 결과는 PR 설명 또는 리뷰 요청서에 요약 기록

## 검증 명령
```bash
cd frontend
npm run test -- --run
npm run build
```

## 완료 기준
- Major 2건 해소(공통 훅 사용 + 소유권 위반 제거)가 확인되어야 재리뷰 가능
- `agent-2/.agent/reviews/REVIEW-REQUEST-P3-AGENT2.md` 업데이트 후 push
