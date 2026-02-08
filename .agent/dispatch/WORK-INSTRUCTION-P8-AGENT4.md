# Phase 8 작업 지시 [Agent 4]

## 브랜치
- `feature/phase8-design-system-foundation`

## 목표
- 초기 초안 디자인의 공통 시각 규칙을 `shared/ui` 기반으로 복원하고, 화면별 적용 시 충돌을 줄이는 기반을 만든다.

## 작업 범위
1. 공유 UI 기초 정렬
- 대상:
  - `frontend/src/shared/ui/Button.tsx`
  - `frontend/src/shared/ui/Card.tsx`
  - `frontend/src/shared/ui/Header.tsx`
  - `frontend/src/shared/ui/Badge.tsx`
  - `frontend/src/shared/ui/Input.tsx`
  - `frontend/src/shared/ui/SectionHeader.tsx`
  - `frontend/src/shared/types/ui.types.ts` (필요 시)
- 요구:
  - 초안 컴포넌트 톤/spacing/타이포를 우선 반영
  - 기존 Props/variant 계약은 가능한 유지(파급 최소화)

2. 디자인 토큰/유틸 정리
- 대상:
  - `frontend/src/shared/utils/**`
  - `frontend/tailwind.config.*` (필요 시)
- 요구:
  - 색상/라운드/그림자/타이포 토큰을 초안 기준으로 정렬
  - 다크/라이트 모드 전환 동작은 유지

3. 회귀 가드
- 대상:
  - `frontend/src/shared/ui/**/*.test.*` (신규/보강 가능)
- 요구:
  - 핵심 공용 컴포넌트 렌더 회귀 테스트 보강
  - Agent 1~3이 사용하는 variant가 깨지지 않도록 기본 스냅샷/행동 테스트 추가

## 검증
```bash
cd frontend
npm run build
npm run test -- --run
```

## 산출물
- 코드 커밋/푸시
- `agent-4/.agent/reviews/REVIEW-REQUEST-P8-AGENT4.md` 작성
