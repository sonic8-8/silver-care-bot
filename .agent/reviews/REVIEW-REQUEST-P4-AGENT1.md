## 코드 리뷰 요청 [Agent 1]

### 작업 정보
- 브랜치: `feature/phase4-map-room-be`
- 작업 범위: P4 Round 1 (`agent-0/.agent/dispatch/WORK-INSTRUCTION-P4-AGENT1.md`)
- 연계 문서: `agent-0/.agent/dispatch/COORDINATION-P4.md`
- PR 링크: 없음

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/main/java/site/silverbot/api/map/controller/ElderMapController.java` | 신규 | `GET /api/elders/{elderId}/map` 엔드포인트 추가 |
| `backend/src/main/java/site/silverbot/api/map/controller/RobotRoomController.java` | 신규 | `GET/POST/PUT/DELETE /api/robots/{robotId}/rooms` 엔드포인트 추가 |
| `backend/src/main/java/site/silverbot/api/map/service/MapRoomService.java` | 신규 | 지도 응답 조합, Room CRUD, 소유권 검증/에러 처리 로직 구현 |
| `backend/src/main/java/site/silverbot/api/map/request/CreateRoomRequest.java` | 신규 | Room 생성 요청 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/map/request/UpdateRoomRequest.java` | 신규 | Room 수정 요청 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/map/response/ElderMapResponse.java` | 신규 | 지도 조회 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/map/response/RoomListResponse.java` | 신규 | Room 목록 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/map/response/RoomResponse.java` | 신규 | Room 단건 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/api/map/response/CreateRoomResponse.java` | 신규 | Room 생성 응답 DTO 추가 |
| `backend/src/main/java/site/silverbot/domain/robot/RoomRepository.java` | 수정 | roomId 조회/중복 검사용 메서드 확장 |
| `backend/src/main/java/site/silverbot/domain/robot/Room.java` | 수정 | Room 이름/좌표/타입 수정 메서드 추가 |
| `backend/src/test/java/site/silverbot/api/map/controller/ElderMapControllerTest.java` | 신규 | 지도 조회 API 권한/응답 계약 테스트 추가 |
| `backend/src/test/java/site/silverbot/api/map/controller/RobotRoomControllerTest.java` | 신규 | Room CRUD API 및 권한/충돌 테스트 추가 |

### 주요 변경 사항
1. `GET /api/elders/{elderId}/map` 구현: elder 소유권 확인 후 robot/room 데이터를 조합해 `mapId`, `lastUpdatedAt`, `rooms[].bounds`, `robotPosition`, `mapHtml` 응답을 반환하도록 구현했습니다.
2. `GET/POST/PUT/DELETE /api/robots/{robotId}/rooms` 구현: 현재 사용자 소유 robot만 접근 가능하도록 제한하고, 생성 시 `useCurrentLocation`/좌표 직접 지정 분기, roomId 중복(409), 부분 수정, 삭제(204)를 반영했습니다.
3. 권한/에러 규격 정렬: `CurrentUserService` + `AccessDeniedException/EntityNotFoundException/ResponseStatusException` 조합으로 기존 인증/에러 핸들링 체계를 재사용했습니다.
4. 컨트롤러 통합 테스트 추가: 정상/권한 거부/중복 충돌/삭제 상태코드까지 회귀 검증했습니다.

### 검증 포인트 (리뷰어 확인 요청)
- [ ] Map 응답 필드(`mapId`, `rooms[].type/bounds`, `robotPosition`, `mapHtml`)가 P4 FE 소비 계약과 충돌 없는지
- [ ] Room 생성/수정/삭제의 상태 코드(201/200/204)와 에러 코드(403/404/409)가 프로젝트 규약에 맞는지
- [ ] roomId 정규화/중복 처리(대소문자 무시) 방식이 운영 데이터와 호환 가능한지
- [ ] 소유권 검증 경로(유저→elder→robot)가 보안상 우회 여지 없는지

### 테스트 명령어
```bash
cd backend
./gradlew --no-daemon test --console=plain
```

### 테스트 실행 결과
- `BUILD SUCCESSFUL` (2026-02-07, 로컬 `agent-1/backend`)

### 우려 사항 / 특별 검토 요청
- 현재 map 응답의 `bounds.width/height`는 DB 컬럼 부재로 기본값(`220x180`)을 사용합니다. 추후 실제 맵 메타데이터 저장 구조와의 정합성 검토를 부탁드립니다.
