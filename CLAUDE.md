# CLAUDE.md

> AI 에이전트를 위한 프로젝트 규칙 및 컨벤션 정의서

---

## 🛠️ Tech Stack

### Frontend
| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | React + Vite | 19.x / 7.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + cva + tailwind-merge | 3.x |
| Routing | React Router | 7.x |
| State (Server) | TanStack Query | 5.x |
| State (Client) | Zustand | 5.x |
| API Mock | MSW (Mock Service Worker) | 2.x |
| HTTP Client | Axios | 1.x |

### Backend
| 카테고리 | 기술 |
|----------|------|
| Framework | Spring Boot (Java 17+) |
| ORM | Spring Data JPA |
| Database | MySQL |
| Docs | Spring REST Docs (AsciiDoc) |
| Infra | Docker, GitHub Actions |

### Testing
| 레벨 | 도구 | 커버리지 목표 |
|------|------|--------------|
| Unit/Integration | Vitest + React Testing Library | 70% |
| E2E | Playwright | Critical Path |
| Backend | JUnit5 + Mockito | 80% |

---

## 📁 Project Structure

### Frontend (`/frontend/src/`)
```
src/
├── app/                    # 앱 진입점, 라우터, 프로바이더
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── pages/                  # 페이지 컴포넌트 (라우트 매핑)
│   ├── Login/
│   ├── Dashboard/
│   ├── Schedule/
│   └── Robot/
├── features/               # 기능 단위 (비즈니스 로직)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── store.ts
│   ├── medication/
│   ├── schedule/
│   └── robot-control/
├── shared/                 # 공유 리소스
│   ├── ui/                # 재사용 UI (Button, Card, Modal)
│   ├── hooks/             # useDebounce, useLocalStorage
│   ├── utils/             # formatDate, validateEmail
│   ├── api/               # axios 인스턴스, 공통 API 설정
│   └── types/             # 공통 타입 정의
├── mocks/                  # MSW 핸들러
│   ├── handlers/
│   ├── browser.ts
│   └── server.ts
└── test/                   # 테스트 유틸, 목 데이터
    ├── mocks/
    └── utils/
```

### Backend (`/backend/`)
```
src/main/java/
└── com.example.project/
    ├── api/                      # Presentation Layer
    │   ├── controller/
    │   │   └── elder/
    │   │       ├── ElderController.java
    │   │       ├── request/
    │   │       │   └── CreateElderRequest.java
    │   │       └── response/
    │   │           └── ElderResponse.java
    │   └── service/
    │       └── elder/
    │           └── ElderService.java
    ├── domain/                   # Domain Layer
    │   └── elder/
    │       ├── Elder.java
    │       └── ElderRepository.java
    └── config/                   # 설정
        └── SecurityConfig.java
```

> ⚠️ **DTO 네이밍**: `DTO` 접미사 사용 금지. `CreateElderRequest`, `ElderResponse` 형식 사용

---

## 📋 Coding Standards

### Frontend (React + TypeScript)

#### Components
- **함수형 컴포넌트만 사용** (Class 컴포넌트 금지)
- **네이밍**: PascalCase (`Button.tsx`, `ElderCard.tsx`)
- **파일당 하나의 컴포넌트** 원칙

#### Styling (Tailwind CSS)
```tsx
// ✅ 권장: cva로 variant 정의
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'rounded-lg font-medium transition-colors',
  {
    variants: {
      intent: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        danger: 'bg-danger text-white hover:bg-red-600',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & 
  React.ButtonHTMLAttributes<HTMLButtonElement>;
```

#### State Management
```tsx
// 🔵 Server State → TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['elder', elderId],
  queryFn: () => elderApi.getById(elderId),
});

// 🟢 Client State → Zustand
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// 🟡 Local State → useState
const [isOpen, setIsOpen] = useState(false);
```

#### API Calls
- API 호출은 `features/*/api/` 또는 `shared/api/`에 분리
- 컴포넌트에서 직접 axios 호출 금지

### Backend (Spring Boot)

#### Architecture
- `Controller` → `Service` → `Repository` 계층 구조 엄수
- 도메인별 패키지 분리

#### Entity
- Setter 사용 금지, Builder 패턴 또는 정적 팩토리 메서드 사용
- `@NoArgsConstructor(access = AccessLevel.PROTECTED)` 권장

#### DTO
- API 요청/응답에 Entity 직접 노출 금지
- Request/Response DTO 분리 (`CreateElderRequest`, `ElderResponse`)

#### Testing & Docs
- Controller 테스트 시 `RestDocumentationRequestBuilders` 사용
- Spring REST Docs 스니펫 자동 생성 필수
- **테스트 통과 없이는 기능 구현 완료로 간주하지 않음**

---

## 🧪 TDD Workflow

> ⚠️ **적용 범위**: 기능 구현 코딩 작업에만 적용 (설정, 문서 작업 제외)

### Red-Green-Refactor 사이클
```
1. 🔴 RED: 실패하는 테스트 먼저 작성
2. 🟢 GREEN: 테스트 통과하는 최소 코드 작성
3. 🔵 REFACTOR: 코드 정리 (테스트 유지)
```

### Backend TDD (필수)
- Controller 테스트 시 `RestDocumentationRequestBuilders` 사용
- Spring REST Docs 스니펫 자동 생성
- **테스트 통과 없이는 기능 구현 완료로 간주하지 않음**

### Frontend TDD (선택적)
| 적용 대상 | TDD 필수 여부 |
|-----------|--------------|
| 커스텀 훅 (`useElderStatus`, `useMedication`) | ✅ 필수 |
| 유틸 함수 (`formatDate`, `validateEmail`) | ✅ 필수 |
| Zustand 스토어 (복잡한 상태 로직) | ✅ 필수 |
| 재사용 UI 컴포넌트 (`Button`, `Modal`) | ⚠️ 선택 |
| 페이지 레이아웃, 스타일링 컴포넌트 | ❌ 불필요 |

### MSW 활용
```typescript
// mocks/handlers/elder.ts
import { http, HttpResponse } from 'msw';

export const elderHandlers = [
  http.get('/api/elders/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: '김옥분',
      age: 80,
      status: 'safe',
    });
  }),
];
```

---

## 🔀 Git Convention

### Branch Strategy (Git Flow)
```
master (production)
  └── develop (integration)
        ├── feature/login-page
        ├── feature/elder-api
        └── hotfix/critical-bug-fix
```

### Branch Naming
| 타입 | 패턴 | 예시 |
|------|------|------|
| 기능 | `feature/{description}` | `feature/login-form` |
| 버그 | `bugfix/{description}` | `bugfix/null-pointer` |
| 핫픽스 | `hotfix/{description}` | `hotfix/security-patch` |
| 릴리스 | `release/v{version}` | `release/v1.0.0` |

### Commit Convention (Angular)
```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅 (로직 변경 X) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 파일 변경 |

**예시:**
```
feat(auth): 로그인 폼 컴포넌트 구현

- 이메일/비밀번호 입력 필드 추가
- 유효성 검증 로직 구현
- 에러 메시지 표시 기능

Closes #123
```

---

## 🏗️ AI Agent Workflow

> 이 섹션은 AI와 사용자의 **협업 규칙**을 정의합니다.

### 📂 파일 시스템 및 역할

모든 거버넌스 파일은 `.agent/` 폴더에 위치합니다.

| 파일 | 질문 | 역할 | 특성 |
|------|------|------|------|
| `PRD.md` | What | 기획서 - "무엇"을 만들지 | **Read-Only** |
| `PLAN.md` | How | 구현 계획서 - "어떻게" 만들지 | **Dynamic** |
| `ADR.md` | Why | 의사결정 기록 - "왜" 이렇게 결정했는지 | **Permanent** |
| `RULES.md` | Constraints | 제약조건 - 하지 말아야 할 것 | **Permanent** |
| `SCRATCHPAD.md` | Now | 단기 기억 및 사고 과정 | **Active** |
| `HISTORY.md` | Done | 프로젝트 영구 작업 로그 | **Archive** |
| `HANDOFF.md` | Next | 세션 종료 시 인수인계서 | **Bridge** |

```
.agent/
├── workflows/            # 재사용 워크플로우
│   └── tdd-workflow.md
├── PRD.md                # What - 기획서
├── PLAN.md               # How - 구현 계획
├── ADR.md                # Why - 의사결정 기록
├── RULES.md              # Constraints - 제약조건
├── SCRATCHPAD.md         # Now - 작업 중 메모
├── HISTORY.md            # Done - 영구 로그
└── HANDOFF.md            # Next - 세션 인계
```

---

### 📋 파일별 행동 수칙 (Rules)

#### 1. PRD.md (기획서)
- 기획서로서 "무엇"을 만들지 정의
- AI가 사용자와 논의 후 **작성** (이후 Read-Only로 참조)
- ⚠️ **PRD 작성 시 PLAN.md 작성 불필요** (PRD 승인 후 PLAN 작성)
- PRD 작성 중 사고 과정은 SCRATCHPAD에 기록

#### 2. PLAN.md (Dynamic)
- 구현 계획 단계별 정의
- ⚠️ **PRD 승인 후에 작성**
- ⚠️ **반드시 사용자 승인(Approval) 후에만 코딩 시작**
- 작업 진행률(`- [x]`)을 실시간 업데이트

#### 3. ADR.md (Permanent)
- 중요한 의사결정과 그 이유를 기록
- 형식: `ADR-001: 제목` + 날짜/상태/결정/이유/대안
- 프로젝트 전체 기간 동안 유지 (삭제 금지)
```markdown
## ADR-001: 색상 팔레트 선택
| 항목 | 내용 |
|------|------|
| 날짜 | 2026-01-22 |
| 상태 | 승인됨 |
| 결정 | 딥블루+피치 하이브리드 |
| 이유 | 복지사→전문성, 어르신→따뜻함 |
| 대안 | 코랄(기각: 긴급 알림과 충돌) |
```

#### 4. RULES.md (Permanent)
- 프로젝트 제약조건 및 금지사항 정의
- 모든 작업 시 참조하여 위반하지 않도록 함
- 섹션: 🚫 금지사항, ✅ 필수사항, 📏 기술 제약

#### 5. SCRATCHPAD.md (Active Workspace)
- **모든 작업 중 판단, 계획, 에러 로그를 실시간으로 기록**
- ⚠️ **CRITICAL**: 작업을 시작하면 **반드시** SCRATCHPAD에 사고 과정을 기록해야 함
- ⚠️ **태스크 완료 후 내용을 `HISTORY.md`로 이관하고 비움(Clear)**

**기록해야 할 내용**:
1. **판단**: A와 B 중 A 선택, 이유는 ~
2. **시도**: A 방법 시도 → 실패, 에러 메시지: ~
3. **대안**: B 방법으로 전환, 이유: ~
4. **결과**: B 성공, 최종 코드: ~

**예시**:
```markdown
### 문제: 로그인 버튼 색상 불일치

**판단**:
- variant="dark" 발견
- 라이트 모드: 검정, 다크 모드: 파란색
- 일관성 문제

**해결 방안 고려**:
1. 모두 primary
2. dark 유지
3. 탭 제거

**사용자 질문** → 답변: primary 통일

**실행**:
- variant="dark" 제거
- ✅ 성공
```

#### 6. HISTORY.md (Permanent Archive)
- SCRATCHPAD 내용 이관 시 **접이식 기능** 사용 필수
- PLAN 핵심 요약을 함께 기록
```markdown
<details>
<summary>2026-01-21: 로그인 기능 구현</summary>

### 📋 계획 (PLAN 요약)
- JWT 토큰 기반 인증
- 로그인/로그아웃 API 연동

### 🛠️ 작업 내용
- LoginScreen 컴포넌트 구현
- useAuth 훅 추가

### ⚠️ 이슈/해결
- CORS 문제 → proxy 설정으로 해결

</details>
```

#### 7. HANDOFF.md (Session Bridge)
- ⚠️ **세션을 새로 만들기 직전에만 작성** (작업 중에는 작성 안 함)
- 현재 상태 + 다음 세션에서 바로 해야 할 일 기록
- ⚠️ **새 세션 시작 시 HANDOFF 확인 → 인계 내용 반영 완료 후 초기화(Clear)**

**작성 시점**:
```
작업 중 → SCRATCHPAD만 사용
세션 종료 직전 → HANDOFF 작성 (한 번만)
새 세션 시작 → HANDOFF 확인 → 작업 반영 → HANDOFF 초기화
```

---

### 🔄 작업 워크플로우 (Workflow)

```
┌─────────────────────────────────────────────────────────────┐
│  신규 기능/프로젝트 시작 시:                                  │
├─────────────────────────────────────────────────────────────┤
│  1. 📋 PRD 작성   → 사용자와 논의 후 PRD.md 작성              │
│                   → SCRATCHPAD에 작성 과정 기록              │
│                   → 사용자 승인 대기                        │
│  2. � ADR 작성   → 중요 의사결정 발생 시 ADR.md에 기록       │
│  3. 📏 RULES 작성 → 프로젝트 제약조건 RULES.md에 정의        │
│  4. �📚 Log        → SCRATCHPAD → HISTORY 이관               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PRD 승인 후 구현 시:                                        │
├─────────────────────────────────────────────────────────────┤
│  1. 📖 Analyze    → PRD, RULES 확인 (새 세션 시 HANDOFF 확인)│
│  2. 📝 Plan       → PLAN.md 작성 → 사용자 승인 대기          │
│  3. 🛠️ Execute    → TDD 사이클 (기능 구현 시)                │
│     └── 🧠 Thinking → SCRATCHPAD에 모든 사고 과정 기록!     │
│     └── 🔴 Red: 실패하는 테스트 작성                         │
│     └── 🟢 Green: 테스트 통과 코드 구현                      │
│     └── 🔵 Refactor: 코드 개선                              │
│  4. 📜 ADR 추가   → 구현 중 중요 결정 시 ADR.md에 기록        │
│  5. 📚 Log        → SCRATCHPAD → HISTORY.md 이관 후 초기화  │
│  6. 🔁 Loop       → 다음 태스크로 계속                      │
│                                                             │
│  ⚠️ 세션 종료 직전:                                          │
│  7. 🤝 Handoff    → HANDOFF.md 작성 (다음 세션 인계)        │
└─────────────────────────────────────────────────────────────┘

⚠️ **중요 규칙**:
- 작업 중 **모든 판단과 시도는 SCRATCHPAD에 실시간 기록**
- "A 시도 → 실패 → B 시도 → 성공" 과정을 상세히 기록
- SCRATCHPAD 없이 작업하는 것은 워크플로우 위반
```

---

### 🧠 SCRATCHPAD 사용 가이드

> **워크플로우의 핵심**: 모든 작업 중 사고 과정을 SCRATCHPAD에 실시간 기록

#### ✅ SCRATCHPAD에 기록해야 하는 것

1. **문제 인식**
   ```markdown
   ### 문제: 로그인 버튼 색상이 다름
   - 보호자: 파란색
   - 로봇: 검정색 (라이트 모드)
   ```

2. **원인 분석**
   ```markdown
   **원인 파악**:
   - variant="dark" 사용
   - dark variant는 LCD용으로 만들어진 것으로 추정
   - 라이트/다크 모드에서 색상이 다름
   ```

3. **해결 방안 검토**
   ```markdown
   **방안 A**: primary로 통일 → 일관성 ✅
   **방안 B**: dark 유지 → 혼란 ❌
   **방안 C**: 탭 제거 → 기능 손실 ❌

   → A 선택, 사용자에게 확인 필요
   ```

4. **시도와 결과**
   ```markdown
   **1차 시도**:
   - variant="dark" 제거
   - ✅ 성공

   **2차 문제 발견**:
   - 탭 전환 시 위치 이동
   - 원인: 높이 차이

   **2차 시도**:
   - min-h-[48px] 추가
   - ⚠️ 부분 성공 (비밀번호 찾기 누락 발견)
   ```

5. **최종 결과**
   ```markdown
   **최종 해결**:
   - 비밀번호 찾기 추가
   - 로봇 탭에 빈 공간 추가
   - ✅ 완전 해결
   ```

#### ❌ SCRATCHPAD를 사용하지 않으면

- 문제 해결 과정이 투명하지 않음
- 같은 실수 반복 가능성
- 의사결정 근거 추적 불가
- **워크플로우 위반**

#### 📚 세션 종료 직전에만

```markdown
1. SCRATCHPAD 내용을 HISTORY.md로 이관
2. SCRATCHPAD 초기화 (다음 작업 준비)
3. HANDOFF.md 작성 (다음 세션 인계) ← 세션 종료 직전에만!
```

⚠️ **주의**: 작업 중에는 HANDOFF 작성 안 함. 세션 종료 직전에만 작성.

---

### 🧑‍💻 Augmented Coding 원칙 (Kent Beck)

| 원칙 | 설명 |
|------|------|
| **Tiny Steps** | 한 번에 하나의 작은 변경만. 즉시 검증 |
| **Make it Work → Right → Fast** | 동작 → 깔끔하게 → 최적화 순서 |
| **Trust but Verify** | AI 코드는 반드시 테스트로 검증 |
| **Always Shippable** | 언제든 배포 가능한 상태 유지 |
| **대화하며 점진적 개선** | AI를 pair programmer로 활용 |

---

### ⚙️ Integration 규칙

타 팀(AI, 임베디드)과의 연동 시:
- JSON 키값 규격 확인 절차 필수
- API 스펙 문서화 후 연동 진행

---

## 💻 Commands

### Frontend
```bash
cd frontend

# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm run test              # Unit/Integration (Vitest)
npm run test:e2e          # E2E (Playwright)
npm run test:coverage     # 커버리지 리포트

# 린트
npm run lint
npm run lint:fix
```

### Backend
```bash
cd backend

# 개발 실행
./gradlew bootRun

# 테스트
./gradlew test

# API 문서 생성
./gradlew asciidoctor

# 빌드
./gradlew build
```

---

## ⚠️ 금지 사항 (Don'ts)

### Frontend
- ❌ Class 컴포넌트 사용
- ❌ any 타입 남용 (unknown, 제네릭 사용)
- ❌ 컴포넌트에서 직접 axios 호출
- ❌ useEffect 내 복잡한 로직 (커스텀 훅으로 분리)
- ❌ 인라인 스타일 (`style={{}}`) 사용

### Backend
- ❌ Entity에 Setter 사용
- ❌ API 응답에 Entity 직접 반환
- ❌ Service에서 다른 Entity의 Repository 직접 접근
- ❌ 테스트 없이 PR 생성

---

## 📚 참고 문서

| 문서 | 위치 |
|------|------|
| UI 설계서 | `docs/ui-implementation-plan.md` |
| 요구사항 명세 | `docs/requirements-specification.md` |
| 페르소나/시나리오 | `docs/persona-scenario.md` |
