## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase4-map-video-fe`
- 작업 범위:
  - Phase 4 Round 1 Frontend Map/Video 구현
  - 지시서 기준: `agent-0/.agent/dispatch/COORDINATION-P4.md`, `agent-0/.agent/dispatch/WORK-INSTRUCTION-P4-AGENT2.md`

### 주요 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/pages/Map/MapScreen.tsx` | 신규 | Canvas 기반 지도 탭 + Snapshot 갤러리 탭 + 이미지 미리보기 모달 구현 |
| `frontend/src/features/map/types.ts` | 신규 | Map/Room/RobotPosition/Snapshot 도메인 타입 정의 |
| `frontend/src/features/map/api/mapApi.ts` | 신규 | `GET /api/elders/{elderId}/map` 정규화 및 fallback 처리(404/501) |
| `frontend/src/features/map/api/snapshotApi.ts` | 신규 | `GET /api/patrol/{patrolId}/snapshots` 정규화/정렬 및 fallback 처리 |
| `frontend/src/features/map/hooks/useMap.ts` | 신규 | TanStack Query 훅(`useElderMap`, `usePatrolSnapshots`) 추가 |
| `frontend/src/features/map/hooks/useRobotLocationRealtime.ts` | 신규 | `/topic/robot/{robotId}/location` 구독 기반 실시간 위치 소비 훅 추가 |
| `frontend/src/app/router.tsx` | 수정 | `/elders/:elderId/map` 라우트 추가 |
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 수정 | 지도/스냅샷 화면 진입 버튼 추가 |
| `frontend/src/mocks/handlers/map.ts` | 신규 | Map/Snapshot MSW 핸들러 추가 |
| `frontend/src/mocks/handlers/index.ts` | 수정 | map 핸들러 등록 |
| `frontend/src/features/map/api/mapApi.test.ts` | 신규 | map API 정규화/fallback 단위 테스트 추가 |
| `frontend/src/features/map/api/snapshotApi.test.ts` | 신규 | snapshot API 정규화/정렬/fallback 단위 테스트 추가 |

### 주요 변경 사항
1. Canvas 지도 화면 구현
- Room bounds 기반 렌더링
- 로봇 좌표/heading 오버레이
- REST 위치 + 실시간 위치를 병합하여 표시

2. Snapshot 갤러리/미리보기 구현
- Patrol ID 입력/적용
- 최신 patrolId(대시보드 데이터) fallback 사용
- 카드 그리드 + 클릭 시 모달 미리보기

3. API/계약 소비 계층 분리
- map/snapshot API 정규화 로직 분리
- TanStack Query 훅으로 페이지와 API 분리
- 의존 API 미구현 구간(404/501) fallback 처리

4. Mock/테스트 보강
- MSW map/snapshot 엔드포인트 추가
- API 헬퍼 단위 테스트 신규 추가

### 검증 포인트 (리뷰어 확인 요청)
- [ ] 지도 렌더링 좌표계가 room bounds/robot position 기준과 일치하는지
- [ ] 실시간 위치 payload 수신 시 REST 위치보다 우선 반영되는지
- [ ] snapshot 정렬(capturedAt desc) 및 fallback(404/501) 정책이 의도와 일치하는지
- [ ] 기존 라우팅/대시보드 동작에 회귀가 없는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (23 files, 68 tests)
- `npm run build` ✅ PASS (chunk size warning 1건, 실패 아님)
- `npm run lint` ✅ PASS

### 우려 사항 / 특별 검토 요청
- 실시간 위치 토픽(`/topic/robot/{robotId}/location`)은 Agent 4 계약 확정본과 최종 대조가 필요합니다.
- snapshot 응답 필드명 변형(`snapshots`/`items`, `imageUrl`/`url`)을 허용하도록 파서를 작성했으므로, 최종 BE 계약 확정 후 과도한 유연성을 축소할지 검토 요청드립니다.
