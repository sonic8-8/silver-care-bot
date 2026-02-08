# Phase 8 작업 지시 [Agent 1]

## 브랜치
- `feature/phase8-shell-auth-routing`

## 목표
- 루트 진입/인증/앱 셸을 초기 초안 디자인으로 복원하면서 현재 기능 흐름을 유지한다.
- `/playground`를 개발 전용으로 숨긴다.

## 작업 범위
1. 루트/인증 라우팅 정렬
- 대상:
  - `frontend/src/app/router.tsx`
  - `frontend/src/app/RootRedirect.tsx`
  - `frontend/src/features/auth/hooks/useAuth.ts`
- 요구:
  - `/`는 로그인 우선 진입 유지
  - 보호자 로그인 후 기존 경로(`elders` 중심) 유지
  - 로봇 로그인 후 `/robots/{robotId}/lcd` 유지

2. 로그인/회원가입 UI 복원
- 대상:
  - `frontend/src/pages/Login/LoginScreen.tsx`
  - `frontend/src/pages/Signup/SignupScreen.tsx`
- 요구:
  - `sh/Playground/index.tsx` 초안 스타일을 기준으로 복원
  - 기존 유효성 검증/에러 처리 로직 유지
  - 브랜드 표기는 `동행`

3. 보호자 공통 셸 정렬
- 대상:
  - `frontend/src/pages/_components/GuardianAppContainer.tsx`
  - `frontend/src/pages/_components/BottomNavigation.tsx`
- 요구:
  - 초안의 헤더/네비 톤 반영
  - 로그아웃/알림/네비게이션 기능 회귀 없음

4. `/playground` 개발 전용 숨김
- 대상:
  - `frontend/src/app/router.tsx`
  - `frontend/.env*` 또는 런타임 플래그 사용 경로
- 요구:
  - 기본값: `/playground` 비노출
  - `VITE_ENABLE_PLAYGROUND=true`에서만 접근 허용

## 검증
```bash
cd frontend
npm run build
npm run test -- --run
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P8-AGENT1.md` 작성
