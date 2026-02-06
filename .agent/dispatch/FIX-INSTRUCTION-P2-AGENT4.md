# Phase 2 수정 지시 [Agent 4]

## 대상 브랜치
`feature/phase2-notification-realtime`

## 기준 리뷰
- `agent-4/.agent/reviews/REVIEW-RESULT-P2-AGENT4.md`
- 판정: `⚠️ Request Changes` (Major 2, Minor 1)

## 필수 수정 항목
1. `markAllAsRead` 전체 unread 처리 보장
- 파일: `backend/src/main/java/site/silverbot/api/notification/service/NotificationService.java`
- `PageRequest.of(0, 500)` 1회 처리 방식 제거.
- 사용자 unread 전체를 처리하도록 bulk update 또는 반복 페이징으로 변경한다.
- API 의도(`read-all`)와 결과가 일치해야 한다.

2. `/notifications` 화면 실시간 구독 복구
- 파일:
  - `frontend/src/pages/Notification/NotificationScreen.tsx`
  - `frontend/src/shared/ui/NotificationBell.tsx`
- 알림 목록 화면에서도 `useNotificationRealtime`가 항상 마운트되도록 구조를 수정한다.
- `NotificationBell` 표시 여부에 구독 생명주기가 종속되지 않게 분리한다.

3. unread 필터 낙관적 업데이트 일관성 보강
- 파일: `frontend/src/features/notification/hooks/useNotifications.ts`
- unread 필터 상태에서 `markAsRead`/`markAllAsRead` 수행 시 읽음 항목을 즉시 목록에서 제거한다.
- refetch 전 구간에서도 필터 의미가 유지되도록 캐시 패치를 조정한다.

4. Flyway 버전 충돌 사전 해소
- 파일: `backend/src/main/resources/db/migration/V4__create_notification_tables.sql` (현 상태 기준)
- Agent 3 DB 브랜치와 병합 시 동일 버전 충돌이 발생하지 않도록 마이그레이션 버전을 재정렬한다.
- `COORDINATION-P2.md`의 `C-01` 기준을 따르고, 최종 버전 맵을 리뷰 요청서에 명시한다.

## 테스트/검증
```bash
cd backend
./gradlew test --tests "site.silverbot.api.notification.controller.NotificationControllerTest" --tests "site.silverbot.api.user.controller.MySettingsControllerTest" --tests "site.silverbot.config.StompChannelInterceptorTest"

cd frontend
npm run test -- --run src/features/notification/hooks/useNotifications.test.tsx src/features/notification/hooks/useNotificationSettings.test.tsx
npm run build
```

추가로 아래를 검증한다.
- unread 500건 초과 데이터에서 `read-all` 후 unread 0건 확인
- `/notifications` 화면에서 실시간 수신 즉시 반영 확인

## 완료 보고
1. 수정 커밋/푸시 후 `agent-4/.agent/reviews/REVIEW-REQUEST-P2-AGENT4.md` 갱신
2. Flyway 버전 재정렬 결과를 명시
3. 재리뷰 요청
