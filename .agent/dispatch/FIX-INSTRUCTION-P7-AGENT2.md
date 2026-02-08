# Phase 7 수정 지시 [Agent 2]

## 브랜치
- `feature/phase7-frontend-contract-fe`

## 리뷰 결과
- `agent-2/.agent/reviews/REVIEW-RESULT-P7-AGENT2.md`: **Request Changes (Major 2)**

## API 기준 확인
- `agent-0/docs/api-specification.md` 3.1 Auth
  - 로그인 응답의 `data.user` 계약을 프론트 소비 로직에서 유지
  - 리프레시/로그인 후 역할별 라우팅 일관성 유지

## 지시 사항
1. FAMILY 라우팅 fallback 보강
- 대상: `frontend/src/features/auth/hooks/useAuth.ts`
- 조치:
  - `payload.elderId` 누락 시 `tokens.user?.elderId` fallback 사용
  - 최종 라우팅 우선순위: `payload.elderId` -> `tokens.user.elderId` -> `/elders`

2. AuthStore 사용자 파싱 fallback 보강
- 대상: `frontend/src/features/auth/store/authStore.ts`
- 조치:
  - JWT 우선 원칙은 유지하되, `email/elderId` 누락 시 `tokens.user` fallback 반영
  - `sub/role`만 있는 JWT에서도 FAMILY 사용자 `elderId`가 유실되지 않게 수정

3. 테스트 보강
- 대상:
  - `frontend/src/features/auth/hooks/useAuth.test.tsx`
  - `frontend/src/features/auth/store/authStore.test.ts` (신규 가능)
- 조치:
  - JWT `elderId` 누락 + `tokens.user.elderId` 존재 케이스 추가
  - JWT `email` 누락 + `tokens.user.email` fallback 케이스 추가

## 검증
```bash
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P7-AGENT2.md` 갱신
