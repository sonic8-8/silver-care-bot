package site.silverbot.api.report.controller;

import static org.hamcrest.Matchers.closeTo;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class ReportControllerTest extends RestDocsSupport {

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
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getWeeklyReport_returnsCalculatedSummary() throws Exception {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        Long medicationId = insertMedication(elder.getId(), "혈압약", "MORNING", weekStart, null);
        for (int day = 0; day < 5; day++) {
            insertMedicationRecord(elder.getId(), medicationId, weekStart.plusDays(day), "MORNING", "TAKEN");
        }

        insertActivity(elder.getId(), "WAKE_UP", weekStart.atTime(7, 10));
        insertActivity(elder.getId(), "OUT_DETECTED", weekStart.plusDays(1).atTime(10, 0));
        insertActivity(elder.getId(), "RETURN_DETECTED", weekStart.plusDays(1).atTime(17, 30));

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/reports/weekly", elder.getId())
                        .param("weekStartDate", weekStart.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.weekStartDate").value(weekStart.toString()))
                .andExpect(jsonPath("$.data.weekEndDate").value(weekStart.plusDays(6).toString()))
                .andExpect(jsonPath("$.data.medicationRate", closeTo(71.4, 0.1)))
                .andExpect(jsonPath("$.data.activityCount").value(3))
                .andExpect(jsonPath("$.data.recommendations.length()").value(2))
                .andExpect(jsonPath("$.data.source").value("CALCULATED"))
                .andDo(document("reports-weekly-get"));
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void getWeeklyReport_deniesWhenNotOwner() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/reports/weekly", elder.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWeeklyReport_deniesWhenRobotTokenUsed() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/reports/weekly", elder.getId())
                        .with(user("1").roles("ROBOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getWeeklyReport_returnsStoredSummaryWhenAiReportExists() throws Exception {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);
        insertAiReport(
                elder.getId(),
                weekEnd,
                weekStart,
                weekEnd,
                "주간 요약",
                "{\"medicationRate\":88.9,\"activityCount\":12}",
                "[\"산책\",\"복약\"]",
                "[\"현재 패턴이 안정적입니다.\"]",
                LocalDateTime.of(2026, 2, 7, 12, 0)
        );

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/reports/weekly", elder.getId())
                        .param("weekStartDate", weekStart.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.medicationRate", closeTo(88.9, 0.1)))
                .andExpect(jsonPath("$.data.activityCount").value(12))
                .andExpect(jsonPath("$.data.conversationKeywords.length()").value(2))
                .andExpect(jsonPath("$.data.recommendations.length()").value(1))
                .andExpect(jsonPath("$.data.source").value("STORED"));
    }

    private void ensurePhase3Tables() {
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
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS ai_report (
                    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    elder_id BIGINT NOT NULL,
                    report_date DATE NOT NULL,
                    period_start DATE NOT NULL,
                    period_end DATE NOT NULL,
                    summary CLOB,
                    metrics CLOB,
                    top_keywords CLOB,
                    recommendations CLOB,
                    generated_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
    }

    private void clearPhase3Tables() {
        jdbcTemplate.update("DELETE FROM medication_record");
        jdbcTemplate.update("DELETE FROM medication");
        jdbcTemplate.update("DELETE FROM activity");
        jdbcTemplate.update("DELETE FROM ai_report");
    }

    private Long insertMedication(
            Long elderId,
            String name,
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
                "1정",
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
            LocalDate recordDate,
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
                recordDate,
                timeOfDay,
                status,
                "MANUAL"
        );
    }

    private void insertActivity(Long elderId, String type, LocalDateTime detectedAt) {
        jdbcTemplate.update(
                """
                INSERT INTO activity (elder_id, type, title, detected_at, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                elderId,
                type,
                type,
                detectedAt
        );
    }

    private void insertAiReport(
            Long elderId,
            LocalDate reportDate,
            LocalDate periodStart,
            LocalDate periodEnd,
            String summary,
            String metricsJson,
            String topKeywordsJson,
            String recommendationsJson,
            LocalDateTime generatedAt
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO ai_report (
                    elder_id, report_date, period_start, period_end, summary,
                    metrics, top_keywords, recommendations, generated_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                elderId,
                reportDate,
                periodStart,
                periodEnd,
                summary,
                metricsJson,
                topKeywordsJson,
                recommendationsJson,
                generatedAt
        );
    }
}
