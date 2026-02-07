# Phase 3 작업 지시 [Agent 4]

## 브랜치
`feature/phase3-contract-realtime`

## 우선순위 A (게이트 선행)
1. 알림 목록 무한 스크롤 UX 보강
- `/notifications` 페이징/더보기 UX 개선
- 중복 로딩/끝 페이지 처리
2. 실시간 공통 훅 정리
- 대시보드용 로봇/어르신 상태 구독 훅 제공
- 재연결/중복 이벤트 방지
3. 계약 정합성
- Agent 1/2와 API/WS payload 계약 동기화

## 우선순위 B (Phase 3 본작업, 게이트 종료 후)
- Phase 3 공통 타입/계약/실시간 연동 보강
- 필요 시 Mock/테스트 핸들러 업데이트

## 비범위
- 도메인 API 본 구현(Agent 1, Agent 3)
- History/Report 화면 본 구현(Agent 2)

## 완료 기준
- 알림 무한스크롤과 실시간 갱신 동시 동작 검증
- 공통 훅 문서화(사용 예시 포함)

## 테스트 명령
```bash
# Backend
cd backend
./gradlew test

# Frontend
cd frontend
npm run test -- --run
npm run build
```

## 산출물
- 코드 커밋/푸시
- `REVIEW-REQUEST-P3-AGENT4.md` 작성
