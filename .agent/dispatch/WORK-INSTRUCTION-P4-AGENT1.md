# Phase 4 Round 1 작업 지시 [Agent 1]

## 브랜치
- `feature/phase4-map-room-be`

## 목표
1. Map 조회 API 구현
- `GET /api/elders/{elderId}/map`

2. Room CRUD API 구현
- `GET /api/robots/{robotId}/rooms`
- `POST /api/robots/{robotId}/rooms`
- `PUT /api/robots/{robotId}/rooms/{roomId}`
- `DELETE /api/robots/{robotId}/rooms/{roomId}`

3. 권한/에러 규격 정렬
- 기존 Auth/ApiResponse 규약 재사용
- `docs/api-specification.md` 응답 필드와 정합 유지

## 제약
- DB 스키마 변경이 필요하면 Agent 3/Agent 0에 먼저 공유 후 진행
- Agent 3/4 소유 영역 직접 수정 금지

## 테스트
```bash
cd backend
./gradlew --no-daemon test --console=plain
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P4-AGENT1.md` 작성/갱신

