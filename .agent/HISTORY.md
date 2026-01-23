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
<summary>2026-01-23: LCD 화면 리팩토링 (ui-implementation-plan.md 동기화)</summary>

### 📋 계획 (PLAN 요약)
- LCD 화면을 ui-implementation-plan.md 와이어프레임에 정확히 맞춤
- 손주 말투 ("할머니~") 통일
- 어르신용 초대형 버튼 (80px+) 추가
- 불필요한 화면 삭제, 누락 화면 추가

### 🛠️ 작업 내용

#### 1. 삭제된 화면
| 화면 | 삭제 이유 |
|------|----------|
| 통화 (`call`) | ui-implementation-plan.md에 없음 |
| 수면 (`sleep`) | ui-implementation-plan.md에 없음 |

#### 2. 추가된 화면
| 화면 | 설명 |
|------|------|
| 일정 알림 (`schedule`) | 📅 + 일정 카드 + 확인 버튼 |
| 대화/듣는 중 (`listening`) | 🎤 + 파동 애니메이션 |

#### 3. 수정된 화면
| 화면 | 변경 사항 |
|------|----------|
| 대기 | 대사 추가, 다음 일정 카드, 상태바 텍스트 |
| 인사 | 피치 배경, 날씨 정보, 일정 안내 |
| 복약 | 손주 말투, 80px+ 버튼 2개 |
| 긴급 | 손주 말투, 80px+ 버튼 2개, 안내 문구 |
| 충전 | 손주 말투, 시간 표시, 대사 2개 |

#### 4. 접근성 개선
- 다크 모드 로봇 로그인 버튼: `dark:bg-primary-600` 추가
- 미사용 import 정리 (PhoneOff, Video, PhoneIncoming)

### 📁 수정된 파일
- `frontend/src/pages/Playground/index.tsx` - RobotFaceApp 전면 재작성
- `.agent/PRD.md` - LCD 화면 목록 7개로 업데이트
- `.agent/ADR.md` - ADR-005 추가

### ✅ 검증 결과
- 브라우저에서 7개 LCD 화면 모두 정상 동작 확인
- 스크린샷 및 녹화 완료

</details>

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

