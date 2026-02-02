# 테스트 코드 작성 스타일 가이드 (프로젝트 기준)

이 문서는 `src/test/java/sample/cafekiosk` 하위 테스트와 `build.gradle`의 테스트 의존성을 기준으로, 현재 코드베이스의 테스트 작성 스타일을 **TDD 워크플로우 레퍼런스** 형태로 정리한 것입니다. 관찰된 패턴과 권장 규칙을 구분해 정리합니다.

## 1) 범위와 테스트 종류

- 단위 테스트: `src/test/java/sample/cafekiosk/unit` 및 `.../unit/beverage`
  - Spring 컨텍스트 없이 도메인 로직 검증
- 스프링 도메인/리포지토리 테스트: `src/test/java/sample/cafekiosk/spring/domain`
  - `@SpringBootTest` 기반
- 서비스 통합 테스트: `src/test/java/sample/cafekiosk/spring/api/service`
  - Spring + DB 연동
- 컨트롤러 테스트: `src/test/java/sample/cafekiosk/spring/api/controller`
  - `@WebMvcTest` + `MockMvc`
- REST Docs 테스트: `src/test/java/sample/cafekiosk/spring/docs`
  - standalone `MockMvc`
- 학습/실험: `src/test/java/sample/cafekiosk/learning`

## 2) 공통 규칙 (관찰 + 권장)

### 네이밍 / 설명
- 관찰: 테스트 메서드는 lowerCamelCase, `@DisplayName`은 자연어(주로 한글)
- 권장: 메서드명은 행위+조건, 짧은 이름은 `@DisplayName`으로 보완

### 구조 (Given / When / Then)
- 관찰: `// given`, `// when`, `// then` 주석 사용, 예외는 `when & then` 병합 가능
- 권장: 검증은 `then`에 모으고 한 테스트는 한 기대에 집중

### Assertion (AssertJ)
- 값/사이즈: `assertThat(x).isEqualTo(...)`, `hasSize(...)`
- 리스트 추출/튜플: `extracting(...).containsExactlyInAnyOrder(tuple(...))`
- 예외: `assertThatThrownBy(() -> ...).isInstanceOf(...).hasMessage(...)`

### Mocking / Stubbing
- 단위: `@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks`
- 스프링: `@MockitoBean`으로 컨텍스트 Bean 대체
- 관찰: `when(...).thenReturn(...)`와 BDD `given(...).willReturn(...)` 혼재
- 권장: 테스트 파일 단위로 스타일을 통일

### 시간 처리
- 관찰: `LocalDateTime.of(...)` 고정 시간과 `LocalDateTime.now()`가 혼재
- 권장: 결정적 테스트는 고정 시간(또는 Clock 주입) 사용

## 3) Spring 테스트 지원 클래스

- `IntegrationTestSupport`: `@SpringBootTest` + `@ActiveProfiles("test")`, 공통 `@MockitoBean MailSendClient`
- `ControllerTestSupport`: `@WebMvcTest`, `MockMvc`, `ObjectMapper`, `@MockitoBean` 서비스
- `RestDocsSupport`: standalone `MockMvc` + REST Docs 설정

## 4) DB 격리 규칙

- `@AfterEach`에서 데이터 정리
- `deleteAllInBatch()` 사용
- 부모/자식 테이블 순서 고려 (자식 → 부모)

## 5) API/Controller 테스트 패턴

- 요청 DTO는 Builder로 구성
- `mockMvc.perform(...)`에 JSON body + `MediaType.APPLICATION_JSON`
- `status()` + `jsonPath()`로 응답 검증
- `andDo(print())`로 요청/응답 출력

## 6) REST Docs 테스트 패턴

- `document("identifier", preprocessRequest(...), preprocessResponse(...), requestFields(...), responseFields(...))`
- `RestDocsSupport` 기반의 standalone `MockMvc`

## 7) TDD 워크플로우 (이 프로젝트 기준)

1. 실패하는 테스트 작성  
   - `@DisplayName` + given/when/then 구조
2. 최소한의 테스트 데이터 준비  
   - Builder + 공용 `createX` 헬퍼 사용
3. 읽기 쉬운 AssertJ 검증 작성  
   - 의도/기대를 한눈에 보이게
4. 통과할 만큼만 구현  
   - 불필요한 분기/옵션 추가 금지
5. 중복 제거 및 리팩터링  
   - 테스트와 프로덕션 코드 모두 정리

### 체크리스트 (Red → Green → Refactor)

- Red: 실패 메시지가 원인과 기대를 설명하는가
- Green: 가장 단순한 구현으로만 통과했는가
- Refactor: 테스트 가독성(네이밍/구조)과 중복이 개선되었는가

## 8) 최소 템플릿

```java
@DisplayName("...")
@Test
void behaviorUnderCondition() {
    // given
    ...

    // when
    ...

    // then
    assertThat(...).isEqualTo(...);
}
```

---

비고:
- Mockito stubbing 스타일은 혼재되어 있으므로, 새 테스트는 파일 단위로 통일하는 것을 권장합니다.
- 컨트롤러/REST Docs는 `MockMvc` 기반, 서비스/리포지토리 테스트는 Spring 컨텍스트 기반입니다.
