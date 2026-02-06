package site.silverbot.api.elder.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.UpdateContactRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContact;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class EmergencyContactControllerTest extends RestDocsSupport {

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
    private Elder elder;

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
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createContact_createsContact() throws Exception {
        CreateContactRequest request = new CreateContactRequest("김자녀", "010-1234-5678", "자녀", 1);

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders/{elderId}/contacts", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("김자녀"))
                .andDo(document("elder-contacts-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getContacts_returnsList() throws Exception {
        emergencyContactRepository.save(EmergencyContact.builder()
                .elder(elder)
                .name("김자녀")
                .phone("010-1234-5678")
                .relation("자녀")
                .priority(1)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/contacts", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andDo(document("elder-contacts-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateContact_updatesContact() throws Exception {
        EmergencyContact contact = emergencyContactRepository.save(EmergencyContact.builder()
                .elder(elder)
                .name("김자녀")
                .phone("010-1234-5678")
                .relation("자녀")
                .priority(1)
                .build());

        UpdateContactRequest request = new UpdateContactRequest("김자녀 수정", "010-0000-0000", null, 2);

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/elders/{elderId}/contacts/{contactId}", elder.getId(), contact.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("김자녀 수정"))
                .andDo(document("elder-contacts-update"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteContact_deletesContact() throws Exception {
        EmergencyContact contact = emergencyContactRepository.save(EmergencyContact.builder()
                .elder(elder)
                .name("김자녀")
                .phone("010-1234-5678")
                .relation("자녀")
                .priority(1)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.delete("/api/elders/{elderId}/contacts/{contactId}", elder.getId(), contact.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(document("elder-contacts-delete"));
    }
}
