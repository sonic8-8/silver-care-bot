## 코드 리뷰 요청 [Agent 3]

### 작업 정보
- 브랜치: `feature/phase4-video-location-be`
- 작업 범위: Phase 4 Round 1 - Video/Location BE
  - `GET /api/patrol/{patrolId}/snapshots`
  - `PUT /api/robots/{robotId}/location`
  - Snapshot 저장용 DB 마이그레이션/인덱스 추가
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/resources/db/migration/V9__add_patrol_snapshot_table.sql` | 신규 | `patrol_snapshot` 테이블 및 조회 인덱스 추가 |
| `backend/src/main/java/site/silverbot/domain/patrol/PatrolSnapshot.java` | 신규 | 스냅샷 메타데이터 엔티티 |
| `backend/src/main/java/site/silverbot/domain/patrol/PatrolSnapshotRepository.java` | 신규 | 스냅샷 조회 Repository |
| `backend/src/main/java/site/silverbot/api/robot/controller/PatrolSnapshotController.java` | 신규 | `GET /api/patrol/{patrolId}/snapshots` 컨트롤러 |
| `backend/src/main/java/site/silverbot/api/robot/response/PatrolSnapshotListResponse.java` | 신규 | 스냅샷 목록 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/PatrolSnapshotResponse.java` | 신규 | 스냅샷 단건 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/service/PatrolService.java` | 수정 | 순찰 리포트 시 스냅샷 저장 + 스냅샷 조회 로직 추가 |
| `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotLocationRequest.java` | 신규 | 위치 갱신 요청 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/RobotLocationUpdateResponse.java` | 신규 | 위치 갱신 응답 DTO |
| `backend/src/main/java/site/silverbot/api/robot/controller/RobotController.java` | 수정 | `PUT /api/robots/{robotId}/location` 엔드포인트 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | 위치 업데이트 비즈니스 로직 추가 |
| `backend/src/test/java/site/silverbot/api/robot/controller/PatrolControllerTest.java` | 수정 | 스냅샷 저장/조회 및 권한 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/robot/service/PatrolServiceTest.java` | 수정 | 스냅샷 저장/조회 서비스 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | 위치 갱신 API 컨트롤러 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 수정 | 위치 갱신 서비스 테스트 추가 |
| `backend/src/test/java/site/silverbot/migration/FlywayMigrationVerificationTest.java` | 수정 | Flyway target version `9` 및 `patrol_snapshot` 검증 추가 |

### 주요 변경 사항
1. `patrol_snapshot` 저장소 도입
- 순찰 리포트(`reportPatrol`) 처리 시 `imageUrl`이 있는 항목만 별도 스냅샷 메타데이터로 저장합니다.
- 조회 성능을 위해 `(patrol_result_id, captured_at DESC)` 인덱스를 추가했습니다.

2. Snapshot 조회 API 구현
- `GET /api/patrol/{patrolId}/snapshots` 추가
- `ROLE_ROBOT`은 조회 불가(기존 elder read 정책과 동일), 보호자 계정 소유권 검증 후 반환합니다.

3. Robot 위치 갱신 API 구현
- `PUT /api/robots/{robotId}/location` 추가
- 요청 좌표/roomId/heading을 `robot` 엔티티 위치 필드에 반영하고 `{ received, serverTime }` 응답합니다.

4. 회귀 방지 테스트 보강
- 컨트롤러/서비스/Flyway 검증 테스트를 함께 추가해 계약/마이그레이션 정합을 확인했습니다.

### 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] `GET /api/patrol/{patrolId}/snapshots` 권한/소유권 검증이 기존 정책과 충돌 없는지
- [ ] `reportPatrol`에서 snapshot 저장 시 중복/누락 케이스가 없는지
- [ ] `PUT /api/robots/{robotId}/location` 요청 필드 검증(`@Valid`)이 계약과 맞는지
- [ ] Flyway `V9` 마이그레이션이 기존 스키마/테스트 환경에서 안전한지
- [ ] 테스트 커버리지가 핵심 시나리오(정상/권한) 기준으로 충분한지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.api.robot.service.PatrolServiceTest' \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

### 우려 사항 / 특별 검토 요청
- `patrol_snapshot`이 `patrol_item.image_url`와 일부 정보가 중복됩니다. 의도는 조회 성능/계약 분리이며, 중복 관리 전략(장기적으로 단일화 여부) 검토가 필요합니다.
- `PUT /location`은 현재 인증 사용자 타입 제한(예: ROBOT-only)을 두지 않았습니다. 운영 정책상 제한이 필요하면 후속 라운드에서 서비스 레벨 권한 검증을 강화해야 합니다.
