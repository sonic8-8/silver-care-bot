## 코드 리뷰 요청 [Agent 1] - Phase 1

### 작업 정보
- 브랜치: feature/phase1-auth
- 작업 범위: PLAN.md 1.1(USER), 1.2/1.3(Auth)
- 작업 기간: 2026-02-05 ~ 2026-02-05
- PR 링크: (없음)

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/auth/controller/AuthController.java` | 수정 | login/signup/refresh 응답 정리 + HttpOnly 쿠키 설정 |
| `backend/src/main/java/site/silverbot/api/auth/service/AuthService.java` | 수정 | refresh 쿠키 기반 처리 + 해시 검증 |
| `backend/src/main/java/site/silverbot/domain/user/User.java` | 수정 | refreshToken 해시 저장/검증 추가 |
| `backend/src/main/java/site/silverbot/api/auth/service/RobotAuthService.java` | 신규 | 로봇 인증 분리 |
| `backend/src/main/java/site/silverbot/config/JwtTokenProvider.java` | 신규 | JWT 생성/검증 |
| `backend/src/main/java/site/silverbot/config/JwtAuthenticationFilter.java` | 신규 | JWT 인증 필터 |
| `backend/src/main/java/site/silverbot/config/SecurityConfig.java` | 수정 | JWT 필터 등록 + /ws/** permitAll |
| `backend/src/main/resources/db/migration/V3__add_refresh_token_to_users.sql` | 신규 | users.refresh_token 컬럼 추가 |
| `backend/src/test/java/site/silverbot/api/auth/**` | 수정/신규 | Auth/RobotAuth 테스트 및 REST Docs 갱신 |
| `frontend/src/features/auth/**` | 신규/수정 | auth api/hook/store 및 JWT 파싱 보정 |
| `frontend/src/features/auth/store/authStore.test.ts` | 수정 | accessToken만 localStorage에 저장하도록 테스트 기대값 수정 |
| `frontend/src/pages/Login/LoginScreen.tsx` | 수정 | 로그인 연동 + 회원가입 링크 |
| `frontend/src/pages/Signup/SignupScreen.tsx` | 수정 | 회원가입 연동 + 로그인 링크 |
| `backend/src/main/resources/application.yml` | 수정 | 프록시 환경 `request.isSecure()` 보정용 forward headers 설정 |

### 주요 변경 사항
1. 로그인/회원가입/리프레시에서 refreshToken은 **HttpOnly 쿠키**로 발급하고, 응답 바디에서는 제거
2. refreshToken은 DB에 **BCrypt 해시**로 저장하고 검증
3. JWT payload 파싱 시 base64url 패딩 보정 로직 적용
4. RobotAuthService 분리로 AuthService 도메인 경계 개선
5. SecurityConfig에 `/ws/**` permitAll 추가
6. refresh 쿠키 `secure`는 요청 스킴 기반으로 동적 결정
7. AuthController REST Docs에 `Set-Cookie` 헤더 문서화 추가
8. authStore에서 refreshToken 로컬 저장/복원 제거
9. forward headers 적용으로 프록시 환경에서 secure 판정 개선
10. authStore 테스트에서 refreshToken localStorage 기대값 제거

### 검증 포인트 (리뷰어 확인 사항)
- [ ] refreshToken이 응답 body에 노출되지 않는지
- [ ] refreshToken 해시 검증 로직이 올바른지 (BCrypt)
- [ ] refresh 요청이 쿠키 기반으로 정상 동작하는지
- [ ] JWT 파싱(base64url 패딩 보정) 안정성
- [ ] `/ws/**` permitAll 추가로 WS 핸드셰이크 문제 해결 여부
- [ ] AuthController REST Docs 스니펫 내용 변경이 적절한지
- [ ] refresh 쿠키 secure 분기(HTTP/HTTPS) 동작 확인

### 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

### 테스트 결과
- Frontend: `npm run test` ✅ PASS (Test Files 3 passed, Tests 11 passed)
- Backend: 미실행

### 우려 사항 / 특별 검토 요청
- `frontend/src/shared/api/axios.ts`는 Agent-4 소유라 본 브랜치에서 원본으로 복원함. HttpOnly 쿠키 기반 refresh/로그아웃 동기화는 Agent-4 통합 필요.
