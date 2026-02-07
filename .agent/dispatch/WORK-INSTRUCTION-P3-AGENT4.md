# Phase 3 Round 2 작업 지시 [Agent 4]

## 브랜치
- `feature/phase3-contract-realtime`

## 목표
1. Agent 1/2 연동용 공통 계약 정렬
- API 응답 타입/프론트 타입 정의 동기화
- 공통 실시간 훅 소비 규칙 명시

2. Mock/테스트 계약 보강
- Activity/Report/Patrol 시나리오에 필요한 mock 데이터 보완
- 계약 mismatch를 조기에 잡는 테스트 보강

3. 통합 검증 지원
- Agent 2가 화면 구현 시 shared 계층 충돌 없이 소비하도록 가이드 제공

## 제약
- 도메인 기능 본 구현(서비스/컨트롤러/페이지)은 담당 Agent에 위임
- Agent 4는 공통 계약, 타입, 실시간 연계 중심으로 작업

## 테스트
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시 (`--force-with-lease` 허용)
- `agent-4/.agent/reviews/REVIEW-REQUEST-P3-AGENT4.md` 갱신
- Agent 2 참조용 계약 변경 요약 제공
