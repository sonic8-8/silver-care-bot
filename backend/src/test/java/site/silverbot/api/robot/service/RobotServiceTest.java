package site.silverbot.api.robot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.LcdEmotion;
import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RobotServiceTest {

    @Autowired
    private RobotService robotService;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private RobotCommandRepository robotCommandRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private UserRepository userRepository;

    private Robot robot;

    @BeforeEach
    void setUp() {
        robotCommandRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        User owner = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        userRepository.save(User.builder()
                .name("다른 사용자")
                .email("other@test.com")
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

        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-2026-X82")
                .authCode("A1B2C3")
                .batteryLevel(90)
                .isCharging(false)
                .networkStatus(NetworkStatus.DISCONNECTED)
                .lcdMode(LcdMode.IDLE)
                .lcdEmotion(LcdEmotion.NEUTRAL)
                .build());
    }

    @Test
    void getStatusReturnsRobotSnapshot() {
        RobotStatusResponse response = robotService.getStatus(robot.getId());

        assertThat(response.id()).isEqualTo(robot.getId());
        assertThat(response.serialNumber()).isEqualTo("ROBOT-2026-X82");
        assertThat(response.settings()).isNotNull();
        assertThat(response.dispenser()).isNotNull();
    }

    @Test
    void syncUpdatesStatusAndReturnsPendingCommands() {
        RobotCommand pending = robotCommandRepository.save(RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-123")
                .command(CommandType.START_PATROL)
                .issuedAt(LocalDateTime.now())
                .build());

        RobotSyncRequest request = new RobotSyncRequest(
                80,
                true,
                null,
                new RobotSyncRequest.CurrentLocation("KITCHEN", 10.5f, 20.1f, 90),
                new RobotSyncRequest.LcdState("IDLE", "neutral", "", ""),
                new RobotSyncRequest.Dispenser(3),
                null
        );

        RobotSyncResponse response = robotService.sync(robot.getId(), request);

        Robot updated = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(updated.getNetworkStatus()).isEqualTo(NetworkStatus.CONNECTED);
        assertThat(updated.getBatteryLevel()).isEqualTo(80);
        assertThat(updated.getDispenserRemaining()).isEqualTo(3);
        assertThat(updated.getLastSyncAt()).isNotNull();

        assertThat(response.pendingCommands()).hasSize(1);
        assertThat(response.pendingCommands().get(0).commandId()).isEqualTo(pending.getCommandId());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateLocationUpdatesRobotPosition() {
        RobotLocationUpdateResponse response = robotService.updateLocation(
                robot.getId(),
                new UpdateRobotLocationRequest(14.2f, 25.8f, "KITCHEN", 270, null)
        );

        Robot updated = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(response.received()).isTrue();
        assertThat(response.serverTime()).isNotNull();
        assertThat(updated.getCurrentLocation()).isEqualTo("KITCHEN");
        assertThat(updated.getCurrentX()).isEqualTo(14.2f);
        assertThat(updated.getCurrentY()).isEqualTo(25.8f);
        assertThat(updated.getCurrentHeading()).isEqualTo(270);
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void updateLocation_nonOwnerUser_throwsAccessDeniedException() {
        assertThrows(AccessDeniedException.class,
                () -> robotService.updateLocation(
                        robot.getId(),
                        new UpdateRobotLocationRequest(14.2f, 25.8f, "KITCHEN", 270, null)
                ));
    }

    @Test
    @WithMockUser(username = "999999", roles = {"ROBOT"})
    void updateLocation_robotPrincipalMismatch_throwsAccessDeniedException() {
        assertThrows(AccessDeniedException.class,
                () -> robotService.updateLocation(
                        robot.getId(),
                        new UpdateRobotLocationRequest(14.2f, 25.8f, "KITCHEN", 270, null)
                ));
    }
}
