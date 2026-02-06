package site.silverbot.api.elder.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.CreateElderRequest;
import site.silverbot.api.elder.request.UpdateElderRequest;
import site.silverbot.api.elder.response.ElderListResponse;
import site.silverbot.api.elder.response.ElderResponse;
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

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ElderServiceTest {

    @Autowired
    private ElderService elderService;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private EntityManager entityManager;

    private User user;

    @BeforeEach
    void setUp() {
        emergencyRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        entityManager.flush();
        entityManager.clear();
        user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createElder_createsElderWithContacts() {
        CreateElderRequest request = new CreateElderRequest(
                "김옥분",
                LocalDate.of(1946, 5, 15),
                Gender.FEMALE,
                "서울시 강남구",
                List.of(new CreateContactRequest("김자녀", "010-1234-5678", "자녀", 1))
        );

        ElderResponse response = elderService.createElder(request);

        assertThat(response.name()).isEqualTo("김옥분");
        assertThat(response.emergencyContacts()).hasSize(1);
        assertThat(elderRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateElder_updatesFields() {
        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        UpdateElderRequest request = new UpdateElderRequest("김옥분 수정", null, null, "서울시 서초구");

        ElderResponse response = elderService.updateElder(elder.getId(), request);

        assertThat(response.name()).isEqualTo("김옥분 수정");
        assertThat(response.address()).isEqualTo("서울시 서초구");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getElders_returnsSummary() {
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

        ElderListResponse response = elderService.getElders();

        assertThat(response.elders()).hasSize(2);
        assertThat(response.summary().total()).isEqualTo(2);
        assertThat(response.summary().danger()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteElder_removesElder() {
        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        elderService.deleteElder(elder.getId());

        assertThat(elderRepository.count()).isZero();
    }
}
