# Phase 5 Round 1 작업 지시 [Agent 4]

## 브랜치
- `feature/phase5-lcd-contract-realtime`

## 목표
1. LCD 계약 타입/파서 정렬
- LCD mode/emotion/message/subMessage/nextSchedule payload 타입 정렬
- `POST /lcd-mode`, `POST /events` 요청/응답 파서 정의

2. Mock/테스트 보강
- `frontend-lcd` 기준 MSW 핸들러 추가:
  - `GET /api/robots/{robotId}/lcd`
  - `POST /api/robots/{robotId}/lcd-mode`
  - `POST /api/robots/{robotId}/events`
- 계약 mismatch 탐지 테스트 추가

3. 실시간 수신 계층 정리
- `/topic/robot/{robotId}/lcd` payload 파서/훅 제공
- Agent 2가 바로 소비 가능한 사용 가이드 제공

## 제약
- `frontend-lcd/src/pages/*`, `frontend-lcd/src/features/*`는 Agent 2 소유
- 백엔드 도메인 구현(서비스 본체)은 Agent 1/3 소유

## 테스트
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P5-AGENT4.md` 작성/갱신
- Agent 2 공유용 계약 변경 요약
