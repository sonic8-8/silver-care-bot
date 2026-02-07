## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase4-contract-realtime-map`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P4.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P4-AGENT4.md`
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/types/map.types.ts` | 신규 | Map/Room/Snapshot/Location 계약 타입 + strict 파서 추가 |
| `frontend/src/shared/types/map.query-keys.ts` | 신규 | Map/Video 전용 공통 TanStack Query 키 유틸 추가 |
| `frontend/src/shared/types/map.types.test.ts` | 신규 | 계약 mismatch 조기 탐지 테스트 추가 |
| `frontend/src/shared/types/index.ts` | 수정 | Map 관련 타입/키 export 노출 |
| `frontend/src/mocks/handlers/mapVideo.ts` | 신규 | Map/Room/Snapshot/Location MSW 시나리오 핸들러 추가 |
| `frontend/src/mocks/handlers/index.ts` | 수정 | `mapVideoHandlers` 등록 |
| `frontend/src/shared/websocket/useRobotLocationRealtime.ts` | 신규 | 지도용 로봇 위치 실시간 구독 훅 추가 |
| `frontend/src/shared/websocket/useRobotLocationRealtime.test.tsx` | 신규 | 위치 실시간 훅 토픽/중복방지/필터링 테스트 |
| `frontend/src/shared/websocket/types.ts` | 수정 | `ROBOT_LOCATION_UPDATE` 메시지 타입 및 위치 payload/state 타입 추가 |
| `frontend/src/shared/websocket/index.ts` | 수정 | 위치 실시간 훅 export 추가 |
| `frontend/src/shared/websocket/README.md` | 수정 | 위치 토픽/페이로드 소비 규칙 + Agent 2 연동 가이드 추가 |

### 주요 변경 사항
1. Map/Room/Snapshot/Location 공통 계약 정렬
- `docs/api-specification.md`의 Map/Room/Location 응답 형태를 기준으로 shared 타입과 파서를 정의했습니다.
- Snapshot API(`GET /api/patrol/{patrolId}/snapshots`)는 `patrolId + snapshots[]` 구조로 공통 계약을 명시하고 파서로 강제합니다.

2. Mock/테스트 보강
- MSW에 Map 조회, Room CRUD, Location 업데이트, Snapshot 조회 시나리오를 추가했습니다.
- 계약 불일치(예: room type drift, snapshot 필수 필드 누락)를 즉시 감지하는 테스트를 추가했습니다.

3. 실시간 위치 연계 제공
- `/topic/robot/{robotId}/location` 토픽 구독용 `useRobotLocationRealtime` 훅을 추가했습니다.
- 중복 메시지 방지, robotId 불일치 필터링, envelope/직접 payload 양쪽 호환 처리를 포함했습니다.

### Agent 2 참조용 계약 요약
- 타입/파서:
  - `parseElderMapPayload` (`GET /api/elders/{elderId}/map`)
  - `parseRobotRoomsPayload` (`GET /api/robots/{robotId}/rooms`)
  - `parsePatrolSnapshotListPayload` (`GET /api/patrol/{patrolId}/snapshots`)
  - `parseRobotLocationUpdateRequest` / `parseRobotLocationUpdateAckPayload` (`PUT /api/robots/{robotId}/location`)
- 쿼리 키:
  - `mapVideoQueryKeys.elderMap(elderId)`
  - `mapVideoQueryKeys.robotRooms(robotId)`
  - `mapVideoQueryKeys.robotLocation(robotId)`
  - `mapVideoQueryKeys.patrolSnapshots(patrolId)`
- 실시간:
  - 훅: `useRobotLocationRealtime`
  - 토픽: `/topic/robot/{robotId}/location`
  - 권장 메시지: `type: "ROBOT_LOCATION_UPDATE", payload: { robotId, elderId, roomId, x, y, heading, timestamp }`

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] Map/Room/Snapshot/Location 파서가 API 명세 대비 과도/과소 제약 없이 동작하는지
- [ ] `useRobotLocationRealtime`의 메시지 필터링/중복 제거가 실시간 지도 시나리오에 적합한지
- [ ] MSW 시나리오가 Agent 2 화면 통합 테스트에 충분한지
- [ ] 기존 WebSocket/History 계약과 충돌이 없는지
- [ ] CLAUDE.md 코딩 규칙과 테스트 커버리지 기대치를 충족하는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx
npm run test -- --run
npm run build
npm run lint
```

### 테스트 결과
- `npm run test -- --run src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx` → PASS (2 files, 11 tests)
- `npm run test -- --run` → PASS (23 files, 73 tests)
- `npm run build` → PASS
- `npm run lint` → PASS

### 우려 사항 / 특별 검토 요청
- Snapshot API 응답 필드는 명세 문서에 상세 스키마가 아직 없어서, Agent 3 구현과 최종 필드명이 다를 경우 파서 alias를 추가로 맞출 필요가 있습니다.
- WebSocket 위치 토픽(`/topic/robot/{robotId}/location`)은 Agent 2 소비 기준으로 선반영한 계약입니다. 백엔드 발행 토픽 확정값과 최종 대조 부탁드립니다.
