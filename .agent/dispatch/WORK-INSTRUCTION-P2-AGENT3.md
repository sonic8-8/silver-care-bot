# Phase 2 작업 지시 [Agent 3]

## 브랜치
`feature/phase2-db-schedule`

## 담당 범위
- PLAN 2.1 데이터베이스 확장
- PLAN 2.4 일정 관리(Backend)

## 구현 항목
1. DB/Flyway
- `MEDICATION`, `MEDICATION_RECORD`, `SCHEDULE`, `NOTIFICATION` 테이블/인덱스/제약 추가
- 필요한 ENUM/기본값/FK 명시
2. Domain
- 관련 Entity/Repository 생성
- 공통 감사 컬럼/상태 필드 일관화
3. Schedule API
- `POST /api/elders/{elderId}/schedules`
- `GET /api/elders/{elderId}/schedules` (startDate/endDate/type)
- `GET /api/elders/{elderId}/schedules/{id}`
- `PUT /api/elders/{elderId}/schedules/{id}`
- `DELETE /api/elders/{elderId}/schedules/{id}`
- `POST /api/elders/{elderId}/schedules/voice` (voice_original/normalized_text/confidence)

## 비범위
- Medication/Dashboard Backend 비즈니스 완성(Agent 1)
- Notification 서비스/실시간 발송(Agent 4)

## 완료 기준
- 마이그레이션 신규 DB에 clean 적용 가능.
- 일정 API CRUD + 필터 + 권한 테스트 통과.

## 테스트 명령
```bash
cd backend
./gradlew test
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P2-AGENT3.md` 작성
