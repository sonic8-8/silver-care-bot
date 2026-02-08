## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase7-frontend-contract-fe`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P7.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P7-AGENT2.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P7-AGENT2.md`
- 목표:
  - Auth 소비 계약(`user`, `robot`, `refreshToken`) 정렬
  - Robot Settings 소비 경로(`PATCH /api/robots/{robotId}/settings`) 연결 및 검증
  - Emergency 화면 긴급연락처 표시/전화 액션 및 빈/오류 상태 보강
  - 계약 회귀 테스트 보강

### 반영 항목 요약
- [x] Auth 응답 파서를 확장해 `accessToken` + 선택 필드(`refreshToken`, `expiresIn`, `user`, `robot`)를 안전하게 파싱
- [x] JWT claim 누락 시에도 `user`/`robot` 계약으로 로그인 후 라우팅/스토어 상태 구성 가능하도록 보강
- [x] Settings 화면에 로봇 설정 폼 추가 및 `ttsVolume(0~100)`/시간(`HH:mm`) 검증 반영
- [x] Robot API에 `updateSettings` 추가 및 Mock 핸들러(`PATCH /api/robots/:robotId/settings`) 동기화
- [x] Emergency 화면에 긴급연락처 목록/전화 링크(`tel:`) 및 데이터 없음/조회 실패 상태 UI 추가
- [x] 테스트 추가/보강:
  - `useAuth` 계약 fallback 회귀 테스트
  - `EmergencyScreen` 연락처 렌더/빈 상태/오류 상태 테스트

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/features/auth/api/authApi.ts` | 수정 | Auth 계약 파서 추가(`user`/`robot`/`refreshToken` 처리) |
| `frontend/src/shared/types/user.types.ts` | 수정 | Auth 응답 프로필 타입(`AuthUserProfile`, `AuthRobotProfile`) 확장 |
| `frontend/src/features/auth/store/authStore.ts` | 수정 | JWT claim 누락 시 `user`/`robot` 응답 기반 사용자 상태 fallback |
| `frontend/src/features/auth/hooks/useAuth.ts` | 수정 | 로그인 후 경로 결정 시 `user`/`robot` 계약 fallback 적용 |
| `frontend/src/features/auth/hooks/useAuth.test.tsx` | 수정 | 계약 fallback 회귀 테스트 2건 추가 |
| `frontend/src/shared/types/robot.types.ts` | 수정 | 로봇 설정 타입(`RobotSettings`, `UpdateRobotSettingsPayload`) 분리 |
| `frontend/src/features/robot-control/api/robotApi.ts` | 수정 | `updateSettings(robotId, payload)` API 추가 |
| `frontend/src/pages/Settings/SettingsScreen.tsx` | 수정 | 로봇 설정 폼/검증/저장 연동 추가 |
| `frontend/src/pages/Emergency/EmergencyScreen.tsx` | 수정 | 긴급연락처 목록/전화 액션/빈·오류 상태 UI 추가 |
| `frontend/src/pages/Emergency/EmergencyScreen.test.tsx` | 신규 | 연락처 렌더/빈 상태/오류 상태 테스트 |
| `frontend/src/mocks/handlers/auth.ts` | 수정 | signup/refresh Mock를 신규 Auth 계약/쿠키 흐름과 호환되게 보완 |
| `frontend/src/mocks/handlers/robot.ts` | 수정 | 로봇 설정 상태 저장 및 PATCH Mock 핸들러 추가 |
| `frontend/src/pages/_components/GuardianAppContainer.test.tsx` | 수정 | Router 컨텍스트(MemoryRouter) 누락 보완 |

### 리뷰어 확인 요청 포인트
- [ ] Auth 응답에서 JWT claim 누락 시 fallback 정책(`user`/`robot` 우선순위)이 의도와 맞는지
- [ ] Settings 화면의 elder/robot 식별 방식(`auth elderId` 또는 `lastElderId`)이 UX/정책에 부합하는지
- [ ] 로봇 설정 검증 규칙(`HH:mm`, volume 0~100, 순찰 시작<종료)이 백엔드 계약과 일치하는지
- [ ] Emergency 연락처 UI에서 전화 액션(`tel:`)과 오류/빈 상태 문구가 요구사항에 맞는지
- [ ] Agent 4 소유 영역(`frontend/src/shared/types/**` 계약 충돌 가능성)과 충돌 없는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run
npm run build
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (28 files, 101 tests)
- `npm run build` ✅ PASS

### 참고 사항
- `refresh`는 기존 쿠키 기반 흐름을 유지하며, 응답 파서만 신규 계약 형태를 수용하도록 확장했습니다.
- Robot Settings는 기존 알림 설정 화면 안에 섹션으로 통합했습니다.

---

## Round 2 수정 반영 (FIX-INSTRUCTION-P7-AGENT2)

### 수정 요약
- [x] `FAMILY` 라우팅 fallback 보강
  - `payload.elderId` 누락 시 `tokens.user.elderId`를 사용하도록 수정
  - 우선순위: `payload.elderId` → `tokens.user.elderId` → `/elders`
- [x] `AuthStore` 사용자 파싱 fallback 보강
  - JWT `sub/role` 유지
  - JWT `email/elderId` 누락 시 `tokens.user.email/elderId` fallback 반영
- [x] 테스트 보강
  - `useAuth.test.tsx`: FAMILY `elderId` fallback 케이스 추가
  - `authStore.test.ts`: `elderId`/`email` fallback 케이스 추가

### Round 2 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/features/auth/hooks/useAuth.ts` | 수정 | FAMILY 라우팅 시 `tokens.user.elderId` fallback 반영 |
| `frontend/src/features/auth/store/authStore.ts` | 수정 | JWT `email/elderId` 누락 시 `tokens.user` fallback 반영 |
| `frontend/src/features/auth/hooks/useAuth.test.tsx` | 수정 | FAMILY `elderId` fallback 회귀 테스트 1건 추가 |
| `frontend/src/features/auth/store/authStore.test.ts` | 수정 | `elderId`/`email` fallback 테스트 2건 추가 |

### Round 2 테스트 실행 결과
- `cd frontend && npm run test -- --run src/features/auth/hooks/useAuth.test.tsx src/features/auth/store/authStore.test.ts` ✅ PASS (2 files, 9 tests)
- `cd frontend && npm run build` ✅ PASS
- 참고: `npm run test -- --run` 전체 실행은 Vitest worker timeout(환경 이슈)으로 완료 안정성이 낮아, 변경 범위 대상 테스트로 재검증했습니다.
