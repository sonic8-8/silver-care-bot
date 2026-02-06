# Phase 2 수정 지시 [Agent 2]

## 대상 브랜치
`feature/phase2-medication-dashboard-fe`

## 기준 리뷰
- `agent-2/.agent/reviews/REVIEW-RESULT-P2-AGENT2.md`
- 판정: `⚠️ Request Changes` (Major 3, Minor 1)

## 필수 수정 항목
1. 최근 알림 5개 정렬 보장
- 파일: `frontend/src/features/dashboard/api/dashboardApi.ts`
- `notificationsResult?.notifications`를 `createdAt` 내림차순으로 정렬한 뒤 상위 5건만 선택한다.
- 백엔드 응답 순서에 의존하지 않도록 구현한다.

2. 알림/일정 API fallback 범위 축소
- 파일: `frontend/src/features/dashboard/api/dashboardApi.ts`
- 현재 `.catch(() => null)` 전체 삼킴 로직을 제거한다.
- fallback 허용 케이스는 "미구현 의존성" 성격의 상태코드(예: 404/501)로 한정한다.
- `401/403/5xx/네트워크 오류`는 반드시 상위로 전파하여 에러 상태가 드러나게 한다.

3. 기본 시작일 로컬 타임존 기준으로 변경
- 파일: `frontend/src/features/medication/components/MedicationFormModal.tsx`
- `toISOString().slice(0, 10)` 사용을 제거한다.
- 로컬 타임존 기준 `yyyy-mm-dd` 유틸로 기본 날짜를 생성한다.

4. `shared/types` 소유권 충돌 해소
- 대상 파일:
  - `frontend/src/shared/types/medication.types.ts`
  - `frontend/src/shared/types/notification.types.ts`
  - `frontend/src/shared/types/schedule.types.ts`
  - `frontend/src/shared/types/dashboard.types.ts`
- `COORDINATION-P2.md`의 `C-02` 지시를 따른다.
- Agent 4 소유 경로이므로, 최종 반영은 Agent 4 브랜치 기준으로 정렬하고 Agent 2 브랜치에는 중복 변경이 남지 않게 정리한다.

## 테스트/검증
```bash
cd frontend
npm run test -- --run
npm run lint
```

추가로 아래를 확인한다.
- 최근 알림 정렬 단위 테스트(정렬 역전 데이터 포함)
- fallback 분기 테스트(404/501 fallback, 401/500 throw)
- 로컬 날짜 포맷 유틸 테스트(UTC 경계 시간대 케이스 포함)

## 완료 보고
1. 수정 커밋/푸시 후 `agent-2/.agent/reviews/REVIEW-REQUEST-P2-AGENT2.md` 갱신
2. `shared/types` 소유권 정리 방법(Agent 4와의 조율 결과) 명시
3. 재리뷰 요청
