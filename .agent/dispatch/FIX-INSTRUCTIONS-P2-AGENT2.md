# FIX Instructions [P2-AGENT2]

## 대상 브랜치
- `feature/phase2-medication-dashboard-fe`

## 수정 필수 항목

1. 최근 알림 정렬 보장
- 파일: `frontend/src/features/dashboard/api/dashboardApi.ts`
- 조치:
  - `notificationsResult?.notifications`를 `createdAt` 내림차순 정렬
  - 정렬 후 상위 5개를 `recentNotifications`에 매핑
- 완료 기준:
  - 응답 순서가 뒤섞여도 UI에는 항상 최신 5개가 노출

2. fallback 정책 축소 (의존성 미구현 케이스만 허용)
- 파일: `frontend/src/features/dashboard/api/dashboardApi.ts`
- 조치:
  - 알림/일정 조회의 `.catch(() => null)` 제거
  - 404/501 같은 미구현 오류만 fallback, 401/403/5xx는 throw
  - 에러 분기 기준 주석 또는 유틸 함수로 명시
- 완료 기준:
  - 인증/서버 오류 시 `useDashboard`가 error 상태로 전파됨

3. 시작일 로컬 날짜 계산으로 변경
- 파일: `frontend/src/features/medication/components/MedicationFormModal.tsx`
- 조치:
  - `toISOString().slice(0, 10)` 제거
  - 로컬 타임존 기준 `YYYY-MM-DD` 생성 함수로 교체
- 완료 기준:
  - 자정 경계에서도 입력 기본값이 사용자 로컬의 "오늘"과 일치

4. 공유 타입 소유권 조율 근거 남기기
- 파일: `.agent/reviews/REVIEW-REQUEST-P2-AGENT2.md` 또는 별도 코멘트 문서
- 조치:
  - `shared/*` 수정에 대한 Agent 0 승인/Agent 4 합의 근거를 문서화
- 완료 기준:
  - 병렬 소유권 예외 사유가 추적 가능하게 기록됨

## 재검증 명령어
```bash
cd frontend
npm run test -- --run
npm run lint
npm run build
```

## 재리뷰 요청
- 수정 반영 후 `.agent/reviews/REVIEW-REQUEST-P2-AGENT2.md`에 변경점 요약을 추가해 재요청 바랍니다.
