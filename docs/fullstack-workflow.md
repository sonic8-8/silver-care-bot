# 풀스택 개발 워크플로우

## 📋 개요

| 항목 | 내용 |
|------|------|
| **담당** | 승환 |
| **역할** | 풀스택 (Backend + Frontend) |
| **기간** | 3 ~ 3.5주 |

---

## 🛠️ 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Backend** | Spring Boot (Java) |
| **Frontend** | React.js |
| **Database** | MySQL |
| **문서화** | Spring REST Docs |
| **배포** | GitHub Actions + Docker |
| **모니터링** (추후) | Prometheus + Grafana |
| **부하테스트** (추후) | K6 |

---

## 📐 개발 순서

```
1. 화면 설계
   └─ Gemini로 토스 UI 레퍼런스 초안 생성
   └─ Figma Make (Gemini 모델)로 빠르게 화면 제작

2. DB 설계
   └─ 화면에서 필요한 데이터 기반으로 설계

3. 배포 자동화
   └─ GitHub Actions + Docker 기본 구성
   └─ 초기 세팅으로 이후 개발-배포 사이클 효율화

4. 기능 구현
   └─ Claude Opus / Claude Code로 구현 가속
   └─ Spring REST Docs로 API 문서화
```

---

## 🤖 AI 도구 활용 계획

| 단계 | 도구 | 용도 |
|------|------|------|
| 화면 설계 | Gemini | 토스 UI 레퍼런스 기반 초안 생성 |
| 화면 제작 | Figma Make (Gemini) | 빠른 UI 프로토타이핑 |
| 코드 구현 | Claude Opus / Claude Code | 실제 코드 작성 |
| 코드 리뷰 | Codex | 구현 중간마다 코드 품질 검토 |

### 개발 사이클

```
구현 → Codex 리뷰 → 수정 → 구현 → Codex 리뷰 → ...
```

---

## 📄 코드 스타일 가이드

> 별도 md 파일로 정의 예정  
> AI Agent가 일관된 코드 스타일로 생성하도록 참조

---

## 🔗 타 팀 연동

### 연동이 필요한 팀

| 팀 | 필요 API |
|----|----------|
| AI (건도) | 날씨/일정 조회, 치매 의심 데이터 저장 |
| 임베디드 (동완) | 로봇 상태 전송, 알림 트리거 |

### 연동 방식 (논의 필요)

- [ ] API 우선 구현 후 제공
- [ ] Mock 서버 제공 (json-server 등)
- [ ] 로컬 테스트 후 나중에 연동

> [!NOTE]
> 타 팀과 "API가 언제 필요한지" 확인 후 방식 결정

---

## ✅ 체크리스트

- [ ] 화면 설계 완료
- [ ] DB 설계 완료
- [ ] GitHub Actions 설정
- [ ] Docker 설정
- [ ] Spring Boot 프로젝트 셋업
- [ ] React 프로젝트 셋업
- [ ] 기능 구현 시작
