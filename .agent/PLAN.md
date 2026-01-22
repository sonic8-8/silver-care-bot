# 구현 계획: UI 프로토타입 이식

## 목표
- `impl.html`의 UI 코드를 `frontend/src/pages/Playground/index.tsx`로 이식
- 라우팅 설정을 통해 브라우저에서 디자인 검증 환경 구축

## 단계
1. **Playground 페이지 생성**: `impl.html` 내용(`React`, `lucide-react` import 포함)을 `.tsx` 파일로 변환
2. **라우팅 추가**: `App.tsx`에 `/playground` 경로 추가
3. **의존성 확인**: `lucide-react` 패키지 설치

## 예상 결과
- `http://localhost:5173/playground`에서 프로토타입 UI 확인 가능
