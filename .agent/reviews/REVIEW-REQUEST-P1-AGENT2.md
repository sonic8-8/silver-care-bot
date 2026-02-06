# 코드 리뷰 요청 [Agent 2] - Phase 1

## 작업 정보
- **브랜치**: feature/phase1-elder
- **작업 범위**: PLAN.md 1.1(ELDER/EMERGENCY_CONTACT/EMERGENCY), 1.4, 1.5, 1.9, 1.10
- **작업 기간**: 2026-02-03 ~ 2026-02-06

## 변경 파일 목록
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/elder/controller/ElderController.java` | 신규 | Elder CRUD API 컨트롤러 |
| `backend/src/main/java/site/silverbot/api/elder/controller/EmergencyContactController.java` | 신규 | 긴급 연락처 CRUD 컨트롤러 |
| `backend/src/main/java/site/silverbot/api/common/ApiResponse.java` | 수정 | no-arg 메서드 충돌 해결 (`success()` → `ok()`) |
| `backend/src/main/java/site/silverbot/api/elder/service/ElderService.java` | 신규/수정 | Elder 비즈니스 로직, 소유권/인증 강화 + 목록 N+1 완화 |
| `backend/src/main/java/site/silverbot/api/elder/service/EmergencyContactService.java` | 신규 | 긴급 연락처 서비스, 소유권/인증 강화 |
| `backend/src/main/java/site/silverbot/api/emergency/controller/EmergencyController.java` | 신규 | Emergency API 컨트롤러 |
| `backend/src/main/java/site/silverbot/api/emergency/service/EmergencyService.java` | 신규/수정 | Emergency 로직, 소유권 검증/해제 처리 + 재해제 방어(409) |
| `backend/src/main/java/site/silverbot/domain/elder/Elder.java` | 수정 | update 메서드 추가 |
| `backend/src/main/java/site/silverbot/domain/elder/EmergencyContact.java` | 수정 | update 메서드 추가 |
| `backend/src/main/java/site/silverbot/domain/emergency/Emergency.java` | 수정 | resolve 메서드 추가 |
| `backend/src/main/java/site/silverbot/domain/emergency/EmergencyRepository.java` | 수정 | 조회 메서드 추가 (PENDING 배치 조회) |
| `backend/src/main/java/site/silverbot/domain/robot/RobotRepository.java` | 수정 | elderIds 배치 조회 메서드 추가 |
| `backend/src/test/java/site/silverbot/api/elder/controller/ElderControllerTest.java` | 신규 | REST Docs 포함 컨트롤러 테스트 |
| `backend/src/test/java/site/silverbot/api/elder/controller/EmergencyContactControllerTest.java` | 신규 | REST Docs 포함 컨트롤러 테스트 |
| `backend/src/test/java/site/silverbot/api/emergency/controller/EmergencyControllerTest.java` | 신규 | REST Docs 포함 컨트롤러 테스트 |
| `backend/src/test/java/site/silverbot/api/elder/service/ElderServiceTest.java` | 신규 | 서비스 테스트 |
| `backend/src/test/java/site/silverbot/api/elder/service/EmergencyContactServiceTest.java` | 신규 | 서비스 테스트 |
| `backend/src/test/java/site/silverbot/api/emergency/service/EmergencyServiceTest.java` | 신규/수정 | 서비스 테스트 (재해제 409/다중 PENDING 케이스 추가) |
| `frontend/src/features/elder/**` | 신규 | Elder API/훅/컴포넌트 |
| `frontend/src/features/emergency/**` | 신규 | Emergency API/훅/컴포넌트 |
| `frontend/src/pages/Elders/ElderSelectScreen.tsx` | 수정 | Elder 리스트 연동 및 모달 추가 |
| `frontend/src/pages/Emergency/EmergencyScreen.tsx` | 수정 | Emergency 상세/해제 연동 |
| `frontend/src/mocks/handlers/elder.ts` | 수정 | Elder/Contact MSW 확장 |
| `frontend/src/mocks/handlers/emergency.ts` | 수정 | Emergency MSW 응답 보강 |
| `frontend/src/shared/types/elder.types.ts` | 수정 | `robotConnected` nullable 반영 |
| `frontend/src/shared/types/emergency.types.ts` | 신규 | Emergency 타입 추가 |
| `frontend/src/shared/types/index.ts` | 수정 | 타입 export 추가 |
| `frontend/src/features/elder/api/elderApi.ts` | 수정 | UpdateElderPayload에서 status 제거 + EmergencyContact 타입 통합 |
| `frontend/package.json` | 수정 | WebSocket 의존성 추가 |

## 주요 변경 사항
1. Elder/Contact/Emergency CRUD API 및 서비스 구현 (소유권/인증 강화 포함)
2. Emergency 해제 시 다른 PENDING 존재 여부 확인 후 Elder 상태 SAFE 전환
3. 프론트 Elder/Emergency 연동 및 MSW 응답 계약 보강 + 타입 확장
4. Elder 목록 조회 시 배치 조회로 N+1 완화 + PENDING 해제 방어 로직 추가
5. 리뷰 피드백 반영: 이미 해제된 Emergency 재해제 차단(409), `robotConnected` null 표시 일치화
6. ApiResponse record accessor 충돌 해결(`ApiResponse.ok()`)

## 검증 포인트 (리뷰어가 확인해야 할 것)
- [ ] 소유권/권한 체크 누락 여부 (robot/elder/emergency)
- [ ] Emergency 해제 후 Elder 상태 처리의 타당성 (다른 PENDING 존재 시 SAFE 전환 방지)
- [ ] API 응답 구조와 프론트 타입 매핑 일치 여부
- [ ] 테스트 케이스 누락/경계 조건 처리
- [ ] CLAUDE.md/RULES.md 준수 여부

## 테스트 명령어
```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && npm run test
```

## 우려 사항 / 특별 검토 요청
- Emergency 해제 시 다른 PENDING 존재 여부 체크 로직의 타당성 확인 부탁드립니다.
- Elder 삭제 시 Robot 연결 존재 시 CONFLICT 반환 추가했는데, 정책적으로 맞는지 확인 필요합니다.

## 테스트 실행 여부
- Backend:
  - `./gradlew test --tests "site.silverbot.api.emergency.service.EmergencyServiceTest"` 통과
  - `./gradlew test` 실패 (총 26개 중 16 fail, `DataIntegrityViolationException` 기반 기존 테스트 데이터 무결성 이슈)
- Frontend:
  - `npm run test` 통과 (Test Files 3, Tests 9)
  - 실행 시각: 2026-02-06 (KST)
