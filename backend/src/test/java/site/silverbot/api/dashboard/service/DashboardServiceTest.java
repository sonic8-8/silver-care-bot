package site.silverbot.api.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

import site.silverbot.api.dashboard.response.DashboardResponse;
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
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

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

    private Elder elder;

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

        elder = elderRepository.save(Elder.builder()
                .user(owner)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .build());

        robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("RB-DASHBOARD-01")
                .networkStatus(NetworkStatus.CONNECTED)
                .batteryLevel(87)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getDashboard_calculatesMorningEveningMedicationStatus() {
        Long morningMedicationId = insertMedication(elder.getId(), "혈압약", "1정", "MORNING", LocalDate.now(), null);
        Long eveningMedicationId = insertMedication(elder.getId(), "당뇨약", "1정", "EVENING", LocalDate.now(), null);

        insertMedicationRecord(elder.getId(), morningMedicationId, "MORNING", "TAKEN");
        insertMedicationRecord(elder.getId(), eveningMedicationId, "EVENING", "MISSED");

        DashboardResponse response = dashboardService.getDashboard(elder.getId());

        assertThat(response.todaySummary().medicationStatus().morning().status()).isEqualTo("TAKEN");
        assertThat(response.todaySummary().medicationStatus().evening().status()).isEqualTo("MISSED");
        assertThat(response.todaySummary().medicationStatus().taken()).isEqualTo(1);
        assertThat(response.todaySummary().medicationStatus().total()).isEqualTo(2);
        assertThat(response.todaySummary().medicationStatus().label()).isEqualTo("복약 누락 발생");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getDashboard_returnsNoneStatusWhenMedicationIsEmpty() {
        DashboardResponse response = dashboardService.getDashboard(elder.getId());

        assertThat(response.todaySummary().medicationStatus().morning().status()).isEqualTo("NONE");
        assertThat(response.todaySummary().medicationStatus().evening().status()).isEqualTo("NONE");
        assertThat(response.todaySummary().medicationStatus().total()).isZero();
        assertThat(response.todaySummary().medicationStatus().label()).isEqualTo("등록된 약 없음");
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void getDashboard_deniesWhenCurrentUserIsNotOwner() {
        assertThatThrownBy(() -> dashboardService.getDashboard(elder.getId()))
                .isInstanceOf(AccessDeniedException.class);
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

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS schedule (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    elder_id BIGINT NOT NULL,
                    title VARCHAR(120) NOT NULL,
                    description CLOB,
                    scheduled_at TIMESTAMP NOT NULL,
                    location VARCHAR(120),
                    type VARCHAR(30) NOT NULL,
                    source VARCHAR(30),
                    status VARCHAR(30) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS notification (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    elder_id BIGINT,
                    type VARCHAR(30) NOT NULL,
                    title VARCHAR(150) NOT NULL,
                    message CLOB,
                    target_path VARCHAR(255),
                    is_read BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);

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

    private void clearPhase2Tables() {
        jdbcTemplate.update("DELETE FROM medication_record");
        jdbcTemplate.update("DELETE FROM medication");
        jdbcTemplate.update("DELETE FROM schedule");
        jdbcTemplate.update("DELETE FROM notification");
        jdbcTemplate.update("DELETE FROM activity");
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

    private void insertMedicationRecord(
            Long elderId,
            Long medicationId,
            String timeOfDay,
            String status
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO medication_record (elder_id, medication_id, record_date, time_of_day, status, method, created_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                elderId,
                medicationId,
                LocalDate.now(),
                timeOfDay,
                status,
                "MANUAL"
        );
    }
}
