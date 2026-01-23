# 📋 PRD: 실버케어 로봇 웹앱 UI 리디자인

> **프로젝트명**: 미정 (임시: 실버케어 로봇)  
> **작성일**: 2026-01-22  
> **버전**: v1.0  

---

## 1. 개요

### 1.1 배경
실버케어 로봇 서비스의 프로토타입(`impl.html`)을 React 프로젝트로 이식하고, 전문적인 디자인으로 개선한다.

### 1.2 목표
1. Gemini Canvas 프로토타입을 React + TypeScript로 마이그레이션
2. 사용자별 최적화된 디자인 시스템 구축
3. 전문성 있는 UI로 개선 (이모지 → 아이콘)
4. 접근성 기준 충족 (WCAG AA/AAA)

### 1.3 사용자
| 사용자 | 앱 | 주요 활동 |
|--------|-----|----------|
| 사회복지사 | 보호자 웹앱 | 다수 어르신 모니터링, 일정/약 관리 |
| 가족 | 보호자 웹앱 | 어르신 상태 확인, 원격 제어 |
| 어르신 | 로봇 LCD | 로봇과 대화, 알림 확인 (직접 사용) |

---

## 2. 디자인 시스템

### 2.1 색상 팔레트 (하이브리드)

#### 보호자 웹앱 (딥블루 테마)
| 용도 | 컬러 | 코드 |
|------|------|------|
| Primary | 네이비 딥블루 | `#1E3A5F` |
| Primary Hover | 미디엄 블루 | `#2D5A87` |
| Primary Light | 아이스 블루 | `#E8F4FC` |
| Accent | 웜 골드 | `#D4A574` |
| Accent Light | 크림 | `#F5E6D3` |

#### 로봇 LCD (다크 시안 테마) - `lcd-impl.html` 기반
| 용도 | 컬러 | 코드 |
|------|------|------|
| Background | 블랙 | `#000000` |
| Eye | 시안 | `#22d3ee` |
| Eye Glow | 시안 글로우 | `rgba(34, 211, 238, 0.6)` |
| Primary | 토스 블루 | `#3182F6` |
| Safe | 그린 | `#00C471` |
| Danger | 레드 | `#F04452` |
| Text | 화이트 | `#ffffff` |
| Text Sub | 그레이 | `#9ca3af` |

#### 공통 시맨틱 컬러
| 상태 | 컬러 | 코드 | 배경 |
|------|------|------|------|
| Safe | 그린 | `#22C55E` | `#E8F9F0` |
| Warning | 앰버 | `#F59E0B` | `#FFF4E5` |
| Danger | 레드 | `#EF4444` | `#FFEFEF` |

### 2.2 타이포그래피

| 용도 | 보호자 웹앱 | 로봇 LCD |
|------|------------|----------|
| 제목 | 24px Bold | 48px Bold |
| 본문 | 16px Regular | 32px Regular |
| 캡션 | 12px Regular | 24px Regular |
| 버튼 | 16px SemiBold | 32px SemiBold |

**폰트**: Pretendard (한글 최적화)

### 2.3 아이콘
- **라이브러리**: Lucide React
- **스타일**: Outlined, stroke-width 1.5-2px
- **크기**: 16px (인라인) / 20px (카드) / 24px (네비게이션)
- **로봇 표정**: SVG 커스텀 또는 Lottie 애니메이션

### 2.4 컴포넌트 스타일
| 요소 | Border Radius | Shadow |
|------|---------------|--------|
| 카드 | 24px | `0 4px 24px rgba(0,0,0,0.04)` |
| 버튼 | 16px | 없음 (호버 시 적용) |
| 입력 필드 | 16px | 없음 |
| 탭/네비게이션 | 12px | 없음 |

---

## 3. 화면 구조

### 3.1 보호자 웹앱 화면

| # | 화면 | 경로 | 설명 |
|---|------|------|------|
| 1 | 로그인 | `/login` | 보호자/로봇 로그인 선택 |
| 2 | 회원가입 | `/signup` | 보호자 계정 생성 |
| 3 | 어르신 선택 | `/elders` | 관리 대상 목록 (복지사용) |
| 4 | 홈 대시보드 | `/elders/:id` | 어르신 상태 요약 |
| 5 | 일정 관리 | `/elders/:id/schedule` | 캘린더/일정 목록 |
| 6 | 로봇 제어 | `/elders/:id/robot` | 로봇 상태/원격 제어 |
| 7 | 기록 | `/elders/:id/history` | AI 리포트/활동 로그 |
| 8 | 약 관리 | `/elders/:id/medications` | 복약 현황 |
| 9 | 알림 | `/notifications` | 알림 히스토리 |
| 10 | 설정 | `/settings` | 프로필/앱 설정 |
| 11 | 긴급 상황 | `/emergency/:id` | 풀스크린 경고 |
| 12 | LCD 미러링 | `/elders/:id/robot/lcd` | 로봇 화면 프리뷰 |

### 3.2 로봇 LCD 화면 (로봇 로그인 시)

> **참고**: `lcd-impl.html` 기반 (Framer Motion 적용)

#### 3.2.1 모드 정의 (RobotMode)

| # | 모드 | 트리거 | 표정 | 눈 위치 | UI 요소 |
|---|------|--------|------|---------|---------|
| 1 | IDLE | 평상시 | neutral | 중앙 | 메시지 + 다음 일정 카드 |
| 2 | GREETING | 기상/귀가 | happy | 상단 | 인사말 + 날씨 정보 |
| 3 | MEDICATION | 약 시간 | neutral | 상단 | 약 아이콘(bounce) + 초대형 버튼 2개 |
| 4 | SCHEDULE | 일정 N분 전 | surprised | 상단 | 일정 카드 + 확인 버튼 |
| 5 | LISTENING | 음성 인식 | happy | 상단 | 파동 애니메이션 (3개 막대) |
| 6 | EMERGENCY | 낙상 감지 | surprised | 상단 | 배경 점멸 + 119 버튼 |
| 7 | SLEEP | 도킹/충전 | sleep | 중앙 | 충전 상태 메시지 |

#### 3.2.2 표정 시스템 (emotion variants)

```typescript
type emotion = 'neutral' | 'happy' | 'angry' | 'surprised' | 'sleep' | 'suspicious';
```

| 표정 | 눈 높이 | 눈 너비 | borderRadius | 설명 |
|------|---------|---------|--------------|------|
| neutral | 240px | 180px | 50% | 기본 상태 |
| happy | 160px | 200px | 40% 40% 60% 60% | 웃는 눈 |
| surprised | 280px | 200px | 50% + scale 1.1 | 놀란 눈 |
| sleep | 15px | 220px | 10px | 감은 눈 |
| blink | 8px | 200px | 50% | 깜빡임 |

#### 3.2.3 인터랙티브 요소

**자동 깜빡임**:
- 2-5초 랜덤 간격
- 150ms 깜빡임 지속
- SLEEP 모드 제외

**마우스 추적**:
- 눈 위치 ±20px 이동
- sleep, blink, suspicious 상태 제외

**화난 표정**:
- 눈 회전 (좌: -15°, 우: +15°)
- 미간 찌푸리기 효과

#### 3.2.4 상태바 (Top Bar)

```
[시계 HH:MM] ─────────────── [WiFi 연결됨] [배터리 85%]
```

- 시계: 1초마다 업데이트
- 배터리/WiFi: 실시간 상태

#### 3.2.5 컨테이너 레이아웃

| 모드 | 눈 위치 | 눈 크기 |
|------|---------|---------|
| IDLE, SLEEP | 중앙 (y: 0) | 100% |
| GREETING, MEDICATION, SCHEDULE, LISTENING, EMERGENCY | 상단 (y: -120) | 60% |

#### 3.2.6 모드별 UI 상세

**IDLE**:
- 메시지: "할머니~ 오늘도 좋은 하루 되세요!"
- 하단: 다음 일정 카드 (cyan 테마)

**MEDICATION**:
- 약 아이콘 3개 bounce 애니메이션
- 버튼: "응, 먹었어~" (green), "아직이야" (gray)
- 버튼 높이: 80px+

**EMERGENCY**:
- 배경: 빨간색 점멸 (0.8초 간격)
- 버튼: "119 구조 요청" (빨강), "괜찮아요, 오인 감지" (흰색)
- 전체 화면 긴급 모드

**LISTENING**:
- 파동 애니메이션: 3개 막대
- 높이 변화: 10px ↔ 40px
- 반복 지속시간: 1초

---

## 4. 기능 요구사항

### 4.1 다크 모드
- 보호자 웹앱에 다크 모드 지원
- 야간 모니터링 시 눈 피로도 감소
- 시스템 설정 연동 + 수동 토글

### 4.2 로봇 이름 커스터마이징
- 어르신이 로봇 이름을 직접 명명
- 설정 화면에서 변경 가능
- 음성 호출어(Wake Word)로 사용
- LCD 및 보호자 앱에 반영

### 4.3 로봇 LCD 애니메이션
- Framer Motion 기반 동적 표정 시스템
- 자동 깜빡임, 마우스 추적으로 생동감 부여
- 모드 전환 시 부드러운 애니메이션 (spring transition)
- 긴급 상황 시 배경 점멸로 즉각적인 주의 환기

### 4.4 접근성
| 앱 | 기준 | 세부 |
|----|------|------|
| 보호자 웹앱 | WCAG AA | 대비율 4.5:1, 터치 48px |
| 로봇 LCD | WCAG AAA | 대비율 7:1, 터치 64px, 폰트 24px+ |

---

## 5. 기술 스택

| 카테고리 | 기술 |
|----------|------|
| Framework | React 19 + Vite |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 3.x + cva + tailwind-merge |
| Animation | Framer Motion 11.x |
| Icons | Lucide React |
| State (Server) | TanStack Query |
| State (Client) | Zustand |
| Routing | React Router 7.x |
| Testing | Vitest + RTL + Playwright |

---

## 6. 성공 지표

| 지표 | 목표 |
|------|------|
| 접근성 점검 | Lighthouse Accessibility 90+ |
| 다크 모드 | 모든 화면 지원 |
| 아이콘 전환 | 이모지 0개 (로봇 표정 제외) |
| LCD 가독성 | 어르신 5명 이상 사용성 테스트 통과 |

---

## 7. 범위 외 (Out of Scope)

- 백엔드 API 개발 (추후)
- 실제 로봇 연동 (추후)
- 음성 인식 기능 (추후)
- iOS/Android 네이티브 앱 (추후)

---

## 8. 참고 문서

| 문서 | 위치 |
|------|------|
| 기존 프로토타입 | `impl.html` |
| UI 설계서 | `docs/ui-implementation-plan.md` |
| 요구사항 명세 | `docs/requirements-specification.md` |
| 의사결정 기록 | `.agent/ADR.md` |
| 제약조건 | `.agent/RULES.md` |
