## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase6-lcd-hardening-be`
- 작업 범위: P6 Round 1 (`agent-0/.agent/dispatch/WORK-INSTRUCTION-P6-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P6.md`
- 목표: LCD 조회/모드 변경 API의 권한 회귀와 응답 계약(`message/subMessage` string 보장) 하드닝

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotLcdModeRequest.java` | 수정 | 모드/감정 trim, 메시지 null->"" 정규화 접근자 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotService.java` | 수정 | `lcd-mode` 전용 required 파싱 추가(모드/감정 필수), 문자열 정규화 경로 정리 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | `GET /lcd`, `POST /lcd-mode` 권한 회귀(owner/non-owner/robot principal) 및 400/문자열 계약 케이스 보강 |
| `backend/src/test/java/site/silverbot/api/robot/service/RobotServiceTest.java` | 수정 | 서비스 레벨 권한/정규화/invalid 입력 예외 메시지 일관성 테스트 추가 |

### 주요 변경 사항
1. `UpdateRobotLcdModeRequest`에 정규화 메서드를 추가해 mode/emotion 입력 trim과 message/subMessage `null -> ""`를 일관 처리했습니다.
2. `RobotService.updateLcdMode`는 `parseRequiredMode/Emotion` 경로를 사용해 빈값/누락/잘못된 enum 입력 시 `IllegalArgumentException("Invalid lcd ...")`을 일관되게 발생시키도록 강화했습니다.
3. `RobotService.parseMode/parseEmotion`은 trim 기반 파싱으로 보정하되, `sync` 경로의 부분 업데이트 허용(null 허용)은 유지했습니다.
4. 컨트롤러/서비스 테스트에 `GET /lcd`, `POST /lcd-mode` 권한 분기(소유 worker, 비소유 worker, robot principal 일치/불일치)와 응답 문자열 계약 회귀 케이스를 추가했습니다.
5. `POST /lcd-mode` invalid mode 입력에 대해 400 + `INVALID_REQUEST` + `Invalid lcd mode`를 검증해 예외 메시지/상태코드 일관성을 고정했습니다.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] `GET /api/robots/{robotId}/lcd`가 owner worker/robot principal 일치에서만 허용되고, 비소유/불일치에서 차단되는지
- [ ] `POST /api/robots/{robotId}/lcd-mode` 응답에서 `message/subMessage`가 null 없이 string으로 보장되는지
- [ ] `POST /api/robots/{robotId}/lcd-mode` invalid mode/emotion 처리 시 400 계열 에러 계약이 일관되는지
- [ ] `sync` 경로의 기존 부분 업데이트 동작(null 허용)이 이번 하드닝으로 깨지지 않았는지
- [ ] REST Docs 스니펫 생성 흐름에 회귀가 없는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

### 테스트 실행 결과
- `BUILD SUCCESSFUL` (2026-02-08, 로컬 `agent-1/backend`)

### 우려 사항 / 특별 검토 요청
- `@MockBean` deprecation warning은 기존 테스트 인프라 이슈로 유지했습니다(동작 영향 없음).
- invalid emotion의 컨트롤러 레벨 400 상세 메시지 검증은 서비스 테스트에서 우선 고정했으며, 필요 시 컨트롤러 단에도 동일 케이스 추가 가능합니다.
