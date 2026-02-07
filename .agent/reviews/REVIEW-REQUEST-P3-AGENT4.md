## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase3-contract-realtime`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P3.md` (0단계 게이트)
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P3-AGENT4.md` 우선순위 A
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT4.md` Round 4 확인(블로킹 수정 없음)
- PR 링크: (생성 전)

### Round 4 상태 업데이트 (2026-02-07)
- Fix Round 4 지시사항 확인 결과: 신규 블로킹 수정 지시 없음
- 코드 변경: 없음 (기존 반영 커밋 `cb6f2be` 유지)
- 본 요청서는 Agent 0 머지 판단을 위한 최신 상태 재확인용 문서

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/pages/Notification/NotificationScreen.tsx` | 수정 | IntersectionObserver 기반 자동 추가 로드 + 수동 더보기 병행, 중복 로딩 락 처리, 끝 페이지 안내 문구 추가 |
| `frontend/src/features/notification/hooks/useNotifications.ts` | 수정 | 페이지 병합 시 알림 ID 기준 dedupe(`mergeUniqueNotifications`) 적용 |
| `frontend/src/features/notification/hooks/useNotifications.test.tsx` | 수정 | dedupe 유틸 회귀 테스트 추가 |
| `frontend/src/features/notification/hooks/useNotificationRealtime.ts` | 수정 | Notification WS payload 공통 타입 사용 + dedupe set 메모리 상한 적용 |
| `frontend/src/shared/websocket/types.ts` | 수정 | Robot/Elder WS payload nullable/타입 계약 보강 + Dashboard realtime state 타입 추가 |
| `frontend/src/shared/websocket/useDashboardRealtime.ts` | 신규 | 대시보드용 로봇/어르신 상태 실시간 공통 훅 추가 (토픽: `/topic/robot/{robotId}/status`, `/topic/elder/{elderId}/status`) |
| `frontend/src/shared/websocket/useDashboardRealtime.test.tsx` | 신규 | 구독 대상 검증, 중복 메시지 방지, Robot/Elder ID 불일치 필터링 테스트 추가 |
| `frontend/src/pages/Notification/NotificationScreen.test.tsx` | 신규 | `IntersectionObserver` 자동 로드 + 수동 `더 보기` 병행 시 중복 호출 방지(`loadLockRef`) 회귀 테스트 추가 |
| `frontend/src/shared/websocket/index.ts` | 수정 | `useDashboardRealtime` export 추가 |
| `frontend/src/shared/websocket/README.md` | 신규 | 공통 훅 사용 예시/반환값 문서화 |

### 주요 변경 사항
1. 알림 목록 UX를 무한 스크롤 친화적으로 개선했습니다.
2. 실시간 공통 훅(`useDashboardRealtime`)을 추가해 대시보드에서 로봇/어르신 상태 토픽을 표준 방식으로 구독할 수 있게 했습니다.
3. WS/알림 계약 타입을 공통 타입으로 정리하고, 중복 이벤트 방지 로직에 메모리 상한을 두어 안정성을 보강했습니다.
4. Fix Round 2 보강으로 `NotificationScreen` 회귀 테스트(자동/수동 병행 중복 방지)와 `ELDER_STATUS_UPDATE` 경로 테스트(정상 반영 + elderId mismatch 필터)를 추가했습니다.

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] 알림 페이지에서 자동 로드/수동 로드가 중복 호출 없이 동작하는지
- [ ] `useDashboardRealtime`의 메시지 dedupe 기준(`message.body`)이 운영 payload에서 과도 차단/누락을 만들지 않는지
- [ ] 기존 WS 훅(`useWebSocket`, `useSubscription`)과의 라이프사이클 충돌이 없는지
- [ ] CLAUDE.md/RULES.md 및 Agent 4 소유 범위(`shared/*`, `mocks/*`, realtime/notification 관련) 준수 여부
- [ ] 테스트 범위가 회귀를 충분히 커버하는지

### 테스트 명령어
```bash
# Frontend
cd frontend
npm run test -- --run src/pages/Notification/NotificationScreen.test.tsx src/shared/websocket/useDashboardRealtime.test.tsx
npm run build
```

### 테스트 결과
- `npm run test -- --run src/pages/Notification/NotificationScreen.test.tsx src/shared/websocket/useDashboardRealtime.test.tsx` → **PASS** (2 files, 7 tests)
- `npm run build` → **PASS** (vite build 성공, chunk size warning only)

### 우려 사항 / 특별 검토 요청
- `NotificationScreen`의 자동 로드는 sentinel이 뷰포트에 계속 노출될 때 연속 페이지 로드를 트리거할 수 있습니다. 현재는 `loadLockRef` + `isFetchingNextPage`로 중복 요청은 막았지만, UX 관점에서 자동 로드 횟수 제한이 추가로 필요한지 검토 부탁드립니다.
- `useDashboardRealtime`는 공통 훅까지만 제공했고, 실제 대시보드 UI 반영 연결은 Agent 2 통합 단계에서 수행 예정입니다.
