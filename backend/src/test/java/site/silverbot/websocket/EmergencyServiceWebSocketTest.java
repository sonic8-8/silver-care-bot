package site.silverbot.websocket;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.api.emergency.service.EmergencyService;
import site.silverbot.api.notification.service.NotificationService;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.Emergency;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyType;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRole;
import site.silverbot.websocket.dto.ElderStatusMessage;
import site.silverbot.websocket.dto.EmergencyMessage;

@ExtendWith(MockitoExtension.class)
class EmergencyServiceWebSocketTest {
    @Mock
    private EmergencyRepository emergencyRepository;
    @Mock
    private RobotRepository robotRepository;
    @Mock
    private ElderRepository elderRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private WebSocketMessageService webSocketMessageService;

    @InjectMocks
    private EmergencyService emergencyService;

    @Test
    void reportEmergencyPublishesEmergencyAndElderStatus() {
        User worker = createWorker(3L);
        Elder elder = createElder(worker, 11L, "김옥분");
        Robot robot = createRobot(elder, 7L);
        OffsetDateTime detectedAt = OffsetDateTime.parse("2026-02-08T10:23:00+09:00");

        when(robotRepository.findById(robot.getId())).thenReturn(Optional.of(robot));
        when(currentUserService.getCurrentUser()).thenReturn(worker);
        when(emergencyRepository.save(any(Emergency.class))).thenAnswer(invocation -> {
            Emergency saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 101L);
            return saved;
        });

        emergencyService.reportEmergency(
                robot.getId(),
                new ReportEmergencyRequest(EmergencyType.FALL_DETECTED, "거실", detectedAt, 0.92f, null)
        );

        verify(webSocketMessageService).sendElderStatus(
                eq(11L),
                argThat((ElderStatusMessage.Payload payload) ->
                        payload.elderId().equals(11L)
                                && "DANGER".equals(payload.status())
                                && "거실".equals(payload.location())
                )
        );
        verify(webSocketMessageService).broadcastEmergency(
                argThat((EmergencyMessage.Payload payload) ->
                        payload.emergencyId().equals(101L)
                                && payload.elderId().equals(11L)
                                && "FALL_DETECTED".equals(payload.type())
                                && "거실".equals(payload.location())
                )
        );
    }

    @Test
    void resolveEmergencyPublishesSafeStatusWhenNoPendingEmergency() {
        User worker = createWorker(3L);
        Elder elder = createElder(worker, 11L, "김옥분");
        elder.updateStatus(ElderStatus.DANGER);
        Robot robot = createRobot(elder, 7L);

        Emergency emergency = Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.parse("2026-02-08T09:50:00"))
                .build();
        ReflectionTestUtils.setField(emergency, "id", 99L);

        when(emergencyRepository.findById(99L)).thenReturn(Optional.of(emergency));
        when(currentUserService.getCurrentUser()).thenReturn(worker);
        when(emergencyRepository.existsByElderIdAndResolution(11L, EmergencyResolution.PENDING)).thenReturn(false);

        emergencyService.resolveEmergency(
                99L,
                new ResolveEmergencyRequest(EmergencyResolution.RESOLVED, "상황 종료")
        );

        verify(webSocketMessageService).sendElderStatus(
                eq(11L),
                argThat((ElderStatusMessage.Payload payload) ->
                        payload.elderId().equals(11L)
                                && "SAFE".equals(payload.status())
                )
        );
    }

    private User createWorker(Long id) {
        User user = User.builder()
                .name("복지사")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Elder createElder(User user, Long id, String name) {
        Elder elder = Elder.builder()
                .user(user)
                .name(name)
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build();
        ReflectionTestUtils.setField(elder, "id", id);
        return elder;
    }

    private Robot createRobot(Elder elder, Long id) {
        Robot robot = Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-2026-X82")
                .build();
        ReflectionTestUtils.setField(robot, "id", id);
        return robot;
    }
}
