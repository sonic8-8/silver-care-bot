# 테스트 코드 스타일 (프로젝트 기준)

이 문서는 `study` 패키지 테스트를 기준으로, 현재 프로젝트에서 사용되는 테스트 작성 규칙을 **TDD 워크플로우 레퍼런스**로 정리한 것입니다.

## 1) 범위

- 기준 파일:  
  `src/test/java/study/JavaBaseballTest.java`  
  `src/test/java/study/UmpireTest.java`  
  `src/test/java/study/ComputerTest.java`  
  `src/test/java/study/io/ConsoleInputHandlerTest.java`

## 2) 사용 프레임워크/라이브러리

- JUnit 5: `@Test`, `@BeforeEach`, `@DisplayName`
- AssertJ: `assertThat`, `assertThatThrownBy`

## 3) 공통 규칙 (관찰 + 권장)

### 네이밍 / 설명
- 관찰: 테스트 메서드는 `snake_case` (영문 소문자 + 언더스코어)
  - 예: `generateRandomNumber_3digit`, `handleRestartOrQuit_notGivenOption`
- 관찰: `@DisplayName`은 한국어 자연문 + 마침표
- 권장: 메서드명은 **행위 + 조건**, `@DisplayName`은 **규칙/기대**로 정리

### 구조 (Arrange / Act / Assert)
- 관찰: `// given`, `// when`, `// then` 주석으로 단계 구분
- 관찰: 필요 시 `given & when`, `when & then` 병합
- 권장: 한 테스트는 하나의 기대/규칙만 검증

### 셋업
- 관찰: 공용 객체는 `@BeforeEach`에서 초기화
  - 예: `umpire = new Umpire();`, `computer = new Computer();`

### 검증
- 값: `assertThat(actual).isEqualTo(expected)`
- 예외: `assertThatThrownBy(() -> ...)` + 타입 + 메시지

### 예외 메시지
- 관찰: 상수(`ErrorCode`) 메시지와 리터럴 비교가 혼재
- 권장: 한 방식으로 통일해 유지보수 부담을 줄이기

## 4) 입력/데이터 패턴

### 콘솔 입력 테스트
- `ByteArrayInputStream` + `System.setIn`으로 입력 시뮬레이션
- `Scanner`로 입력 읽기

### 데이터 구성
- 입력/타겟은 `int[]` 리터럴로 명시
- 경계/조합 테스트 중심
  - 스트라이크/볼: 0, 1, 2, 3 케이스
  - 입력 유효성: 길이(2/4자리), 숫자 여부, 중복 여부

## 5) 패키지/파일 구조

- 테스트 패키지는 프로덕션 코드와 동일 구조 유지
- 접근 제어자는 default/public 혼재 (새 테스트는 하나로 통일 권장)

## 6) TDD 워크플로우 (이 프로젝트 기준)

1. 실패 테스트 작성  
   - `@DisplayName`에 규칙/기대 명시
2. 최소 구현으로 통과  
   - 필요 최소 로직만 추가
3. 리팩터링  
   - 중복 제거, 네이밍/가독성 개선

## 7) 레퍼런스용 템플릿

### 정상 동작 테스트
```java
@DisplayName("간단한 규칙 설명")
@Test
void method_condition() {
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
void method_invalidInput() {
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
void getDigits_3digit() {
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
