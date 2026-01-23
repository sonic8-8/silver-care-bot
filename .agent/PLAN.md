# 📋 PLAN: LCD Framer Motion 애니메이션 적용

> **작업일**: 2026-01-23  
> **상태**: 📋 계획 단계 (사용자 승인 대기)

---

## 1. 목표

`lcd-impl.html`의 Framer Motion 기반 로봇 얼굴 UI를 Playground의 LCD 화면에 적용합니다.

### 주요 개선사항
1. **동적 애니메이션**: 정적 이모지 → 움직이는 눈 + 표정
2. **인터랙티브**: 마우스 추적, 자동 깜빡임
3. **향상된 UX**: 부드러운 전환, 점멸 효과 (긴급 상황)
4. **상태 표시**: 시계, WiFi, 배터리 상태바

---

## 2. 구현 계획

### Phase 1: 의존성 설치 ✅
- [x] Framer Motion 설치 필요 여부 확인 (미설치 확인됨)
- [ ] `npm install framer-motion` 실행

### Phase 2: RobotFaceApp 교체
- [ ] `lcd-impl.html`의 코드를 `Playground/index.tsx`의 `RobotFaceApp`에 통합
- [ ] 기존 7개 모드 매핑:
  - `standby` → `IDLE`
  - `greeting` → `GREETING`
  - `medication` → `MEDICATION`
  - `schedule` → `SCHEDULE`
  - `listening` → `LISTENING`
  - `emergency` → `EMERGENCY`
  - `charging` → `SLEEP`

### Phase 3: 컴포넌트 통합
- [x] `Eye` 컴포넌트 추가 (눈 애니메이션)
- [x] `ScenarioButton` 컴포넌트 추가
- [x] `RobotState` 타입 정의
- [x] 색상 토큰 (`COLORS`) 적용 - **다크 시안 테마**:
  ```typescript
  const COLORS = {
    primary: '#3182F6',   // Toss Blue
    eye: '#22d3ee',       // Cyan (로봇 눈)
    eyeGlow: 'rgba(34, 211, 238, 0.6)',
    bg: '#000000',        // 검정 배경
    danger: '#F04452',
    safe: '#00C471',
    text: '#ffffff',
    textSub: '#9ca3af',
  };
  ```

### Phase 4: 애니메이션 로직
- [x] 자동 깜빡임 (`useEffect`)
- [x] 마우스 추적 (`handleMouseMove`)
- [x] 모드별 애니메이션 variants
- [x] `AnimatePresence`로 모드 전환

### Phase 5: 기존 기능 보존
- [ ] `SimControls` 버튼 연동
- [ ] `onLogout` 기능 유지
- [ ] `isPreview`, `isLcd` props 유지

---

## 3. 주요 변경 파일

| 파일 | 변경 사항 |
|------|----------|
| `frontend/package.json` | framer-motion 의존성 추가 |
| `frontend/src/pages/Playground/index.tsx` | RobotFaceApp 전면 재작성 (107-500줄) |

---

## 4. 기술적 고려사항

### 장점 ✅
- 훨씬 더 생동감 있고 친근한 UI
- 어르신이 로봇과 상호작용하는 느낌
- 애니메이션으로 상태 변화 명확

### 잠재적 이슈 ⚠️
- Framer Motion 번들 크기 증가 (~100KB)
- 애니메이션 성능 (로봇 LCD 하드웨어 스펙 미확인)
- 기존 이모지 기반 UI와 완전히 다름

### 대응 방안
- 필요 시 애니메이션 최적화
- 사용자 피드백 기반 조정

---

## 5. 검증 계획

### 5.1 개발 서버 테스트
**명령어**:
```bash
cd frontend
npm run dev
```
- 브라우저 접속: http://localhost:5173/playground
- 로봇 모드로 로그인

### 5.2 7개 모드 수동 테스트
**테스트 절차**:
1. SimControls 버튼으로 각 모드 전환
2. 확인 항목:
   - [x] 대기 (IDLE): 눈 깜빡임, 메시지 표시
   - [x] 인사 (GREETING): 눈 위로 이동, 인사말
   - [x] 복약 (MEDICATION): 약 아이콘, 큰 버튼 2개
   - [x] 일정 (SCHEDULE): 일정 카드, 확인 버튼
   - [x] 듣기 (LISTENING): 파동 애니메이션
   - [x] 긴급 (EMERGENCY): 배경 점멸, 긴급 버튼
   - [x] 충전 (SLEEP): 눈 감김, 충전 메시지

### 5.3 애니메이션 확인
- 눈 깜빡임 자동 실행 (2-5초 간격)
- 마우스 이동 시 눈이 따라가는지
- 모드 전환 시 부드러운 전환

### 5.4 반응형 확인
- Desktop (1024px+)
- Tablet (768px)
- Mobile (375px)

---

## 6. 사용자 검토 사항

> [!IMPORTANT]
> 다음 사항에 대한 승인이 필요합니다:

1. **Framer Motion 설치**: 약 100KB 번들 크기 증가
2. **전면 교체**: 기존 이모지 기반 UI를 완전히 대체
3. **로봇 LCD 하드웨어**: 애니메이션 성능 확인 필요 (실제 로봇 테스트)

> [!NOTE]
> 기존 7개 모드와 기능은 모두 유지되며, 시각적 표현만 개선됩니다.

---

## 7. 롤백 계획

문제 발생 시:
1. Git에서 이전 버전으로 복구
2. Framer Motion 제거 (`npm uninstall framer-motion`)
3. 기존 이모지 기반 UI 복원
