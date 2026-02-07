# Phase 5 Round 1 작업 지시 [Agent 2]

## 브랜치
- `feature/phase5-lcd-ui-fe`

## 목표
1. LCD 전용 프론트 앱 구성
- `/frontend-lcd` 프로젝트 생성(Vite + React + TypeScript)
- 기본 라우팅/레이아웃/앱 진입점 구성

2. LCD 모드 화면 구현
- IDLE, GREETING, MEDICATION, SCHEDULE, LISTENING, EMERGENCY, SLEEP
- 대형 터치 영역/가독성 우선 UI 적용

3. 실시간/액션 연동
- `/topic/robot/{robotId}/lcd` 구독 기반 화면 전환
- 버튼 액션 -> 백엔드 이벤트 API 호출(`TAKE`, `LATER`, 확인/긴급)

## 제약
- `frontend-lcd/src/shared/*`, `frontend-lcd/src/mocks/*`는 Agent 4 소유
- 계약 해석 불일치 시 Agent 4/Agent 0에 즉시 공유

## 테스트
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P5-AGENT2.md` 작성/갱신
