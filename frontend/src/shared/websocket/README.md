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
