# Fix Instruction - P3 Agent 3 (Round 6)

## 대상 브랜치
- `feature/phase3-db-patrol-ai`

## 리뷰 판정
- `Approve` (Critical 0, Major 0, Minor 0)

## 수정 지시
- 이번 라운드 블로킹 수정 지시 없음 (머지 게이트 영향 없음)

## 참고
- V9 인덱스 및 Flyway 검증 결과는 승인 기준 충족
- Agent 4 계약 정렬 이슈(`PatrolTarget`, nullable 필드)에 대한 백엔드 계약 기준 확인 요청이 오면 우선 응답
- 현재 원격 기준 `origin/develop..origin/feature/phase3-db-patrol-ai` 추가 코드 커밋이 없으면 병합 생략 가능

## 완료 기준
- 본 브랜치는 현재 기능 기준 머지 가능
- Round 6 병합 전 최신 `origin/develop` 기준으로 충돌 재점검 권장
