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

## `useRobotLcdRealtime`
LCD 화면 앱에서 모드 전환 토픽을 구독하기 위한 공통 훅입니다.

- LCD 토픽: `/topic/robot/{robotId}/lcd`
- 메시지 형식:
  - 권장 envelope: `type: "LCD_MODE_CHANGE"` + `payload`
  - 호환 payload: envelope 없이 payload 단독 수신도 허용
- 중복 이벤트 방지: 동일 메시지(`message.body`)는 1회만 반영

### LCD payload 계약
```json
{
  "robotId": 1,
  "mode": "MEDICATION",
  "emotion": "happy",
  "message": "할머니~ 약 드실 시간이에요!",
  "subMessage": "아침약 2정",
  "nextSchedule": {
    "label": "병원 방문",
    "time": "14:00"
  },
  "updatedAt": "2026-02-08T08:30:00+09:00"
}
```

### 사용 예시
```tsx
import { useRobotLcdRealtime } from '@/shared/websocket';

const { lcdState, isConnected } = useRobotLcdRealtime({
  token: accessToken,
  robotId,
  onLcdChange: (next) => {
    setCurrentMode(next.mode);
  },
});
```

## `useRobotLocationRealtime`
지도 화면에서 로봇 좌표를 실시간 반영하기 위한 공통 훅입니다.

- 로봇 위치 토픽: `/topic/robot/{robotId}/location`
- 메시지 형식:
  - 권장 envelope: `type: "ROBOT_LOCATION_UPDATE"` + `payload`
  - 호환 payload: envelope 없이 위치 payload 단독 수신도 허용
- 중복 이벤트 방지: 동일 메시지(`message.body`)는 1회만 반영

### 위치 payload 계약
```json
{
  "robotId": 1,
  "elderId": 1,
  "roomId": "LIVING_ROOM",
  "x": 450,
  "y": 150,
  "heading": 45,
  "timestamp": "2026-02-07T10:23:00+09:00"
}
```

### 사용 예시
```tsx
import { useRobotLocationRealtime } from '@/shared/websocket';
import { mapVideoQueryKeys } from '@/shared/types';

const { location, isConnected } = useRobotLocationRealtime({
  token: accessToken,
  robotId,
  onLocation: (next) => {
    // 필요 시 지도 데이터 캐시와 함께 갱신
    queryClient.setQueryData(mapVideoQueryKeys.robotLocation(robotId), next);
  },
});
```

## History/Report/Patrol 연동 규칙
- History(`GET /api/elders/{elderId}/activities`), Weekly Report(`GET /api/elders/{elderId}/reports/weekly`), Patrol(`GET /api/elders/{elderId}/patrol/latest`)은 REST 계약을 기준으로 최초 조회합니다.
- 실시간 이벤트는 `ELDER_STATUS_UPDATE`/`ROBOT_STATUS_UPDATE`를 캐시 갱신 트리거로만 사용하고, History/Report/Patrol 리스트에 직접 append 하지 않습니다.
- `elderStatus.lastActivity`가 바뀌었거나 Activity 계열 알림(`NOTIFICATION.type === ACTIVITY`)이 수신되면 History/Patrol 쿼리만 선택적으로 `refetch`합니다.
- 주간 리포트는 push 기반 갱신을 하지 않고 화면 진입/주차 변경 시점에만 재조회합니다.
- 공통 계약 파서는 `@/shared/types/history.types`의 `parseActivityListPayload`, `parseWeeklyReportPayload`, `parsePatrolLatestPayload`를 사용합니다.

## Map/Video 쿼리 키
- `mapVideoQueryKeys.elderMap(elderId)` → `GET /api/elders/{elderId}/map`
- `mapVideoQueryKeys.robotRooms(robotId)` → `GET /api/robots/{robotId}/rooms`
- `mapVideoQueryKeys.robotLocation(robotId)` → `PUT /api/robots/{robotId}/location` ack/마지막 위치 상태
- `mapVideoQueryKeys.patrolSnapshots(patrolId)` → `GET /api/patrol/{patrolId}/snapshots`
