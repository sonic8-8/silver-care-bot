# Phase 5 수정 지시 [Agent 2]

## 브랜치
- `feature/phase5-lcd-ui-fe`

## 리뷰 결과
- `agent-2/.agent/reviews/REVIEW-RESULT-P5-AGENT2.md`: **Request Changes (Major 1)**

## 필수 수정
1. HTTP 인증 헤더 전달 추가
- 대상:
  - `frontend-lcd/src/features/lcd/api/httpClient.ts`
  - 필요 시 `frontend-lcd/src/pages/LcdScreenPage.tsx`, `frontend-lcd/src/features/lcd/hooks/useLcdController.ts`
- 요구:
  - 토큰 소스(우선순위: URL query `token`)를 확보해 `Authorization: Bearer {token}` 헤더를 REST 요청에 포함.
  - 토큰이 없으면 명시적 에러 메시지 또는 요청 차단 처리로 무인증 호출 방지.
- 계약 근거:
  - `agent-0/docs/api-specification.md:159`

2. WebSocket/STOMP 인증 전달 추가
- 대상:
  - `frontend-lcd/src/features/lcd/hooks/useLcdRealtime.ts`
- 요구:
  - STOMP `connectHeaders.Authorization` 또는 ws query `?token=` 중 최소 1개를 반드시 적용.
  - 가능하면 둘 다 적용해 서버 인증 방식 차이를 흡수.
- 계약 근거:
  - `agent-0/docs/api-specification.md:1522`
  - `agent-0/docs/api-specification.md:1565`

3. 동작 검증
- `GET /api/robots/{robotId}/lcd`, `POST /api/robots/{robotId}/events`, `/topic/robot/{robotId}/lcd` 경로에서
  무인증 401/연결 실패가 재현되지 않는지 확인.

## 검증
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 수정 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P5-AGENT2.md`에 인증 연동 반영 내역/검증 로그 추가
