# Phase 7 작업 지시 [Agent 4]

## 브랜치
- `feature/phase7-contract-websocket`

## 목표
- API/Mock/WebSocket 계약을 코드 기준으로 정렬하고 교차 회귀를 방지한다.

## 작업 범위
1. 공유 계약/Mock 정렬
- 대상:
  - `frontend/src/shared/types/**`
  - `frontend/src/mocks/**`
  - `frontend-lcd/src/**`
- 요구:
  - Agent 1/3 API 변경사항(auth/sync/patrol/map/ack) 반영
  - `APPLIANCE`, `MULTI_TAP` 병행 규칙 파서 반영
  - 신규 엔드포인트 Mock 추가

2. WebSocket 운영 경로 정렬
- 대상:
  - `backend/src/main/java/site/silverbot/websocket/**`
  - `backend/src/main/java/site/silverbot/api/emergency/service/EmergencyService.java`
  - 관련 notifier/service
- 요구:
  - `/topic/emergency`, `/topic/elder/{elderId}/status`가 실제 운영 코드에서 발행되도록 연결
  - STOMP 기반 구현과 임베디드 소비 규칙 차이를 문서화(코드 주석/테스트 설명)

3. 통합 테스트/회귀 가드
- 대상:
  - `frontend/src/shared/**` 테스트
  - `frontend-lcd/src/**` 테스트
  - `backend/src/test/java/site/silverbot/websocket/**`
- 요구:
  - 계약 파서/실시간 이벤트 회귀 테스트 보강
  - Agent 2 UI 변경과 충돌 없는 소비 계약 검증

## 검증
```bash
cd frontend
npm run test -- --run

cd ../frontend-lcd
npm run test -- --run
npm run build

cd ../backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.websocket.WebSocketMessageServiceTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P7-AGENT4.md` 작성
