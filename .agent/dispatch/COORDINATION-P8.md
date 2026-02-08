# Phase 8 작업 지시서 (Coordinator)

## 목적
- 초기 초안 디자인(`sh/Playground/index.tsx`, `sh/Playground/RobotLCD.tsx`)을 현재 프로젝트에 재적용한다.
- 디자인은 초안 우선으로 복원하고, 현재 구현된 기능/API 연동은 유지한다.
- 프로젝트명은 `동행` 기준으로 유지한다.

## 기준
- 기준 브랜치: `origin/develop`
- 기준 디자인 소스:
  - `sh/Playground/index.tsx`
  - `sh/Playground/RobotLCD.tsx`
- 기준 정책:
  - 초안 UI 우선
  - 기능 회귀 금지
  - `/playground`는 개발 전용 플래그로 숨김

## 브랜치 정책
- Agent 1: `feature/phase8-shell-auth-routing`
- Agent 2: `feature/phase8-elder-dashboard-ui`
- Agent 3: `feature/phase8-robot-domain-ui`
- Agent 4: `feature/phase8-design-system-foundation`
- 공통 Push 규칙: `git push -u origin <현재브랜치>`

## 공통 제약
- API 스펙/응답 구조를 임의로 변경하지 않는다.
- 기존 상태관리(TanStack Query, Zustand)와 인증 흐름을 깨지 않는다.
- 디자인이 충돌할 경우 “초안 시각 구조”를 우선하고, 기능을 내부 로직으로 맞춘다.
- `docs/api-specification.md`는 수정하지 않는다.

## 소유권 경계
- Agent 1 (Shell/Auth/Routing):
  - `frontend/src/app/**`
  - `frontend/src/pages/Login/**`, `frontend/src/pages/Signup/**`
  - `frontend/src/pages/_components/**` (네비/헤더/공통 셸)
- Agent 2 (Elder/Dashboard/Notification/Emergency):
  - `frontend/src/pages/Elders/**`
  - `frontend/src/pages/Dashboard/**`
  - `frontend/src/pages/Notification/**`
  - `frontend/src/pages/Emergency/**`
- Agent 3 (Robot/LCD/Map/Schedule/Medication/History):
  - `frontend/src/pages/Robot/**`
  - `frontend/src/features/robot-lcd/**`
  - `frontend/src/pages/Map/**`
  - `frontend/src/pages/Schedule/**`
  - `frontend/src/pages/Medication/**`
  - `frontend/src/pages/History/**`
- Agent 4 (Design Foundation + QA):
  - `frontend/src/shared/ui/**`
  - `frontend/src/shared/types/ui.types.ts`
  - `frontend/src/shared/utils/**` (필요 시)
  - 디자인 회귀 테스트/빌드 체크 스크립트

## 교차 조정 포인트
1. Agent 4 → Agent 1/2/3
- 공유 UI 컴포넌트의 variant/class 변경을 먼저 확정 후 소비 화면에서 적용.

2. Agent 1 ↔ Agent 3
- 로봇 로그인 후 라우팅(`/robots/{robotId}/lcd`)과 Robot LCD 화면 구조 충돌 방지.

3. Agent 1 ↔ Agent 2
- 보호자 공통 헤더/네비 변경이 Dashboard/Notification 화면과 충돌하지 않도록 인터페이스 고정.

## 머지 순서 (권장)
1. Agent 4 (공유 UI 기반)
2. Agent 1 (루트/인증/셸)
3. Agent 2 (Elder 계열 화면)
4. Agent 3 (Robot/LCD 계열 화면)
5. Agent 0 (`management/architect` -> `develop`)

## 완료 기준 (Phase 8 Round 1)
- Agent 1~4 각각 `REVIEW-REQUEST-P8-AGENT{N}.md` 작성 완료
- 새 세션 리뷰 `REVIEW-RESULT-P8-AGENT{N}.md` Approve 확보
- `/playground` 기본 비노출(개발 플래그 OFF) 확인
- 라이트/다크 모드, 모바일/데스크톱 동작 확인
