## 코드 리뷰 요청 [Agent 4]

### 작업 정보
- 브랜치: `feature/phase3-contract-realtime`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P3.md`
  - `agent-0/.agent/dispatch/FIX-INSTRUCTION-P3-AGENT4.md` (Round 7)
- 리뷰 대상: Round 7 Request Changes(Major 3, Minor 1) 후속 수정본

### Round 7 처리 결과
1. Patrol target 계약 병행 허용 + 정규화
- `APPLIANCE`, `MULTI_TAP` 모두 파서 입력 허용
- 화면 소비 모델은 `MULTI_TAP`으로 정규화

2. `lastPatrolAt` nullable 허용
- `PatrolLatestPayload.lastPatrolAt: string | null`
- 순찰 이력 없음 케이스에서도 파서 예외 없이 처리

3. Activity `title` nullable 허용
- `ActivityItem.title: string | null`
- null title 데이터에서 목록 파싱 실패 방지

4. 회귀 테스트 보강
- `APPLIANCE` 허용 케이스
- `MULTI_TAP` 허용 케이스
- `lastPatrolAt: null` 케이스
- `activity.title: null` 케이스

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/shared/types/history.types.ts` | 수정 | Patrol target 병행 허용/정규화, `lastPatrolAt` nullable, `activity.title` nullable 반영 |
| `frontend/src/shared/types/history.types.test.ts` | 수정 | Round 7 요구 회귀 테스트 4종 추가 |
| `frontend/src/mocks/handlers/history.ts` | 신규 | Activity/Report/Patrol Mock 핸들러 |
| `frontend/src/mocks/handlers/index.ts` | 수정 | `historyHandlers` 등록 |
| `frontend/src/shared/types/index.ts` | 수정 | `history.types` export 추가 |
| `frontend/src/shared/websocket/README.md` | 수정 | History/Report/Patrol 실시간 소비 규칙 문서화 |

### Agent 2 참조용 계약 요약
- Activity: `parseActivityListPayload` 사용, `title` nullable 수용
- Weekly Report: `parseWeeklyReportPayload` 사용 (고정 필드 기반 strict 파싱)
- Patrol: `parsePatrolLatestPayload` 사용, `lastPatrolAt` nullable, target은 출력 시 `MULTI_TAP` 정규화

### 검증 명령
```bash
cd frontend
npm run test -- --run src/shared/types/history.types.test.ts
npm run test -- --run
npm run build
npm run lint
```

### 검증 결과
- `npm run test -- --run src/shared/types/history.types.test.ts` → PASS (1 file, 7 tests)
  - 1회 워커 타임아웃 재시도 후 정상 통과
- `npm run test -- --run` → PASS (18 files, 52 tests)
- `npm run build` → PASS
- `npm run lint` → FAIL (기존 미추적 생성 JS 설정 파일 이슈)
  - `frontend/playwright.config.js`, `frontend/vite.config.js`, `frontend/vitest.config.js`
  - 이번 Round 7 수정 파일에서 신규 lint 오류는 확인되지 않음

### 리뷰어 확인 요청
- [ ] Round 7 Major 3건이 모두 해소되었는지
- [ ] `APPLIANCE -> MULTI_TAP` 정규화 정책이 화면/백엔드 양측 계약에 부합하는지
- [ ] nullable 허용(`activity.title`, `lastPatrolAt`)이 Agent 2 화면 시나리오에서 충분한지
