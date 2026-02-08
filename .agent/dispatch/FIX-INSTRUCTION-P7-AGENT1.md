# Phase 7 수정 지시 [Agent 1]

## 브랜치
- `feature/phase7-auth-settings-be`

## 리뷰 결과
- `agent-1/.agent/reviews/REVIEW-RESULT-P7-AGENT1.md`: **Approve**

## API 기준 확인
- `agent-0/docs/api-specification.md` 3.1 Auth
  - `POST /api/auth/login`: `accessToken`, `refreshToken`, `expiresIn`, `user`
  - `POST /api/auth/refresh`: refresh token 기반 갱신

## 지시 사항
1. 추가 코드 수정 없음
- Round 1 지적사항(Refresh 토큰 회전 보장) 해소 확인.

2. 병합 대기
- Agent 0 머지 순서에 따라 병합 진행.

## 참고
- 리뷰 기준 커밋: `40a9fa8`
