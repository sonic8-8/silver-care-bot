# 테스트 코드 스타일 & TDD 워크플로우 레퍼런스 (통합)

이 문서는 다음 두 문서를 **하나의 TDD 레퍼런스**로 통합한 것입니다.

- 참고 테스트 코드: `TEST_STYLE_GUIDE.md`
- 직접 작성 테스트 코드: `TEST_STYLE_INDIVIDUAL.md`

목표는 **현재 코드베이스에서 실제로 쓰는 패턴**과 **앞으로의 작성 기준**을 한 곳에서 찾을 수 있도록 정리하는 것입니다.

---

## 1) 범위 및 테스트 종류

### 참고 테스트 코드 기반 (Spring 중심)
- 단위 테스트: `src/test/java/sample/cafekiosk/unit` 및 `.../unit/beverage`
- 스프링 도메인/리포지토리 테스트: `src/test/java/sample/cafekiosk/spring/domain`
- 서비스 통합 테스트: `src/test/java/sample/cafekiosk/spring/api/service`
- 컨트롤러 테스트: `src/test/java/sample/cafekiosk/spring/api/controller`
- REST Docs 테스트: `src/test/java/sample/cafekiosk/spring/docs`
- 학습/실험: `src/test/java/sample/cafekiosk/learning`

### 직접 작성 테스트 코드 기반 (study 패키지)
- 기준 파일:
  - `src/test/java/study/JavaBaseballTest.java`
  - `src/test/java/study/UmpireTest.java`
  - `src/test/java/study/ComputerTest.java`
  - `src/test/java/study/io/ConsoleInputHandlerTest.java`

---

## 2) 공통 규칙 (두 문서 공통으로 관찰)

### 구조 (Arrange / Act / Assert)
- `// given`, `// when`, `// then` 주석으로 단계 구분
- 예외 테스트는 `when & then` 병합 가능
- 한 테스트는 하나의 기대/규칙에 집중

### Assertion (AssertJ)
- 값/사이즈: `assertThat(x).isEqualTo(...)`, `hasSize(...)`
- 예외: `assertThatThrownBy(() -> ...)` + 타입 + 메시지

### 가독성
- `@DisplayName`을 사용해 자연어로 의도를 설명

---

## 3) 차이점 요약 (레퍼런스로 명시)

### 네이밍
- 참고 테스트 코드: lowerCamelCase
- 직접 작성 테스트 코드: snake_case

### 테스트 환경
- 참고 테스트 코드: Spring 컨텍스트 사용 (통합 테스트, MockMvc, REST Docs 포함)
- 직접 작성 테스트 코드: 순수 단위 테스트 + 콘솔 입력 시뮬레이션

### Mocking
- 참고 테스트 코드: Mockito (`@Mock`, `@InjectMocks`, `@MockitoBean`)
- 직접 작성 테스트 코드: Mocking 사용 없음

### 예외 메시지 검증
- 상수(`ErrorCode`) 메시지와 문자열 리터럴 비교가 혼재

---

## 4) 통합 작성 기준 (권장)

### 네이밍 (통일 기준)
- **프로젝트 전체: lowerCamelCase로 통일**
- 패턴: `행위 + 조건/결과`를 camelCase로 풀어쓰기
- 기존 `snake_case` 테스트는 신규/수정 시 camelCase로 정리

### Assertion
- AssertJ 사용 통일
- 예외 테스트는 **타입 + 메시지**까지 검증

### 테스트 구조
- given/when/then 주석 유지
- 검증은 then에 모으기

### 시간 처리
- 결정적 테스트는 고정 시간 사용 (예: `LocalDateTime.of(...)`)
- 가능하면 `Clock` 주입 고려

---

## 5) 테스트 유형별 패턴

### 단위 테스트 (도메인)
- Spring 없이 순수 객체 검증
- Mockito 사용 가능 (`@ExtendWith(MockitoExtension.class)`)

### 스프링 통합/서비스 테스트
- `@SpringBootTest` + `@ActiveProfiles("test")`
- `@AfterEach`에서 DB 정리 (`deleteAllInBatch()`)

### 컨트롤러 테스트
- `@WebMvcTest` + `MockMvc`
- JSON 요청/응답 검증 + `jsonPath()`

### REST Docs 테스트
- `RestDocsSupport` 기반 standalone `MockMvc`
- `document("id", preprocessRequest(...), preprocessResponse(...), ...)`

### 콘솔 입력 테스트 (study)
- `ByteArrayInputStream` + `System.setIn`으로 입력 시뮬레이션
- `Scanner`로 입력 읽기

---

## 6) TDD 워크플로우 (Red → Green → Refactor)

1. 실패 테스트 작성  
   - `@DisplayName`에 규칙/기대 명시
2. 최소 구현으로 통과  
   - 필요 최소 로직만 추가
3. 리팩터링  
   - 중복 제거, 네이밍/가독성 개선

### 체크리스트
- Red: 실패 메시지가 원인과 기대를 설명하는가
- Green: 가장 단순한 구현으로 통과했는가
- Refactor: 테스트/프로덕션 코드가 더 읽기 쉬워졌는가

---

## 7) 최소 템플릿

### 정상 동작 테스트
```java
@DisplayName("간단한 규칙 설명")
@Test
void behaviorCondition() {
    // given
    Foo foo = new Foo();

    // when
    int result = foo.doSomething();

    // then
    assertThat(result).isEqualTo(1);
}
```

### 예외 테스트
```java
@DisplayName("잘못된 입력은 예외를 발생시킨다.")
@Test
void behaviorInvalidInput() {
    // given
    Foo foo = new Foo();

    // when & then
    assertThatThrownBy(() -> foo.doSomething("bad"))
            .isInstanceOf(GameException.class)
            .hasMessage("에러 메시지");
}
```

### 콘솔 입력 테스트
```java
@DisplayName("입력은 세 자리 숫자여야 한다.")
@Test
void getDigitsWithThreeDigits() {
    // given
    String input = "123\n";
    System.setIn(new ByteArrayInputStream(input.getBytes()));
    Scanner scanner = new Scanner(System.in);

    // when
    int[] digits = inputHandler.getDigitsFromUser(scanner);

    // then
    assertThat(digits).isEqualTo(new int[]{1, 2, 3});
}
```
