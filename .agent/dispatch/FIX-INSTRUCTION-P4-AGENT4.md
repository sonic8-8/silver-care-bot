# Phase 4 Round 2 수정 지시 [Agent 4]

## 브랜치
- `feature/phase4-contract-realtime-map`

## 리뷰 결과
- `REVIEW-RESULT-P4-AGENT4.md`: **Request Changes (Major 1, Minor 1)**

## 필수 수정 (Major)
1. 위치 업데이트 요청 파서를 백엔드 계약과 정렬한다.
- 대상: `frontend/src/shared/types/map.types.ts`
- 함수: `parseRobotLocationUpdateRequest`
- 요구:
  - `x`, `y`, `roomId`는 필수 유지
  - `heading`, `timestamp`는 optional/nullable 허용
2. Agent 2가 제거한 mock 변경 필요분을 Agent 4 브랜치에서 반영한다.
- 대상: `frontend/src/mocks/handlers/index.ts`
- 대상: `frontend/src/mocks/handlers/map.ts`
- 범위: Map/Snapshot/Location 계약 검증에 필요한 최소 변경만 적용

## 필수 수정 (Minor)
1. optional 필드 회귀 테스트를 추가한다.
- 대상: `frontend/src/shared/types/map.types.test.ts`
- 케이스: `heading`/`timestamp` 생략 요청이 파싱 성공

## 검증
```bash
cd frontend
npm run test -- --run src/shared/types/map.types.test.ts src/shared/websocket/useRobotLocationRealtime.test.tsx
npm run test -- --run --pool=threads
npm run build
npm run lint
```

## 산출물
- 수정 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P4-AGENT4.md` 갱신
- Agent 2가 바로 반영 가능한 mock/계약 변경 요약 첨부
