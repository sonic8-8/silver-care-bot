# Phase 8 작업 지시 [Agent 3]

## 브랜치
- `feature/phase8-robot-domain-ui`

## 목표
- Robot/LCD/Map/Schedule/Medication/History 영역을 초기 초안 디자인으로 복원하고 현재 기능(명령/API/실시간)을 유지한다.

## 작업 범위
1. Robot 제어/LCD 화면 복원
- 대상:
  - `frontend/src/pages/Robot/RobotControlScreen.tsx`
  - `frontend/src/pages/Robot/RobotLCDScreen.tsx`
  - `frontend/src/features/robot-lcd/RobotLCD.tsx`
  - `frontend/src/features/robot-lcd/*` (Eye/InfoChip/SimControls 포함)
- 요구:
  - `sh/Playground/RobotLCD.tsx` 디자인/모션 톤 우선 복원
  - 로봇 제어 명령/상태 조회 기능 회귀 없음

2. Map/Schedule/Medication/History 화면 복원
- 대상:
  - `frontend/src/pages/Map/MapScreen.tsx`
  - `frontend/src/pages/Schedule/ScheduleScreen.tsx`
  - `frontend/src/pages/Medication/MedicationScreen.tsx`
  - `frontend/src/pages/History/HistoryScreen.tsx`
- 요구:
  - 초기 초안 시각 구조를 우선 반영
  - 기존 API 호출/폼 제출/필터/실시간 반영 로직 유지

3. 로봇 전용 화면 라우트 호환
- 대상:
  - `frontend/src/pages/Robot/RobotDeviceScreen.tsx` (존재 시)
- 요구:
  - 로봇 로그인 후 진입한 화면에서 LCD 렌더 동작 유지
  - 로그아웃 동작 유지

## 검증
```bash
cd frontend
npm run build
npm run test -- --run
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P8-AGENT3.md` 작성
