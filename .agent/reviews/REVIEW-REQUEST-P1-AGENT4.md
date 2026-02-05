# 코드 리뷰 요청 [Agent 4] - Phase 1

## 작업 정보
- **브랜치**: `feature/phase1-websocket`
- **작업 범위**: PLAN.md 섹션 1.11 (WebSocket 기반 구축) + 리뷰 피드백 반영
- **작업 기간**: 2026-02-05

## 변경 파일 목록
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/websocket/useWebSocket.ts` | 수정 | 토큰 변경 시 상태 무관 재연결 + 클라이언트 정리 로직 보강 |
| `frontend/src/shared/websocket/useWebSocket.test.tsx` | 수정 | 토큰 변경 재연결 테스트 추가 |
| `backend/src/main/java/site/silverbot/config/WebSocketHandshakeInterceptor.java` | 수정 | 프로파일 판단을 `Environment.acceptsProfiles`로 변경 |
| `backend/src/main/java/site/silverbot/config/WebSocketSecurityConfig.java` | 수정 | `Environment` 주입 방식으로 인터셉터 생성 |

## 주요 변경 사항
1. 토큰 변경 시 `DISCONNECTED/CONNECTING` 상태에서도 재연결 수행
2. 쿼리 토큰 허용 프로파일 판단을 `acceptsProfiles(dev, local)`로 교체
3. 토큰 변경 재연결 시나리오 테스트 추가

## 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `useWebSocket` 토큰 변경 시 상태 무관 재연결이 동작하는지
- [ ] 기존 재연결 타이머/수동 해제 로직에 회귀가 없는지
- [ ] dev/local 프로파일에서만 쿼리 토큰 허용되는지
- [ ] CLAUDE.md/RULES.md 준수 여부

## 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

## 테스트 실행 결과
- Frontend: `npm run test` 실패 → `@stomp/stompjs` import resolve 실패 (`src/shared/websocket/stompClient.ts`)
- Backend: `./gradlew test` 실패 → `ApiResponse` record accessor 충돌 컴파일 에러

## 우려 사항 / 특별 검토 요청
- 없음
