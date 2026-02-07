# Phase 4 Round 1 작업 지시 [Agent 4]

## 브랜치
- `feature/phase4-contract-realtime-map`

## 목표
1. Map/Video 계약 정렬
- shared 타입/파서/쿼리 키 정리
- `docs/api-specification.md` 기준 필드 정합 보장

2. Mock/테스트 보강
- Map/Room/Snapshot/Location 시나리오 MSW 반영
- 계약 mismatch 조기 탐지 테스트 추가

3. 실시간 위치 연계 가이드
- 위치 업데이트 WebSocket 토픽/페이로드 소비 규칙 문서화
- Agent 2가 바로 소비 가능한 훅/타입 제공

## 제약
- 도메인 API 구현은 Agent 1/3 소유 범위 존중
- 응답 계약 변경은 Agent 0 승인 후 확정

## 테스트
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P4-AGENT4.md` 작성/갱신
- Agent 2 참조용 계약 변경 요약

