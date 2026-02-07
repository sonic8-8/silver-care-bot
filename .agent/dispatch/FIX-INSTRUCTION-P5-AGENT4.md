# Phase 5 Round 2 수정 지시 [Agent 4]

## 브랜치
- `feature/phase5-lcd-contract-realtime`

## 리뷰 결과
- `REVIEW-RESULT-P5-AGENT4.md`: **Approve**

## Round 2 조정 반영 (계약 정렬)
1. 로봇 이벤트 계약에 `medicationId` 필드 반영
- 대상:
  - `frontend/src/shared/types/lcd.types.ts`
  - 관련 테스트 파일
- 요구:
  - 이벤트 payload에 `medicationId?: number | null` 계약 추가
  - `action=TAKE`일 때 `medicationId` 필수 규칙을 파서/검증 로직에 반영

2. Mock 정렬
- `POST /api/robots/{robotId}/events` mock에서 `TAKE` + `medicationId` 규칙 반영

3. Agent 2 연동 가이드
- Agent 2가 `TAKE` 전송 시 `medicationId`를 전달하도록 변경 요약 제공

## 검증
```bash
cd frontend
npm run test -- --run src/shared/types/lcd.types.test.ts src/shared/websocket/useRobotLcdRealtime.test.tsx
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- (변경 발생 시) 수정 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P5-AGENT4.md`에 Round 2 계약 정렬 내용 추가
