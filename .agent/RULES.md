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
