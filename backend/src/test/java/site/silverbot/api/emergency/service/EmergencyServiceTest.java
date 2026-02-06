package site.silverbot.api.emergency.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.api.emergency.response.EmergencyListResponse;
import site.silverbot.api.emergency.response.EmergencyResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.Emergency;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyType;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EmergencyServiceTest {

    @Autowired
    private EmergencyService emergencyService;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    private Elder elder;
    private Robot robot;

    @BeforeEach
    void setUp() {
        emergencyRepository.deleteAll();
        robotRepository.deleteAll();
        elderRepository.deleteAll();
        userRepository.deleteAll();
        User user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());
        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-2026-X82")
                .networkStatus(NetworkStatus.CONNECTED)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void reportEmergency_createsEmergency() {
        ReportEmergencyRequest request = new ReportEmergencyRequest(
                EmergencyType.FALL_DETECTED,
                "거실",
                OffsetDateTime.now(),
                0.92f,
                null
        );

        EmergencyResponse response = emergencyService.reportEmergency(robot.getId(), request);

        assertThat(response.robotId()).isEqualTo(robot.getId());
        assertThat(emergencyRepository.count()).isEqualTo(1);
        assertThat(elderRepository.findById(elder.getId()).orElseThrow().getStatus())
                .isEqualTo(ElderStatus.DANGER);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getEmergencies_returnsList() {
        emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now())
                .build());

        EmergencyListResponse response = emergencyService.getEmergencies();

        assertThat(response.emergencies()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void resolveEmergency_updatesResolution() {
        Emergency emergency = emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now())
                .build());
        elder.updateStatus(ElderStatus.DANGER);

        ResolveEmergencyRequest request = new ResolveEmergencyRequest(EmergencyResolution.RESOLVED, "상황 종료");

        EmergencyResponse response = emergencyService.resolveEmergency(emergency.getId(), request);

        assertThat(response.resolution()).isEqualTo(EmergencyResolution.RESOLVED);
        assertThat(response.resolvedAt()).isNotNull();
        assertThat(elderRepository.findById(elder.getId()).orElseThrow().getStatus())
                .isEqualTo(ElderStatus.SAFE);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void resolveEmergency_alreadyResolved_shouldThrowConflict() {
        Emergency emergency = emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .resolution(EmergencyResolution.RESOLVED)
                .detectedAt(LocalDateTime.now().minusMinutes(10))
                .resolvedAt(LocalDateTime.now().minusMinutes(1))
                .build());

        ResolveEmergencyRequest request = new ResolveEmergencyRequest(EmergencyResolution.FALSE_ALARM, "재해제 시도");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> emergencyService.resolveEmergency(emergency.getId(), request)
        );

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void resolveEmergency_withOtherPending_shouldNotSetElderSafe() {
        Emergency toResolve = emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now().minusMinutes(5))
                .build());
        emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.SOS_BUTTON)
                .detectedAt(LocalDateTime.now().minusMinutes(3))
                .build());
        elder.updateStatus(ElderStatus.DANGER);

        ResolveEmergencyRequest request = new ResolveEmergencyRequest(EmergencyResolution.RESOLVED, "첫 번째만 해제");

        emergencyService.resolveEmergency(toResolve.getId(), request);

        Elder refreshedElder = elderRepository.findById(elder.getId()).orElseThrow();
        assertThat(refreshedElder.getStatus()).isEqualTo(ElderStatus.DANGER);
        assertThat(emergencyRepository.existsByElderIdAndResolution(elder.getId(), EmergencyResolution.PENDING)).isTrue();
    }
}
