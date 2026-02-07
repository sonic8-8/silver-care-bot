## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase5-lcd-ui-fe`
- 작업 범위:
  - `agent-0/.agent/dispatch/COORDINATION-P5.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P5-AGENT2.md`
- 목표:
  - `frontend-lcd` 앱 신규 구성 (Vite + React + TypeScript)
  - LCD 7개 모드 화면 구현
  - LCD WebSocket 수신 기반 화면 전환 + 버튼 액션 이벤트 API 연동

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend-lcd/package.json` | 신규/수정 | LCD 앱 의존성/스크립트(test 포함) 추가 |
| `frontend-lcd/src/main.tsx` | 신규/수정 | 앱 진입점 + 전역 스타일 연결 |
| `frontend-lcd/src/app/App.tsx` | 신규 | RouterProvider/AppProviders 구성 |
| `frontend-lcd/src/app/router.tsx` | 신규 | `/robots/:robotId` 라우트 구성 |
| `frontend-lcd/src/app/providers.tsx` | 신규 | 앱 공통 provider 슬롯 |
| `frontend-lcd/src/app/styles.css` | 신규 | 대형 터치 UI/모드별 스타일/애니메이션 |
| `frontend-lcd/src/pages/LcdScreenPage.tsx` | 신규 | robotId 기반 LCD 메인 페이지 |
| `frontend-lcd/src/features/lcd/types.ts` | 신규 | LCD mode/emotion/state/action 타입 |
| `frontend-lcd/src/features/lcd/api/httpClient.ts` | 신규 | API 클라이언트 |
| `frontend-lcd/src/features/lcd/api/lcdApi.ts` | 신규 | `GET /api/robots/{robotId}/lcd` 정규화 |
| `frontend-lcd/src/features/lcd/api/lcdEventApi.ts` | 신규 | 버튼 액션 -> `POST /api/robots/{robotId}/events` 요청 |
| `frontend-lcd/src/features/lcd/hooks/useLcdRealtime.ts` | 신규 | `/topic/robot/{robotId}/lcd` STOMP 구독 |
| `frontend-lcd/src/features/lcd/hooks/useLcdController.ts` | 신규 | 초기 조회 + 실시간 반영 + 액션 전송 orchestration |
| `frontend-lcd/src/features/lcd/components/LcdLayout.tsx` | 신규 | 공통 레이아웃/상태 헤더/에러 표시 |
| `frontend-lcd/src/features/lcd/components/LcdModeScreens.tsx` | 신규 | IDLE/GREETING/MEDICATION/SCHEDULE/LISTENING/EMERGENCY/SLEEP 화면 |
| `frontend-lcd/src/features/lcd/components/LcdActionButton.tsx` | 신규 | 공통 대형 액션 버튼 |
| `frontend-lcd/src/features/lcd/api/lcdApi.test.ts` | 신규 | LCD 상태 정규화 테스트 |
| `frontend-lcd/src/features/lcd/api/lcdEventApi.test.ts` | 신규 | 액션 이벤트 payload 생성 테스트 |
| `frontend-lcd/vitest.config.ts` | 신규 | Vitest 설정(jsdom/setup) |
| `frontend-lcd/src/test/setup.ts` | 신규 | jest-dom matcher 로드 |

### 주요 변경 사항
1. `frontend-lcd` 독립 앱을 생성하고 라우팅/엔트리 구조를 `app/pages/features` 기준으로 구성했습니다.
2. LCD 모드 7개 화면을 각각 구현하고, 고령자 가독성/대형 버튼/명확한 대비 중심 UI를 적용했습니다.
3. `GET /api/robots/{robotId}/lcd` 초기 조회 + WebSocket(`/topic/robot/{robotId}/lcd`) 수신 업데이트를 하나의 컨트롤러 훅으로 통합했습니다.
4. 버튼 액션(`TAKE`, `LATER`, `CONFIRM`, `EMERGENCY`) 클릭 시 이벤트 API(`/api/robots/{robotId}/events`) 호출을 연결했습니다.
5. Agent 4 소유 경로(`frontend-lcd/src/shared/*`, `frontend-lcd/src/mocks/*`)는 생성/수정하지 않았습니다.

### Agent 4 협업 요청 (계약 정렬)
1. `frontend-lcd/src/shared/*`에 LCD 계약 타입/파서와 실시간 훅이 확정되면 Agent 2 코드의 로컬 정규화 로직과 교체/정렬 필요
2. `POST /api/robots/{robotId}/events`의 LCD 버튼 payload 최종 계약 필드명(`type/action/detectedAt` 등) 확정 필요
3. `frontend-lcd/src/mocks/*`에 `/lcd`, `/lcd-mode`, `/events` MSW 핸들러 제공 시 Agent 2의 화면 테스트 시나리오 연동 예정

### 검증 포인트 (리뷰어 확인 요청)
- [ ] LCD 7개 모드 UI가 지시서의 목적(가독성/터치 영역)과 어긋나지 않는지
- [ ] `useLcdRealtime` 구독 처리에서 reconnect/에러 상태 전파가 적절한지
- [ ] `normalizeLcdState`가 계약 변형(`data/payload`, `updatedAt/lastUpdatedAt`)을 안전하게 처리하는지
- [ ] 액션 이벤트 요청 payload가 Agent 3/4 계약과 충돌 여지가 없는지
- [ ] Agent 4 소유 경로(`shared/*`, `mocks/*`) 침범이 없는지

### 테스트 명령어
```bash
cd frontend-lcd
npm run test -- --run
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (2 files, 3 tests)
- `npm run build` ✅ PASS
- `npm run lint` ✅ PASS

### 우려 사항 / 특별 검토 요청
- 이벤트 API payload는 Agent 3/4 최종 계약 전 임시 형태(`events[].type='LCD_BUTTON'`)입니다.  
  계약 확정 후 필드명/enum이 달라지면 후속 정렬(Fix Round) 가능성을 전제로 리뷰 부탁드립니다.
