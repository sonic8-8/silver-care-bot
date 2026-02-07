package site.silverbot.api.robot.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.robot.request.ReportPatrolRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.patrol.PatrolItem;
import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolOverallStatus;
import site.silverbot.domain.patrol.PatrolResult;
import site.silverbot.domain.patrol.PatrolResultRepository;
import site.silverbot.domain.patrol.PatrolSnapshotRepository;
import site.silverbot.domain.patrol.PatrolTarget;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class PatrolControllerTest extends RestDocsSupport {

    @Autowired
    private PatrolResultRepository patrolResultRepository;

    @Autowired
    private PatrolSnapshotRepository patrolSnapshotRepository;

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
        patrolSnapshotRepository.deleteAllInBatch();
        patrolResultRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

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
                .serialNumber("ROBOT-PTL-01")
                .authCode("123456")
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void reportPatrol_createsPatrolResult() throws Exception {
        ReportPatrolRequest request = new ReportPatrolRequest(
                "patrol-20260207-0900",
                LocalDateTime.of(2026, 2, 7, 9, 0),
                LocalDateTime.of(2026, 2, 7, 9, 5),
                List.of(
                        new ReportPatrolRequest.PatrolItemRequest(
                                PatrolTarget.GAS_VALVE,
                                "가스밸브",
                                PatrolItemStatus.NORMAL,
                                0.95f,
                                null,
                                LocalDateTime.of(2026, 2, 7, 9, 2)
                        ),
                        new ReportPatrolRequest.PatrolItemRequest(
                                PatrolTarget.DOOR,
                                "현관문",
                                PatrolItemStatus.NEEDS_CHECK,
                                0.88f,
                                "https://cdn.test/patrol/door.jpg",
                                LocalDateTime.of(2026, 2, 7, 9, 4)
                        )
                )
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/patrol/report", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.patrolId").value("patrol-20260207-0900"))
                .andExpect(jsonPath("$.data.overallStatus").value("WARNING"))
                .andDo(document("patrol-report-create"));

        assertThat(patrolSnapshotRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getLatestPatrol_returnsLatestPatrol() throws Exception {
        PatrolResult patrolResult = PatrolResult.builder()
                .robot(robot)
                .elder(elder)
                .patrolId("patrol-latest")
                .overallStatus(PatrolOverallStatus.SAFE)
                .startedAt(LocalDateTime.of(2026, 2, 7, 9, 0))
                .completedAt(LocalDateTime.of(2026, 2, 7, 9, 5))
                .build();
        patrolResult.addItem(PatrolItem.builder()
                .patrolResult(patrolResult)
                .target(PatrolTarget.WINDOW)
                .label("창문")
                .status(PatrolItemStatus.LOCKED)
                .confidence(0.92f)
                .checkedAt(LocalDateTime.of(2026, 2, 7, 9, 4))
                .build());
        patrolResultRepository.save(patrolResult);

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/patrol/latest", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.patrolId").value("patrol-latest"))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andDo(document("patrol-latest-get"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getPatrolHistory_returnsPagedHistory() throws Exception {
        PatrolResult patrolResult = PatrolResult.builder()
                .robot(robot)
                .elder(elder)
                .patrolId("patrol-history")
                .overallStatus(PatrolOverallStatus.SAFE)
                .startedAt(LocalDateTime.of(2026, 2, 7, 9, 0))
                .completedAt(LocalDateTime.of(2026, 2, 7, 9, 5))
                .build();
        patrolResult.addItem(PatrolItem.builder()
                .patrolResult(patrolResult)
                .target(PatrolTarget.GAS_VALVE)
                .label("가스밸브")
                .status(PatrolItemStatus.NORMAL)
                .confidence(0.95f)
                .checkedAt(LocalDateTime.of(2026, 2, 7, 9, 5))
                .build());
        patrolResultRepository.save(patrolResult);

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/patrol/history", elder.getId())
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.patrols.length()").value(1))
                .andDo(document("patrol-history-get"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getPatrolSnapshots_returnsSnapshots() throws Exception {
        ReportPatrolRequest request = new ReportPatrolRequest(
                "patrol-with-snapshot",
                LocalDateTime.of(2026, 2, 7, 9, 0),
                LocalDateTime.of(2026, 2, 7, 9, 3),
                List.of(new ReportPatrolRequest.PatrolItemRequest(
                        PatrolTarget.WINDOW,
                        "창문",
                        PatrolItemStatus.LOCKED,
                        0.96f,
                        "https://cdn.test/patrol/window.jpg",
                        LocalDateTime.of(2026, 2, 7, 9, 2)
                ))
        );
        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/patrol/report", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/patrol/{patrolId}/snapshots", "patrol-with-snapshot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.patrolId").value("patrol-with-snapshot"))
                .andExpect(jsonPath("$.data.snapshots.length()").value(1))
                .andExpect(jsonPath("$.data.snapshots[0].imageUrl").value("https://cdn.test/patrol/window.jpg"))
                .andDo(document("patrol-snapshots-get"));
    }

    @Test
    void roleRobot_cannotReadElderPatrolApis() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/patrol/latest", elder.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT")))
                .andExpect(status().isForbidden());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/patrol/history", elder.getId())
                        .param("page", "0")
                        .param("size", "10")
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT")))
                .andExpect(status().isForbidden());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/patrol/{patrolId}/snapshots", "patrol-role-test")
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void roleRobot_canReportOnlyOwnRobotPatrol() throws Exception {
        ReportPatrolRequest request = new ReportPatrolRequest(
                "patrol-robot-role",
                LocalDateTime.of(2026, 2, 7, 9, 0),
                LocalDateTime.of(2026, 2, 7, 9, 3),
                List.of(new ReportPatrolRequest.PatrolItemRequest(
                        PatrolTarget.GAS_VALVE,
                        "가스밸브",
                        PatrolItemStatus.NORMAL,
                        0.95f,
                        null,
                        LocalDateTime.of(2026, 2, 7, 9, 2)
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/patrol/report", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
