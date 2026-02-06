package site.silverbot.api.dashboard.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class DashboardJdbcRepository {
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<NotificationData> findRecentNotifications(Long elderId, int limit) {
        String sql = """
                SELECT id, type, title, message, is_read, created_at
                FROM notification
                WHERE elder_id = :elderId
                ORDER BY created_at DESC
                LIMIT :limit
                """;
        try {
            return jdbcTemplate.query(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("limit", limit),
                    notificationMapper()
            );
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return List.of();
            }
            throw ex;
        }
    }

    public List<ScheduleData> findWeeklySchedules(Long elderId, LocalDateTime start, LocalDateTime end) {
        String sql = """
                SELECT id, title, scheduled_at, location, type, status
                FROM schedule
                WHERE elder_id = :elderId
                  AND scheduled_at BETWEEN :startDateTime AND :endDateTime
                ORDER BY scheduled_at ASC
                """;
        try {
            return jdbcTemplate.query(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("startDateTime", start)
                            .addValue("endDateTime", end),
                    scheduleMapper()
            );
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return List.of();
            }
            throw ex;
        }
    }

    public LocalDateTime findTodayWakeUpTime(Long elderId, LocalDateTime start, LocalDateTime end) {
        String sql = """
                SELECT detected_at
                FROM activity
                WHERE elder_id = :elderId
                  AND type = :wakeUpType
                  AND detected_at BETWEEN :startDateTime AND :endDateTime
                ORDER BY detected_at ASC
                LIMIT 1
                """;
        try {
            List<LocalDateTime> values = jdbcTemplate.query(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("wakeUpType", "WAKE_UP")
                            .addValue("startDateTime", start)
                            .addValue("endDateTime", end),
                    (rs, rowNum) -> getLocalDateTime(rs, "detected_at")
            );
            return values.stream().findFirst().orElse(null);
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return null;
            }
            throw ex;
        }
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

    private RowMapper<NotificationData> notificationMapper() {
        return (rs, rowNum) -> new NotificationData(
                rs.getLong("id"),
                rs.getString("type"),
                rs.getString("title"),
                rs.getString("message"),
                rs.getBoolean("is_read"),
                getLocalDateTime(rs, "created_at")
        );
    }

    private RowMapper<ScheduleData> scheduleMapper() {
        return (rs, rowNum) -> new ScheduleData(
                rs.getLong("id"),
                rs.getString("title"),
                getLocalDateTime(rs, "scheduled_at"),
                rs.getString("location"),
                rs.getString("type"),
                rs.getString("status")
        );
    }

    private LocalDateTime getLocalDateTime(ResultSet rs, String columnName) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnName);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    public record NotificationData(
            Long id,
            String type,
            String title,
            String message,
            boolean isRead,
            LocalDateTime createdAt
    ) {
    }

    public record ScheduleData(
            Long id,
            String title,
            LocalDateTime scheduledAt,
            String location,
            String type,
            String status
    ) {
    }
}
