package site.silverbot.api.medication.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.medication.model.MedicationFrequency;
import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.request.CreateMedicationRecordRequest;
import site.silverbot.api.medication.request.CreateMedicationRequest;
import site.silverbot.api.medication.request.UpdateMedicationRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class MedicationControllerTest extends RestDocsSupport {

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
        ensurePhase2Tables();
        clearPhase2Tables();

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

        elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createMedication_createsMedication() throws Exception {
        CreateMedicationRequest request = new CreateMedicationRequest(
                "혈압약",
                "1정",
                MedicationFrequency.MORNING,
                "식후 30분",
                "white",
                LocalDate.now(),
                null
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders/{elderId}/medications", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("혈압약"))
                .andExpect(jsonPath("$.data.frequency").value("MORNING"))
                .andDo(document("medications-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMedications_returnsWeeklySummary() throws Exception {
        Long medicationId = insertMedication(elder.getId(), "당뇨약", "1정", "BOTH", LocalDate.now().minusDays(1), null);
        insertMedicationRecord(
                elder.getId(),
                medicationId,
                LocalDate.now().minusDays(1),
                "MORNING",
                "TAKEN",
                OffsetDateTime.now().minusDays(1).toLocalDateTime(),
                "BUTTON"
        );

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/medications", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.medications.length()").value(1))
                .andExpect(jsonPath("$.data.weeklyStatus.total").isNumber())
                .andExpect(jsonPath("$.data.dailyStatus.length()").value(7))
                .andDo(document("medications-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMedication_returnsDetail() throws Exception {
        Long medicationId = insertMedication(elder.getId(), "비타민", "1정", "EVENING", LocalDate.now(), null);

        mockMvc.perform(RestDocumentationRequestBuilders.get(
                        "/api/elders/{elderId}/medications/{medicationId}",
                        elder.getId(),
                        medicationId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(medicationId))
                .andExpect(jsonPath("$.data.name").value("비타민"))
                .andDo(document("medications-detail"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateAndDeleteMedication_updatesThenDeletes() throws Exception {
        Long medicationId = insertMedication(elder.getId(), "칼슘", "1정", "MORNING", LocalDate.now(), null);

        UpdateMedicationRequest updateRequest = new UpdateMedicationRequest(
                "칼슘+비타민D",
                "2정",
                MedicationFrequency.BOTH,
                "식후",
                "yellow",
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                true
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put(
                        "/api/elders/{elderId}/medications/{medicationId}",
                        elder.getId(),
                        medicationId
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("칼슘+비타민D"))
                .andDo(document("medications-update"));

        mockMvc.perform(RestDocumentationRequestBuilders.delete(
                        "/api/elders/{elderId}/medications/{medicationId}",
                        elder.getId(),
                        medicationId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(document("medications-delete"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createMedicationRecord_createsRecord() throws Exception {
        Long medicationId = insertMedication(elder.getId(), "관절약", "1정", "MORNING", LocalDate.now(), null);

        CreateMedicationRecordRequest request = new CreateMedicationRecordRequest(
                medicationId,
                MedicationStatus.TAKEN,
                OffsetDateTime.now(),
                MedicationMethod.DISPENSER,
                MedicationTimeOfDay.MORNING
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders/{elderId}/medications/records", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.medicationId").value(medicationId))
                .andExpect(jsonPath("$.data.status").value("TAKEN"))
                .andDo(document("medications-record-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateMedication_returnsBadRequest_whenNameIsBlank() throws Exception {
        Long medicationId = insertMedication(elder.getId(), "칼슘", "1정", "MORNING", LocalDate.now(), null);
        UpdateMedicationRequest request = new UpdateMedicationRequest(
                "   ",
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put(
                        "/api/elders/{elderId}/medications/{medicationId}",
                        elder.getId(),
                        medicationId
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.error.message").value("Invalid request"));
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

    private void insertMedicationRecord(
            Long elderId,
            Long medicationId,
            LocalDate recordDate,
            String timeOfDay,
            String status,
            java.time.LocalDateTime takenAt,
            String method
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO medication_record (elder_id, medication_id, record_date, time_of_day, status, taken_at, method, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                elderId,
                medicationId,
                recordDate,
                timeOfDay,
                status,
                takenAt,
                method
        );
    }
}
