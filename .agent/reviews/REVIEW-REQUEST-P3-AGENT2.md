## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase3-history-report-fe`
- 작업 범위:
  - Phase 3 게이트 우선순위 A (Schedule/Dashboard Frontend)
  - Fix Round 3 (`FIX-INSTRUCTION-P3-AGENT2.md`) 반영
- 기준 문서:
  - `agent-0/.agent/dispatch/COORDINATION-P3.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P3-AGENT2.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT2.md`

### Fix Round 3 반영 상태
- [x] Critical #1: `DashboardScreen` Hook call order 위반 해소
- [x] Round 2 회귀 없음: stale 방지(reset + ID guard) 및 소유권 준수 상태 유지

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 수정 | 조기 return 이전으로 `useMemo` 계산 이동, 훅 호출 순서 고정 |

### 주요 변경 사항
1. Hook call order 고정 (Critical 해소)
- `activeRealtimeRobotStatus`, `activeRealtimeElderStatus` 계산 `useMemo`를 조기 `return` 이전으로 이동했습니다.
- `dashboardQuery.data`를 nullable-safe 기본값으로 먼저 계산해 렌더 경로와 무관하게 훅 순서를 고정했습니다.

2. Round 2 회귀 방지 확인
- 실시간 stale 방지(reset + ID guard) 로직은 유지했습니다.
- `frontend/src/shared/websocket/**` 직접 수정 없이 소비 계층 구조를 유지했습니다.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] `DashboardScreen`에서 loading/error/invalid-id -> success 전환 시 Hook order 오류가 없는지
- [ ] 기존 stale 방지(reset + ID guard) 동작이 유지되는지
- [ ] Agent 2 브랜치에서 `frontend/src/shared/websocket/**` 직접 변경이 없는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (17 files, 41 tests)
- `npm run build` ✅ PASS (Vite chunk size warning 1건, 실패 아님)
- `npm run lint` ✅ PASS

### 우려 사항 / 특별 검토 요청
- 라우트 전환/쿼리 상태 전환 구간에서 Hook order 회귀 여부를 중점 재확인 부탁드립니다.
