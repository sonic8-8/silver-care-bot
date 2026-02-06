package site.silverbot.api.medication.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.medication.model.MedicationFrequency;
import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.request.CreateMedicationRecordRequest;
import site.silverbot.api.medication.request.CreateMedicationRequest;
import site.silverbot.api.medication.response.MedicationListResponse;
import site.silverbot.api.medication.response.MedicationRecordResponse;
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

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MedicationServiceTest {

    @Autowired
    private MedicationService medicationService;

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

    @Autowired
    private EntityManager entityManager;

    private Elder ownerElder;

    @BeforeEach
    void setUp() {
        ensurePhase2Tables();
        clearPhase2Tables();

        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        entityManager.flush();
        entityManager.clear();

        User owner = userRepository.save(User.builder()
                .name("담당자")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        userRepository.save(User.builder()
                .name("외부사용자")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        ownerElder = elderRepository.save(Elder.builder()
                .user(owner)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMedications_returnsEmptySummaryWhenNoData() {
        MedicationListResponse response = medicationService.getMedications(ownerElder.getId());

        assertThat(response.medications()).isEmpty();
        assertThat(response.weeklyStatus().taken()).isZero();
        assertThat(response.weeklyStatus().missed()).isZero();
        assertThat(response.weeklyStatus().rate()).isZero();
        assertThat(response.dailyStatus()).hasSize(7);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMedications_calculatesWeeklyRate() {
        CreateMedicationRequest createRequest = new CreateMedicationRequest(
                "혈압약",
                "1정",
                MedicationFrequency.MORNING,
                "식후 30분",
                "white",
                LocalDate.now(),
                null
        );

        Long medicationId = medicationService.createMedication(ownerElder.getId(), createRequest).id();

        MedicationRecordResponse record = medicationService.createMedicationRecord(
                ownerElder.getId(),
                new CreateMedicationRecordRequest(
                        medicationId,
                        MedicationStatus.TAKEN,
                        null,
                        MedicationMethod.BUTTON,
                        MedicationTimeOfDay.MORNING
                )
        );

        MedicationListResponse response = medicationService.getMedications(ownerElder.getId());

        assertThat(record.status()).isEqualTo(MedicationStatus.TAKEN);
        assertThat(response.weeklyStatus().total()).isEqualTo(1);
        assertThat(response.weeklyStatus().taken()).isEqualTo(1);
        assertThat(response.weeklyStatus().missed()).isZero();
        assertThat(response.weeklyStatus().rate()).isEqualTo(100.0);
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void createMedicationRecord_deniesOtherUser() {
        Long medicationId = insertMedication(ownerElder.getId(), "당뇨약", "1정", "MORNING", LocalDate.now(), null);

        CreateMedicationRecordRequest request = new CreateMedicationRecordRequest(
                medicationId,
                MedicationStatus.TAKEN,
                null,
                MedicationMethod.DISPENSER,
                MedicationTimeOfDay.MORNING
        );

        assertThatThrownBy(() -> medicationService.createMedicationRecord(ownerElder.getId(), request))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createMedicationRecord_rejectsPendingStatus() {
        Long medicationId = insertMedication(ownerElder.getId(), "비타민", "1정", "MORNING", LocalDate.now(), null);

        CreateMedicationRecordRequest request = new CreateMedicationRecordRequest(
                medicationId,
                MedicationStatus.PENDING,
                null,
                MedicationMethod.MANUAL,
                MedicationTimeOfDay.MORNING
        );

        assertThatThrownBy(() -> medicationService.createMedicationRecord(ownerElder.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMedications_excludesFutureAndEndedMedicationFromDispenserCalculation() {
        robotRepository.save(Robot.builder()
                .elder(ownerElder)
                .serialNumber("RB-DISPENSER-01")
                .networkStatus(NetworkStatus.CONNECTED)
                .batteryLevel(88)
                .dispenserRemaining(6)
                .dispenserCapacity(10)
                .build());

        LocalDate today = LocalDate.now();
        insertMedication(ownerElder.getId(), "현재 복용약", "1정", "BOTH", today.minusDays(1), today.plusDays(3));
        insertMedication(ownerElder.getId(), "미래 시작약", "1정", "BOTH", today.plusDays(2), null);
        insertMedication(ownerElder.getId(), "종료된 약", "1정", "BOTH", today.minusDays(10), today.minusDays(1));

        MedicationListResponse response = medicationService.getMedications(ownerElder.getId());

        assertThat(response.dispenser().daysUntilEmpty()).isEqualTo(3);
        assertThat(response.dispenser().needsRefill()).isFalse();
    }

    private void ensurePhase2Tables() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS medication (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    elder_id BIGINT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    dosage VARCHAR(100) NOT NULL,
                    frequency VARCHAR(20) NOT NULL,
                    timing VARCHAR(100),
                    color VARCHAR(30),
                    start_date DATE,
                    end_date DATE,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS medication_record (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    elder_id BIGINT NOT NULL,
                    medication_id BIGINT NOT NULL,
                    record_date DATE NOT NULL,
                    time_of_day VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    taken_at TIMESTAMP,
                    method VARCHAR(20),
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_medication_record UNIQUE (medication_id, record_date, time_of_day)
                )
                """);
    }

    private void clearPhase2Tables() {
        jdbcTemplate.update("DELETE FROM medication_record");
        jdbcTemplate.update("DELETE FROM medication");
    }

    private Long insertMedication(
            Long elderId,
            String name,
            String dosage,
            String frequency,
            LocalDate startDate,
            LocalDate endDate
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO medication (elder_id, name, dosage, frequency, timing, color, start_date, end_date, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                elderId,
                name,
                dosage,
                frequency,
                "식후",
                "white",
                startDate,
                endDate,
                true
        );
        return jdbcTemplate.queryForObject("SELECT MAX(id) FROM medication", Long.class);
    }
}
