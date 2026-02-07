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
