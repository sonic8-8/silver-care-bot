package site.silverbot.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mock.web.MockHttpServletRequest;
import jakarta.servlet.http.Cookie;
import site.silverbot.api.auth.request.LoginRequest;
import site.silverbot.api.auth.request.SignupRequest;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.api.auth.service.AuthService;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void signup_createsUserAndTokens() {
        SignupRequest request = new SignupRequest(
                "홍길동",
                "signup@test.com",
                "password123",
                "01012345678",
                UserRole.WORKER
        );

        TokenResponse response = authService.signup(request);

        User user = userRepository.findByEmail("signup@test.com").orElseThrow();
        assertThat(passwordEncoder.matches("password123", user.getPassword())).isTrue();
        assertThat(user.getRefreshToken()).isNotBlank();
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void login_throwsWhenPasswordMismatch() {
        SignupRequest request = new SignupRequest(
                "홍길동",
                "login@test.com",
                "password123",
                null,
                UserRole.FAMILY
        );
        authService.signup(request);

        assertThatThrownBy(() -> authService.login(new LoginRequest("login@test.com", "wrong")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void refresh_rotatesTokens() {
        SignupRequest signupRequest = new SignupRequest(
                "홍길동",
                "refresh@test.com",
                "password123",
                null,
                UserRole.WORKER
        );
        TokenResponse loginResponse = authService.signup(signupRequest);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.setCookies(new Cookie("refreshToken", loginResponse.refreshToken()));

        TokenResponse refreshResponse = authService.refresh(mockRequest);

        User user = userRepository.findByEmail("refresh@test.com").orElseThrow();
        assertThat(refreshResponse.accessToken()).isNotBlank();
        assertThat(refreshResponse.refreshToken()).isNotBlank();
        assertThat(refreshResponse.refreshToken()).isNotEqualTo(loginResponse.refreshToken());
        assertThat(user.validateRefreshToken(refreshResponse.refreshToken())).isTrue();
    }

}
