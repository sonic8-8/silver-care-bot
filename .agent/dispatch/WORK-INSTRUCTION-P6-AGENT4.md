# Phase 6 작업 지시 [Agent 4]

## 브랜치
- `feature/phase6-lcd-contract-e2e`

## 목표
- LCD 계약/Mock/테스트를 강화해 Phase 6 병합 시 회귀를 사전에 차단한다.

## 작업 범위
1. LCD 계약 파서/정규화 보강
- 대상:
  - `frontend-lcd/src/features/lcd/api/*`
  - `frontend-lcd/src/features/lcd/auth/*`
  - `frontend-lcd/src/features/lcd/types.ts`
- 요구:
  - REST/WebSocket payload의 허용 변형을 정리하되, 필수 계약은 strict 유지
  - 인증 토큰 누락/오류 경로 테스트 보강

2. 공유 계약/Mock 정렬
- 대상:
  - `frontend/src/shared/types/*`
  - `frontend/src/mocks/*`
- 요구:
  - `POST /api/robots/{robotId}/events` 관련 계약/Mock이 Backend 처리 규칙과 일치하는지 확인
  - `TAKE/LATER/CONFIRM/EMERGENCY` 경로 회귀 테스트 보강

3. 통합 검증 가이드 제공
- Agent 2 UI 변경과 충돌 없이 소비 가능한 계약 변경 요약 작성

## 검증
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint

cd ../frontend
npm run test -- --run src/shared/types/lcd.types.test.ts src/shared/websocket/useRobotLcdRealtime.test.tsx
```

## 산출물
- 코드 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P6-AGENT4.md` 작성
