# Phase 3 Round 2 작업 지시 [Agent 1]

## 브랜치
- `feature/phase3-activity-report-be`

## 목표 (우선순위)
1. PLAN 3.2 활동 로그 Backend 완료
- `GET /api/elders/{elderId}/activities` (date query 지원)
- `POST /api/robots/{robotId}/activities`

2. PLAN 3.4 AI 리포트 Backend 완료
- `GET /api/elders/{elderId}/reports/weekly`
- 주간 리포트 생성 스케줄러

3. Agent 2 연동용 계약 고정
- Dashboard 복약 요약(아침/저녁) 응답 계약 명시
- History/Report 화면이 바로 소비 가능한 응답 필드 확정

## 제약
- DB 스키마 변경은 원칙적으로 금지
- DB 변경이 불가피하면 Agent 3/Agent 0 승인 후 진행

## 테스트
```bash
cd backend
./gradlew --no-daemon test --console=plain
```

## 산출물
- 코드 커밋/푸시 (`--force-with-lease` 허용)
- `agent-1/.agent/reviews/REVIEW-REQUEST-P3-AGENT1.md` 갱신
- Agent 2/4가 참조할 응답 계약 요약 추가
