# Phase 2 작업 지시 [Agent 2]

## 브랜치
`feature/phase2-medication-dashboard-fe`

## 담당 범위
- PLAN 2.3 복약 관리(Frontend)
- PLAN 2.8 대시보드(Frontend)

## 구현 항목
1. Medication 화면/상태
- `/elders/:id/medications` 라우트/화면
- 주간 복용률 차트
- 약 목록 카드 + 추가/수정 모달
- 일별 복용 상태 캘린더
2. Dashboard 화면
- `/elders/:id` 요약 카드(기상/복약/활동)
- 최근 알림 5개
- 주간 캘린더 위젯
- 로봇 상태 카드(배터리/연결/위치/LCD)
3. API 연동
- Agent 1/4 API 계약 기반 훅/쿼리 연결
- 로딩/에러/빈 상태 처리

## 비범위
- 백엔드 API/DB 마이그레이션
- Notification 도메인 상세 구현(Agent 4)

## 완료 기준
- 주요 사용자 플로우(조회/등록/수정) 수동 검증.
- 기존 UI 컴포넌트 규칙(cva/타입) 준수.

## 테스트 명령
```bash
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P2-AGENT2.md` 작성
