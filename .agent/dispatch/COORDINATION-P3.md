# Phase 3 Round 2 작업 지시서 (Coordinator)

## 목적
- Phase 3 1차 머지 완료 후 남은 기능(PLAN 3.2, 3.3, 3.4, 3.5, 3.7)을 빠르게 닫는다.
- 충돌 최소화를 위해 계약 고정 후 병렬 구현으로 진행한다.

## 브랜치 정책
- 브랜치명은 기존 Phase 3 브랜치 재사용:
  - `feature/phase3-activity-report-be`
  - `feature/phase3-history-report-fe`
  - `feature/phase3-db-patrol-ai`
  - `feature/phase3-contract-realtime`
- 기존 원격 Phase 3 브랜치는 정리 완료(삭제).
- 각 Agent는 작업 완료 시 아래 형태로 원격 브랜치 재생성/갱신:
  - `git push -u origin <현재브랜치> --force-with-lease`

## 라운드 운영 방식 (충돌 최소/속도 우선)
1. Step A: 계약 고정 (짧게)
- Agent 1: Activity/Report/Dashboard 응답 계약 확정
- Agent 4: 공통 타입/Mock/실시간 소비 계약 정렬

2. Step B: 병렬 구현
- Agent 1: Backend 구현 (3.2, 3.4)
- Agent 2: Frontend 구현 (3.3, 3.5, 3.7)
- Agent 4: 공통 계약/연동 보강 및 검증
- Agent 3: DB 변경 필요 시에만 선행 적용, 기본은 검증/지원

## Agent별 범위
- Agent 1: Activity API + Weekly Report API + Scheduler + Dashboard 복약 요약 계약
- Agent 2: History 화면(활동/리포트 탭) + 순찰 카드 UI + API 연동
- Agent 3: (기본) DB/마이그레이션 안정성 검증, (조건부) 필요한 비파괴 인덱스 추가
- Agent 4: shared 계약, 타입, MSW, 실시간 소비 가이드/테스트 보강

## 머지 순서 (Round 2)
- 기본 순서: Agent 1 → Agent 4 → Agent 2
- 예외: Agent 3이 DB 변경 커밋을 만든 경우 Agent 3을 최우선으로 선병합

## 완료 기준 (Round 2)
- PLAN 잔여 항목 완료:
  - 3.2 Activity Backend
  - 3.3 Activity Frontend
  - 3.4 Report Backend
  - 3.5 Report Frontend
  - 3.7 Patrol Frontend
- 각 Agent 리뷰 요청서/리뷰 결과서 갱신 완료
- Agent 0가 순서대로 develop 병합 완료

## 이번 라운드에서 하지 않는 것
- sync.sh 실행은 제외 (코딩/머지까지만 수행)
- Phase 4(Map/Video/LCD) 착수 금지

## Fix Round 6 협업 지시 (2026-02-07)
1. 계약 단일화: PatrolTarget/nullable 규칙 (Agent 3 ↔ Agent 4 ↔ Agent 2)
- PatrolTarget은 `MULTI_TAP` 단일 기준으로 통일 (`APPLIANCE`는 신규 계약에서 사용 금지)
- `patrolLatest.lastPatrolAt` nullable, `activity.title` nullable 규칙을 프론트 파서/타입에 반영
- Agent 2는 History 소비 코드에서 Agent 4 타입 변경을 즉시 반영

2. 날짜 해석 기준 고정 (Agent 2 ↔ Agent 4)
- `date=YYYY-MM-DD`는 로컬 날짜 기준으로 처리
- `new Date('YYYY-MM-DD')` 사용 금지, 로컬 파서 유틸 공통화 권장
- 필요 시 Agent 4가 shared 유틸 또는 타입 가이드 제공

3. 병합 전 브랜치 기준점 정렬 (Agent 1~4 공통)
- 현재 Phase3 브랜치는 `origin/develop` 대비 뒤처진 상태가 커서, 병합 전 기준점 정렬이 필요
- 권장 절차:
  - `git fetch origin`
  - `git rebase origin/develop` 또는 `git checkout -B <same-branch> origin/develop` 후 Round2 커밋 재적용
  - `git push -u origin <branch> --force-with-lease`
- Agent 0는 위 정렬 완료 브랜치만 병합 대상으로 처리

## Fix Round 7 협업 지시 (2026-02-07)
> 아래 규칙이 Round 6의 "PatrolTarget 단일화" 지시를 대체합니다.

1. 순찰 target 계약 병행 허용 (Agent 3 ↔ Agent 4 ↔ Agent 2)
- 기준 문서 우선순위: `api-embedded.md`, `api-ai.md` → `api-specification.md`
- `APPLIANCE`(embedded `patrol/report`)와 `MULTI_TAP`(ai `patrol-results`)를 모두 허용
- 프론트 파서는 둘 다 수용하고, 화면 모델에서는 `MULTI_TAP`으로 정규화 권장

2. nullable/날짜 규칙 유지 (Agent 2 ↔ Agent 4)
- `patrolLatest.lastPatrolAt`: nullable
- `activity.title`: nullable
- `date=YYYY-MM-DD`: 로컬 날짜 기준 파싱 (`new Date('YYYY-MM-DD')` 금지)

3. 브랜치 정렬 후 병합 (Agent 1~4 공통)
- `origin/develop` 기준점 정렬(rebase/reset) 후에만 재리뷰/병합 진행
- push는 `--force-with-lease` 사용
