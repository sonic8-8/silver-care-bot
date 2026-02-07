# Phase 4 Round 1 작업 지시서 (Coordinator)

## 목적
- Phase 4 범위(Map/Video)를 충돌 최소화 방식으로 착수한다.
- `docs/api-specification.md` 계약을 기준으로 백엔드/프론트/공통계약을 병렬 진행한다.

## 브랜치 정책
- Agent별 전용 브랜치:
  - Agent 1: `feature/phase4-map-room-be`
  - Agent 2: `feature/phase4-map-video-fe`
  - Agent 3: `feature/phase4-video-location-be`
  - Agent 4: `feature/phase4-contract-realtime-map`
- 공통 기준점: `origin/develop` (`341d254`)
- Push 규칙:
  - `git push -u origin <현재브랜치>`
  - 기존 브랜치 재사용/강제푸시는 이번 라운드에서 사용하지 않음

## 공통 제약
- `docs/api-specification.md`는 수정 금지(기준 문서로만 사용).
- 타 Agent 소유 파일 직접 수정 금지(필요 시 Agent 0 조정).
- `sync.sh`는 이번 라운드 범위에서 제외(코딩/머지까지만).

## Agent별 담당 범위
- Agent 1 (BE Map/Room):
  - `GET /api/elders/{elderId}/map`
  - `GET/POST/PUT/DELETE /api/robots/{robotId}/rooms`
- Agent 2 (FE Map/Video):
  - Canvas 기반 지도 화면
  - 스냅샷 갤러리 UI (`/api/patrol/{patrolId}/snapshots` 소비)
- Agent 3 (BE Video/Location):
  - 순찰 스냅샷 저장/조회 API
  - `PUT /api/robots/{robotId}/location` 반영
  - 필요한 DB 마이그레이션(비파괴 우선)
- Agent 4 (Contract/Realtime):
  - Map/Video 관련 shared 타입/파서/MSW 정합
  - 지도 위치 실시간(WebSocket) 계약 정렬 및 소비 가이드

## 머지 순서 (Round 1)
1. Agent 3 (DB/Video 기반)
2. Agent 1 (Map/Room API)
3. Agent 4 (공통계약/실시간 정렬)
4. Agent 2 (화면 통합)
5. Agent 0 문서 브랜치(`management/architect`) → `develop`

## 완료 기준 (Round 1)
- Agent 1~4 각자 `REVIEW-REQUEST-P4-AGENT{N}.md` 작성 완료
- 새 세션 리뷰 `REVIEW-RESULT-P4-AGENT{N}.md` Approve 확보
- 위 머지 순서대로 `develop` 반영 완료

