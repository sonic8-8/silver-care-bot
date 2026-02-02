# Project Rules & Constraints

> 프로젝트 전체에 적용되는 제약조건 및 금지사항

---

## 🚫 금지 사항 (Don'ts)

### UI/UX
- 이모지를 프로덕션 UI에 사용하지 않음 (Lucide 아이콘 사용)
- 인라인 스타일 (`style={{}}`) 사용 금지
- WCAG AA 미만의 색상 대비 사용 금지
- 어르신용 LCD에서 24px 미만 폰트 사용 금지

### 코드
- `any` 타입 남용 금지 (unknown, 제네릭 사용)
- Class 컴포넌트 사용 금지 (함수형만)
- 컴포넌트에서 직접 axios 호출 금지

### 병렬 작업
- ❌ **타 Agent 담당 파일 수정 금지** (CLAUDE.md 파일 소유권 참조)
- ❌ **공유 파일 동시 수정 금지** (build.gradle, package.json, router.tsx)
- ❌ **의존성 미완료 작업 선행 시작 금지** (AUTH 미완료 시 인증 필요 API 구현 금지)
- ❌ **싱크 포인트 미확인 머지 금지** (체크리스트 완료 전 develop 머지 금지)
- ❌ **Agent ID 없는 커밋 금지** (커밋 메시지에 `[Agent N]` 필수)

---

## ✅ 필수 사항 (Must-haves)

### UI/UX
- 모든 버튼: 최소 48px 터치 타겟 (LCD는 64px)
- 긴급 알림: 빨강 계열만 사용
- 모든 이미지: alt 텍스트 필수
- 포커스 표시: 키보드 탐색 시 명확한 아웃라인

### 접근성
- 보호자 웹앱: WCAG AA 준수
- 로봇 LCD: WCAG AAA 준수 (어르신용)

### 코드
- 테스트 없이 기능 구현 완료로 간주하지 않음 (디자인 초안/레이아웃 다듬기는 TDD 제외)
- 컴포넌트당 하나의 파일
- API 호출은 `features/*/api/` 또는 `shared/api/`에 분리

### 병렬 작업
- ✅ **커밋 메시지에 Agent ID 명시**: `feat(auth): 구현 [Agent 1]`
- ✅ **브랜치 네이밍 규칙 준수**: `feature/phase{N}-{domain}`
- ✅ **머지 전 싱크 포인트 체크리스트 확인** (CLAUDE.md 참조)
- ✅ **의존성 있는 작업은 Mock으로 우회**: `@WithMockUser`, MSW 활용
- ✅ **일일 싱크**: 작업 시작 전 어제 완료/오늘 할 일/블로커 공유
- ✅ **PARALLEL-WORK.md 참조**: 작업 분배 및 머지 순서 확인

---

## 📏 기술 제약 (Tech Constraints)

### Frontend
| 항목 | 기술 |
|------|------|
| Framework | React 19 + Vite |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS + cva + tailwind-merge |
| Icons | Lucide React |
| State (Server) | TanStack Query |
| State (Client) | Zustand |
| Routing | React Router 7.x |

### 색상 팔레트
| 용도 | Primary | Background |
|------|---------|------------|
| 보호자 웹앱 | 딥블루 `#1E3A5F` | 화이트/그레이 |
| 로봇 LCD | 피치 `#FFAB91` | 크림 `#FFF8F5` |

### LCD 해상도
- 크기: 7인치
- 해상도: 1024 x 600
- 최소 폰트: 24px
- 최소 터치 타겟: 64px

---

## 🔄 업데이트 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-22 | 초기 작성 |
| 2026-01-22 | 디자인 초안/레이아웃 다듬기 TDD 제외 명시 |
| 2026-02-02 | 병렬 작업 금지/필수 사항 추가 (4 Agent 병렬 개발 대응) |
