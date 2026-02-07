## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase3-history-report-fe`
- 작업 범위:
  - Phase 3 게이트 우선순위 A (Schedule/Dashboard Frontend)
  - Fix Round 2 (`FIX-INSTRUCTION-P3-AGENT2.md`) 반영
- 기준 문서:
  - `agent-0/.agent/dispatch/COORDINATION-P3.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P3-AGENT2.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT2.md`

### Fix Round 2 반영 상태
- [x] Major #1: `frontend/src/shared/websocket/**` 직접 수정 제거 (소유권 위반 해소)
- [x] Major #2: elder/robot 전환 시 stale realtime 상태 오염 방지
- [x] Minor #1: lint 증빙 정합화 (`npm run lint` PASS 기준으로 문서 갱신)

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/pages/Schedule/ScheduleScreen.tsx` | 수정 | 일정 화면(주간 캘린더/리스트 전환, 추가/수정 모달) 구현 |
| `frontend/src/features/schedule/types.ts` | 신규 | 일정 도메인 타입 정의 |
| `frontend/src/features/schedule/api/scheduleApi.ts` | 신규 | 일정 조회/생성/수정/삭제 API 구현 |
| `frontend/src/features/schedule/api/scheduleApi.test.ts` | 신규 | 수정 payload에서 `undefined` 제거 / `null` 유지 검증 |
| `frontend/src/features/schedule/hooks/useSchedules.ts` | 신규 | 일정 Query/Mutation 훅 구현 |
| `frontend/src/features/schedule/components/ScheduleFormModal.tsx` | 신규 | 일정 추가/수정 모달 구현 |
| `frontend/src/features/dashboard/api/dashboardApi.ts` | 수정 | 복약 요약/주간 일정 파싱 정규화 보강 |
| `frontend/src/features/dashboard/types.ts` | 수정 | 대시보드 확장 타입(`elderStatus`, 복약 세부 필드) 정렬 |
| `frontend/src/features/dashboard/hooks/useDashboardRealtime.ts` | 신규 | Dashboard 전용 realtime 브리지 훅(공통 계약 소비, stale reset/ID guard) |
| `frontend/src/features/dashboard/hooks/useDashboardRealtime.test.tsx` | 신규 | realtime 브리지 훅 테스트(구독/리셋/ID mismatch) |
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 수정 | realtime 상태 병합 시 대상 ID 가드 + 전환 오염 방지 적용 |
| `frontend/eslint.config.js` | 수정 | 빌드 산출 config js/d.ts 파일 lint ignore 추가(재현 가능한 lint PASS 확보) |

### 주요 변경 사항
1. 소유권 위반 해소
- Agent 2 변경분이던 `frontend/src/shared/websocket/**` 직접 수정/추가를 모두 제거했습니다.
- Dashboard 연동은 Agent 2 소유 영역(`features/dashboard/hooks`)에서만 처리했습니다.

2. stale 상태 오염 방지
- `useDashboardRealtime`(Dashboard 전용)에서 `elderId/robotId` 변경 시 `robotStatus/elderStatus`를 즉시 초기화합니다.
- 실시간 이벤트 반영 시 `robotId/elderId` mismatch를 필터링합니다.
- `DashboardScreen`에서도 병합 직전에 한 번 더 현재 화면 대상 ID와 교차 검증합니다.

3. lint 증빙 정합화
- 빌드 후 생성되는 `playwright/vite/vitest config .js/.d.ts`로 인해 발생하던 `no-undef(process,__dirname)`를 eslint ignore로 정리했습니다.
- 현재 기준 `npm run lint` PASS입니다.

### 협업/계약 정렬 메모 (Agent 2 ↔ Agent 4)
- COORDINATION/FIX 지시의 공통 계약 기준으로 아래를 고정해 반영했습니다.
  - 토픽 규칙: `/topic/robot/{robotId}/status`, `/topic/elder/{elderId}/status`
  - 훅 옵션 시그니처: `token`, `robotId`, `elderId`, `enabled`
  - 이벤트 반영 규칙: 중복 메시지 dedup + ID mismatch 필터
- Agent 2는 공통 소유 경로(`shared/websocket`)를 직접 수정하지 않고 소비 계층만 유지했습니다.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] Agent 2 브랜치에서 `frontend/src/shared/websocket/**` 직접 변경이 남아있지 않은지
- [ ] elder/robot 전환 직후 이전 대상의 realtime 상태가 화면에 남지 않는지
- [ ] realtime 이벤트가 현재 대상 ID일 때만 반영되는지
- [ ] 일정/대시보드 기존 기능 회귀가 없는지

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
- Agent 4 공통 훅이 develop에 반영되는 시점과 최종 시그니처 드리프트가 없는지 재확인 부탁드립니다.
