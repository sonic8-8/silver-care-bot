# 코드 리뷰 결과 [Agent 1] - Phase 1

## 요약
- **전체 평가**: ⚠️ Request Changes
- **Critical 이슈**: 0건
- **Major 이슈**: 1건
- **Minor 이슈**: 1건

## 발견된 이슈

### [Major] authStore.test.ts가 refreshToken 로컬 저장을 여전히 기대해 테스트 실패
`authStore`에서 refreshToken 저장/복구 로직을 제거했지만, 테스트는 여전히 refreshToken이 localStorage에 남아있다고 가정합니다.
- 파일: `frontend/src/features/auth/store/authStore.test.ts`
- 위치: `persists tokens...` 테스트의 refreshToken 기대 구간
- 조치: refreshToken 관련 기대값 제거/수정하여 현재 저장 정책(AccessToken만 저장)에 맞추세요.

### [Minor] request.isSecure() 기반 Secure 플래그 판단은 프록시 환경에서 오동작 가능
TLS 종료 프록시 뒤에서는 `request.isSecure()`가 `false`가 될 수 있어 Secure 플래그가 빠질 수 있습니다. Forwarded 헤더 처리 설정이 없으므로 운영 환경에서 쿠키가 비보안으로 내려갈 가능성이 있습니다.
- 파일: `backend/src/main/java/site/silverbot/api/auth/controller/AuthController.java`
- 위치: `setRefreshCookie`의 `isSecure` 결정
- 조치: forward header 설정 추가 또는 프로퍼티 기반 분기(예: `app.jwt.cookie-secure`) 고려.

## 테스트 실행 결과
- 실행하지 않음 (리뷰만 수행)

## 최종 의견
- 테스트 불일치(Major) 수정이 필요합니다. 나머지는 운영 환경에 맞춰 보완하면 됩니다.
