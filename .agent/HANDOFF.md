# Handoff Document

> 세션 종료 시 인수인계서

---

## 📅 세션 정보
- **날짜**: 2026-01-29
- **작업 시간**: 저녁 세션 (17:53 ~ 18:07)

---

## ✅ 완료된 작업

### 이전 세션 (오후)
- API 명세서 작성 완료 (`docs/api-*.md`)
- 데이터베이스 ERD 설계 완료 (`docs/database-erd.md`)
- Docker 인프라 설정 완료

### 현재 세션
- CLAUDE.md, HANDOFF.md, 워크플로우 확인 완료
- PRD 작성 방향 논의 시작

---

## 💡 다음 세션 계획

### 1단계: PRD 작성 (실제 서비스 구현용)

> [!IMPORTANT]
> 기존 PRD.md는 UI 초안용이었음. 새로운 PRD는 실제 서비스 구현을 위한 것.

**PRD 작성 전 결정 필요 사항:**

| # | 질문 | 옵션 |
|---|------|------|
| 1 | **개발 범위** | 백엔드만? 프론트엔드+백엔드 통합? |
| 2 | **우선순위** | requirements-specification.md 순서대로? 특정 기능 우선? |
| 3 | **데이터베이스** | PostgreSQL (HANDOFF 권장) vs MySQL (CLAUDE.md) |
| 4 | **개발 기간 & 팀** | 예상 기간? 혼자? 팀? |
| 5 | **MVP 범위** | 로봇 연동(WebSocket) 포함? 웹앱 기본 기능만? |

**참고 문서:**
- `docs/requirements-specification.md` - 요구사항 명세
- `docs/api-specification.md` - REST API 40+ 엔드포인트
- `docs/database-erd.md` - 14개 테이블 설계
- `docs/persona-scenario.md` - 페르소나 및 시나리오

### 2단계: PLAN 작성

PRD 승인 후:
1. 구현 계획 작성 (PLAN.md)
2. 사용자 승인 대기
3. TDD 기반 구현 시작

---

## 📎 관련 파일

| 파일 | 경로 |
|------|------|
| CLAUDE.md | `CLAUDE.md` |
| 기존 PRD (UI용) | `.agent/PRD.md` |
| API 명세서 | `docs/api-specification.md` |
| DB ERD | `docs/database-erd.md` |
| 요구사항 명세 | `docs/requirements-specification.md` |

---

## 🔗 배포 URL

| 환경 | URL |
|------|-----|
| Client | `https://i14c104.p.ssafy.io/` |
| API | `https://i14c104.p.ssafy.io/api/` |
| WebSocket | `wss://i14c104.p.ssafy.io/ws` |
