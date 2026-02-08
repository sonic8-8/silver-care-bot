# Phase 7 수정 지시 [Agent 2]

## 브랜치
- `feature/phase7-frontend-contract-fe`

## 리뷰 결과
- `agent-2/.agent/reviews/REVIEW-RESULT-P7-AGENT2.md`: **Approve**

## API 기준 확인
- `agent-0/docs/api-specification.md` 3.1 Auth
  - 로그인 응답의 `data.user` 계약 소비 정렬 확인
  - 리프레시/로그인 후 역할별 라우팅 일관성 유지 확인

## 지시 사항
1. 추가 코드 수정 없음
- Round 1 지적사항(FAMILY 라우팅/AuthStore fallback) 해소 확인.

2. 병합 대기
- Agent 0 머지 순서에 따라 병합 진행.

## 참고
- 리뷰 기준 커밋: `a91f88d`
