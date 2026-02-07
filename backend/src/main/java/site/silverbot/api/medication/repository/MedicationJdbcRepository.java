package site.silverbot.api.medication.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import site.silverbot.api.medication.model.MedicationFrequency;
import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;

@Repository
@RequiredArgsConstructor
public class MedicationJdbcRepository {
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public Optional<MedicationData> findMedicationByIdAndElderId(Long elderId, Long medicationId) {
        String sql = """
                SELECT id, elder_id, name, dosage, frequency, timing, color, start_date, end_date, is_active, created_at, updated_at
                FROM medication
                WHERE elder_id = :elderId AND id = :medicationId
                """;
        List<MedicationData> results = jdbcTemplate.query(
                sql,
                Map.of("elderId", elderId, "medicationId", medicationId),
                medicationMapper()
        );
        return results.stream().findFirst();
    }

    public List<MedicationData> findAllMedicationsByElderId(Long elderId) {
        String sql = """
                SELECT id, elder_id, name, dosage, frequency, timing, color, start_date, end_date, is_active, created_at, updated_at
                FROM medication
                WHERE elder_id = :elderId
                ORDER BY created_at DESC, id DESC
                """;
        return jdbcTemplate.query(sql, Map.of("elderId", elderId), medicationMapper());
    }

    public List<MedicationData> findActiveMedicationsByElderId(Long elderId) {
        String sql = """
                SELECT id, elder_id, name, dosage, frequency, timing, color, start_date, end_date, is_active, created_at, updated_at
                FROM medication
                WHERE elder_id = :elderId AND is_active = TRUE
                ORDER BY created_at DESC, id DESC
                """;
        return jdbcTemplate.query(sql, Map.of("elderId", elderId), medicationMapper());
    }

    public MedicationData insertMedication(
            Long elderId,
            String name,
            String dosage,
            MedicationFrequency frequency,
            String timing,
            String color,
            LocalDate startDate,
            LocalDate endDate,
            boolean isActive
    ) {
        String sql = """
                INSERT INTO medication (elder_id, name, dosage, frequency, timing, color, start_date, end_date, is_active, created_at, updated_at)
                VALUES (:elderId, :name, :dosage, :frequency, :timing, :color, :startDate, :endDate, :isActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("elderId", elderId)
                .addValue("name", name)
                .addValue("dosage", dosage)
                .addValue("frequency", frequency.name())
                .addValue("timing", timing)
                .addValue("color", color)
                .addValue("startDate", startDate)
                .addValue("endDate", endDate)
                .addValue("isActive", isActive);

        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to create medication");
        }

        return findMedicationByIdAndElderId(elderId, key.longValue())
                .orElseThrow(() -> new IllegalStateException("Created medication not found"));
    }

    public MedicationData updateMedication(MedicationData medication) {
        String sql = """
                UPDATE medication
                SET name = :name,
                    dosage = :dosage,
                    frequency = :frequency,
                    timing = :timing,
                    color = :color,
                    start_date = :startDate,
                    end_date = :endDate,
                    is_active = :isActive,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id AND elder_id = :elderId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", medication.id())
                .addValue("elderId", medication.elderId())
                .addValue("name", medication.name())
                .addValue("dosage", medication.dosage())
                .addValue("frequency", medication.frequency().name())
                .addValue("timing", medication.timing())
                .addValue("color", medication.color())
                .addValue("startDate", medication.startDate())
                .addValue("endDate", medication.endDate())
                .addValue("isActive", medication.isActive());

        jdbcTemplate.update(sql, params);

        return findMedicationByIdAndElderId(medication.elderId(), medication.id())
                .orElseThrow(() -> new IllegalStateException("Updated medication not found"));
    }

    public void deleteMedication(Long elderId, Long medicationId) {
        String deleteRecordsSql = "DELETE FROM medication_record WHERE medication_id = :medicationId";
        jdbcTemplate.update(deleteRecordsSql, Map.of("medicationId", medicationId));

        String deleteMedicationSql = "DELETE FROM medication WHERE elder_id = :elderId AND id = :medicationId";
        jdbcTemplate.update(deleteMedicationSql, Map.of("elderId", elderId, "medicationId", medicationId));
    }

    public MedicationRecordData upsertMedicationRecord(
            Long elderId,
            Long medicationId,
            LocalDate recordDate,
            MedicationTimeOfDay timeOfDay,
            MedicationStatus status,
            LocalDateTime takenAt,
            MedicationMethod method
    ) {
        Optional<Long> existingId = findRecordId(medicationId, recordDate, timeOfDay);
        if (existingId.isPresent()) {
            String updateSql = """
                    UPDATE medication_record
                    SET status = :status,
                        taken_at = :takenAt,
                        method = :method
                    WHERE id = :id
                    """;
            jdbcTemplate.update(
                    updateSql,
                    new MapSqlParameterSource()
                            .addValue("id", existingId.get())
                            .addValue("status", status.name())
                            .addValue("takenAt", takenAt)
                            .addValue("method", method.name())
            );
            return findRecordById(existingId.get())
                    .orElseThrow(() -> new IllegalStateException("Updated medication record not found"));
        }

        String insertSql = """
                INSERT INTO medication_record (elder_id, medication_id, record_date, time_of_day, status, taken_at, method, created_at)
                VALUES (:elderId, :medicationId, :recordDate, :timeOfDay, :status, :takenAt, :method, CURRENT_TIMESTAMP)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                insertSql,
                new MapSqlParameterSource()
                        .addValue("elderId", elderId)
                        .addValue("medicationId", medicationId)
                        .addValue("recordDate", recordDate)
                        .addValue("timeOfDay", timeOfDay.name())
                        .addValue("status", status.name())
                        .addValue("takenAt", takenAt)
                        .addValue("method", method.name()),
                keyHolder,
                new String[]{"id"}
        );

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to create medication record");
        }

        return findRecordById(key.longValue())
                .orElseThrow(() -> new IllegalStateException("Created medication record not found"));
    }

    public List<MedicationRecordData> findMedicationRecords(Long elderId, LocalDate startDate, LocalDate endDate) {
        String sql = """
                SELECT id, elder_id, medication_id, record_date, time_of_day, status, taken_at, method, created_at
                FROM medication_record
                WHERE elder_id = :elderId
                  AND record_date BETWEEN :startDate AND :endDate
                ORDER BY record_date ASC, time_of_day ASC, id ASC
                """;
        return jdbcTemplate.query(
                sql,
                new MapSqlParameterSource()
                        .addValue("elderId", elderId)
                        .addValue("startDate", startDate)
                        .addValue("endDate", endDate),
                medicationRecordMapper()
        );
    }

    private Optional<Long> findRecordId(Long medicationId, LocalDate recordDate, MedicationTimeOfDay timeOfDay) {
        String sql = """
                SELECT id
                FROM medication_record
                WHERE medication_id = :medicationId
                  AND record_date = :recordDate
                  AND time_of_day = :timeOfDay
                """;
        List<Long> ids = jdbcTemplate.query(
                sql,
                new MapSqlParameterSource()
                        .addValue("medicationId", medicationId)
                        .addValue("recordDate", recordDate)
                        .addValue("timeOfDay", timeOfDay.name()),
                (rs, rowNum) -> rs.getLong("id")
        );
        return ids.stream().findFirst();
    }

    private Optional<MedicationRecordData> findRecordById(Long id) {
        String sql = """
                SELECT id, elder_id, medication_id, record_date, time_of_day, status, taken_at, method, created_at
                FROM medication_record
                WHERE id = :id
                """;
        List<MedicationRecordData> rows = jdbcTemplate.query(
                sql,
                Map.of("id", id),
                medicationRecordMapper()
        );
        return rows.stream().findFirst();
    }

    private RowMapper<MedicationData> medicationMapper() {
        return (rs, rowNum) -> new MedicationData(
                rs.getLong("id"),
                rs.getLong("elder_id"),
                rs.getString("name"),
                rs.getString("dosage"),
                MedicationFrequency.valueOf(rs.getString("frequency")),
                rs.getString("timing"),
                rs.getString("color"),
                rs.getObject("start_date", LocalDate.class),
                rs.getObject("end_date", LocalDate.class),
                rs.getBoolean("is_active"),
                getLocalDateTime(rs, "created_at"),
                getLocalDateTime(rs, "updated_at")
        );
    }

    private RowMapper<MedicationRecordData> medicationRecordMapper() {
        return (rs, rowNum) -> new MedicationRecordData(
                rs.getLong("id"),
                rs.getLong("elder_id"),
                rs.getLong("medication_id"),
                rs.getObject("record_date", LocalDate.class),
                MedicationTimeOfDay.valueOf(rs.getString("time_of_day")),
                MedicationStatus.valueOf(rs.getString("status")),
                getLocalDateTime(rs, "taken_at"),
                MedicationMethod.valueOf(rs.getString("method")),
                getLocalDateTime(rs, "created_at")
        );
    }

    private LocalDateTime getLocalDateTime(ResultSet rs, String columnName) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnName);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    public record MedicationData(
            Long id,
            Long elderId,
            String name,
            String dosage,
            MedicationFrequency frequency,
            String timing,
            String color,
            LocalDate startDate,
            LocalDate endDate,
            boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record MedicationRecordData(
            Long id,
            Long elderId,
            Long medicationId,
            LocalDate recordDate,
            MedicationTimeOfDay timeOfDay,
            MedicationStatus status,
            LocalDateTime takenAt,
            MedicationMethod method,
            LocalDateTime createdAt
    ) {
    }
}
