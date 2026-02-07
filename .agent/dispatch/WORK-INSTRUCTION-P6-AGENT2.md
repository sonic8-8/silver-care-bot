# Phase 6 작업 지시 [Agent 2]

## 브랜치
- `feature/phase6-lcd-hardening-fe`

## 목표
- LCD 전용 프론트의 접근성/표현 품질을 높여 사용자 체감 품질을 마무리한다.

## 작업 범위
1. 레이아웃/접근성 하드닝
- 대상:
  - `frontend-lcd/src/app/styles.css`
  - `frontend-lcd/src/features/lcd/components/*`
- 요구:
  - 1024x600 우선 레이아웃 기준 정리 + 작은 화면 fallback 유지
  - 버튼/텍스트 대비율, 폰트 크기, 터치 타깃(64px+) 점검 및 보정
  - 긴급/에러 상태에서 정보 우선순위(메시지, 버튼, 상태칩) 개선

2. 공통 컴포넌트 보강
- 대상:
  - `frontend-lcd/src/features/lcd/components/LcdModeScreens.tsx`
  - 필요 시 신규 컴포넌트 파일
- 요구:
  - `RobotFace`(blink/emotion), `StatusBar`(시계/연결상태/배터리 표기) 도입 또는 동등 구현
  - `GREETING`, `EMERGENCY` 모드 UI 보강(날씨 슬롯/119 버튼/확인 버튼 흐름)

3. 상호작용 안정성
- 대상:
  - `frontend-lcd/src/features/lcd/hooks/useLcdController.ts`
- 요구:
  - 액션 전송 중 중복 클릭 방지와 사용자 피드백 문구 정리

## 검증
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

## 산출물
- 코드 커밋/푸시
- `agent-2/.agent/reviews/REVIEW-REQUEST-P6-AGENT2.md` 작성
