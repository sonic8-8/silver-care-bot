# Phase 4 Round 1 작업 지시 [Agent 3]

## 브랜치
- `feature/phase4-video-location-be`

## 목표
1. Snapshot 저장/조회 백엔드 구현
- 순찰 시 이미지 메타데이터 저장
- 조회 API:
  - `GET /api/patrol/{patrolId}/snapshots`

2. 로봇 위치 갱신 API 구현
- `PUT /api/robots/{robotId}/location`

3. DB 마이그레이션/성능 보강
- 필요한 테이블/인덱스 추가(비파괴 우선, Flyway 규칙 준수)
- 조회 성능에 필요한 최소 인덱스 반영

## 제약
- Map/Room API 본체는 Agent 1 담당(중복 구현 금지)
- 계약 필드 변경 시 Agent 4/Agent 0 사전 공유

## 테스트
```bash
cd backend
./gradlew --no-daemon test --console=plain
```

## 산출물
- 코드 커밋/푸시
- `agent-3/.agent/reviews/REVIEW-REQUEST-P4-AGENT3.md` 작성/갱신

