# Phase 2 작업 지시 [Agent 4]

## 브랜치
`feature/phase2-notification-realtime`

## 담당 범위
- PLAN 2.6 알림 시스템(Backend)
- PLAN 2.7 알림 시스템(Frontend)
- WebSocket 실시간 알림 연동

## 구현 항목
1. Notification Backend
- `GET /api/notifications` (페이지네이션/읽음필터)
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`
- `GET /api/users/me/settings`
- `PATCH /api/users/me/settings`
- 알림 생성 서비스(긴급/복약/일정/활동/시스템)
2. Realtime
- 사용자 토픽(`/topic/user/{userId}/notifications`) 실시간 발송
- 토큰/권한 검증 하에 구독 가능 상태 점검
3. Notification Frontend
- 알림 목록/필터/전체읽음
- 헤더 알림벨(안읽음 뱃지 + 최근 5개)
- WebSocket 수신 시 즉시 갱신

## 비범위
- Dashboard 메인 UI 구현(Agent 2)
- Medication core backend 집계/CRUD 완성(Agent 1)

## 완료 기준
- API + WS 이벤트가 UI에 실시간 반영.
- 중복 수신/재연결 회귀 방지.

## 테스트 명령
```bash
# Backend
cd backend
./gradlew test

# Frontend
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P2-AGENT4.md` 작성
