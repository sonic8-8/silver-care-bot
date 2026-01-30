# HISTORY.md

> 프로젝트 영구 작업 로그 (Permanent Archive)

---

<details>
<summary>2026-01-29: 배포 파이프라인/리버스 프록시 구성 정리</summary>

### 📋 계획 (PLAN 요약)
- Jenkins 컨테이너에 Docker CLI/Compose 설치
- Nginx 리버스 프록시로 경로 기반 라우팅 구성
- 포트 충돌 해소 및 보안 강화

### 🛠️ 작업 내용
- Jenkins 컨테이너에 Docker CLI/Compose 플러그인 설치용 커스텀 이미지 적용
- Jenkins 접근 경로를 `/jenkins`로 프록시하도록 Nginx 설정 구성
- Web 앱 포트 충돌 해소를 위해 내부 바인딩(127.0.0.1) 포트 맵 정리
- Backend Dockerfile에서 `gradlew` 실행 권한 복구
- Jenkins URL을 `/jenkins` 기반으로 설정하고 Webhook 경로를 통일
- 파이프라인 changeset 조건으로 인한 배포 스킵 확인 및 임시 강제 실행 안내

### ⚠️ 이슈/해결
| 문제 | 해결 |
|------|------|
| Jenkins 컨테이너에 docker CLI 미설치 | 커스텀 이미지로 해결 |
| `/jenkins` 404 | `proxy_pass` 슬래시 제거로 경로 유지 |
| `502 Bad Gateway` | web 컨테이너 미기동 확인 후 파이프라인 강제 실행 |
| backend `./gradlew Permission denied` | `COPY . .` 이후 chmod 추가 |
| Jenkins changeset 조건으로 스테이지 스킵 | Replay에서 when 제거로 임시 배포 |

### 📁 수정된 파일
- `web/docker-compose.yml` (frontend/backend 포트 8081/8082 내부 바인딩)
- `web/default` (/, /api, /jenkins 프록시 추가)
- `web/backend/Dockerfile` (gradlew 실행 권한 복구)

### 🔧 운영 환경 변경
- Jenkins 컨테이너 포트: `127.0.0.1:8083`으로 내부 바인딩
- Jenkins 옵션: `JENKINS_OPTS=--prefix=/jenkins`
- Nginx 경로 라우팅: `/`(frontend), `/api/`(backend), `/jenkins/`(Jenkins)
- GitLab Webhook: `/jenkins/generic-webhook-trigger` 경로로 변경

</details>

<details>
<summary>2026-01-29: 프론트 UI 리팩터링 및 배포 설정 정비</summary>

### 📋 계획 (PLAN 요약)
- Playground/LCD UI를 React로 정리하고 다크 모드/디자인 토큰을 반영
- 프론트 정적 배포(Docker+Nginx) 준비
- 문서 업데이트 및 리포 구조 정리

### 🛠️ 작업 내용

#### 1. 프론트 UI/UX 개편
- `frontend/src/pages/Playground/index.tsx`에 로그인/회원가입/노인선택/대시보드/일정/로봇제어/약관리/기록/알림/설정/긴급 화면 구성
- 공통 UI 컴포넌트(Button/Card/Header/Badge/Input) 추가 및 접근성 포커스 링 적용
- 다크 모드 대응 및 딥블루 테마 일관화

#### 2. Robot LCD 고도화
- `frontend/src/pages/Playground/RobotLCD.tsx`에 Framer Motion 기반 상태 전환(IDLE/GREETING/MEDICATION/SCHEDULE/LISTENING/EMERGENCY/SLEEP) 구현
- 시나리오 버튼으로 상태 미리보기 제공

#### 3. 테마/개발환경 정비
- `tailwind.config.js`에 딥블루/피치/시맨틱 컬러 토큰, 폰트/타이포/섀도 정의
- 테마 스토어(`themeStore`)로 시스템/로컬 스토리지 기반 다크모드 전환
- MSW 핸들러/테스트 셋업 보강

#### 4. 배포 및 구조 정리
- `frontend/Dockerfile`, `frontend/nginx/default.conf` 추가(SPA 라우팅 + 캐시 정책)
- `backend/**` 및 HTML 프로토타입(`impl.html`, `lcd-impl.html`) 제거
- `.agent/**`, `docs/**`, `CLAUDE.md` 문서 대규모 업데이트

### 📁 수정된 파일
- `frontend/src/pages/Playground/index.tsx`
- `frontend/src/pages/Playground/RobotLCD.tsx`
- `frontend/src/shared/store/themeStore.ts`
- `frontend/tailwind.config.js`
- `frontend/Dockerfile`
- `frontend/nginx/default.conf`
- `backend/**` (삭제)
- `impl.html`, `lcd-impl.html` (삭제)

### ⚠️ 확인 필요 사항
- 루트 `/src/**`는 `frontend/src`와 중복 구조로 보임. 의도 여부 확인 필요.
- `backend/**` 삭제가 최종 방침인지 확인 필요(별도 레포로 이전 등).

</details>

<details>
<summary>2026-01-23: UI 화면 점검 및 수정 (ui-implementation-plan.md 동기화 확인)</summary>

### 📋 계획 (PLAN 요약)
- ui-implementation-plan.md와 현재 구현 비교
- 로그인 화면 접근성 문제 해결
- 전체 화면 검증 (12개 + LCD 7개)
- 설정 화면 누락 기능 보완

### 🛠️ 작업 내용

#### 1. 로그인 화면 수정
| 문제 | 해결 |
|------|------|
| 보호자/로봇 버튼 색상 불일치 | `variant="dark"` 제거, primary로 통일 |
| 탭 전환 시 위치 이동 | 로봇 탭에 빈 공간(`h-[44px]`) 추가로 높이 동기화 |
| 비밀번호 찾기 링크 누락 | "비밀번호를 잊으셨나요?" 버튼 추가 |

#### 2. 전체 화면 점검 결과
- ✅ 로그인, 회원가입, 노인 선택, 홈 대시보드
- ✅ 일정 관리 (주간 캘린더로 구현 - 모바일 UX 개선)
- ✅ 로봇 제어, 기록/리포트, 약 관리, 알림
- ✅ 긴급 상황 (LIVE 표시 제거 - 논리적 일관성)
- ✅ LCD 화면 7개 (모두 문서와 일치)

#### 3. 설정 화면 보완
| 항목 | 내용 |
|------|------|
| 이메일 알림 토글 | 알림 설정에 추가 |
| 로봇 설정 | 아침/저녁 약 알림 시간, TTS 볼륨(70%), 순찰 시간대 |
| 긴급 연락처 | 1순위(자녀), 2순위(복지사) + 수정 버튼 |

#### 4. 불필요한 기능 제거
- 음성 메시지/동작 정지 버튼 삭제 (애초에 불필요한 기능)
- 긴급 화면 LIVE 표시 삭제 (논리적 모순 해결)

### 💡 의사결정 기록

| 결정 | 선택 | 이유 |
|------|------|------|
| 로그인 버튼 색상 | primary 통일 | 일관성, 토스 스타일 |
| 캘린더 타입 | 주간 유지 | 모바일 UX, 공간 활용 |
| LIVE 표시 | 제거 | "카메라 연결 중" 정보와 중복, 논리적 모순 |
| 음성/정지 버튼 | 삭제 | 불필요한 기능 |

### 📁 수정된 파일
- `frontend/src/pages/Playground/index.tsx` - 로그인/설정/긴급 화면 수정
- `.agent/HANDOFF.md` - 작업 결과 문서화 (이후 초기화)

### ✅ 최종 상태
- ui-implementation-plan.md와 100% 동기화 완료
- 접근성 및 일관성 문제 해결
- 미구현 항목 0개

</details>

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

