# Phase 8 작업 지시 [Agent 2]

## 브랜치
- `feature/phase8-elder-dashboard-ui`

## 목표
- Elder/Dashboard/Notification/Emergency 화면을 초기 초안 디자인으로 복원하되, 현재 API 연동 기능을 유지한다.

## 작업 범위
1. Elder 선택/관리 화면 복원
- 대상:
  - `frontend/src/pages/Elders/ElderSelectScreen.tsx`
  - `frontend/src/features/elder/components/**`
- 요구:
  - 카드/배지/버튼 레이아웃을 초안 기준으로 복원
  - 어르신 추가/연락처 관리 기능 회귀 없음

2. Dashboard 화면 복원
- 대상:
  - `frontend/src/pages/Dashboard/DashboardScreen.tsx`
  - `frontend/src/features/dashboard/**` (UI 계층)
- 요구:
  - 요약 카드/상태 섹션/최근 알림 영역 디자인 복원
  - 실시간/데이터 바인딩 로직 유지

3. Notification/Emergency 화면 복원
- 대상:
  - `frontend/src/pages/Notification/NotificationScreen.tsx`
  - `frontend/src/pages/Emergency/EmergencyScreen.tsx`
- 요구:
  - 초기 초안 시각 구조 반영
  - 알림 클릭 이동/긴급 처리 동작 유지
  - 긴급연락처 표시 기능이 있다면 UI 파손 없이 유지

4. 반응형/접근성 최소 기준
- 요구:
  - 모바일/데스크톱에서 레이아웃 깨짐 없음
  - 주요 버튼 `min-h-[48px]` 터치 영역 유지

## 검증
```bash
cd frontend
npm run build
npm run test -- --run
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P8-AGENT2.md` 작성
