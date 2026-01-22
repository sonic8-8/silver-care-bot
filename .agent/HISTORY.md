# HISTORY.md

> 프로젝트 영구 작업 로그 (Permanent Archive)

---

<!-- 
작업 로그 작성 형식:

<details>
<summary>YYYY-MM-DD: 작업 제목</summary>

### 작업 내용
- 완료된 작업 목록

### 에러/이슈
- 발생한 문제 및 해결 방법

### 참고
- 관련 파일, 커밋 해시 등

</details>
-->

<details>
<summary>2026-01-22: Phase 1 디자인 시스템 구축 완료</summary>

### 작업 내용

#### 1. Tailwind 테마 설정
- 딥블루 색상 팔레트 적용 (`#1E3A5F`)
- 피치 색상 팔레트 적용 (로봇 LCD용)
- 시맨틱 컬러 정의 (safe, warning, danger)
- LCD용 타이포그래피 추가 (lcd-title, lcd-body, lcd-caption)

#### 2. 다크 모드 인프라
- `themeStore.ts` 생성 (Zustand + persist)
- 시스템 설정 / 라이트 / 다크 3가지 옵션
- 시스템 테마 변경 감지 (matchMedia)
- 설정 화면에 테마 토글 UI 추가

#### 3. impl.html 전체 이식
- 총 13개 화면을 Playground 페이지로 이식
- 로그인, 회원가입, 어르신선택, 대시보드, 설정
- 일정, 로봇제어, 약관리, 기록, 알림, 긴급, LCD미러링
- 로봇 LCD 7개 모드 (대기, 인사, 복약, 긴급, 통화, 충전, 수면)

### 의사결정 기록

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| 다크 모드 기본값 | 시스템 설정 따라가기 | 토스/카카오 등 실무 표준 |
| 토글 위치 | 설정 페이지 내부 | UI 깔끔하게 유지 |
| TDD 적용 | 미적용 | 디자인 다듬기 단계이므로 (CLAUDE.md 지침) |
| 컴포넌트 분리 | 미적용 | 디자인 확정 후 분리 예정 |

### 생성/수정된 파일
- `tailwind.config.js` - 색상 토큰, 다크 모드
- `shared/store/themeStore.ts` - 테마 상태 관리
- `pages/Playground/index.tsx` - 전체 UI (~1160줄)

### 참고
- Playground: http://localhost:5173/playground
- PLAN.md Phase 1 완료 표시

</details>

<details>
<summary>2026-01-21: 프로젝트 초기 설정 완료</summary>

### 작업 내용
- TypeScript 마이그레이션 (`tsconfig.json`, `main.tsx`, `App.tsx`)
- 테스트 환경 구축 (Vitest, RTL, Playwright, MSW)
- 라이브러리 설치 (React Router, TanStack Query, Zustand, Axios, cva, tailwind-merge)
- Tailwind 디자인 토큰 설정
- MSW 핸들러 작성 (`auth.ts`, `elder.ts`)
- CLAUDE.md 거버넌스 문서 작성

### 참고
- 개발 서버: `npm run dev` → http://localhost:5173

</details>

