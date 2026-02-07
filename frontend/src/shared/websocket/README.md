# WebSocket 공통 훅 가이드

## `useDashboardRealtime`
대시보드에서 로봇/어르신 상태 토픽을 동시에 구독하기 위한 공통 훅입니다.

- 로봇 토픽: `/topic/robot/{robotId}/status`
- 어르신 토픽: `/topic/elder/{elderId}/status`
- 중복 이벤트 방지: 동일 메시지(`message.body`)는 1회만 반영
- 재연결: `useWebSocket`의 재시도 정책(`maxReconnectAttempts`, `reconnectDelayMs`) 사용

### 사용 예시
```tsx
import { useDashboardRealtime } from '@/shared/websocket';

const { robotStatus, elderStatus, isConnected } = useDashboardRealtime({
  token: accessToken,
  robotId: selectedRobotId,
  elderId: selectedElderId,
  onRobotStatus: (next) => {
    // 예: 대시보드 캐시 반영 또는 로컬 상태 반영
    console.log(next.networkStatus, next.batteryLevel);
  },
  onElderStatus: (next) => {
    console.log(next.status, next.location);
  },
});
```

### 반환값
- `status`: `CONNECTING | CONNECTED | DISCONNECTED`
- `isConnected`: 연결 여부
- `robotStatus`: 최근 로봇 상태 이벤트 (없으면 `null`)
- `elderStatus`: 최근 어르신 상태 이벤트 (없으면 `null`)

## History/Report/Patrol 연동 규칙
- History(`GET /api/elders/{elderId}/activities`), Weekly Report(`GET /api/elders/{elderId}/reports/weekly`), Patrol(`GET /api/elders/{elderId}/patrol/latest`)은 REST 계약을 기준으로 최초 조회합니다.
- 실시간 이벤트는 `ELDER_STATUS_UPDATE`/`ROBOT_STATUS_UPDATE`를 캐시 갱신 트리거로만 사용하고, History/Report/Patrol 리스트에 직접 append 하지 않습니다.
- `elderStatus.lastActivity`가 바뀌었거나 Activity 계열 알림(`NOTIFICATION.type === ACTIVITY`)이 수신되면 History/Patrol 쿼리만 선택적으로 `refetch`합니다.
- 주간 리포트는 push 기반 갱신을 하지 않고 화면 진입/주차 변경 시점에만 재조회합니다.
- 공통 계약 파서는 `@/shared/types/history.types`의 `parseActivityListPayload`, `parseWeeklyReportPayload`, `parsePatrolLatestPayload`를 사용합니다.
