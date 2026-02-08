## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase7-contract-websocket`
- 작업 범위: Phase 7 Agent 4 (`Contracts/WebSocket/Mock`)
- 기준 문서: `docs/api-ai.md`, `docs/api-embedded.md`, `docs/api-specification.md`

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/types/robot.types.ts` | 수정 | robot sync 확장 필드(`scheduleReminders`, `medications`, `serverTime`) 및 `commands/{id}/ack` 계약 파서 추가 |
| `frontend/src/shared/types/robot.types.test.ts` | 신규 | sync/ack 계약 파서 회귀 테스트 추가 |
| `frontend/src/mocks/handlers/robot.ts` | 수정 | `/sync`, `/commands/{commandId}/ack` mock 추가 및 pending command 큐 반영 |
| `frontend/src/shared/websocket/useRobotLcdRealtime.test.tsx` | 수정 | STOMP envelope 없는 raw payload 소비 호환 테스트 추가 |
| `frontend/src/shared/websocket/useRobotLocationRealtime.test.tsx` | 수정 | STOMP envelope 없는 raw payload 소비 호환 테스트 추가 |
| `backend/src/main/java/site/silverbot/api/emergency/service/EmergencyService.java` | 수정 | 긴급 보고/해제 시 `/topic/emergency`, `/topic/elder/{elderId}/status` 발행 연결 |
| `backend/src/main/java/site/silverbot/websocket/WebSocketMessageService.java` | 수정 | STOMP envelope 발행/임베디드 호환 레이어 의도 주석 추가 |
| `backend/src/test/java/site/silverbot/websocket/EmergencyServiceWebSocketTest.java` | 신규 | EmergencyService의 WebSocket 발행 경로 단위 테스트 추가 |

### 주요 변경 사항
1. Robot sync 응답 확장 계약(`pendingCommands + scheduleReminders + medications + serverTime`)을 FE 파서/테스트에 반영했습니다.
2. Robot command ack 계약(`status/completedAt/result`)을 FE 파서/Mock에 반영하고, 완료/실패/취소 시 mock pending queue 정리 동작을 추가했습니다.
3. 긴급 이벤트 처리 시 실제 운영 코드에서 `ElderStatus`/`Emergency` WebSocket 발행이 이뤄지도록 `EmergencyService`를 연결했습니다.
4. STOMP envelope 기반 발행은 유지하되, 임베디드 소비 호환을 위해 FE 쪽 raw payload 소비 경로 회귀 테스트를 보강했습니다.

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `robot.types` 파서가 Agent 3의 sync/ack 응답 변형을 과도하게 허용/차단하지 않는지
- [ ] `robot` mock의 pending queue 처리(ack 상태별 제거 규칙)가 계약 의도와 일치하는지
- [ ] `EmergencyService`의 WebSocket 발행 시점(보고 시 DANGER, 전체 해제 시 SAFE)이 도메인 규칙과 충돌하지 않는지
- [ ] STOMP envelope 주석/테스트 설명이 실제 소비 코드와 일관적인지
- [ ] Agent 2 소비 코드와 병합 시 타입 충돌이 없는지

### 테스트 명령어
```bash
# Frontend 전체 (현재 develop 기준 기존 실패 1건 존재)
cd frontend && npm run test -- --run

# Frontend Agent4 영향 범위
cd frontend && npm run test -- --run \
  src/shared/types/robot.types.test.ts \
  src/shared/websocket/useRobotLcdRealtime.test.tsx \
  src/shared/websocket/useRobotLocationRealtime.test.tsx

# Frontend LCD
cd frontend-lcd && npm run test -- --run
cd frontend-lcd && npm run build

# Backend WebSocket
cd backend && ./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.websocket.WebSocketMessageServiceTest' \
  --tests 'site.silverbot.websocket.EmergencyServiceWebSocketTest'
```

### 테스트 결과 요약
- `frontend-lcd` 테스트/빌드: 통과
- `frontend` Agent4 영향 범위 테스트: 통과
- `backend` WebSocket 테스트: 통과
- `frontend` 전체 테스트: **기존 실패 1건** 확인
  - `src/pages/_components/GuardianAppContainer.test.tsx`
  - 실패 사유: `useNavigate()` Router 컨텍스트 누락 (Agent4 변경 파일과 무관)

### 우려 사항 / 특별 검토 요청
- `EmergencyService`의 `LocalDateTime -> OffsetDateTime` 변환은 서버 현재 오프셋을 사용합니다. 운영 타임존 정책과 일치하는지 확인 부탁드립니다.
- `robot.types`의 `commandId`는 number/string 혼용 입력을 string으로 정규화합니다. Agent 2 소비 코드에서 number를 직접 기대하지 않는지 확인 부탁드립니다.
