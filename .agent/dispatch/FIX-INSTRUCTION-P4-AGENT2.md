# Phase 4 Round 2 수정 지시 [Agent 2]

## 브랜치
- `feature/phase4-map-video-fe`

## 리뷰 결과
- `REVIEW-RESULT-P4-AGENT2.md`: **Request Changes (Major 1)**
- 이슈: 병렬 작업 소유권 위반 (`mocks/*`는 Agent 4 전담)

## 필수 수정
1. 아래 파일의 Agent 2 변경을 제거한다.
- `frontend/src/mocks/handlers/index.ts`
- `frontend/src/mocks/handlers/map.ts`
2. 지도/스냅샷 UI 구현 범위만 유지한다.
- 허용: `frontend/src/pages/*`, `frontend/src/features/*`, Agent 2 소유 라우팅 파일
- 금지: `frontend/src/shared/*`, `frontend/src/mocks/*`
3. Mock 변경 필요사항은 코드로 수정하지 말고 리뷰 요청서에 명시한다.
- `agent-2/.agent/reviews/REVIEW-REQUEST-P4-AGENT2.md`에 "Agent 4 반영 요청 목록" 섹션 추가

## 검증
```bash
cd frontend
npm run test -- --run --pool=threads
npm run build
npm run lint
```

## 산출물
- 수정 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P4-AGENT2.md` 갱신
