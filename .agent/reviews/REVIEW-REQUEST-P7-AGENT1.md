## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase7-auth-settings-be`
- 작업 범위: P7 Round 1 (`agent-0/.agent/dispatch/WORK-INSTRUCTION-P7-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P7.md`
- 목표:
  - Auth 응답 계약 정렬 (`/api/auth/login`, `/api/auth/robot/login`, `/api/auth/refresh`)
  - Robot Settings API 신규 구현 (`PATCH /api/robots/{robotId}/settings`)

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/auth/controller/AuthController.java` | 수정 | login/signup/refresh 응답을 계약형 본문으로 반환, refresh body 토큰 입력 호환 처리 |
| `backend/src/main/java/site/silverbot/api/auth/service/AuthService.java` | 수정 | 로그인 응답에 `user` 포함, refresh에서 쿠키 우선 + body fallback 토큰 추출 지원 |
| `backend/src/main/java/site/silverbot/api/auth/service/RobotAuthService.java` | 수정 | 로봇 로그인 응답에 `robot` 정보 포함 |
| `backend/src/main/java/site/silverbot/api/auth/response/TokenResponse.java` | 수정 | 토큰 응답 구조를 `accessToken/refreshToken/expiresIn/user/robot`로 정렬 |
| `backend/src/main/java/site/silverbot/api/auth/response/AuthUserResponse.java` | 신규 | 로그인 사용자 응답 DTO |
| `backend/src/main/java/site/silverbot/api/auth/response/AuthRobotResponse.java` | 신규 | 로봇 로그인 응답 DTO |
| `backend/src/main/java/site/silverbot/api/auth/request/RefreshTokenRequest.java` | 신규 | `/auth/refresh` body 기반 refresh token 입력 DTO |
| `backend/src/main/java/site/silverbot/api/robot/controller/RobotSettingsController.java` | 신규 | `PATCH /api/robots/{robotId}/settings` 엔드포인트 추가 |
| `backend/src/main/java/site/silverbot/api/robot/service/RobotSettingsService.java` | 신규 | 로봇 설정 업데이트 비즈니스 로직/권한 검증/값 검증 구현 |
| `backend/src/main/java/site/silverbot/api/robot/request/UpdateRobotSettingsRequest.java` | 신규 | 로봇 설정 요청 DTO |
| `backend/src/main/java/site/silverbot/api/robot/response/UpdateRobotSettingsResponse.java` | 신규 | 로봇 설정 응답 DTO |
| `backend/src/main/java/site/silverbot/domain/robot/Robot.java` | 수정 | 설정 필드 업데이트 도메인 메서드(`updateSettings`) 추가 |
| `backend/src/test/java/site/silverbot/api/auth/AuthControllerTest.java` | 수정 | Auth 응답 계약(user/robot/refresh body) 기준 REST Docs/회귀 테스트 갱신 |
| `backend/src/test/java/site/silverbot/api/auth/AuthServiceTest.java` | 수정 | login user payload, refresh body fallback 회귀 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/auth/RobotAuthServiceTest.java` | 수정 | robot payload(elderId/elderName 포함) 검증 강화 |
| `backend/src/test/java/site/silverbot/api/robot/RobotControllerTest.java` | 수정 | robot settings PATCH 성공/권한/유효성(시간, 볼륨, patrol range) 테스트 및 REST Docs 추가 |

### 주요 변경 사항
1. `POST /api/auth/login` 응답에 `refreshToken`, `expiresIn`, `user`를 포함하도록 계약을 정렬했습니다.
2. `POST /api/auth/robot/login` 응답에 `robot { id, serialNumber, elderId, elderName }`를 포함하도록 확장했습니다.
3. `POST /api/auth/refresh`는 기존 쿠키 기반을 유지하면서 body의 `refreshToken`도 fallback으로 허용하도록 처리했습니다(쿠키 경로 `/api/auth/refresh` 유지).
4. `PATCH /api/robots/{robotId}/settings`를 신규 구현했습니다.
5. Robot Settings 권한은 기존 로봇 write 정책과 동일하게 유지했습니다.
- owner worker 허용
- non-owner worker 차단
- robot principal은 robotId 일치 시 허용, 불일치 시 차단
6. Robot Settings 입력 검증을 추가했습니다.
- `morningMedicationTime`, `eveningMedicationTime`, `patrolTimeRange.start/end`: `HH:mm`
- `ttsVolume`: `0~100`
- `patrolTimeRange.start < patrolTimeRange.end`

### 검증 포인트 (리뷰어 확인 요청)
- [ ] Auth 응답 구조가 문서 계약과 정렬되는지 (`data.user`, `data.robot`, `refreshToken` 포함 여부)
- [ ] `/api/auth/refresh`에서 쿠키 우선 + body fallback 동작이 의도대로 유지되는지
- [ ] `PATCH /api/robots/{robotId}/settings` 권한 정책이 기존 robot write 정책과 일관적인지
- [ ] settings 입력 검증 에러가 `400 + INVALID_REQUEST`로 안정적으로 매핑되는지
- [ ] REST Docs 스니펫(`auth-*`, `robot-settings-update`) 생성 흐름에 회귀가 없는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.auth.AuthControllerTest' \
  --tests 'site.silverbot.api.auth.AuthServiceTest' \
  --tests 'site.silverbot.api.auth.RobotAuthServiceTest' \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

### 테스트 실행 결과
- `BUILD SUCCESSFUL` (2026-02-08, 로컬 `agent-1/backend`)

### 우려 사항 / 특별 검토 요청
- `@MockBean` deprecation warning은 기존 테스트 인프라 이슈로 유지했습니다(동작 영향 없음).
- Auth 응답에서 기존 `tokenType` 필드는 제거했습니다. 현재 FE는 `accessToken` 중심 소비로 직접 영향은 없지만, Agent 2/4의 계약 소비 코드와 최종 정렬 확인이 필요합니다.
