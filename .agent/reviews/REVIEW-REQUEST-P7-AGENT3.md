## 코드 리뷰 요청 [Agent 3]

### 작업 정보
- 브랜치: `feature/phase7-robot-ingest-be`
- 작업 범위: Phase 7 Robot Ingestion Backend (누락 API 구현 + sync/patrol 계약 정렬)
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java` | 수정 | Robot 누락 API 엔드포인트 추가 (`map`, `ack`, `patrol-results`, `sleep-wake`, `medication-*`) |
| `backend/src/main/java/site/silverbot/api/map/service/RobotMapUploadService.java` | 신규 | multipart 맵 업로드 검증 및 rooms upsert 처리 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotCommandService.java` | 수정 | 명령 ACK 상태 전이 검증/저장 로직 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | sync 응답 확장(`scheduleReminders`, `medications`, `serverTime`) |
| `backend/src/main/java/site/silverbot/api/robot/service/PatrolService.java` | 수정 | Vision AI용 `patrol-results` 입력 변환/저장 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotEventService.java` | 수정 | `sleep-wake`, `medication-reminder`, `medication-response` 연계 추가 |
| `backend/src/main/java/site/silverbot/domain/patrol/PatrolTarget.java` | 수정 | `APPLIANCE`, `MULTI_TAP` 호환 파싱 강화 |
| `backend/src/main/resources/db/migration/V13__add_appliance_patrol_target.sql` | 신규 | `patrol_target` enum에 `APPLIANCE` 비파괴 추가 |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotSyncResponse.java` | 수정 | sync 계약 필드 확장 |
| `backend/src/main/java/site/silverbot/domain/robot/RobotCommand.java` | 수정 | ACK 결과/result/completedAt 갱신 메서드 추가 |
| `backend/src/main/java/site/silverbot/domain/robot/RobotCommandRepository.java` | 수정 | `findByRobotIdAndCommandId` 추가 |
| `backend/src/main/java/site/silverbot/domain/schedule/ScheduleRepository.java` | 수정 | sync 일정 조회용 쿼리 메서드 추가 |
| `backend/src/main/java/site/silverbot/domain/medication/MedicationRepository.java` | 수정 | sync 복약 조회용 쿼리 메서드 추가 |
| `backend/src/main/java/site/silverbot/api/robot/request/*.java` | 신규 | 누락 API 요청 DTO 추가 (`RobotCommandAck`, `ReportSleepWake`, `ReportPatrolResults`, `MedicationReminder`, `MedicationResponse`) |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotCommandAckResponse.java` | 신규 | 명령 ACK 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotMapUploadResponse.java` | 신규 | 맵 업로드 응답 DTO |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | 신규 API + sync 확장 계약 테스트/문서 필드 갱신 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 수정 | sync 확장 필드 반환 검증 추가 |
| `backend/src/test/java/site/silverbot/api/robot/controller/PatrolControllerTest.java` | 수정 | `APPLIANCE`/`MULTI_TAP` 호환 입력 테스트 추가 |
| `backend/src/test/java/site/silverbot/migration/FlywayMigrationVerificationTest.java` | 수정 | V13 및 enum 값 검증 반영 |

### 주요 변경 사항
1. 문서 누락 Robot API 6종 구현 및 기존 도메인 서비스와 연결
2. `POST /sync` 응답을 임베디드 계약에 맞춰 확장
3. Patrol target 호환성(`APPLIANCE`, `MULTI_TAP`) 보강 및 DB enum 비파괴 마이그레이션 추가
4. 명령 ACK 상태 전이 검증 로직 도입으로 잘못된 상태 변경 차단
5. 관련 통합/서비스/Flyway 테스트 갱신 완료

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `commands/{commandId}/ack` 상태 전이 규칙이 기존 명령 생성/소비 흐름과 충돌하지 않는지
- [ ] `sync` 확장 필드(`scheduleReminders`, `medications`, `serverTime`)가 계약과 타입 일치하는지
- [ ] `APPLIANCE` enum 추가 마이그레이션이 기존 `OUTLET`/`MULTI_TAP` 저장 경로에 회귀를 만들지 않는지
- [ ] map 업로드 시 권한/확장자/rooms 파싱 실패 케이스 처리 적절한지
- [ ] 신규 API 테스트 커버리지 및 에러 핸들링이 충분한지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

### 테스트 결과
- `BUILD SUCCESSFUL`

### 우려 사항 / 특별 검토 요청
- `map` 업로드는 현재 파일 영구 저장소 연동 없이 메타 검증 + room upsert만 수행합니다. 추후 실제 맵 파일 보관 경로가 확정되면 저장 어댑터 연동이 필요합니다.
- `patrol-results`의 `overallStatus`는 현재 입력을 신뢰하지 않고 기존 계산 규칙(`items` 기반)으로 처리합니다.
