# Phase 7 작업 지시 [Agent 1]

## 브랜치
- `feature/phase7-auth-settings-be`

## 목표
- Auth API 응답 계약을 문서 기준으로 정렬하고, 누락된 Robot Settings API를 구현한다.

## 작업 범위
1. Auth 응답 계약 정렬
- 대상:
  - `backend/src/main/java/site/silverbot/api/auth/controller/AuthController.java`
  - `backend/src/main/java/site/silverbot/api/auth/service/AuthService.java`
  - `backend/src/main/java/site/silverbot/api/auth/service/RobotAuthService.java`
  - `backend/src/main/java/site/silverbot/api/auth/response/*`
- 요구:
  - `POST /api/auth/login`: `accessToken`, `refreshToken`, `expiresIn`, `user` 반환
  - `POST /api/auth/robot/login`: `accessToken`, `robot` 반환
  - `POST /api/auth/refresh`: 쿠키 경로 유지 + body 기반 refreshToken 호환

2. Robot Settings API 구현
- 대상(신규/수정):
  - `backend/src/main/java/site/silverbot/api/robot/controller/*Settings*.java`
  - `backend/src/main/java/site/silverbot/api/robot/service/*Settings*.java`
  - `backend/src/main/java/site/silverbot/api/robot/request/*Settings*.java`
  - `backend/src/main/java/site/silverbot/api/robot/response/*Settings*.java`
- 요구:
  - `PATCH /api/robots/{robotId}/settings` 구현
  - 필드: `morningMedicationTime`, `eveningMedicationTime`, `ttsVolume`, `patrolTimeRange.start/end`
  - 권한 검증(소유 사용자/로봇 principal 정책) 일관성 유지

3. 테스트/문서화
- 대상:
  - `backend/src/test/java/site/silverbot/api/auth/**`
  - `backend/src/test/java/site/silverbot/api/robot/**`
- 요구:
  - Auth/Settings 회귀 테스트 보강
  - REST Docs 스니펫 회귀 없음 확인

## 검증
```bash
cd backend
./gradlew --no-daemon test --console=plain \
  --tests 'site.silverbot.api.auth.AuthControllerTest' \
  --tests 'site.silverbot.api.auth.AuthServiceTest' \
  --tests 'site.silverbot.api.auth.RobotAuthServiceTest' \
  --tests 'site.silverbot.api.robot.RobotControllerTest'
```

## 산출물
- 코드 커밋/푸시
- `agent-1/.agent/reviews/REVIEW-REQUEST-P7-AGENT1.md` 작성
