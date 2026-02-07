# Phase 5 Round 1 작업 지시서 (Coordinator)

## 목적
- Phase 5 범위(LCD 전용 앱 + LCD 제어 이벤트)를 충돌 최소화 방식으로 착수한다.
- `docs/api-specification.md`의 LCD/WebSocket 계약을 기준으로 백엔드/프론트/계약을 병렬 진행한다.

## 브랜치 정책
- Agent별 전용 브랜치:
  - Agent 1: `feature/phase5-lcd-backend-be`
  - Agent 2: `feature/phase5-lcd-ui-fe`
  - Agent 3: `feature/phase5-lcd-events-be`
  - Agent 4: `feature/phase5-lcd-contract-realtime`
- 공통 기준점: `origin/develop` (`9831dac`)
- Push 규칙:
  - `git push -u origin <현재브랜치>`
  - `git push` 단독 사용 금지

## 공통 제약
- `docs/api-specification.md`는 수정 금지(기준 문서로만 사용).
- 타 Agent 소유 파일 직접 수정 금지(필요 시 Agent 0 조정).
- `sync.sh`는 이번 라운드 범위에서 제외(코딩/머지까지만).

## Phase 5 소유권(추가)
- Agent 2:
  - `frontend-lcd/src/app/*`
  - `frontend-lcd/src/pages/*`
  - `frontend-lcd/src/features/*` (LCD 화면/상태 UI)
- Agent 4:
  - `frontend-lcd/src/shared/*`
  - `frontend-lcd/src/mocks/*`
  - LCD 계약 타입/파서/WebSocket payload 정합

## Agent별 담당 범위
- Agent 1 (LCD Backend API):
  - `GET /api/robots/{robotId}/lcd` 계약 정렬 보강
  - `POST /api/robots/{robotId}/lcd-mode` 구현/검증
  - LCD 모드 변경 시 `/topic/robot/{robotId}/lcd` 브로드캐스트 보장
- Agent 2 (LCD Frontend UI):
  - `/frontend-lcd` 앱 구성
  - LCD 모드별 화면(IDLE/GREETING/MEDICATION/SCHEDULE/LISTENING/EMERGENCY/SLEEP)
  - WebSocket 수신 기반 화면 전환 + 액션 버튼 연동
- Agent 3 (LCD Event Backend):
  - `POST /api/robots/{robotId}/events` 구현
  - LCD 버튼 액션(`TAKE`, `LATER`, 긴급/확인 등) 처리 및 저장
  - 필요한 DB 마이그레이션(비파괴 우선)
- Agent 4 (Contract/Mock/Realtime):
  - LCD 계약 타입/파서 정렬
  - MSW 핸들러(`/lcd`, `/lcd-mode`, `/events`) 정렬
  - LCD WebSocket payload 파서/훅 정렬 및 Agent 2 소비 가이드 제공

## 교차 조정 포인트
1. Agent 1 ↔ Agent 4
- `POST /lcd-mode` 요청/응답 필드(mode, emotion, message, subMessage, updatedAt) 계약 고정
2. Agent 3 ↔ Agent 4
- `POST /events` payload/action enum 계약 고정
3. Agent 2 ↔ Agent 4
- `frontend-lcd` 공통 타입/웹소켓 payload는 Agent 4 계약 우선

## 머지 순서 (Round 1)
1. Agent 3 (events + migration)
2. Agent 1 (lcd backend API)
3. Agent 4 (contract/mock/realtime)
4. Agent 2 (lcd ui integration)
5. Agent 0 문서 브랜치(`management/architect`) -> `develop`

## 완료 기준 (Round 1)
- Agent 1~4 각자 `REVIEW-REQUEST-P5-AGENT{N}.md` 작성 완료
- 새 세션 리뷰 `REVIEW-RESULT-P5-AGENT{N}.md` Approve 확보
- 위 머지 순서대로 `develop` 반영 완료

---

## Round 2 수정 조정 (Review Follow-up)

### 조정 항목 A: Agent 1 ↔ Agent 4 (LCD 문자열 계약 고정)
- 배경:
  - Agent 1 리뷰에서 `GET /lcd`, `POST /lcd-mode`, `LCD_MODE_CHANGE` payload의
    `message/subMessage`가 `null`로 내려갈 수 있는 이슈 확인.
  - Agent 4 LCD 계약 파서는 `message/subMessage`를 string 필수로 파싱.
- 실행:
  1. Agent 1은 응답/브로드캐스트에서 `null -> ""` 정규화.
  2. Agent 4는 계약 파서 strict 유지(문자열 필수).

### 조정 항목 B: Agent 2 ↔ Agent 3 ↔ Agent 4 (`TAKE + medicationId`)
- 배경:
  - Agent 3 리뷰에서 `action=TAKE` + `medicationId` 누락 시 무음 성공 이슈 확인.
  - Round 2에서 `TAKE` 요청은 `medicationId` 필수로 고정 필요.
- 실행:
  1. Agent 3은 `TAKE` + `medicationId` 누락 시 `400` 실패 처리 및 정합성 수정.
  2. Agent 4는 이벤트 계약 타입/파서에 `medicationId`와 조건부 필수 규칙 반영.
  3. Agent 2는 `TAKE` 전송 시 `medicationId`를 포함하도록 payload 경로 보강.

### Round 2 머지 게이트
1. Agent 3 정합성 이슈 수정 + 재리뷰 Approve
2. Agent 1 LCD 문자열 계약 수정 + 재리뷰 Approve
3. Agent 4 계약/Mock 정렬 + 재리뷰 Approve
4. Agent 2 이벤트 payload 정렬 + 재리뷰 Approve
5. Agent 0 순차 병합 (권장: 3 -> 1 -> 4 -> 2)
