package site.silverbot.api.activity.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.activity.model.ActivityType;
import site.silverbot.api.activity.request.CreateActivityRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class ActivityControllerTest extends RestDocsSupport {

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Elder elder;
    private Robot robot;

    @BeforeEach
    void setUp() {
        ensurePhase3Tables();
        clearPhase3Tables();

        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        User user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        userRepository.save(User.builder()
                .name("박보호")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .build());

        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("RB-ACTIVITY-01")
                .networkStatus(NetworkStatus.CONNECTED)
                .batteryLevel(90)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getActivities_returnsDailyTimeline() throws Exception {
        insertActivity(elder.getId(), robot.getId(), "WAKE_UP", "기상", LocalDateTime.now().withHour(7).withMinute(20));
        insertActivity(elder.getId(), robot.getId(), "OUT_DETECTED", "외출", LocalDateTime.now().withHour(10).withMinute(0));

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/activities", elder.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.data.activities.length()").value(2))
                .andExpect(jsonPath("$.data.activities[0].type").value("OUT_DETECTED"))
                .andDo(document("activities-get"));
    }

    @Test
    void createRobotActivity_createsActivityWhenRobotAuthenticated() throws Exception {
        CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.RETURN_DETECTED,
                "귀가 감지",
                "현관 진입 감지",
                "현관",
                LocalDateTime.of(2026, 2, 7, 18, 5)
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/activities", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("RETURN_DETECTED"))
                .andExpect(jsonPath("$.data.location").value("현관"))
                .andDo(document("activities-create"));
    }

    @Test
    void createRobotActivity_deniesWhenRobotPrincipalDoesNotMatchPath() throws Exception {
        CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.WAKE_UP,
                "기상",
                "기상 감지",
                "침실",
                LocalDateTime.of(2026, 2, 7, 7, 0)
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/activities", robot.getId())
                        .with(user("999").roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void getActivities_deniesWhenNotOwner() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/activities", elder.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void getActivities_deniesWhenRobotTokenUsed() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/activities", elder.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void createRobotActivity_rejectsInvalidActivityType() throws Exception {
        String invalidRequest = """
                {
                  "type": "INVALID_TYPE",
                  "title": "오류",
                  "description": "잘못된 타입",
                  "location": "거실"
                }
                """;

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/activities", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));
    }

    private void ensurePhase3Tables() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS activity (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    elder_id BIGINT NOT NULL,
                    robot_id BIGINT,
                    type VARCHAR(40) NOT NULL,
                    title VARCHAR(120),
                    description CLOB,
                    location VARCHAR(120),
                    detected_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
    }

    private void clearPhase3Tables() {
        jdbcTemplate.update("DELETE FROM activity");
    }

    private void insertActivity(
            Long elderId,
            Long robotId,
            String type,
            String title,
            LocalDateTime detectedAt
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO activity (elder_id, robot_id, type, title, detected_at, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                elderId,
                robotId,
                type,
                title,
                detectedAt
        );
    }
}
