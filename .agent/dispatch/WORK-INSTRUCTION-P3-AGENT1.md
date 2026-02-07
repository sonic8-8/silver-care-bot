# Phase 3 작업 지시 [Agent 1]

## 브랜치
`feature/phase3-activity-report-be`

## 우선순위 A (게이트 선행)
1. 대시보드 복약 요약 API 계약 보완
- Dashboard 응답이 아침/저녁 복약 상태 UI를 지원하도록 보완
- Agent 2와 응답 스키마 합의 후 구현
2. 테스트 갱신
- `DashboardControllerTest`/관련 서비스 테스트 보강
- 권한/빈데이터/기록 누락 케이스 검증

## 우선순위 B (Phase 3 본작업, 게이트 종료 후)
- PLAN 3.2 활동 로그 Backend
  - `GET /api/elders/{elderId}/activities`
  - `POST /api/robots/{robotId}/activities`
- PLAN 3.4 AI 리포트 Backend
  - `GET /api/elders/{elderId}/reports/weekly`
  - 주간 리포트 생성 스케줄러

## 비범위
- Phase 3 DB 스키마 생성(Agent 3)
- History/Report UI(Agent 2)

## 완료 기준
- API 계약 문서(요청/응답 예시)와 테스트 결과 공유
- 변경 범위 테스트 통과

## 테스트 명령
```bash
cd backend
./gradlew test
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P3-AGENT1.md` 작성
