## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase6-lcd-hardening-fe`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P6.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P6-AGENT2.md`
- 목표:
  - LCD 전용 프론트 접근성/표현 품질 하드닝
  - `GREETING`/`EMERGENCY` 모드 UI 보강
  - 액션 전송 중 중복 클릭 방지 + 사용자 피드백 정리

### 반영 항목 요약
- [x] 1024x600 우선 레이아웃으로 `styles.css` 재정비 및 작은 화면 fallback 유지
- [x] 버튼 최소 높이 `64px` 보장, 대비/포커스 스타일 보강
- [x] `StatusBar` 컴포넌트 도입(시계/연결상태/배터리 표기)
- [x] `RobotFace` 컴포넌트 도입(blink/emotion/emergency 표현)
- [x] `GREETING` 모드 날씨 슬롯 UI 추가
- [x] `EMERGENCY` 모드 정보 우선순위 및 `확인`/`119 연결 요청` 흐름 강화
- [x] `useLcdController`에 액션 전송 lock 추가(중복 클릭 방지)
- [x] 액션 전송 진행/완료 상태 메시지 노출

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend-lcd/src/app/styles.css` | 수정 | 1024x600 기준 레이아웃/접근성/긴급 화면 스타일 하드닝 |
| `frontend-lcd/src/features/lcd/components/StatusBar.tsx` | 신규 | 시계/연결 상태/배터리 게이지 표기 컴포넌트 |
| `frontend-lcd/src/features/lcd/components/RobotFace.tsx` | 신규 | 감정/긴급 상태 표현 + blink 효과 컴포넌트 |
| `frontend-lcd/src/features/lcd/components/LcdLayout.tsx` | 수정 | StatusBar 통합, 화면 타이틀 블록, notice/error 배너 분리 |
| `frontend-lcd/src/features/lcd/components/LcdModeScreens.tsx` | 수정 | GREETING/EMERGENCY UI 재구성 및 RobotFace 적용 |
| `frontend-lcd/src/features/lcd/components/LcdActionButton.tsx` | 수정 | 접근성 속성(`aria-disabled`) 보강 |
| `frontend-lcd/src/features/lcd/hooks/useLcdController.ts` | 수정 | 전송 lock, 진행/완료 피드백 메시지 상태 추가 |
| `frontend-lcd/src/pages/LcdScreenPage.tsx` | 수정 | 상태 메시지 전달, 시계 30초 주기 갱신 |

### 리뷰어 확인 요청 포인트
- [ ] 1024x600 기준에서 정보 밀도/가독성이 의도대로인지
- [ ] 작은 화면(`768px` 이하, 낮은 height) fallback이 깨지지 않는지
- [ ] `StatusBar`의 연결 상태/배터리 표기가 접근성 측면에서 충분한지
- [ ] `GREETING` 날씨 슬롯과 `EMERGENCY` 버튼 흐름이 UX 요구사항에 부합하는지
- [ ] 액션 연타 시 중복 전송이 차단되고 피드백 문구가 자연스러운지
- [ ] Agent 4 소유 경로(`api/auth/types/shared/mocks`) 침범이 없는지

### 테스트 명령어
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (2 files, 5 tests)
- `npm run build` ✅ PASS
- `npm run lint` ✅ PASS

### 참고 사항
- 계약/타입 계층(`frontend-lcd/src/features/lcd/api/*`, `auth/*`, `types.ts`)은 변경하지 않았습니다.
- 배터리 수치는 계약 필드 미확정 상태를 고려해 UI 표기 우선으로 구현했으며, 값 미존재 시 `확인중`으로 표시합니다.
