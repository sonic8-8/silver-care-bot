# Phase 3 작업 지시 [Agent 2]

## 브랜치
`feature/phase3-history-report-fe`

## 우선순위 A (게이트 선행)
1. 일정 관리 Frontend 완성
- `/elders/:id/schedule` 실데이터 연동
- 주간 캘린더/리스트 전환
- 일정 추가/수정 모달
- 일정 유형별 색상 구분
2. 대시보드 실시간 반영
- `/elders/:elderId`에서 로봇/어르신 상태 실시간 갱신
- Agent 4가 제공하는 공통 realtime 훅 사용
3. 대시보드 복약 UI 정합
- Agent 1의 계약 반영(아침/저녁 복약 표시)

## 우선순위 B (Phase 3 본작업, 게이트 종료 후)
- PLAN 3.3 활동 로그 Frontend
- PLAN 3.5 AI 리포트 Frontend
- PLAN 3.7 순찰 결과 카드(대시보드)

## 비범위
- Backend API/스키마 수정

## 완료 기준
- 게이트 3개 중 FE 담당 항목 종료
- 화면 단 수동 시나리오(조회/등록/수정/실시간 갱신) 검증

## 테스트 명령
```bash
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P3-AGENT2.md` 작성
