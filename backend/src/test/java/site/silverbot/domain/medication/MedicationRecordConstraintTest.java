package site.silverbot.domain.medication;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
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
class MedicationRecordConstraintTest {

    @Autowired
    private MedicationRecordRepository medicationRecordRepository;

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
        medicationRecordRepository.deleteAllInBatch();
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
    void medicationRecordRejectsCrossElderMedicationPair() {
        assertThrows(
                IllegalArgumentException.class,
                () -> medicationRecordRepository.save(MedicationRecord.builder()
                        .elder(elder1)
                        .medication(elder2Medication)
                        .recordDate(LocalDate.of(2026, 2, 7))
                        .timeOfDay(MedicationTimeOfDay.MORNING)
                        .status(MedicationRecordStatus.TAKEN)
                        .build())
        );
    }
}
