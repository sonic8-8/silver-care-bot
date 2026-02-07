## 코드 리뷰 요청 [Agent 2]

### 작업 정보
- 브랜치: `feature/phase3-history-report-fe`
- 작업 범위:
  - Phase 3 Round 2 Frontend 구현 (PLAN 3.3, 3.5, 3.7)
  - History 화면(활동 로그/AI 리포트) + Dashboard 순찰 피드 연동
- 기준 문서:
  - `agent-0/.agent/dispatch/COORDINATION-P3.md`
  - `agent-0/.agent/dispatch/WORK-INSTRUCTION-P3-AGENT2.md`

### 구현 완료 항목
- [x] 3.3 활동 로그 Frontend
  - `/elders/:elderId/history` 탭 UI(활동 로그/AI 리포트)
  - 날짜 선택 + 활동 타임라인 + 유형별 아이콘/색상
- [x] 3.5 AI 리포트 Frontend
  - 주차 이동(이전 주/다음 주)
  - 복약률/활동량 시각화, 키워드 클라우드형 칩, 추천사항 카드
- [x] 3.7 순찰 피드 Frontend
  - 대시보드 순찰 카드 추가
  - 경고 항목 하이라이트 + 마지막 순찰 시각 표시

### 주요 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `frontend/src/features/history/types.ts` | 추가 | 활동 로그/주간 리포트 타입 정의 |
| `frontend/src/features/history/api/historyApi.ts` | 추가 | Activity/Weekly Report API 연동 + 404/501 fallback |
| `frontend/src/features/history/hooks/useHistory.ts` | 추가 | 활동/리포트 Query 훅 |
| `frontend/src/pages/History/HistoryScreen.tsx` | 수정 | 탭/타임라인/리포트 시각화 전면 구현 |
| `frontend/src/features/dashboard/types.ts` | 수정 | `latestPatrol` 타입/필드 추가 |
| `frontend/src/features/dashboard/api/dashboardApi.ts` | 수정 | `/patrol/latest` 연동 및 정규화 |
| `frontend/src/pages/Dashboard/DashboardScreen.tsx` | 수정 | 순찰 결과 카드 UI 및 경고 하이라이트 |
| `frontend/src/features/history/api/historyApi.test.ts` | 추가 | 날짜/주차/fallback 헬퍼 테스트 |
| `frontend/src/features/dashboard/hooks/useDashboard.test.tsx` | 수정 | `latestPatrol` 필드 반영 |

### 검증 포인트 (리뷰어 확인 요청)
- [ ] History 화면에서 활동/리포트 탭 전환 시 쿼리 enabled 조건이 의도대로 동작하는지
- [ ] 활동 로그 아이템의 유형별 라벨/색상/아이콘 매핑이 계약(ActivityType)과 일치하는지
- [ ] Dashboard 순찰 카드의 경고 하이라이트(OFF/UNLOCKED/NEEDS_CHECK)가 적절한지
- [ ] `frontend/src/shared/**`, `frontend/src/mocks/**` 직접 수정 없이 구현되었는지

### 테스트 명령어
```bash
cd frontend
npm run test -- --run
npm run build
npm run lint
```

### 테스트 실행 결과
- `npm run test -- --run` ✅ PASS (18 files, 44 tests)
- `npm run build` ✅ PASS (Vite chunk size warning 1건, 실패 아님)
- `npm run lint` ✅ PASS

### Agent 0 전달 메모
- Work Instruction Round 2 기준(3.3/3.5/3.7) 구현 완료 상태입니다.
- 커밋 해시와 푸시 결과는 본 문서 하단에 최종 반영하겠습니다.
