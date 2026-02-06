# 코드 리뷰 요청 [Agent 1] - Phase 1

## 작업 정보
- 브랜치: `feature/phase1-auth`
- 작업 범위: PLAN.md `1.1(USER)`, `1.2/1.3(Auth)`
- 작업 기간: `2026-02-05 ~ 2026-02-06`
- PR 링크: (없음)

## 지시서 반영 상태 (v10)
| 항목 | 상태 | 비고 |
|------|------|------|
| `FIX-INSTRUCTIONS-P1-AGENT1.md` 신규 항목 `/ws/** permitAll` | ✅ 반영 완료 | `SecurityConfig.PERMIT_ALL`에 포함 |
| 이전 Major/Minor 지시사항 (maxAge, SecretKey, CORS trim, signup 에러 처리) | ✅ 반영 완료 | 코드/테스트 기준 확인 |
| 미사용 `RefreshRequest` 정리 | ✅ 반영 완료 | 변경 집합에서 제외 |
| v10 추가 코드 수정 요구 | ✅ 없음 | Agent 0 통합 지시서 기준 코드 수정 불필요 |
| 커밋/푸시 상태 | ✅ 완료 | `67a2b02` 커밋을 `origin/feature/phase1-auth`로 푸시 완료 |

## 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/auth/controller/AuthController.java` | 수정 | refresh 쿠키 `maxAge` 설정값 연동, 쿠키 발급 정리 |
| `backend/src/main/java/site/silverbot/api/auth/service/AuthService.java` | 수정 | refresh 쿠키 기반 처리 + 해시 검증 |
| `backend/src/main/java/site/silverbot/domain/user/User.java` | 수정 | refreshToken 저장/검증 시 SHA-256 정규화 후 BCrypt 적용 |
| `backend/src/main/java/site/silverbot/api/auth/service/RobotAuthService.java` | 신규 | 로봇 인증 분리 |
| `backend/src/main/java/site/silverbot/config/JwtTokenProvider.java` | 수정 | `Key -> SecretKey` 타입 정리, refresh 만료 getter 추가 |
| `backend/src/main/java/site/silverbot/config/JwtAuthenticationFilter.java` | 신규 | JWT 인증 필터 |
| `backend/src/main/java/site/silverbot/config/SecurityConfig.java` | 수정 | JWT 필터 등록 + `/ws/**` permitAll + CORS origin trim 처리 |
| `backend/src/main/resources/db/migration/V3__add_refresh_token_to_users.sql` | 신규 | `users.refresh_token` 컬럼 추가 |
| `backend/src/test/java/site/silverbot/api/auth/**` | 수정/신규 | Auth/RobotAuth 테스트 및 REST Docs 갱신 |
| `frontend/src/features/auth/**` | 신규/수정 | auth api/hook/store 및 JWT 파싱 보정 + signup 에러 처리 일관화 |
| `frontend/src/features/auth/store/authStore.test.ts` | 수정 | accessToken만 localStorage 저장하도록 기대값 수정 |
| `frontend/src/pages/Login/LoginScreen.tsx` | 수정 | 로그인 연동 + 회원가입 링크 |
| `frontend/src/pages/Signup/SignupScreen.tsx` | 수정 | 회원가입 연동 + 로그인 링크 |
| `backend/src/main/resources/application.yml` | 수정 | 프록시 환경 `request.isSecure()` 보정용 forward headers 설정 |

## 주요 변경 사항
1. 로그인/회원가입/리프레시에서 refreshToken은 HttpOnly 쿠키로 발급하고 응답 body에서는 제거
2. refresh 쿠키 `maxAge`를 `app.jwt.refresh-token-expiration` 설정값과 동기화
3. JWT 파서 `verifyWith` 타입 불일치 해결(`SecretKey`)
4. refreshToken 저장/검증 시 SHA-256 정규화 후 BCrypt 적용(BCrypt 72-byte 제한 대응)
5. JWT payload 파싱 시 base64url 패딩 보정 로직 적용
6. RobotAuthService 분리로 AuthService 책임 축소
7. SecurityConfig에 `/ws/**` permitAll 추가
8. authStore에서 refreshToken local 저장 제거
9. CORS `allowed-origins` 파싱 시 공백 trim 및 빈 값 제거
10. signup API에서 accessToken 누락 응답을 예외로 처리(`Invalid signup response`)
11. 미사용 `RefreshRequest` 신규 파일은 변경 집합에서 제외(미반영)

## 검증 포인트 (리뷰어 확인 사항)
- [ ] refreshToken이 응답 body에 노출되지 않는지
- [ ] refresh 쿠키 `maxAge`가 설정값(`refresh-token-expiration`)과 일치하는지
- [ ] `JwtTokenProvider`의 `verifyWith` 타입이 빌드/런타임에서 안전한지
- [ ] refreshToken 해시/검증 로직이 긴 JWT 문자열에서도 안전한지
- [ ] refresh 요청이 쿠키 기반으로 정상 동작하는지
- [ ] JWT 파싱(base64url 패딩 보정) 안정성
- [ ] `/ws/**` permitAll 추가가 의도한 범위인지
- [ ] AuthController REST Docs `Set-Cookie` 문서화가 적절한지

## 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

## 테스트 결과
- Frontend: `npm run test -- --run` PASS (Test Files 3 passed, Tests 11 passed)
- Backend:
  - 현재 `develop` 기준 `ApiResponse` 충돌(`success()` accessor)로 컴파일 실패
  - `origin/feature/phase1-websocket`의 `ApiResponse`(`ok()`)를 임시 반영한 상태에서 `./gradlew --no-daemon test` PASS

## 우려 사항 / 특별 검토 요청
- Agent 4 브랜치가 `develop`에 먼저 머지되어야 backend 통합 빌드/테스트가 안정적으로 진행됩니다.
- `frontend/src/shared/api/axios.ts`는 Agent 4 소유라 본 브랜치에서 직접 수정하지 않았습니다.
- 이전 리뷰의 Minor 3건(CORS trim, signup 에러 처리, RefreshRequest 미사용)은 모두 반영 완료했습니다.
- v10 기준 Agent 1은 코드 수정 항목이 없으며, 현재 상태는 Agent 0 머지 대기입니다.
