package site.silverbot.api.robot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLcdModeRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.RobotLcdResponse;
import site.silverbot.api.robot.response.UpdateRobotLcdModeResponse;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.medication.Medication;
import site.silverbot.domain.medication.MedicationFrequency;
import site.silverbot.domain.medication.MedicationRepository;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.LcdEmotion;
import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.schedule.Schedule;
import site.silverbot.domain.schedule.ScheduleRepository;
import site.silverbot.domain.schedule.ScheduleSource;
import site.silverbot.domain.schedule.ScheduleType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.websocket.WebSocketMessageService;
import site.silverbot.websocket.dto.LcdModeMessage;

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

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @MockBean
    private WebSocketMessageService webSocketMessageService;

    private Robot robot;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @BeforeEach
    void setUp() {
        robotCommandRepository.deleteAllInBatch();
        scheduleRepository.deleteAllInBatch();
        medicationRepository.deleteAllInBatch();
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
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void syncUpdatesStatusAndReturnsPendingCommands() {
        RobotCommand pending = robotCommandRepository.save(RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-123")
                .command(CommandType.START_PATROL)
                .issuedAt(LocalDateTime.now())
                .build());

        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(robot.getElder())
                .title("병원 방문")
                .description("정기 검진")
                .scheduledAt(LocalDateTime.now().plusHours(3))
                .location("서울의료원")
                .type(ScheduleType.HOSPITAL)
                .source(ScheduleSource.MANUAL)
                .remindBeforeMinutes(60)
                .build());

        Medication medication = medicationRepository.save(Medication.builder()
                .elder(robot.getElder())
                .name("아침약")
                .frequency(MedicationFrequency.MORNING)
                .isActive(true)
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
        assertThat(response.scheduleReminders()).hasSize(1);
        assertThat(response.scheduleReminders().get(0).scheduleId()).isEqualTo(schedule.getId());
        assertThat(response.medications()).hasSize(1);
        assertThat(response.medications().get(0).medicationId()).isEqualTo(medication.getId());
        assertThat(response.serverTime()).isNotNull();
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void sync_nonOwnerUser_throwsAccessDeniedException() {
        RobotSyncRequest request = new RobotSyncRequest(
                80,
                true,
                null,
                null,
                null,
                null,
                null
        );

        assertThrows(AccessDeniedException.class, () -> robotService.sync(robot.getId(), request));
    }

    @Test
    @WithMockUser(username = "999999", roles = {"ROBOT"})
    void sync_robotPrincipalMismatch_throwsAccessDeniedException() {
        RobotSyncRequest request = new RobotSyncRequest(
                80,
                true,
                null,
                null,
                null,
                null,
                null
        );

        assertThrows(AccessDeniedException.class, () -> robotService.sync(robot.getId(), request));
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

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getLcd_ownerWorker_returnsNormalizedStrings() {
        RobotLcdResponse response = robotService.getLcd(robot.getId());

        assertThat(response.mode()).isEqualTo("IDLE");
        assertThat(response.emotion()).isEqualTo("neutral");
        assertThat(response.message()).isEqualTo("");
        assertThat(response.subMessage()).isEqualTo("");
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void getLcd_nonOwnerWorker_throwsAccessDeniedException() {
        assertThrows(AccessDeniedException.class, () -> robotService.getLcd(robot.getId()));
    }

    @Test
    void getLcd_robotPrincipalMatched_returnsResponse() {
        authenticateAsRobot(robot.getId());

        RobotLcdResponse response = robotService.getLcd(robot.getId());

        assertThat(response.mode()).isEqualTo("IDLE");
        assertThat(response.emotion()).isEqualTo("neutral");
    }

    @Test
    void getLcd_robotPrincipalMismatch_throwsAccessDeniedException() {
        authenticateAsRobot(robot.getId() + 1);

        assertThrows(AccessDeniedException.class, () -> robotService.getLcd(robot.getId()));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateLcdMode_updatesStateAndBroadcasts() {
        UpdateRobotLcdModeResponse response = robotService.updateLcdMode(
                robot.getId(),
                new UpdateRobotLcdModeRequest(
                        "LISTENING",
                        "happy",
                        "할머니, 말씀해주세요.",
                        "듣고 있어요"
                )
        );

        Robot updated = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(updated.getLcdMode()).isEqualTo(LcdMode.LISTENING);
        assertThat(updated.getLcdEmotion()).isEqualTo(LcdEmotion.HAPPY);
        assertThat(updated.getLcdMessage()).isEqualTo("할머니, 말씀해주세요.");
        assertThat(updated.getLcdSubMessage()).isEqualTo("듣고 있어요");

        assertThat(response.mode()).isEqualTo("LISTENING");
        assertThat(response.emotion()).isEqualTo("happy");
        assertThat(response.updatedAt()).isNotNull();

        verify(webSocketMessageService).sendLcdMode(
                eq(robot.getId()),
                argThat((LcdModeMessage.Payload payload) ->
                        payload.robotId().equals(robot.getId())
                                && payload.mode().equals("LISTENING")
                                && payload.emotion().equals("happy")
                                && payload.message().equals("할머니, 말씀해주세요.")
                                && payload.subMessage().equals("듣고 있어요")
                )
        );
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateLcdMode_whenMessageFieldsNull_normalizesToEmptyAndBroadcasts() {
        UpdateRobotLcdModeResponse response = robotService.updateLcdMode(
                robot.getId(),
                new UpdateRobotLcdModeRequest(
                        "IDLE",
                        "neutral",
                        null,
                        null
                )
        );

        Robot updated = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(updated.getLcdMessage()).isEqualTo("");
        assertThat(updated.getLcdSubMessage()).isEqualTo("");
        assertThat(response.message()).isEqualTo("");
        assertThat(response.subMessage()).isEqualTo("");

        verify(webSocketMessageService).sendLcdMode(
                eq(robot.getId()),
                argThat((LcdModeMessage.Payload payload) ->
                        payload.message().equals("")
                                && payload.subMessage().equals("")
                )
        );
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void updateLcdMode_nonOwnerUser_throwsAccessDeniedException() {
        assertThrows(AccessDeniedException.class,
                () -> robotService.updateLcdMode(
                        robot.getId(),
                        new UpdateRobotLcdModeRequest("IDLE", "neutral", "", "")
                ));
    }

    @Test
    @WithMockUser(username = "999999", roles = {"ROBOT"})
    void updateLcdMode_robotPrincipalMismatch_throwsAccessDeniedException() {
        assertThrows(AccessDeniedException.class,
                () -> robotService.updateLcdMode(
                        robot.getId(),
                        new UpdateRobotLcdModeRequest("IDLE", "neutral", "", "")
                ));
    }

    @Test
    void updateLcdMode_robotPrincipalMatched_updatesState() {
        authenticateAsRobot(robot.getId());

        UpdateRobotLcdModeResponse response = robotService.updateLcdMode(
                robot.getId(),
                new UpdateRobotLcdModeRequest("LISTENING", "happy", "안녕하세요", "도와드릴까요?")
        );

        assertThat(response.mode()).isEqualTo("LISTENING");
        assertThat(response.emotion()).isEqualTo("happy");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateLcdMode_invalidMode_throwsIllegalArgumentException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> robotService.updateLcdMode(
                        robot.getId(),
                        new UpdateRobotLcdModeRequest("UNKNOWN_MODE", "neutral", "", "")
                ));

        assertThat(exception).hasMessage("Invalid lcd mode");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateLcdMode_blankEmotion_throwsIllegalArgumentException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> robotService.updateLcdMode(
                        robot.getId(),
                        new UpdateRobotLcdModeRequest("IDLE", "   ", "", "")
                ));

        assertThat(exception).hasMessage("Invalid lcd emotion");
    }

    private void authenticateAsRobot(Long robotPrincipalId) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(
                String.valueOf(robotPrincipalId),
                "N/A",
                List.of(new SimpleGrantedAuthority("ROLE_ROBOT"))
        ));
        SecurityContextHolder.setContext(context);
    }
}
