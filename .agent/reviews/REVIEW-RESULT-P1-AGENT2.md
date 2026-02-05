# 코드 리뷰 결과 [Agent 2] - Phase 1

## 요약
- **전체 평가**: ⚠️ Request Changes
- **Critical 이슈**: 1건
- **Major 이슈**: 3건
- **Minor 이슈**: 1건

## 발견된 이슈

### [Critical] ApiResponse record accessor 충돌로 백엔드 컴파일 실패
- 파일: `backend/src/main/java/site/silverbot/api/common/ApiResponse.java:16`
- 내용: record 컴포넌트 `success`의 자동 생성 accessor `success()`와 동일 시그니처의 static `success()`가 충돌하여 컴파일 실패.
- 영향: `./gradlew test` 자체가 실패하여 머지 불가.
- 제안: no-arg static 메서드를 `ok()`/`empty()` 등으로 rename하거나 제거하고 호출부에서 `ApiResponse.success(null)` 사용.

### [Major] 소유권 규칙 위반 파일 수정
- 규칙: `CLAUDE.md`의 파일 소유권 규칙에 따라 `domain/**`는 Agent 3, `shared/**`/`mocks/**`는 Agent 4 소유.
- 위반 파일:
  - `backend/src/main/java/site/silverbot/domain/elder/Elder.java`
  - `backend/src/main/java/site/silverbot/domain/elder/EmergencyContact.java`
  - `backend/src/main/java/site/silverbot/domain/emergency/Emergency.java`
  - `backend/src/main/java/site/silverbot/domain/emergency/EmergencyRepository.java`
  - `backend/src/main/java/site/silverbot/domain/robot/RobotRepository.java`
  - `frontend/src/shared/types/elder.types.ts`
  - `frontend/src/shared/types/emergency.types.ts`
  - `frontend/src/shared/types/index.ts`
  - `frontend/src/mocks/handlers/elder.ts`
  - `frontend/src/mocks/handlers/emergency.ts`
- 제안: 해당 변경은 Agent 3/4와 협의하여 그들의 브랜치로 이동하거나, Agent 0 통해 조정 필요.

### [Major] Emergency 해제 시 잘못된 예외 타입
- 파일: `backend/src/main/java/site/silverbot/api/emergency/service/EmergencyService.java:102-104`
- 내용: `PENDING` 해제 요청 시 `IllegalArgumentException` 사용 → 별도 예외 핸들러 없으면 500으로 처리될 가능성 큼.
- 제안: `ResponseStatusException(HttpStatus.BAD_REQUEST, ...)` 또는 전용 예외로 400 반환.

### [Major] 커스텀 훅 테스트 누락 (TDD 규칙 위반)
- 규칙: `CLAUDE.md`에서 커스텀 훅 테스트 필수.
- 누락 대상: `frontend/src/features/elder/hooks/useElderDetail.ts` (테스트 파일 없음)
- 제안: `useElderDetail.test.tsx` 추가.

### [Minor] Elder 목록 조회 시 중복 로봇 키 충돌 위험
- 파일: `backend/src/main/java/site/silverbot/api/elder/service/ElderService.java:84-89`
- 내용: `Collectors.toMap` 사용 시 동일 elder에 복수 robot이 있으면 `IllegalStateException` 발생.
- 제안: 1:1 제약이 없다면 merge 함수 추가 또는 DB 레벨에서 유일성 보장 확인.

## 테스트 실행 결과
- Backend: `./gradlew test` 실패 (ApiResponse record accessor 충돌)
- Frontend: `npm run test` 통과 (Test Files 3, Tests 9)

## 오픈 질문/확인 사항
- `/api/robots/{robotId}/emergency` 호출 주체가 로봇(비인증)이라면 `EmergencyService.reportEmergency`의 `getCurrentUser()` 검증이 항상 실패합니다. 이 엔드포인트의 인증 정책이 워커용인지 로봇용인지 정책 확인 필요.

## 최종 의견
- 컴파일 실패 이슈와 소유권 위반 정리 전에는 머지 불가.
- 위 이슈 조치 후 재확인 요청 바랍니다.
