# Phase 3 Round 2 작업 지시 [Agent 3]

## 브랜치
- `feature/phase3-db-patrol-ai`

## 역할
- 기본 역할: DB/마이그레이션 안정성 검증 및 지원
- 조건부 역할: Agent 1 요구가 있는 경우에만 비파괴 DB 변경 수행

## 기본 수행 항목
1. Flyway + PostgreSQL 통합 검증 재실행
2. Activity/Report/Patrol 조회 패턴 인덱스 점검
3. Agent 1/2 구현 과정에서 DB 관련 블로커 대응

## 조건부 수행 항목
- 성능/정합성 이슈가 확인될 때만 마이그레이션 추가
- 변경은 비파괴(인덱스/제약 보강) 중심으로 제한

## 테스트
```bash
cd backend
./gradlew --no-daemon test --tests "site.silverbot.migration.FlywayMigrationVerificationTest" --console=plain
./gradlew --no-daemon test --tests "site.silverbot.api.robot.controller.PatrolControllerTest" --tests "site.silverbot.api.dashboard.controller.DashboardControllerTest" --console=plain
```

## 산출물
- 코드 변경이 있으면 커밋/푸시 (`--force-with-lease` 허용)
- 변경이 없으면 검증 로그를 리뷰 요청서에 기록
- `agent-3/.agent/reviews/REVIEW-REQUEST-P3-AGENT3.md` 갱신
