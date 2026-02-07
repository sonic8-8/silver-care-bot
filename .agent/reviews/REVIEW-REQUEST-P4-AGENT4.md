## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase4-contract-realtime-map`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P4.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P4-AGENT4.md` (Round 2)
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/types/map.types.ts` | 수정 | `parseRobotLocationUpdateRequest`에서 `heading`/`timestamp`를 optional(nullable) 허용으로 완화 |
| `frontend/src/shared/types/map.types.test.ts` | 수정 | `heading`/`timestamp` 생략 요청 파싱 성공 회귀 테스트 추가 |
| `frontend/src/mocks/handlers/map.ts` | 수정(이전 `mapVideo.ts`) | 위치 업데이트 mock에서 nullable heading을 기존 값 fallback으로 처리 |
| `frontend/src/mocks/handlers/index.ts` | 수정 | map 핸들러 import 경로를 `./map`으로 정렬하고 등록 유지 |

### 주요 변경 사항
1. 위치 업데이트 요청 계약 정렬 (Major 반영)
- 백엔드 DTO 기준(`x`,`y`,`roomId` 필수 / `heading`,`timestamp` 선택)으로 파서를 정렬했습니다.
- `RobotLocationUpdateRequest` 타입도 nullable 허용으로 맞췄습니다.

2. optional 필드 회귀 테스트 보강 (Minor 반영)
- `heading`/`timestamp`를 생략한 요청이 파싱 성공하고 `null`로 정규화되는지 검증 케이스를 추가했습니다.

3. mock 소유권/경로 정리
- Agent 4 소유 범위인 `mocks/*`에서 map 핸들러를 `map.ts` 기준으로 정렬했습니다.
- nullable heading 입력 시 mock 내부 상태 저장이 깨지지 않도록 fallback 로직을 추가했습니다.

### Agent 2 참조용 계약 요약
- `PUT /api/robots/{robotId}/location` 요청에서 아래 계약으로 사용하면 됩니다.
  - 필수: `x`, `y`, `roomId`
  - 선택: `heading`, `timestamp`
- 선택 필드 생략 시 shared 파서 결과는 `heading: null`, `timestamp: null`로 정규화됩니다.
- map mock 파일 기준은 `frontend/src/mocks/handlers/map.ts`입니다.

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `parseRobotLocationUpdateRequest`가 백엔드 DTO와 동일 제약인지 (`heading`,`timestamp` optional)
- [ ] optional 생략 회귀 테스트가 계약 드리프트를 충분히 방지하는지
- [ ] `mocks/handlers/map.ts` 경로/등록이 Agent 2 통합 브랜치 기준과 충돌 없는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx
npm run test -- --run --pool=threads
npm run build
npm run lint
```

### 테스트 결과
- `npm run test -- --run src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx` → PASS (2 files, 12 tests)
- `npm run test -- --run --pool=threads` → 환경 이슈로 worker timeout (종료 코드 1)
  - 테스트 집계: `Test Files 22 passed`, `Tests 73 passed`, `Errors 1`
- `npm run build` → PASS
- `npm run lint` → PASS

### 우려 사항 / 특별 검토 요청
- CI/리뷰 환경에서 `--pool=threads` 워커 타임아웃 재현 여부 확인 부탁드립니다.
- 계약 변경점은 위치 요청 optional 정렬과 mock 경로 정리로 제한했습니다.
