package site.silverbot.api.medication.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.medication.Medication;
import site.silverbot.domain.medication.MedicationFrequency;
import site.silverbot.domain.medication.MedicationRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MedicationValidationServiceTest {

    @Autowired
    private MedicationValidationService medicationValidationService;

    @Autowired
    private MedicationRepository medicationRepository;

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

    @Autowired
    private EntityManager entityManager;

    private Elder elder1;
    private Elder elder2;
    private Medication elder2Medication;

    @BeforeEach
    void setUp() {
        medicationRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
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

        elder1 = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .build());

        elder2 = elderRepository.save(Elder.builder()
                .user(user)
                .name("박영자")
                .birthDate(LocalDate.of(1945, 3, 10))
                .gender(Gender.FEMALE)
                .build());

        elder2Medication = medicationRepository.save(Medication.builder()
                .elder(elder2)
                .name("혈압약")
                .frequency(MedicationFrequency.MORNING)
                .build());
    }

    @Test
    void getOwnedMedication_returnsMedicationWhenOwned() {
        Medication owned = medicationRepository.save(Medication.builder()
                .elder(elder1)
                .name("당뇨약")
                .frequency(MedicationFrequency.EVENING)
                .build());

        Medication result = medicationValidationService.getOwnedMedication(elder1.getId(), owned.getId());

        assertThat(result.getId()).isEqualTo(owned.getId());
    }

    @Test
    void getOwnedMedication_throwsAccessDeniedWhenElderMismatch() {
        assertThrows(
                AccessDeniedException.class,
                () -> medicationValidationService.getOwnedMedication(elder1.getId(), elder2Medication.getId())
        );
    }

    @Test
    void getOwnedMedication_throwsEntityNotFoundWhenMedicationMissing() {
        assertThrows(
                EntityNotFoundException.class,
                () -> medicationValidationService.getOwnedMedication(elder1.getId(), 999999L)
        );
    }
}
