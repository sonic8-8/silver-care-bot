## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase7-auth-settings-be`
- 작업 범위: P7 Round 2 Fix (`agent-0/.agent/dispatch/FIX-INSTRUCTION-P7-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P7.md`
- 선행 리뷰 결과: `agent-1/.agent/reviews/REVIEW-RESULT-P7-AGENT1.md` (Request Changes, Major 1)
- 목표:
  - Refresh 토큰 회전 고정 보장
  - 회귀 테스트 안정 통과 (`--rerun-tasks`)
  - Round 1에서 정렬한 Auth 계약/Settings API 동작 유지

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `backend/src/main/java/site/silverbot/config/JwtTokenProvider.java` | 수정 | refresh 토큰 발급 시 `jti`(UUID) claim 추가로 동일 초 재발급에서도 토큰 고유성 보장 |
| `backend/src/test/java/site/silverbot/api/auth/AuthServiceTest.java` | 수정 | `refresh_rotatesTokens()`에서 이전 refresh 토큰 무효화(`validateRefreshToken(old)=false`) 검증 추가 |

### 주요 변경 사항
1. `JwtTokenProvider#createToken`에서 refresh 타입(`type=refresh`)일 때 `jti`를 UUID로 주입해 발급 토큰이 항상 신규 값이 되도록 변경했습니다.
2. `AuthServiceTest#refresh_rotatesTokens`에 이전 refresh 토큰 불일치 + 저장 토큰 회전 검증을 강화해 회귀를 방지했습니다.
3. Round 1의 Auth 응답 계약(`accessToken`, `refreshToken`, `expiresIn`, `user`) 및 refresh 쿠키 우선/body fallback 경로는 변경 없이 유지했습니다.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] refresh 토큰이 동일 초 재발급에서도 항상 회전되는지(`jti` 기반 고유성)
- [ ] `AuthServiceTest.refresh_rotatesTokens()`가 `--rerun-tasks`에서 안정 통과하는지
- [ ] Round 1에서 맞춘 Auth 계약(`accessToken`, `refreshToken`, `expiresIn`, `user`)이 유지되는지
- [ ] `/api/auth/refresh`의 쿠키 우선 + body fallback 동작에 회귀가 없는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain --rerun-tasks \
  --tests 'site.silverbot.api.auth.AuthControllerTest' \
  --tests 'site.silverbot.api.auth.AuthServiceTest' \
  --tests 'site.silverbot.api.auth.RobotAuthServiceTest' \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

### 테스트 실행 결과
- `BUILD SUCCESSFUL` (2026-02-08, 로컬 `agent-1/backend`, `--rerun-tasks` 실행)

### 우려 사항 / 특별 검토 요청
- `@MockBean` deprecation warning은 기존 테스트 인프라 이슈로 유지했습니다(동작 영향 없음).
