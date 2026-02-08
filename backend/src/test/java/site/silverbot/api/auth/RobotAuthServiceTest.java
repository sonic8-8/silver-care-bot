package site.silverbot.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.auth.request.RobotLoginRequest;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.api.auth.service.RobotAuthService;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RobotAuthServiceTest {

    @Autowired
    private RobotAuthService robotAuthService;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void robotLogin_returnsAccessTokenAndRobotPayload() {
        User owner = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        Elder elder = elderRepository.save(Elder.builder()
                .user(owner)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        Robot robot = Robot.builder()
                .elder(elder)
                .serialNumber("RB-001")
                .authCode("123456")
                .build();
        robotRepository.save(robot);

        TokenResponse response = robotAuthService.robotLogin(new RobotLoginRequest("RB-001", "123456"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNull();
        assertThat(response.robot()).isNotNull();
        assertThat(response.robot().id()).isEqualTo(robot.getId());
        assertThat(response.robot().serialNumber()).isEqualTo("RB-001");
        assertThat(response.robot().elderId()).isEqualTo(elder.getId());
        assertThat(response.robot().elderName()).isEqualTo("김옥분");
    }
}
