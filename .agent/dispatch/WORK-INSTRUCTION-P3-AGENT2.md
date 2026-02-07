# Phase 3 Round 2 작업 지시 [Agent 2]

## 브랜치
- `feature/phase3-history-report-fe`

## 목표 (우선순위)
1. PLAN 3.3 활동 로그 Frontend 완료
- `/elders/:id/history` 활동 로그 탭 구현
- 타임라인/날짜 선택/활동 유형 표시

2. PLAN 3.5 AI 리포트 Frontend 완료
- History 화면 리포트 탭 구현
- 복용률/활동량/키워드/추천사항 시각화

3. PLAN 3.7 순찰 피드 Frontend 완료
- 대시보드 순찰 카드 구현
- 경고 항목 하이라이트 + 마지막 순찰 시각 표시

## 선행 계약
- Agent 1 응답 계약 고정본 기준으로 연동
- Agent 4 공통 타입/실시간 소비 계약 준수

## 제약
- `frontend/src/shared/**`, `frontend/src/mocks/**` 직접 수정 금지
- 공통 계층 변경 필요 시 Agent 4에 요청

## 테스트
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시 (`--force-with-lease` 허용)
- `agent-2/.agent/reviews/REVIEW-REQUEST-P3-AGENT2.md` 갱신
