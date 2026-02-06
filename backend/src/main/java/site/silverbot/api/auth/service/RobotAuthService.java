package site.silverbot.api.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import site.silverbot.api.auth.request.RobotLoginRequest;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.config.JwtTokenProvider;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotAuthService {
    private final RobotRepository robotRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenResponse robotLogin(RobotLoginRequest request) {
        Robot robot = robotRepository.findBySerialNumberAndAuthCode(request.serialNumber(), request.authCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid robot credentials"));

        String accessToken = jwtTokenProvider.createAccessToken(String.valueOf(robot.getId()), "ROBOT", null);
        return TokenResponse.accessOnly(accessToken, jwtTokenProvider.getAccessTokenExpiration());
    }
}
