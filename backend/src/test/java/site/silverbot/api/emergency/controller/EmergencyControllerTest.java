package site.silverbot.api.emergency.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
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
import site.silverbot.support.RestDocsSupport;

class EmergencyControllerTest extends RestDocsSupport {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    private User user;
    private Elder elder;
    private Robot robot;

    @BeforeEach
    void setUp() {
        emergencyRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        user = userRepository.save(User.builder()
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
    void reportEmergency_createsEmergency() throws Exception {
        ReportEmergencyRequest request = new ReportEmergencyRequest(
                EmergencyType.FALL_DETECTED,
                "거실",
                OffsetDateTime.now(),
                0.92f,
                null
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/emergency", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.robotId").value(robot.getId()))
                .andDo(document("emergency-report"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getEmergencies_returnsList() throws Exception {
        emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/emergencies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.emergencies.length()").value(1))
                .andDo(document("emergency-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getEmergency_returnsDetail() throws Exception {
        Emergency emergency = emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/emergencies/{emergencyId}", emergency.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.emergencyId").value(emergency.getId()))
                .andDo(document("emergency-detail"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void resolveEmergency_updatesResolution() throws Exception {
        Emergency emergency = emergencyRepository.save(Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(EmergencyType.NO_RESPONSE)
                .detectedAt(LocalDateTime.now())
                .build());

        ResolveEmergencyRequest request = new ResolveEmergencyRequest(EmergencyResolution.RESOLVED, "상황 종료");

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/api/emergencies/{emergencyId}/resolve", emergency.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.resolution").value("RESOLVED"))
                .andDo(document("emergency-resolve"));
    }
}
