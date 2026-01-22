---
description: TDD 기반 기능 구현 워크플로우
---

# TDD Workflow

## 1. 요구사항 분석
- PRD.md에서 구현할 기능 확인
- 테스트 케이스 목록 작성

## 2. 테스트 먼저 작성 (RED)
```bash
# 테스트 파일 생성
# features/{feature}/components/{Component}.test.tsx
# 또는
# features/{feature}/hooks/use{Hook}.test.ts
```

// turbo
## 3. 테스트 실행 (실패 확인)
```bash
npm run test -- --watch
```

## 4. 최소 구현 (GREEN)
- 테스트 통과하는 최소한의 코드 작성
- 완벽한 코드보다 동작하는 코드 우선

// turbo
## 5. 테스트 재실행 (통과 확인)
```bash
npm run test
```

## 6. 리팩토링 (REFACTOR)
- 코드 정리, 중복 제거
- 테스트는 계속 통과해야 함

## 7. 커밋
```bash
git add .
git commit -m "feat(scope): 기능 설명"
```
