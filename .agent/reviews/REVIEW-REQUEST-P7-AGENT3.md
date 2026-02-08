## 코드 리뷰 요청 [Agent 3]

### 작업 정보
- 브랜치: `feature/phase7-robot-ingest-be`
- 작업 범위: Phase 7 Robot Ingestion Backend (Round 2 수정 반영)
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | `sync()` 시작 시 write 권한(소유 사용자/로봇 본인 principal) 검증 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotCommandService.java` | 수정 | ACK 상태 전이 규칙 강화 (`PENDING->RECEIVED`만 허용) |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | `sync/ack/map` 실패 경로(권한/유효성/전이 차단) 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 수정 | `sync` 권한 실패 케이스(비소유자/불일치 robot principal) 테스트 추가 |

### 주요 변경 사항
1. `sync` 권한 검증 보강
- `POST /api/robots/{robotId}/sync` 호출 시 소유 사용자 또는 로봇 본인 principal만 허용하도록 수정했습니다.

2. `ack` 상태 전이 정합성 수정
- `PENDING -> RECEIVED`만 허용하도록 제한했습니다.
- `IN_PROGRESS/COMPLETED/FAILED/CANCELLED`는 `RECEIVED` 또는 `IN_PROGRESS`에서만 허용하도록 수정했습니다.

3. 실패 경로 테스트 보강
- `sync`: 비소유 worker/불일치 robot principal 접근 시 403 검증 추가
- `ack`: `PENDING -> COMPLETED` 차단(400) 검증 추가
- `map`: 잘못된 확장자/잘못된 rooms JSON/비소유 worker 접근 실패 케이스 추가

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `sync`가 비소유자/불일치 robot principal을 확실히 차단하는지
- [ ] `ack` 전이 규칙이 `consumePendingCommands()` 흐름(`PENDING->RECEIVED`)과 충돌하지 않는지
- [ ] `sync` 응답 확장 필드(`pendingCommands`, `scheduleReminders`, `medications`, `serverTime`) 회귀가 없는지
- [ ] `map` 실패 경로(확장자/rooms JSON/권한)가 모두 `400` 또는 `403`으로 일관 처리되는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain --rerun-tasks \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'

AGENT3_FLYWAY_PG_URL='jdbc:postgresql://localhost:5432/silverbot' \
AGENT3_FLYWAY_PG_USER='postgres' \
AGENT3_FLYWAY_PG_PASSWORD='postgres' \
./gradlew --no-daemon test --console=plain --rerun-tasks \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

### 테스트 결과
- `RobotControllerTest`: tests=40, failures=0, errors=0, skipped=0
- `RobotServiceTest`: tests=18, failures=0, errors=0, skipped=0
- `PatrolControllerTest`: tests=7, failures=0, errors=0, skipped=0
- `FlywayMigrationVerificationTest` (기본): tests=2, failures=0, errors=0, skipped=2 (환경변수 미설정)
- `FlywayMigrationVerificationTest` (PostgreSQL): tests=2, failures=0, errors=0, skipped=0

### 우려 사항 / 특별 검토 요청
- 없음
