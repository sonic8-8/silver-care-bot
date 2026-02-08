package site.silverbot.api.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import site.silverbot.api.auth.request.LoginRequest;
import site.silverbot.api.auth.request.SignupRequest;
import site.silverbot.api.auth.response.AuthUserResponse;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.config.JwtTokenProvider;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(request.role())
                .build();

        User savedUser = userRepository.save(user);
        return issueTokens(savedUser, true);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return issueTokens(user, true);
    }

    public TokenResponse refresh(HttpServletRequest request, String refreshTokenFromBody) {
        String refreshToken = extractRefreshToken(request, refreshTokenFromBody);
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing");
        }
        if (!jwtTokenProvider.validateToken(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        Long userId = jwtTokenProvider.getSubjectAsLong(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (!user.validateRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token mismatch");
        }

        return issueTokens(user, false);
    }

    private TokenResponse issueTokens(User user, boolean includeUser) {
        String accessToken = jwtTokenProvider.createAccessToken(
                String.valueOf(user.getId()),
                user.getRole().name(),
                user.getEmail()
        );
        String refreshToken = jwtTokenProvider.createRefreshToken(String.valueOf(user.getId()));
        user.updateRefreshToken(refreshToken);
        AuthUserResponse userResponse = includeUser
                ? new AuthUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getPhone()
                )
                : null;

        return new TokenResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                userResponse,
                null
        );
    }

    private String extractRefreshToken(HttpServletRequest request, String refreshTokenFromBody) {
        String refreshTokenFromCookie = extractRefreshTokenFromCookie(request);
        if (StringUtils.hasText(refreshTokenFromCookie)) {
            return refreshTokenFromCookie;
        }

        if (StringUtils.hasText(refreshTokenFromBody)) {
            return refreshTokenFromBody.trim();
        }
        return null;
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
