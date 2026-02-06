package site.silverbot.api.elder.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.CreateElderRequest;
import site.silverbot.api.elder.request.UpdateElderRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class ElderControllerTest extends RestDocsSupport {

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

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
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getElders_returnsList() throws Exception {
        elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());
        elderRepository.save(Elder.builder()
                .user(user)
                .name("박영자")
                .birthDate(LocalDate.of(1944, 3, 10))
                .gender(Gender.FEMALE)
                .status(ElderStatus.DANGER)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.elders.length()").value(2))
                .andExpect(jsonPath("$.data.summary.total").value(2))
                .andDo(document("elders-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getElder_returnsDetail() throws Exception {
        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(elder.getId()))
                .andDo(document("elders-detail"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createElder_createsElder() throws Exception {
        CreateElderRequest request = new CreateElderRequest(
                "김옥분",
                LocalDate.of(1946, 5, 15),
                Gender.FEMALE,
                "서울시 강남구",
                List.of(new CreateContactRequest("김자녀", "010-1234-5678", "자녀", 1))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("김옥분"))
                .andDo(document("elders-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateElder_updatesElder() throws Exception {
        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        UpdateElderRequest request = new UpdateElderRequest("김옥분 수정", null, null, "서울시 서초구");

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/elders/{elderId}", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("김옥분 수정"))
                .andDo(document("elders-update"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteElder_deletesElder() throws Exception {
        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.delete("/api/elders/{elderId}", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(document("elders-delete"));
    }
}
