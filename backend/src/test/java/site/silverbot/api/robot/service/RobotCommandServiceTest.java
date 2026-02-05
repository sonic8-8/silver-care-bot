package site.silverbot.api.robot.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.request.RobotCommandRequest;
import site.silverbot.api.robot.response.CommandResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.robot.CommandStatus;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RobotCommandServiceTest {

    @Autowired
    private RobotCommandService robotCommandService;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private RobotCommandRepository robotCommandRepository;

    private Robot robot;

    @BeforeEach
    void setUp() {
        robotCommandRepository.deleteAll();
        robotRepository.deleteAll();

        robot = robotRepository.save(Robot.builder()
                .serialNumber("ROBOT-2026-X82")
                .authCode("A1B2C3")
                .networkStatus(NetworkStatus.CONNECTED)
                .build());
    }

    @Test
    void createCommandPersistsCommand() {
        RobotCommandRequest request = new RobotCommandRequest(
                CommandType.MOVE_TO,
                Map.of("location", "LIVING_ROOM")
        );

        CommandResponse response = robotCommandService.createCommand(robot.getId(), request);

        assertThat(response.command()).isEqualTo(CommandType.MOVE_TO);
        assertThat(response.status()).isEqualTo(CommandStatus.PENDING);
        assertThat(robotCommandRepository.findAll()).hasSize(1);
    }

    @Test
    void consumePendingCommandsMarksAsReceived() {
        RobotCommand pending = robotCommandRepository.save(RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-456")
                .command(CommandType.RETURN_TO_DOCK)
                .issuedAt(LocalDateTime.now())
                .build());

        List<RobotSyncResponse.PendingCommandResponse> response = robotCommandService.consumePendingCommands(robot.getId());

        assertThat(response).hasSize(1);
        assertThat(response.get(0).commandId()).isEqualTo(pending.getCommandId());

        RobotCommand updated = robotCommandRepository.findById(pending.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(CommandStatus.RECEIVED);
    }

    @Test
    void consumePendingCommandsReturnsInIssuedAtOrder() {
        LocalDateTime now = LocalDateTime.now();

        RobotCommand later = robotCommandRepository.save(RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-2")
                .command(CommandType.RETURN_TO_DOCK)
                .issuedAt(now.plusMinutes(5))
                .build());

        RobotCommand earlier = robotCommandRepository.save(RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-1")
                .command(CommandType.START_PATROL)
                .issuedAt(now.minusMinutes(5))
                .build());

        List<RobotSyncResponse.PendingCommandResponse> response = robotCommandService.consumePendingCommands(robot.getId());

        assertThat(response)
                .extracting(RobotSyncResponse.PendingCommandResponse::commandId)
                .containsExactly(earlier.getCommandId(), later.getCommandId());
    }
}
