package site.silverbot.api.activity.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import site.silverbot.api.activity.model.ActivityType;

@Repository
@RequiredArgsConstructor
public class ActivityJdbcRepository {
    private static final Set<String> NON_POSTGRES_CAST_SQL_STATES = Set.of(
            "HY004",
            "22018",
            "42S22"
    );

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<ActivityData> findByElderAndRange(Long elderId, LocalDateTime start, LocalDateTime end) {
        String sql = """
                SELECT id, elder_id, robot_id, type, title, description, location, detected_at, created_at
                FROM activity
                WHERE elder_id = :elderId
                  AND detected_at BETWEEN :startDateTime AND :endDateTime
                ORDER BY detected_at DESC, id DESC
                """;
        try {
            return jdbcTemplate.query(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("startDateTime", start)
                            .addValue("endDateTime", end),
                    activityMapper()
            );
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return List.of();
            }
            throw ex;
        }
    }

    public long countByElderAndRange(Long elderId, LocalDateTime start, LocalDateTime end) {
        String sql = """
                SELECT COUNT(*)
                FROM activity
                WHERE elder_id = :elderId
                  AND detected_at BETWEEN :startDateTime AND :endDateTime
                """;
        try {
            Long count = jdbcTemplate.queryForObject(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("startDateTime", start)
                            .addValue("endDateTime", end),
                    Long.class
            );
            return count == null ? 0L : count;
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return 0L;
            }
            throw ex;
        }
    }

    public ActivityData insert(
            Long elderId,
            Long robotId,
            ActivityType type,
            String title,
            String description,
            String location,
            LocalDateTime detectedAt
    ) {
        String sql = """
                INSERT INTO activity (elder_id, robot_id, type, title, description, location, detected_at, created_at)
                VALUES (:elderId, :robotId, CAST(:type AS activity_type), :title, :description, :location, :detectedAt, CURRENT_TIMESTAMP)
                """;
        String fallbackSql = """
                INSERT INTO activity (elder_id, robot_id, type, title, description, location, detected_at, created_at)
                VALUES (:elderId, :robotId, :type, :title, :description, :location, :detectedAt, CURRENT_TIMESTAMP)
                """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("elderId", elderId)
                .addValue("robotId", robotId)
                .addValue("type", type.name())
                .addValue("title", title)
                .addValue("description", description)
                .addValue("location", location)
                .addValue("detectedAt", detectedAt);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        } catch (DataAccessException ex) {
            if (!isUnsupportedTypeCast(ex, "activity_type")) {
                throw ex;
            }
            keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(fallbackSql, params, keyHolder, new String[]{"id"});
        }

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to create activity");
        }
        return findById(key.longValue())
                .orElseThrow(() -> new IllegalStateException("Created activity not found"));
    }

    private boolean isUnsupportedTypeCast(DataAccessException ex, String typeName) {
        String sqlState = findSqlState(ex);
        if (sqlState != null) {
            if (isPostgresSqlState(sqlState)) {
                return false;
            }
            if (NON_POSTGRES_CAST_SQL_STATES.contains(sqlState)) {
                return true;
            }
        }

        String message = ex.getMessage();
        if (message == null) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.ROOT);
        String targetType = typeName.toLowerCase(Locale.ROOT);
        return normalized.contains(targetType)
                && (normalized.contains("unknown")
                || normalized.contains("not found")
                || normalized.contains("cannot cast")
                || normalized.contains("data conversion"));
    }

    private String findSqlState(DataAccessException ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof SQLException sqlException) {
                String sqlState = sqlException.getSQLState();
                if (sqlState != null && !sqlState.isBlank()) {
                    return sqlState;
                }
            }
            current = current.getCause();
        }
        return null;
    }

    private boolean isPostgresSqlState(String sqlState) {
        return sqlState.startsWith("22P")
                || sqlState.startsWith("23P")
                || sqlState.startsWith("42P")
                || "42704".equals(sqlState)
                || "42846".equals(sqlState);
    }

    private Optional<ActivityData> findById(Long id) {
        String sql = """
                SELECT id, elder_id, robot_id, type, title, description, location, detected_at, created_at
                FROM activity
                WHERE id = :id
                """;
        List<ActivityData> rows = jdbcTemplate.query(sql, Map.of("id", id), activityMapper());
        return rows.stream().findFirst();
    }

    private boolean isMissingTable(DataAccessException ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof SQLException sqlException) {
                String sqlState = sqlException.getSQLState();
                if ("42P01".equals(sqlState) || "42S02".equals(sqlState)) {
                    return true;
                }
            }
            current = current.getCause();
        }

        String message = ex.getMessage();
        if (message == null) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.ROOT);
        return normalized.contains("table")
                && (normalized.contains("not found") || normalized.contains("does not exist"));
    }

    private RowMapper<ActivityData> activityMapper() {
        return (rs, rowNum) -> new ActivityData(
                rs.getLong("id"),
                rs.getLong("elder_id"),
                rs.getObject("robot_id", Long.class),
                ActivityType.valueOf(rs.getString("type")),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("location"),
                getLocalDateTime(rs, "detected_at"),
                getLocalDateTime(rs, "created_at")
        );
    }

    private LocalDateTime getLocalDateTime(ResultSet rs, String columnName) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnName);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    public record ActivityData(
            Long id,
            Long elderId,
            Long robotId,
            ActivityType type,
            String title,
            String description,
            String location,
            LocalDateTime detectedAt,
            LocalDateTime createdAt
    ) {
    }
}
