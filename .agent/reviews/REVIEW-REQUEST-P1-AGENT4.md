# 코드 리뷰 요청 [Agent 4] - Phase 1

## 작업 정보
- **브랜치**: `feature/phase1-websocket`
- **작업 범위**: WebSocket 공통 모듈 + v9 리뷰 피드백 반영
- **작업 기간**: 2026-02-05 ~ 2026-02-06

## 변경 파일 목록
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/common/ApiResponse.java` | 수정 | record accessor 충돌 해결 (`success()` no-arg 제거, `ok()` 추가) |
| `frontend/src/shared/websocket/useWebSocket.ts` | 수정 | auto-connect lifecycle 안정화(ref 기반 연결/해제 호출) + 토큰 변경 race 방지 |
| `frontend/src/shared/websocket/useWebSocket.test.tsx` | 수정 | 토큰 변경 시나리오 + auto-connect 상태 전환 회귀 테스트 추가 |
| `frontend/src/types/sockjs-client.d.ts` | 신규 | `sockjs-client` 타입 선언 보강(TS7016 해결) |
| `frontend/package.json` | 수정 | WebSocket 의존성 추가 (`@stomp/stompjs`, `sockjs-client`) |
| `frontend/package-lock.json` | 수정 | 의존성 잠금 파일 갱신 |

## 주요 변경 사항
1. `ApiResponse`의 `record` accessor 충돌 이슈를 해소하여 백엔드 컴파일 블로커 제거
2. `useWebSocket` 토큰 변경 구간의 race condition 방지 로직 적용
3. auto-connect effect가 상태 변경마다 cleanup disconnect를 호출하던 lifecycle 회귀를 ref 안정화로 수정
4. 토큰 급변경 + auto-connect 상태 전환 케이스까지 회귀 테스트 보강
5. `sockjs-client` 타입 선언 파일 추가로 WebSocket 클라이언트 타입 오류(TS7016) 해결

## 검증 포인트 (리뷰어 확인 요청)
- [ ] `ApiResponse.ok()` 변경에 따른 호출부 누락/회귀가 없는지
- [ ] 토큰 변경 시 중복 연결/잘못된 토큰 재연결이 발생하지 않는지
- [ ] auto-connect 사용 시 상태 전환(`DISCONNECTED -> CONNECTING -> CONNECTED`)에서 불필요한 disconnect가 호출되지 않는지
- [ ] 수동 disconnect 이후 재연결 타이머가 다시 동작하지 않는지
- [ ] `sockjs-client` 타입 선언 보강 후 TS7016이 재발하지 않는지

## 테스트 명령어
```bash
# Backend
cd backend && JAVA_TOOL_OPTIONS="-Djava.net.preferIPv4Stack=true" ./gradlew test --no-daemon

# Frontend
cd frontend && npm run build
npm run test:run -- src/shared/websocket/useWebSocket.test.tsx
```

## 테스트 실행 결과
- Backend: `compileJava`, `compileTestJava`, `test` 태스크 진입까지 확인. 전체 완료는 로컬 실행 중단으로 미확정.
- Frontend build: `TS7016(sockjs-client)` 오류는 해결됨. 현재는 Agent-4 범위 밖 기존 타입 오류 2건으로 실패  
  (`src/app/providers.tsx` import path, `src/shared/ui/Header.tsx` props 타입).
- Frontend test: `npm run test:run -- src/shared/websocket/useWebSocket.test.tsx` **PASS (8/8)**
  - 신규 케이스: auto-connect 상태 전환 시 연결 유지 확인

## 우려 사항 / 특별 검토 요청
- 프론트 빌드 잔여 오류 2건은 Agent 4 변경 범위 밖 이슈로 확인되어 병렬 팀 조율이 필요합니다.
