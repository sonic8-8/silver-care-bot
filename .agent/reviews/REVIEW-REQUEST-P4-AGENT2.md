## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase4-map-video-fe`
- 작업 범위:
  - Phase 4 Map/Video FE 구현 유지
  - Fix Round 2: 병렬 작업 소유권 위반(`mocks/*`) 해소
- 기준 문서:
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P4-AGENT2.md`

### Fix Round 2 반영 항목
- [x] `frontend/src/mocks/handlers/index.ts`의 Agent 2 변경 제거
- [x] `frontend/src/mocks/handlers/map.ts` 삭제
- [x] 지도/스냅샷 UI 및 API 소비 코드만 유지 (`pages/*`, `features/*`, 라우터)
- [x] 리뷰요청서에 Agent 4 반영 요청 목록 명시

### 주요 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/pages/Map/MapScreen.tsx` | 유지 | Canvas 지도 탭 + Snapshot 갤러리/미리보기 UI |
| `frontend/src/features/map/types.ts` | 유지 | Map/Room/RobotPosition/Snapshot 타입 정의 |
| `frontend/src/features/map/api/mapApi.ts` | 유지 | `GET /api/elders/{elderId}/map` 정규화 + fallback |
| `frontend/src/features/map/api/snapshotApi.ts` | 유지 | `GET /api/patrol/{patrolId}/snapshots` 정규화/정렬 + fallback |
| `frontend/src/features/map/hooks/useMap.ts` | 유지 | TanStack Query 훅 |
| `frontend/src/features/map/hooks/useRobotLocationRealtime.ts` | 유지 | `/topic/robot/{robotId}/location` 구독 훅 |
| `frontend/src/app/router.tsx` | 유지 | `/elders/:elderId/map` 라우트 |
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 유지 | 지도/스냅샷 진입 버튼 |
| `frontend/src/mocks/handlers/index.ts` | 수정(Fix) | map 핸들러 등록 제거 |
| `frontend/src/mocks/handlers/map.ts` | 삭제(Fix) | Agent 2 브랜치에서 제거 |
| `frontend/src/features/map/api/mapApi.test.ts` | 유지 | map API 테스트 |
| `frontend/src/features/map/api/snapshotApi.test.ts` | 유지 | snapshot API 테스트 |

### Agent 4 반영 요청 목록
1. `GET /api/elders/{elderId}/map` MSW 핸들러 추가(rooms, robotPosition, mapId)
2. `GET /api/patrol/{patrolId}/snapshots` MSW 핸들러 추가(snapshots 배열)
3. 위 2개 핸들러를 `frontend/src/mocks/handlers/index.ts`에 등록
4. 계약 확정 후 snapshot 필드 alias(`items`, `url`) 허용 범위 축소 여부 결정

### 검증 포인트 (리뷰어 확인 요청)
- [ ] `mocks/*` 변경이 Agent 2 브랜치에서 제거되었는지
- [ ] 지도 렌더링 좌표계(room bounds/robot position) 동작이 유지되는지
- [ ] 실시간 위치 우선 반영(`realtime -> rest`)이 유지되는지
- [ ] snapshot 정렬(capturedAt desc) 및 fallback(404/501) 정책이 유지되는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run --pool=threads
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run --pool=threads` ⚠️ 환경성 worker timeout 재현(코드 assertion 실패 없음)
- `npm run test -- --run` ✅ PASS (23 files, 68 tests)
- `npm run build` ✅ PASS (chunk size warning 1건, 실패 아님)
- `npm run lint` ✅ PASS

### 우려 사항 / 특별 검토 요청
- Mock은 소유권 규칙에 맞춰 Agent 4에서 반영되어야 하므로, Agent 4 브랜치 반영 시점 전까지 MapScreen의 수동 UI 검증은 실 API/개별 mock 주입 환경에서 진행이 필요합니다.
