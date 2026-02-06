## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase2-notification-realtime`
- 작업 범위: P2 알림/실시간 구현 + 1차 리뷰(`REVIEW-RESULT-P2-AGENT4.md`) 수정 반영
- 리뷰 라운드: Round 2 (Request Changes 반영 후 재요청)

### 이번 라운드 핵심 수정 파일
| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `backend/src/main/java/site/silverbot/domain/notification/NotificationRepository.java` | 수정 | 사용자 unread 전체 읽음 처리용 bulk update 추가 (`markAllAsReadByUserId`) |
| `backend/src/main/java/site/silverbot/api/notification/service/NotificationService.java` | 수정 | `read-all`을 500건 제한 없이 전체 처리하도록 변경 |
| `backend/src/test/java/site/silverbot/api/notification/controller/NotificationControllerTest.java` | 수정 | unread 550건 시나리오 추가(전체 읽음 후 unread=0 검증) |
| `frontend/src/pages/_components/GuardianAppContainer.tsx` | 수정 | `useNotificationRealtime`를 컨테이너 레벨로 이동(벨 표시 여부와 구독 분리) |
| `frontend/src/shared/ui/NotificationBell.tsx` | 수정 | realtime hook 의존 제거(표시 컴포넌트 역할로 축소) |
| `frontend/src/features/notification/hooks/useNotifications.ts` | 수정 | unread 필터에서 낙관적 업데이트 시 읽음 항목 즉시 제거 |
| `frontend/src/pages/_components/GuardianAppContainer.test.tsx` | 신규 | 벨 숨김 상태(`showNotificationBell=false`)에서도 realtime hook 마운트 검증 |
| `backend/src/main/resources/db/migration/V3__add_robot_offline_notified_at.sql` | 삭제(리네임) | Flyway 버전 재정렬 (`V4`로 이동) |
| `backend/src/main/resources/db/migration/V4__add_robot_offline_notified_at.sql` | 신규(리네임) | Agent 3 버전 맵 정렬 반영 |
| `backend/src/main/resources/db/migration/V6__align_notification_schema.sql` | 신규(리네임+수정) | Agent 3 `V5` 이후 notification 스키마 정렬/호환(alter) |

### 수정 사항 요약 (리뷰 지적 대응)
1. **[Major] `read-all` 500건 제한 제거**
- 기존: `PageRequest.of(0, 500)` 1회 조회
- 변경: DB bulk update로 사용자 unread 전체 읽음 처리

2. **[Major] `/notifications` 화면 실시간 구독 복구**
- 기존: `NotificationBell` 마운트 시에만 `useNotificationRealtime` 동작
- 변경: `GuardianAppContainer`에서 항상 구독하여 벨 숨김과 무관하게 유지

3. **[Minor] unread 필터 낙관적 업데이트 일관성**
- 기존: unread 탭에서 읽음 처리 직후 항목이 잠시 남음
- 변경: unread 필터 상태에서는 캐시 패치 시 읽음 항목 즉시 제거

4. **Flyway 버전 충돌 사전 정렬 (C-01 Follow)**
- 재정렬 결과(Agent 3 맵 기준):
  - `V1__create_enums.sql`
  - `V2__create_core_tables.sql`
  - `V3__add_refresh_token_to_users.sql`
  - `V4__add_robot_offline_notified_at.sql`
  - `V5__create_phase2_core_tables.sql` *(Agent 3 브랜치 기준)*
  - `V6__align_notification_schema.sql` *(Agent 4)*
- `V6`은 `notification` 테이블이 이미 존재해도/없어도 동작하도록 정렬 호환 스크립트로 작성

### 검증 포인트 (리뷰어 확인 요청)
- [ ] `PATCH /api/notifications/read-all`가 unread 개수와 1:1로 일치하는지
- [ ] `/notifications` 페이지에서 `showNotificationBell=false` 상태에서도 WS 수신 반영되는지
- [ ] unread 탭에서 낙관적 업데이트 후 읽음 항목 잔존하지 않는지
- [ ] Flyway 맵(`V1~V6`)이 Agent 3 DB 브랜치와 충돌 없이 결합되는지

### 테스트 명령어
```bash
# Backend (지시서 기준)
cd backend
./gradlew test --tests "site.silverbot.api.notification.controller.NotificationControllerTest" --tests "site.silverbot.api.user.controller.MySettingsControllerTest" --tests "site.silverbot.config.StompChannelInterceptorTest"

# Frontend (지시서 + 실시간 구독 검증 추가)
cd frontend
npm run test -- --run src/features/notification/hooks/useNotifications.test.tsx src/features/notification/hooks/useNotificationSettings.test.tsx src/pages/_components/GuardianAppContainer.test.tsx
npm run build
```

### 테스트 실행 결과
- Backend 타깃 테스트: ✅ BUILD SUCCESSFUL
- Frontend 타깃 테스트: ✅ 3 files, 5 tests passed
- Frontend build: ✅ build 성공

### 우려 사항 / 특별 검토 요청
- `V5__create_phase2_core_tables.sql`는 Agent 3 브랜치 소유 기준입니다. 본 브랜치 단독이 아니라 Agent 3 반영본과 함께 최종 Flyway validate/migrate 재검증 부탁드립니다.
