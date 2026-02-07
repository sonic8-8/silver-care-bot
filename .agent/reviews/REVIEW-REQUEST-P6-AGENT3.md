## 코드 리뷰 요청 [Agent 3]

### 작업 정보
- 브랜치: `feature/phase6-lcd-data-quality-be`
- 작업 라운드: Phase 6 Round 1
- 기준 지시서:
  - `agent-0/.agent/dispatch/COORDINATION-P6.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P6-AGENT3.md`

### 작업 요약
1. 이벤트 `type/action` 조합 검증 강화
- `RobotEventService`에 허용 타입/액션 매트릭스를 추가했습니다.
- 허용되지 않은 타입, 허용되지 않은 액션, 조합 불일치(`TAKE + WAKE_UP` 등)를 `IllegalArgumentException`으로 차단해 `400 INVALID_REQUEST`로 일관 처리되도록 했습니다.
- `BUTTON/LCD_BUTTON` 타입은 `action` 필수로 강제했습니다.

2. 액션 분기별 부수효과 정리
- `TAKE`: 기존과 동일하게 복약 기록 upsert 후 `MEDICATION_TAKEN` activity 기록.
- `LATER`: 복약 연기 알림 생성 + 카운트 증가.
- `CONFIRM`: 이벤트만 저장하고 추가 부수효과 없이 종료.
- `EMERGENCY`: `EMERGENCY` activity 기록.

3. 저장 계층 품질 보강
- `robot_lcd_event`의 액션 기반 로봇 단위 조회/집계 경로를 위해 인덱스 추가:
  - `idx_robot_lcd_event_robot_action_occurred (robot_id, event_action, occurred_at DESC, id DESC)`
- Flyway 검증 테스트의 타겟 버전을 `12`로 업데이트하고 신규 인덱스 존재를 검증하도록 보강했습니다.

4. 테스트 보강
- `RobotControllerTest`에 아래 케이스를 추가/보강했습니다.
  - `TAKE + medicationId 누락 -> 400` + 에러 메시지 일관성
  - `invalid action -> 400`
  - `invalid action/type 조합 -> 400`
  - `CONFIRM` 처리 시 부수효과 없음 검증
  - `EMERGENCY` 처리 시 activity 생성 검증
  - 기존 `LATER` 알림 생성 회귀 유지

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/request/ReportRobotEventsRequest.java` | 수정 | DTO의 비즈니스 검증 제거(서비스 단일 검증으로 통일) |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotEventService.java` | 수정 | 타입/액션 매트릭스 검증, `CONFIRM`/`EMERGENCY` 분기 정리 |
| `backend/src/main/resources/db/migration/V12__add_robot_lcd_event_quality_indexes.sql` | 추가 | `robot_lcd_event` 액션 조회 품질 인덱스 추가 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | invalid payload 400 및 액션 분기 회귀 테스트 추가 |
| `backend/src/test/java/site/silverbot/migration/FlywayMigrationVerificationTest.java` | 수정 | Flyway 타겟 버전 12 + 신규 인덱스 검증 |

### 리뷰 포인트
- [ ] `type/action` 유효성 매트릭스가 FE 계약(`TAKE/LATER/CONFIRM/EMERGENCY`)과 충돌 없는지
- [ ] 잘못된 payload가 모두 `400 / INVALID_REQUEST`로 일관 응답되는지
- [ ] `CONFIRM` 이벤트에서 불필요한 부수효과가 발생하지 않는지
- [ ] 신규 인덱스가 기존 쿼리 경로/마이그레이션 안정성을 해치지 않는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.migration.FlywayMigrationVerificationTest'
```

### 실행 결과
- 위 명령 실행 결과: `BUILD SUCCESSFUL`
