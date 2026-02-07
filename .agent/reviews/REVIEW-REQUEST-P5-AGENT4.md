## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase5-lcd-contract-realtime`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P5.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P5-AGENT4.md`
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/types/lcd.types.ts` | 추가 | LCD REST/Realtime + `/events` 계약 타입/파서 정의 |
| `frontend/src/shared/types/lcd.types.test.ts` | 추가 | LCD 계약 mismatch 탐지 테스트(모드/표정/액션 enum, 필수 필드) |
| `frontend/src/shared/types/index.ts` | 수정 | `lcd.types` export 추가 |
| `frontend/src/shared/websocket/useRobotLcdRealtime.ts` | 추가 | `/topic/robot/{robotId}/lcd` 구독 공통 훅 추가 |
| `frontend/src/shared/websocket/useRobotLcdRealtime.test.tsx` | 추가 | LCD 실시간 훅 구독/중복방지/필터링 테스트 |
| `frontend/src/shared/websocket/types.ts` | 수정 | `LcdModePayload`, `RobotLcdRealtimeState` 타입을 계약 기반으로 정렬 |
| `frontend/src/shared/websocket/index.ts` | 수정 | `useRobotLcdRealtime` export 추가 |
| `frontend/src/shared/websocket/README.md` | 수정 | Agent 2 소비용 LCD 실시간 사용 가이드/페이로드 계약 추가 |
| `frontend/src/mocks/handlers/robot.ts` | 수정 | `/lcd`, `/lcd-mode`, `/events`를 파서 기반 상태형 MSW로 정렬 |

### 주요 변경 사항
1. LCD 계약 타입/파서 정렬
- `GET /api/robots/{robotId}/lcd` 응답 계약(`mode`, `emotion`, `message`, `subMessage`, `nextSchedule`, `lastUpdatedAt`) 파서를 추가했습니다.
- `POST /api/robots/{robotId}/lcd-mode` 요청/응답 파서를 추가했습니다.
- `POST /api/robots/{robotId}/events` 요청/응답 파서를 추가하고, `BUTTON` 타입일 때 `action` 필수 조건을 강제했습니다.

2. 계약 mismatch 탐지 테스트 보강
- LCD emotion enum drift(`angry`) 및 필수 필드 누락 케이스를 실패하도록 테스트 추가했습니다.
- `/events`에서 `BUTTON` 이벤트 action 누락 시 실패하도록 테스트 추가했습니다.

3. LCD 실시간 수신 계층 정리
- `/topic/robot/{robotId}/lcd` 전용 공통 훅 `useRobotLcdRealtime`를 추가했습니다.
- `LCD_MODE_CHANGE` envelope + payload-only 형식을 모두 허용하고, 중복 메시지 방지/robotId 필터를 적용했습니다.
- payload에 `updatedAt`이 없으면 envelope timestamp로 보정하도록 처리했습니다.

4. MSW 핸들러 정렬
- `robot` 핸들러를 상태형으로 변경해 로봇별 LCD 상태를 유지합니다.
- `POST /lcd-mode`는 계약 파서 검증 후 상태 갱신 + `updatedAt` 응답을 반환합니다.
- `POST /events`는 계약 파서 검증 후 `BUTTON` action(`TAKE`, `LATER`, `CONFIRM`, `EMERGENCY`)에 따라 LCD 상태를 반영합니다.

### Agent 2 참조용 계약 요약
- 현재 워크트리 구조상 `frontend-lcd` 디렉토리가 없어, 동일 계약을 `frontend/src/shared/*`, `frontend/src/mocks/*` 기준으로 먼저 고정했습니다.
- LCD 모드 enum: `IDLE | GREETING | MEDICATION | SCHEDULE | LISTENING | EMERGENCY | SLEEP`
- LCD emotion enum: `neutral | happy | sleep`
- `POST /api/robots/{robotId}/lcd-mode` 요청 필수 필드:
  - `mode`, `emotion`, `message`, `subMessage`
- `POST /api/robots/{robotId}/events` 계약:
  - `events[].type`: `WAKE_UP | SLEEP | OUT_DETECTED | RETURN_DETECTED | BUTTON`
  - `events[].type === BUTTON`일 때 `events[].action` 필수
  - `events[].action`: `TAKE | LATER | CONFIRM | EMERGENCY`
- 실시간 구독 payload:
  - 토픽: `/topic/robot/{robotId}/lcd`
  - 타입: `LCD_MODE_CHANGE`
  - payload 필드: `robotId`, `mode`, `emotion`, `message`, `subMessage`, `nextSchedule?`, `updatedAt?`

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `lcd.types.ts`의 enum/필수 필드 제약이 P5 계약 의도와 일치하는지
- [ ] `useRobotLcdRealtime`의 envelope/payload-only 호환 및 중복방지 로직이 충분한지
- [ ] `mocks/handlers/robot.ts`의 `/events` action 처리가 Agent 2 LCD UI 흐름과 충돌 없는지
- [ ] `frontend-lcd` 통합 시 `shared` 계약 이식 경로가 명확한지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run src/shared/types/lcd.types.test.ts src/shared/websocket/useRobotLcdRealtime.test.tsx src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx
npm run test -- --run
npm run build
npm run lint
```

### 테스트 결과
- `npm run test -- --run src/shared/types/lcd.types.test.ts src/shared/websocket/useRobotLcdRealtime.test.tsx src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx`
  - PASS (`Test Files 4 passed`, `Tests 25 passed`)
- `npm run test -- --run`
  - PASS (`Test Files 27 passed`, `Tests 93 passed`)
- `npm run build`
  - PASS (chunk size warning only)
- `npm run lint`
  - PASS

### 우려 사항 / 특별 검토 요청
- `frontend-lcd` 앱 통합 브랜치에서 동일 계약 파일을 복사/이식할 때 import 경로만 재검증 부탁드립니다.
