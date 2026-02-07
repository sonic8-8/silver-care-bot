# Phase 4 Round 1 작업 지시 [Agent 2]

## 브랜치
- `feature/phase4-map-video-fe`

## 목표
1. Map 화면 구현
- Canvas 기반 맵 렌더링
- 로봇 현재 위치 표시(실시간 값 반영 가능 구조)

2. Snapshot 화면 구현
- 순찰 스냅샷 목록/미리보기 UI
- 백엔드 API 연동:
  - `GET /api/patrol/{patrolId}/snapshots`

3. 기존 화면 규약 유지
- 라우팅/상태관리/TanStack Query 패턴 준수

## 제약
- shared 타입/웹소켓 기반은 Agent 4 계약 우선
- API 스펙 해석 불일치는 Agent 0에 즉시 보고

## 테스트
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P4-AGENT2.md` 작성/갱신

