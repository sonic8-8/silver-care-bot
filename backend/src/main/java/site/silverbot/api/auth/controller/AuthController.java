package site.silverbot.api.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.auth.request.LoginRequest;
import site.silverbot.api.auth.request.RobotLoginRequest;
import site.silverbot.api.auth.request.SignupRequest;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.api.auth.service.AuthService;
import site.silverbot.api.auth.service.RobotAuthService;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.config.JwtTokenProvider;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RobotAuthService robotAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ApiResponse<TokenResponse> signup(
            @Valid @RequestBody SignupRequest signupRequest,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        TokenResponse tokens = authService.signup(signupRequest);
        setRefreshCookie(httpRequest, response, tokens.refreshToken());
        return ApiResponse.success(TokenResponse.accessOnly(tokens.accessToken(), tokens.expiresIn()));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        TokenResponse tokens = authService.login(loginRequest);
        setRefreshCookie(httpRequest, response, tokens.refreshToken());
        return ApiResponse.success(TokenResponse.accessOnly(tokens.accessToken(), tokens.expiresIn()));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(HttpServletRequest httpRequest, HttpServletResponse response) {
        TokenResponse tokens = authService.refresh(httpRequest);
        setRefreshCookie(httpRequest, response, tokens.refreshToken());
        return ApiResponse.success(TokenResponse.accessOnly(tokens.accessToken(), tokens.expiresIn()));
    }

    @PostMapping("/robot/login")
    public ApiResponse<TokenResponse> robotLogin(@Valid @RequestBody RobotLoginRequest request) {
        return ApiResponse.success(robotAuthService.robotLogin(request));
    }

    private void setRefreshCookie(HttpServletRequest request, HttpServletResponse response, String refreshToken) {
        if (refreshToken == null) {
            return;
        }
        boolean isSecure = request.isSecure();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }
}
