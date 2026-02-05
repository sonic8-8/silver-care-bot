# 코드 리뷰 요청 [Agent 3] - Phase 1 (ROBOT)

## 작업 정보
- **브랜치**: `feature/phase1-robot`
- **작업 범위**: Phase 1 Robot 도메인 구현 + 후속 리뷰 수정 반영
- **작업 기간**: 2026-02-03 ~ 2026-02-05

## 변경 파일 목록
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java` | 신규 | Robot API 컨트롤러 (`/status`, `/commands`, `/sync`, `/lcd`) |
| `backend/src/main/java/site/silverbot/api/robot/request/RobotCommandRequest.java` | 신규 | 명령 요청 DTO |
| `backend/src/main/java/site/silverbot/api/robot/request/RobotSyncRequest.java` | 신규 | 로봇 동기화 요청 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/CommandResponse.java` | 신규 | 명령 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotLcdResponse.java` | 신규 | LCD 상태 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotStatusResponse.java` | 신규 | 로봇 상태 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotSyncResponse.java` | 신규 | 동기화 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 신규 | 로봇 상태/동기화 서비스 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotCommandService.java` | 신규 | 명령 생성/소비 서비스 + FIFO 정렬 반영 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotStatusNotifier.java` | 신규 | 상태 변경 알림 인터페이스 |
| `backend/src/main/java/site/silverbot/api/robot/service/NoopRobotStatusNotifier.java` | 신규 | 알림 미구현용 NOOP |
| `backend/src/main/java/site/silverbot/domain/robot/Robot.java` | 수정 | 오프라인 알림/상태 갱신 로직 추가 |
| `backend/src/main/java/site/silverbot/domain/robot/RobotCommand.java` | 수정 | 명령 모델 보강 |
| `backend/src/main/java/site/silverbot/domain/robot/RobotCommandRepository.java` | 수정 | Pending 명령 FIFO 정렬 보장 |
| `backend/src/main/java/site/silverbot/scheduler/RobotConnectionScheduler.java` | 신규 | 오프라인 판정 스케줄러 |
| `backend/src/main/resources/db/migration/V3__add_robot_offline_notified_at.sql` | 신규 | 오프라인 알림 중복 방지 컬럼 추가 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 신규 | REST Docs용 컨트롤러 테스트 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 신규 | 로봇 서비스 테스트 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotCommandServiceTest.java` | 신규 | 명령 처리 + FIFO 정렬 테스트 |
| `backend/src/main/java/site/silverbot/SilverBotApplication.java` | 수정 | 스케줄러 동작 및 설정 보강 |
| `frontend/src/pages/Robot/RobotControlScreen.tsx` | 수정 | 로봇 제어 화면 + 미등록 상태 UX 개선 |
| `frontend/src/features/robot-control/api/robotApi.ts` | 신규 | 로봇 API 호출 모듈 |
| `frontend/src/features/robot-control/components/BatteryIndicator.tsx` | 신규 | 배터리 표시 컴포넌트 |
| `frontend/src/features/robot-control/components/CommandButtons.tsx` | 신규 | 명령 버튼 UI |
| `frontend/src/features/robot-control/components/ConnectionStatus.tsx` | 신규 | 연결 상태 표시 |
| `frontend/src/features/robot-control/components/RobotStatusCard.tsx` | 신규 | 로봇 상태 카드 |
| `frontend/src/features/robot-control/components/RoomSelector.tsx` | 신규 | 이동 목적지 선택 |
| `frontend/src/features/robot-control/components/TtsInput.tsx` | 신규 | TTS 입력 |
| `frontend/src/features/robot-control/hooks/useRobotCommand.ts` | 신규 | 명령 호출 훅 |
| `frontend/src/features/robot-control/hooks/useRobotCommand.test.tsx` | 신규 | 명령 훅 테스트 |
| `frontend/src/features/robot-control/hooks/useRobotStatus.ts` | 신규 | 상태 조회 훅 |
| `frontend/src/features/robot-control/hooks/useRobotStatus.test.tsx` | 신규 | 상태 훅 테스트 |
| `frontend/src/test/setup.ts` | 수정 | 테스트 환경 설정 보강 |
| `frontend/src/test/utils.tsx` | 신규 | 테스트 유틸 |

## 주요 변경 사항
1. Robot API 구현 (`/status`, `/commands`, `/sync`, `/lcd`) 및 로봇 오프라인 판정 스케줄러 추가
2. 명령 처리 파라미터 검증 강화 + Pending 명령 FIFO 정렬 보장
3. 오프라인 알림 중복 방지 (DB 컬럼 + 도메인 로직)
4. 로봇 제어 UI/훅/테스트 추가 및 미등록 상태 UX 개선
5. elderId → robotId 매핑 보정 (elder 상세 응답의 `robot.id` 사용 전제)

## 검증 포인트 (리뷰어 확인 요청)
- [ ] 오프라인 알림 중복 방지 로직이 상태 변경과 충돌하지 않는지
- [ ] Pending 명령 FIFO 정렬이 DB/서비스 레벨에서 보장되는지
- [ ] `sync` 빈 바디 허용 변경이 보안/계약과 충돌하지 않는지
- [ ] 명령 파라미터 검증 로직이 과도하거나 누락된 부분이 없는지
- [ ] FE 로봇 제어 화면에서 로봇 미등록 상태 UX가 적절한지

## 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

## 테스트 실행 결과
- `./gradlew test --tests site.silverbot.api.robot.service.RobotCommandServiceTest`
  - 실패: `JAVA_HOME is not set` (로컬 JDK 미설정)

## 우려 사항 / 특별 검토 요청
- MSW elder 상세 응답에 `robot.id` 누락 시 로봇 제어 화면이 비활성화될 수 있음
- 명령 처리 순서(FIFO) 보장 방식이 요구사항과 일치하는지 확인 필요
