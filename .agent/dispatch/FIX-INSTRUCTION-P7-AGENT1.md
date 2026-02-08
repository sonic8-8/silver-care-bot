# Phase 7 수정 지시 [Agent 1]

## 브랜치
- `feature/phase7-auth-settings-be`

## 리뷰 결과
- `agent-1/.agent/reviews/REVIEW-RESULT-P7-AGENT1.md`: **Request Changes (Major 1)**

## API 기준 확인
- `agent-0/docs/api-specification.md` 3.1 Auth
  - `POST /api/auth/login`: `accessToken`, `refreshToken`, `expiresIn`, `user`
  - `POST /api/auth/refresh`: refresh token 기반 갱신

## 지시 사항
1. Refresh 토큰 회전 고정 보장
- 대상: `backend/src/main/java/site/silverbot/config/JwtTokenProvider.java`
- 조치:
  - Refresh 토큰 생성 시 매 발급마다 값이 달라지도록 고유 claim(`jti` UUID 등) 추가
  - 같은 초(second) 내 재발급에서도 동일 토큰이 나오지 않도록 보장

2. 회귀 테스트 보강/통과 확인
- 대상: `backend/src/test/java/site/silverbot/api/auth/AuthServiceTest.java`
- 조치:
  - `refresh_rotatesTokens()`가 `--rerun-tasks`에서도 안정 통과하도록 검증
  - 필요 시 토큰 클레임 검증(assertion) 보강

3. 계약 회귀 금지
- 로그인/리프레시 응답 필드 계약(`accessToken`, `refreshToken`, `expiresIn`, `user`)은 유지
- 쿠키 우선 + body fallback 경로 유지

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain --rerun-tasks \
  --tests 'site.silverbot.api.auth.AuthControllerTest' \
  --tests 'site.silverbot.api.auth.AuthServiceTest' \
  --tests 'site.silverbot.api.auth.RobotAuthServiceTest' \
  --tests 'site.silverbot.api.robot.RobotControllerTest' \
  --tests 'site.silverbot.api.robot.service.RobotServiceTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P7-AGENT1.md` 갱신
