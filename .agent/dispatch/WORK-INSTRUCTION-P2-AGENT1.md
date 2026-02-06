# Phase 2 작업 지시 [Agent 1]

## 브랜치
`feature/phase2-medication-dashboard-be`

## 담당 범위
- PLAN 2.2 복약 관리(Backend)
- PLAN 2.9 대시보드(Backend)

## 구현 항목
1. Medication API
- `POST /api/elders/{elderId}/medications`
- `GET /api/elders/{elderId}/medications`
- `GET /api/elders/{elderId}/medications/{id}`
- `PUT /api/elders/{elderId}/medications/{id}`
- `DELETE /api/elders/{elderId}/medications/{id}`
- `POST /api/elders/{elderId}/medications/records`
2. 복약 집계 로직
- 주간 복용률 계산
- 일별 상태 포함 응답
3. Dashboard API
- `GET /api/elders/{elderId}/dashboard`
- 오늘 요약/최근 알림/주간 일정/로봇 상태 통합 응답

## 비범위
- Flyway/신규 엔티티 스키마 생성(Agent 3 우선)
- Notification 도메인 구현(Agent 4)
- Dashboard UI 구현(Agent 2)

## 완료 기준
- Controller/Service 테스트 + 핵심 경계케이스(소유권/권한/빈 데이터) 검증.
- REST Docs(사용 중이면) 스니펫 갱신.

## 테스트 명령
```bash
cd backend
./gradlew test
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P2-AGENT1.md` 작성
