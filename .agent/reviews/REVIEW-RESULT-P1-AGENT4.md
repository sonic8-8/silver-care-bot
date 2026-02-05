# 코드 리뷰 결과 [Agent 4] - Phase 1

## 요약
- **전체 평가**: ⚠️ Request Changes
- **Critical 이슈**: 0건
- **Major 이슈**: 1건
- **Minor 이슈**: 1건

## 발견된 이슈

### [Major] `frontend/src/shared/websocket/useWebSocket.ts` - 토큰 변경 시 연결 복구 불가 케이스 유지
- 현재 로직은 `status === CONNECTED`일 때만 토큰 변경 재연결을 수행합니다. 토큰이 `null → 유효 토큰`으로 바뀌는 시점에 상태가 `DISCONNECTED/CONNECTING`이면 재연결 트리거가 되지 않아, 기존 클라이언트(구 토큰 헤더)가 계속 재연결을 시도합니다.
- 결과적으로 로그인 직후 또는 토큰 갱신 직후에 WebSocket이 갱신 토큰으로 복구되지 않을 수 있습니다.
- **조치 제안**: 토큰 변경을 감지하면 상태와 무관하게 기존 클라이언트를 정리하고 새 토큰으로 `connect()` 재호출, 또는 토큰 변경 시 `createStompClient`를 재생성하도록 개선. 해당 케이스 테스트 추가 권장.

### [Minor] `backend/src/main/java/site/silverbot/config/WebSocketHandshakeInterceptor.java` - dev/local 판단 기준 미흡
- `spring.profiles.active`만 확인하고 있어, `spring.profiles.default=local` 방식일 때 쿼리 토큰 허용이 비활성화될 수 있습니다.
- **조치 제안**: `Environment#acceptsProfiles(Profiles.of("dev","local"))` 사용 검토.

## 테스트 실행 결과
- 테스트 미실행 (리뷰어 환경에서 실행하지 않음)

## 최종 의견
- 토큰 변경 시 재연결 조건이 여전히 불완전합니다. 이 부분 수정 후 머지 가능하다고 판단됩니다.
