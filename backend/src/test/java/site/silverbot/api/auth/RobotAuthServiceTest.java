package site.silverbot.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.auth.request.RobotLoginRequest;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.api.auth.service.RobotAuthService;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RobotAuthServiceTest {

    @Autowired
    private RobotAuthService robotAuthService;

    @Autowired
    private RobotRepository robotRepository;

    @Test
    void robotLogin_returnsAccessToken() {
        Robot robot = Robot.builder()
                .serialNumber("RB-001")
                .authCode("123456")
                .build();
        robotRepository.save(robot);

        TokenResponse response = robotAuthService.robotLogin(new RobotLoginRequest("RB-001", "123456"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNull();
    }
}
