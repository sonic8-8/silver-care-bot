## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase2-medication-dashboard-fe`
- 작업 범위: Phase 2 수정 라운드 (FIX-INSTRUCTION-P2-AGENT2)
- 기준 문서:
  - `agent-0/.agent/dispatch/COORDINATION-P2.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P2-AGENT2.md`

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/features/dashboard/api/dashboardApi.ts` | 수정 | 최근 알림 정렬 보장, fallback 범위 축소(404/501만), 에러 전파 로직 반영 |
| `frontend/src/features/dashboard/api/dashboardApi.test.ts` | 신규 | 알림 역정렬 데이터 검증, fallback 상태코드 분기(404/501 허용, 401/500/네트워크 거부) 테스트 추가 |
| `frontend/src/features/dashboard/types.ts` | 신규 | Dashboard 전용 로컬 타입 정의 (`shared/types` 중복 변경 제거 목적) |
| `frontend/src/features/dashboard/hooks/useDashboard.test.tsx` | 수정 | `DashboardData` 타입 참조 경로를 dashboard 로컬 타입으로 정리 |
| `frontend/src/features/medication/components/MedicationFormModal.tsx` | 수정 | 기본 시작일 계산을 로컬 타임존 유틸로 교체 |
| `frontend/src/features/medication/utils/date.ts` | 신규 | 로컬 타임존 기준 `yyyy-mm-dd` 날짜 포맷 유틸 추가 |
| `frontend/src/features/medication/utils/date.test.ts` | 신규 | UTC 경계 케이스 포함 날짜 유틸 테스트 추가 |
| `frontend/src/features/medication/types.ts` | 신규 | Medication 전용 로컬 타입 정의 (`shared/types` 중복 변경 제거 목적) |
| `frontend/src/features/medication/api/medicationApi.ts` | 수정 | Medication 로컬 타입 참조로 정리 |
| `frontend/src/features/medication/hooks/useMedications.ts` | 수정 | Medication 로컬 타입 참조로 정리 |
| `frontend/src/features/medication/components/MedicationStatusCalendar.tsx` | 수정 | Medication 로컬 타입 참조로 정리 |
| `frontend/src/features/medication/components/WeeklyMedicationChart.tsx` | 수정 | Medication 로컬 타입 참조로 정리 |
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 수정 | Dashboard 로컬 타입 참조로 정리 |
| `frontend/src/pages/Medication/MedicationScreen.tsx` | 수정 | Medication 로컬 타입 참조로 정리 |

### 주요 수정 사항
1. Major #1 해결: 최근 알림 정렬 보장
- `selectRecentNotifications` 헬퍼를 추가하고 `createdAt` 기준 내림차순 정렬 후 상위 5개만 반환하도록 변경.

2. Major #2 해결: fallback 범위 축소
- 기존 `.catch(() => null)` 전면 제거.
- `isDependencyFallbackError` 기준으로 `404/501`만 fallback 허용.
- `401/403/5xx/네트워크 오류`는 상위로 throw되어 화면 에러 상태로 노출되도록 수정.

3. Major #3 해결: UTC 날짜 계산 제거
- `toISOString().slice(0, 10)` 제거.
- `toLocalDateInputValue` 유틸로 로컬 타임존 기준 날짜 문자열 생성.

4. Minor(소유권) 대응: `shared/types` 충돌 해소
- Agent 2 브랜치에서 `frontend/src/shared/types/**` 신규/수정 의존을 제거.
- 필요한 타입은 `features/dashboard/types.ts`, `features/medication/types.ts`로 로컬화.
- `COORDINATION-P2.md`의 C-02(Agent 4 소유 경로 우선) 기준을 준수하도록 정리.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] 대시보드 알림이 항상 최신순 5건인지
- [ ] fallback 정책이 404/501만 허용하고 나머지 오류를 숨기지 않는지
- [ ] Medication 기본 시작일이 로컬 날짜 기준인지
- [ ] `shared/types` 소유권 충돌이 해소되었는지(Agent 2 브랜치 기준)

### 테스트 명령어
```bash
cd frontend
npm run test -- --run
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ 통과 (`12 files`, `32 tests`)
- `npm run lint` ✅ 통과

### 우려 사항 / 협업 메모
- C-02 기준상 `frontend/src/shared/types/**`의 최종 소스 오브 트루스는 Agent 4 브랜치로 유지되어야 하므로,
  Agent 4에서 공용 타입 반영 필요 시 해당 브랜치 기준으로 재정렬(또는 공용 타입 흡수) 예정.
