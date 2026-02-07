# Phase 3 작업 지시 [Agent 3]

## 브랜치
`feature/phase3-db-patrol-ai`

## 0단계(게이트 기간)
- Phase 3 DB 설계/마이그레이션 초안 준비
- ERD/인덱스/제약 검토
- 본 구현(DDL + 엔티티 + API)은 게이트 종료 후 착수

## 1단계 (Phase 3 본작업)
1. PLAN 3.1 데이터베이스 확장
- ACTIVITY, PATROL_RESULT, PATROL_ITEM, CONVERSATION, SEARCH_RESULT, AI_REPORT
2. PLAN 3.6 순찰 피드 Backend
- `GET /api/elders/{elderId}/patrol/latest`
- `GET /api/elders/{elderId}/patrol/history`
- `POST /api/robots/{robotId}/patrol/report`
3. PLAN 3.8 대화/검색 기록 Backend
- `GET/POST /api/robots/{robotId}/conversations`
- `GET/POST /api/robots/{robotId}/search-results`

## 비범위
- History/Report UI(Agent 2)
- Activity/Weekly Report API 구현 본체(Agent 1)

## 완료 기준
- Flyway clean DB 적용 가능
- 핵심 쿼리 인덱스 근거 제시
- CRUD/조회 테스트 통과

## 테스트 명령
```bash
cd backend
./gradlew test
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P3-AGENT3.md` 작성
