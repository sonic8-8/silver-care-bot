package site.silverbot.api.elder.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.UpdateContactRequest;
import site.silverbot.api.elder.response.ContactResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContact;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EmergencyContactServiceTest {

    @Autowired
    private EmergencyContactService emergencyContactService;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private Elder elder;

    @BeforeEach
    void setUp() {
        emergencyContactRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        entityManager.flush();
        entityManager.clear();
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
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createContact_createsContact() {
        CreateContactRequest request = new CreateContactRequest("김자녀", "010-1234-5678", "자녀", 1);

        ContactResponse response = emergencyContactService.createContact(elder.getId(), request);

        assertThat(response.name()).isEqualTo("김자녀");
        assertThat(emergencyContactRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateContact_updatesContact() {
        EmergencyContact contact = emergencyContactRepository.save(EmergencyContact.builder()
                .elder(elder)
                .name("김자녀")
                .phone("010-1234-5678")
                .relation("자녀")
                .priority(1)
                .build());

        UpdateContactRequest request = new UpdateContactRequest("김자녀 수정", "010-0000-0000", null, 2);

        ContactResponse response = emergencyContactService.updateContact(elder.getId(), contact.getId(), request);

        assertThat(response.phone()).isEqualTo("010-0000-0000");
        assertThat(response.priority()).isEqualTo(2);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteContact_removesContact() {
        EmergencyContact contact = emergencyContactRepository.save(EmergencyContact.builder()
                .elder(elder)
                .name("김자녀")
                .phone("010-1234-5678")
                .relation("자녀")
                .priority(1)
                .build());

        emergencyContactService.deleteContact(elder.getId(), contact.getId());

        assertThat(emergencyContactRepository.count()).isZero();
    }
}
