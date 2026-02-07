## 코드 리뷰 요청 [Agent 3]

### 작업 정보
- 브랜치: `feature/phase4-video-location-be`
- 작업 라운드: Phase 4 Round 2 (Fix)
- 기준 지시서:
  - `agent-0/.agent/dispatch/COORDINATION-P4.md` (Round 2 조정 포함)
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P4-AGENT3.md`

### 리뷰 결과 반영 사항
1. **Major 반영**: `PUT /api/robots/{robotId}/location` 서비스 레벨 권한/소유권 검증 추가
- `ROLE_ROBOT`: principal robotId와 path robotId 불일치 시 `403`
- 사용자 토큰: 해당 로봇 소유 보호자 계정만 허용, 그 외 `403`

2. **Minor 반영**: 스냅샷 조회 정렬키 인덱스 보강
- 조회 정렬: `captured_at DESC, id DESC`
- 신규 Flyway: `(patrol_result_id, captured_at DESC, id DESC)` 보강 인덱스 추가

### 변경 파일 (Round 2)
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | `updateLocation` 접근 제어(ROLE_ROBOT principal 일치 + 사용자 소유권 검증) 추가 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | 위치 갱신 성공/권한 거부 케이스 보강 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 수정 | 서비스 레벨 접근 제어 테스트 보강 |
| `backend/src/main/resources/db/migration/V10__add_patrol_snapshot_sort_index.sql` | 신규 | 스냅샷 정렬키 일치 인덱스 추가 |
| `backend/src/test/java/site/silverbot/migration/FlywayMigrationVerificationTest.java` | 수정 | Flyway target version `10` 반영 |

### 주요 구현 포인트
1. `RobotService.updateLocation()`
- `validateLocationWriteAccess` 추가
- 인증 미존재/익명 차단
- `ROLE_ROBOT`일 때 principal 파싱 및 robotId 일치 강제
- 사용자 principal은 `CurrentUserService`로 조회 후 소유 elder 매핑 검증

2. 인덱스 마이그레이션
- 기존 `V9`는 유지하고, `V10`에서 정렬키 보강 인덱스를 비파괴로 추가

### 검증 포인트 (리뷰어 확인 요청)
- [ ] `PUT /location`이 인증만으로 통과되지 않는지
- [ ] `ROLE_ROBOT` mismatch 요청이 `403`으로 차단되는지
- [ ] 비소유 사용자 요청이 `403`으로 차단되는지
- [ ] Flyway `V10` 추가가 기존 스키마와 충돌 없는지
- [ ] 테스트가 Round 2 요구사항(Major/Minor)을 충분히 커버하는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest' \
  --tests 'site.silverbot.api.robot.controller.PatrolControllerTest' \
  --tests 'site.silverbot.api.robot.service.PatrolServiceTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

### 실행 결과
- 위 명령 실행 결과: `BUILD SUCCESSFUL`
