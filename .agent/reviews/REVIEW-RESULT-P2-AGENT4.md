## 코드 리뷰 결과 [Agent 4 -> Reviewer Codex]

### 요약
- 전체 평가: ⚠️ Request Changes
- Critical 이슈: 0건
- Major 이슈: 2건
- Minor 이슈: 1건

### 발견된 이슈

#### [Major] `markAllAsRead`가 최대 500건까지만 처리됨
- 파일: `backend/src/main/java/site/silverbot/api/notification/service/NotificationService.java:83`
- 근거:
  - `PageRequest.of(0, 500)`으로 첫 페이지만 조회하고(`:88`), 해당 페이지 content만 순회해서 읽음 처리합니다(`:92`).
  - unread가 500건 초과하면 나머지는 읽음 처리되지 않는데, API 이름/의도(`read-all`)와 불일치합니다.
- 영향:
  - 대량 알림 사용자에서 `PATCH /api/notifications/read-all` 호출 후 일부 unread가 남아 기능 오작동.

#### [Major] `/notifications` 화면에서 실시간 구독이 끊김
- 파일: `frontend/src/pages/Notification/NotificationScreen.tsx:58`
- 파일: `frontend/src/shared/ui/NotificationBell.tsx:42`
- 근거:
  - 실시간 구독 훅(`useNotificationRealtime`)은 `NotificationBell` 내부에서만 호출됩니다(`NotificationBell.tsx:42`).
  - 그런데 알림 목록 페이지는 `showNotificationBell={false}`로 벨을 숨겨 구독 훅이 마운트되지 않습니다(`NotificationScreen.tsx:58`).
- 영향:
  - 알림 목록 화면 자체에서는 새 알림의 실시간 반영이 되지 않아 "실시간 알림 연동" 요구와 동작이 어긋납니다.

#### [Minor] unread 필터에서 낙관적 업데이트 직후 목록 일관성이 깨짐
- 파일: `frontend/src/features/notification/hooks/useNotifications.ts:13`
- 파일: `frontend/src/features/notification/hooks/useNotifications.ts:35`
- 근거:
  - `patchReadInPages`/`patchReadAllInPages`는 unread 목록에서 항목을 제거하지 않고 `isRead=true`만 바꿉니다.
  - `onSettled` 재조회 전까지 "안읽음" 탭에 읽음 항목이 잠시 노출됩니다.
- 영향:
  - 짧은 구간이지만 필터 의미와 UI가 불일치.

### 테스트 실행 결과
```bash
# Backend
cd backend && ./gradlew test --tests "site.silverbot.api.notification.controller.NotificationControllerTest" --tests "site.silverbot.api.user.controller.MySettingsControllerTest" --tests "site.silverbot.config.StompChannelInterceptorTest"
# 결과: BUILD SUCCESSFUL

# Frontend
cd frontend && npm run test -- --run src/features/notification/hooks/useNotifications.test.tsx src/features/notification/hooks/useNotificationSettings.test.tsx
# 결과: 2 files, 4 tests passed

cd frontend && npm run build
# 결과: build 성공
```

### 추가 확인 메모
- `backend/src/main/resources/db/migration/`에 `V3__add_refresh_token_to_users.sql`, `V3__add_robot_offline_notified_at.sql`가 공존합니다.
- 이번 변경의 직접 회귀로 단정하긴 어렵지만, 통합 브랜치에서 Flyway 버전 충돌 리스크는 계속 존재합니다.

### 최종 의견
- 위 Major 2건 수정 후 재리뷰 권장.

---

## Agent 4 추가 코멘트 (Agent 0 전달용)

### 이슈 수용 여부
- Major 2건, Minor 1건 모두 **수용**합니다.
- 현재 코드 기준으로 리뷰 지적 내용과 실제 구현이 일치함을 확인했습니다.

### 수정 계획
1. `markAllAsRead` 전체 처리 보장
- `NotificationService.markAllAsRead`에서 `PageRequest.of(0, 500)` 기반 1페이지 처리 로직 제거
- 사용자별 unread 전체를 처리하도록 repository bulk update 또는 반복 페이징 방식으로 변경

2. `/notifications` 화면 실시간 구독 보장
- `NotificationScreen` 진입 시에도 `useNotificationRealtime`가 항상 마운트되도록 변경
- `NotificationBell` 의존 구조를 제거하고, 화면 단/앱 단 공통 구독 포인트로 정리

3. unread 필터 낙관적 업데이트 일관성
- `isRead === false` 필터에서 `markAsRead`/`markAllAsRead` 낙관 업데이트 시 읽음 항목 즉시 목록에서 제거
- invalidate 전 구간에서도 탭 의미가 유지되도록 캐시 패치 로직 보강

### 재검증 계획
```bash
cd backend && ./gradlew test --tests "site.silverbot.api.notification.controller.NotificationControllerTest" --tests "site.silverbot.api.user.controller.MySettingsControllerTest" --tests "site.silverbot.config.StompChannelInterceptorTest"
cd frontend && npm run test -- --run src/features/notification/hooks/useNotifications.test.tsx src/features/notification/hooks/useNotificationSettings.test.tsx
cd frontend && npm run build
```

---

## Agent 4 후속 업데이트 (수정 반영 완료)

### 반영 상태
- Major 2건, Minor 1건 **모두 수정 반영 완료**.

### 반영 요약
1. `markAllAsRead` 전체 unread 처리 보장
- `NotificationRepository`에 bulk update 메서드(`markAllAsReadByUserId`) 추가
- `NotificationService.markAllAsRead`가 전체 unread를 일괄 읽음 처리하도록 변경
- `NotificationControllerTest`에 unread 550건 시나리오 추가(읽음 후 unread=0 검증)

2. `/notifications` 화면 실시간 구독 복구
- `useNotificationRealtime`를 `NotificationBell`에서 분리
- `GuardianAppContainer` 레벨에서 항상 마운트되도록 이동
- 벨 숨김(`showNotificationBell=false`) 상태에서도 구독 유지 테스트 추가

3. unread 필터 낙관적 업데이트 일관성 보강
- `useNotifications` 캐시 패치 로직에서 unread 탭(`isRead=false`)일 때
  읽음 처리된 항목을 즉시 제거하도록 수정

4. Flyway 버전 충돌 사전 정렬 (C-01 follow)
- `V3__add_robot_offline_notified_at.sql` → `V4__add_robot_offline_notified_at.sql`로 재정렬
- 알림 스키마는 `V6__align_notification_schema.sql`로 정렬(Agent 3 `V5` 이후)
- `V6`는 기존/신규 DB 상태 모두 대응하도록 호환 DDL/ALTER 형태로 구성

### 재검증 결과
```bash
# Backend
cd backend && ./gradlew test --tests "site.silverbot.api.notification.controller.NotificationControllerTest" --tests "site.silverbot.api.user.controller.MySettingsControllerTest" --tests "site.silverbot.config.StompChannelInterceptorTest"
# 결과: BUILD SUCCESSFUL

# Frontend
cd frontend && npm run test -- --run src/features/notification/hooks/useNotifications.test.tsx src/features/notification/hooks/useNotificationSettings.test.tsx src/pages/_components/GuardianAppContainer.test.tsx
# 결과: 3 files, 5 tests passed

cd frontend && npm run build
# 결과: build 성공
```

### Agent 0 전달 메모
- 현재 상태: **재리뷰 요청 가능**
- 참고: 최종 Flyway validate/migrate는 Agent 3의 `V5__create_phase2_core_tables.sql` 반영본과 함께 통합 브랜치에서 재확인 필요
