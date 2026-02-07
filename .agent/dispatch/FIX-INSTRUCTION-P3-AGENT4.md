# Fix Instruction - P3 Agent 4 (Round 6)

## 대상 브랜치
- `feature/phase3-contract-realtime`

## 리뷰 판정
- `Request Changes` (Major 3, Minor 1)

## 필수 수정 사항
1. Patrol target 계약 불일치 수정 (Major, Blocking)
- 대상:
  - `frontend/src/shared/types/history.types.ts`
- 문제:
  - 프론트는 `APPLIANCE`를 허용하지만 백엔드/계약 기준은 `MULTI_TAP`
- 조치:
  - `PATROL_TARGETS`를 `MULTI_TAP` 기준으로 정렬
  - 필요 시 하위호환(`APPLIANCE`)을 임시 허용하되, 파싱 결과는 `MULTI_TAP`로 정규화
  - 기준 문서: `agent-0/docs/api-specification.md` v1.3.2

2. `lastPatrolAt` nullable 허용 (Major, Blocking)
- 대상:
  - `frontend/src/shared/types/history.types.ts`
- 문제:
  - 백엔드는 이력 없음 시 `lastPatrolAt = null` 가능
- 조치:
  - 파서/타입에서 `lastPatrolAt: string | null` 처리
  - 빈 순찰 응답에서도 화면이 깨지지 않도록 보장

3. Activity `title` nullable 허용 (Major, Blocking)
- 대상:
  - `frontend/src/shared/types/history.types.ts`
- 문제:
  - 백엔드 계약상 `title` nullable 가능
- 조치:
  - `ActivityItem.title`을 nullable 처리
  - null 데이터가 있어도 목록 파싱 실패가 발생하지 않도록 수정

4. 회귀 테스트 보강 (Minor, Required)
- 대상:
  - `frontend/src/shared/types/history.types.test.ts`
- 조치:
  - `MULTI_TAP` 허용 케이스
  - `lastPatrolAt: null` 케이스
  - `activity.title: null` 케이스 추가

## 검증 명령
```bash
cd frontend
npm run test -- --run src/shared/types/history.types.test.ts
npm run test -- --run
npm run build
npm run lint
```

## 완료 기준
- Major 3건 해소 + 회귀 테스트 보강 확인
- `agent-4/.agent/reviews/REVIEW-REQUEST-P3-AGENT4.md` 업데이트 후 push
