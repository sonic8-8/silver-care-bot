# Phase 7 작업 지시 [Agent 2]

## 브랜치
- `feature/phase7-frontend-contract-fe`

## 목표
- Backend 계약 변경을 Frontend에 반영하고, 미완 상태인 긴급연락처 UI를 보강한다.

## 작업 범위
1. Auth 소비 계약 정렬
- 대상:
  - `frontend/src/features/auth/**`
  - `frontend/src/shared/types/user.types.ts`
  - `frontend/src/shared/api/**`
- 요구:
  - 로그인/리프레시/로봇로그인 응답 파서가 신규 계약(`user`, `robot`, `refreshToken`)을 처리
  - 기존 쿠키 기반 흐름과 충돌 없이 동작

2. Robot Settings 소비 경로 정렬
- 대상:
  - `frontend/src/pages/Settings/**`
  - `frontend/src/features/robot/**` (존재 시)
  - `frontend/src/shared/types/robot.types.ts`
- 요구:
  - `PATCH /api/robots/{robotId}/settings` 호출 경로 연결
  - 타입/폼 검증 규칙(`ttsVolume`, 시간 필드) 반영

3. 긴급 화면 미완 항목 보강
- 대상:
  - `frontend/src/pages/Emergency/EmergencyScreen.tsx`
  - `frontend/src/features/elder/**` (연락처 조회 재사용 시)
- 요구:
  - 긴급연락처 목록 표시(전화 액션 포함)
  - 데이터 미존재/오류 상태 UI 처리

4. 테스트 보강
- 대상:
  - `frontend/src/features/auth/hooks/useAuth.test.tsx`
  - `frontend/src/pages/Emergency/**` 테스트 파일(신규 가능)
- 요구:
  - 계약 파서 회귀 테스트 추가
  - 긴급연락처 렌더/액션 테스트 추가

## 검증
```bash
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P7-AGENT2.md` 작성
