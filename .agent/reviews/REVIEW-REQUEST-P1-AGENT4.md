# 코드 리뷰 요청 [Agent 4] - Phase 1

## 작업 정보
- **브랜치**: `feature/phase1-websocket`
- **작업 범위**: PLAN.md 섹션 1.11 (WebSocket 기반 구축)
- **작업 기간**: 2026-02-05

## 변경 파일 목록
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/config/WebSocketConfig.java` | 신규 | STOMP + SockJS 엔드포인트 등록 |
| `backend/src/main/java/site/silverbot/config/WebSocketSecurityConfig.java` | 신규 | 핸드셰이크 인터셉터 Bean 등록 |
| `backend/src/main/java/site/silverbot/config/WebSocketHandshakeInterceptor.java` | 수정 | 토큰 추출(헤더/쿼리) 및 세션 저장 (dev/local만 쿼리 허용) |
| `backend/src/main/java/site/silverbot/config/StompChannelInterceptor.java` | 수정 | STOMP CONNECT 시 JWT 검증, `SecurityContextHolder` 사용 제거 |
| `backend/src/main/java/site/silverbot/websocket/WebSocketMessageService.java` | 신규 | 5개 토픽 메시지 발행 |
| `backend/src/main/java/site/silverbot/websocket/dto/*` | 신규 | 메시지 DTO/Type 정의 |
| `backend/src/test/java/site/silverbot/websocket/WebSocketMessageServiceTest.java` | 신규 | 메시지 서비스 단위 테스트 |
| `frontend/src/shared/websocket/*` | 신규 | stompClient, useWebSocket, useSubscription, types |
| `frontend/src/shared/websocket/useWebSocket.test.tsx` | 신규 | 재연결 포함 훅 테스트 |
| `frontend/src/shared/websocket/useWebSocket.ts` | 수정 | 토큰 변경 시 재연결 로직 추가 |
| `frontend/src/shared/api/axios.ts` | 수정 | HttpOnly refresh 기반 토큰 갱신/큐 + authFailureHandler 주입 |
| `frontend/src/app/providers.tsx` | 수정 | authFailureHandler를 logout에 연결 |

## 주요 변경 사항
1. `/ws` STOMP + SockJS 엔드포인트 구성 및 CONNECT 인증 인터셉터 추가
2. WebSocket 메시지 포맷(`type/payload/timestamp`) DTO 및 발행 서비스 구현
3. Frontend WebSocket 훅(자동 재연결, 구독) 및 테스트 추가
4. HttpOnly refresh 정책에 맞춘 axios interceptor 재구현 + logout 동기화
5. 리뷰 반영: `SecurityContextHolder` 제거, 쿼리 토큰 dev/local 제한, 토큰 변경 시 재연결

## 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `StompChannelInterceptor`의 JWT 검증 로직(리플렉션) 안전성 및 머지 후 직접 주입 전환 필요성
- [ ] `SecurityContextHolder` 제거 후 인증 컨텍스트 누수/부재 이슈가 없는지
- [ ] `/ws` 핸드셰이크가 SecurityConfig에서 허용되는지 (Agent-1 변경 사항 확인)
- [ ] 쿼리 파라미터 토큰이 dev/local에서만 허용되는지
- [ ] 재연결 타이머 중복 예약 방지 및 토큰 변경 재연결 동작 여부
- [ ] axios refresh 흐름이 HttpOnly 쿠키 정책과 일치하는지 (refresh 요청 body 없음)
- [ ] refresh 실패 시 authFailureHandler → logout 호출 흐름이 정상인지
- [ ] CLAUDE.md/RULES.md 준수 여부

## 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

## 테스트 실행 결과
- Backend: `./gradlew test` 실패 (JAVA_HOME 미설정)
- Frontend: `npm run test -- --run` 실행 후 장시간 무응답으로 중단

## 우려 사항 / 특별 검토 요청
- Agent-1 머지 후 `StompChannelInterceptor`를 직접 주입 방식으로 변경해야 함
- `frontend/src/shared/api/axios.ts`는 Agent-4 소유 파일로 통합 반영됨 (정책: HttpOnly refresh)
