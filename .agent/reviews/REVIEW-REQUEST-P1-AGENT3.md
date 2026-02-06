# 코드 리뷰 요청 [Agent 3] - Phase 1 (ROBOT)

## 작업 정보
- **브랜치**: `feature/phase1-robot`
- **작업 범위**: Phase 1 Robot 도메인 구현 + v7 수정 지시 반영
- **작업 기간**: 2026-02-03 ~ 2026-02-06
- **대상 커밋**:
  - `9d41226` fix(robot): 리뷰 피드백 반영 [Agent 3]
  - `3293b95` fix(robot): 리뷰 지시사항 반영 [Agent 3]
  - `c15f79f` fix(robot): ApiResponse 정합 및 notifier 빈 안정화 [Agent 3]

## 변경 파일 목록

### A. 주요 구현 파일 (기존 Phase 1 작업)
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java` | 신규 | Robot API 컨트롤러 (`/status`, `/commands`, `/sync`, `/lcd`) |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | 네트워크 상태 갱신/동기화 처리 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotCommandService.java` | 수정 | 명령 생성/소비 로직 |
| `backend/src/main/java/site/silverbot/domain/robot/RobotCommandRepository.java` | 수정 | Pending 명령 FIFO 정렬 (`issuedAt`, `id`) |
| `backend/src/main/java/site/silverbot/scheduler/RobotConnectionScheduler.java` | 신규 | 오프라인 판정 스케줄러 |
| `backend/src/main/resources/db/migration/V3__add_robot_offline_notified_at.sql` | 신규 | 오프라인 알림 중복 방지 컬럼 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 신규 | Controller 테스트 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 신규 | Robot 서비스 테스트 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotCommandServiceTest.java` | 신규 | 명령 처리/FIFO 테스트 |
| `frontend/src/pages/Robot/RobotControlScreen.tsx` | 수정 | 로봇 제어 화면 |
| `frontend/src/features/robot-control/**` | 신규/수정 | Robot control UI/API/hook/test |

### B. 이번 리뷰 반영 파일 (v7 지시 반영)
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/domain/robot/RobotRepository.java` | 수정 | `findByElderIdIn(List<Long> elderIds)` 추가 (Agent 2 요청 반영) |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotCommandServiceTest.java` | 수정 | 동일 `issuedAt` 시 `id` 오름차순 정렬 테스트 추가 |
| `backend/src/main/java/site/silverbot/api/common/ApiResponse.java` | 수정 | record accessor 충돌 해소: 무인자 메서드 `success()` → `ok()` |
| `backend/src/main/java/site/silverbot/api/robot/service/NoopRobotStatusNotifier.java` | 수정 | 기본 notifier 빈 등록 안정화 (`@ConditionalOnMissingBean` 제거) |

## 주요 변경 사항
1. Robot API/스케줄러/도메인 로직 기본 구현 완료
2. 이전 리뷰 Major 반영 완료
- `updateNetworkStatus` 트랜잭션 명시
- Pending 명령 정렬 2차 키(`issuedAt`, `id`) 적용
3. v7 지시 반영 완료
- `RobotRepository.findByElderIdIn(...)` 추가
- 동일 `issuedAt` 정렬 안정성 테스트 추가
4. 통합 컴파일 블로커 해소
- `ApiResponse` 무인자 static 메서드명 충돌 수정
5. 테스트 컨텍스트 안정화
- `RobotStatusNotifier` 기본 구현 빈 주입 보장

## 검증 포인트 (리뷰어 확인 요청)
- Pending 명령 FIFO가 동일 `issuedAt` 상황에서도 안정적으로 보장되는지
- `RobotRepository.findByElderIdIn` 추가가 Elder 조회 플로우와 충돌 없는지
- `ApiResponse.ok()` 변경이 공통 응답 컨벤션과 일치하는지
- `NoopRobotStatusNotifier` 기본 빈 전략이 WebSocket 구현체와 충돌 없는지

## 테스트 명령어
```bash
# Backend (Agent 3 범위)
cd backend && ./gradlew test --tests "site.silverbot.api.robot.service.RobotCommandServiceTest"
cd backend && ./gradlew test --tests "site.silverbot.api.robot.service.RobotServiceTest"

# Frontend
cd frontend && npm run test
```

## 테스트 실행 결과
- `./gradlew test --tests "site.silverbot.api.robot.service.RobotCommandServiceTest"` ✅ PASS
- `./gradlew test --tests "site.silverbot.api.robot.service.RobotServiceTest"` ✅ PASS
- `./gradlew test --tests "site.silverbot.api.robot.RobotControllerTest"` ❌ FAIL (`SnippetException`)
- Frontend 이전 실행 결과: `npm run test` ✅ PASS

## 우려 사항 / 특별 검토 요청
- `/elders/{id}` 응답의 `robot.id` 계약이 없는 경우 FE에서 미등록 처리됨 (Agent 2/4와 계약 합의 필요)
- 현재 브랜치는 원격 대비 `ahead 3` 상태이며, 이 환경에서는 GitHub 인증 부재로 push 미완료

## Agent 0 추가 전달 사항 (리뷰 결과 반영)
- 리뷰 결과 기준 **Major 1건으로 현재 상태는 Request Changes**입니다.
- 블로킹 이슈: `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java:116`
  - `sendRobotCommand()` REST Docs 스니펫 누락 (`params.location`)으로 테스트 실패
  - 재현: `./gradlew test --tests "site.silverbot.api.robot.RobotControllerTest"`
- WebSocket notifier 구현체 추가 시 `RobotStatusNotifier` 다중 빈 충돌 위험이 있으므로, Agent 4 머지 시점에 `@Primary` 또는 `@ConditionalOnMissingBean` 전략 재조율이 필요합니다.
