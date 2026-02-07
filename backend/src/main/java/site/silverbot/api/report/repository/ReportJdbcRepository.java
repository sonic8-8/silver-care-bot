package site.silverbot.api.report.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ReportJdbcRepository {
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public Optional<WeeklyReportData> findWeeklyReport(Long elderId, LocalDate weekStartDate, LocalDate weekEndDate) {
        String sql = """
                SELECT id, elder_id, report_date, period_start, period_end, summary,
                       metrics, top_keywords, recommendations, generated_at
                FROM ai_report
                WHERE elder_id = :elderId
                  AND period_start = :weekStartDate
                  AND period_end = :weekEndDate
                ORDER BY generated_at DESC, id DESC
                LIMIT 1
                """;
        try {
            List<WeeklyReportData> rows = jdbcTemplate.query(
                    sql,
                    new MapSqlParameterSource()
                            .addValue("elderId", elderId)
                            .addValue("weekStartDate", weekStartDate)
                            .addValue("weekEndDate", weekEndDate),
                    weeklyReportMapper()
            );
            return rows.stream().findFirst();
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return Optional.empty();
            }
            throw ex;
        }
    }

    public void saveWeeklyReport(
            Long elderId,
            LocalDate reportDate,
            LocalDate weekStartDate,
            LocalDate weekEndDate,
            String summary,
            String metricsJson,
            String topKeywordsJson,
            String recommendationsJson,
            LocalDateTime generatedAt
    ) {
        String sql = """
                INSERT INTO ai_report (
                    elder_id, report_date, period_start, period_end, summary,
                    metrics, top_keywords, recommendations, generated_at, created_at
                )
                VALUES (
                    :elderId, :reportDate, :weekStartDate, :weekEndDate, :summary,
                    CAST(:metricsJson AS jsonb), CAST(:topKeywordsJson AS jsonb), CAST(:recommendationsJson AS jsonb), :generatedAt, CURRENT_TIMESTAMP
                )
                """;
        String fallbackSql = """
                INSERT INTO ai_report (
                    elder_id, report_date, period_start, period_end, summary,
                    metrics, top_keywords, recommendations, generated_at, created_at
                )
                VALUES (
                    :elderId, :reportDate, :weekStartDate, :weekEndDate, :summary,
                    :metricsJson, :topKeywordsJson, :recommendationsJson, :generatedAt, CURRENT_TIMESTAMP
                )
                """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("elderId", elderId)
                .addValue("reportDate", reportDate)
                .addValue("weekStartDate", weekStartDate)
                .addValue("weekEndDate", weekEndDate)
                .addValue("summary", summary)
                .addValue("metricsJson", metricsJson)
                .addValue("topKeywordsJson", topKeywordsJson)
                .addValue("recommendationsJson", recommendationsJson)
                .addValue("generatedAt", generatedAt);

        try {
            jdbcTemplate.update(sql, params);
        } catch (DataAccessException ex) {
            if (isMissingTable(ex)) {
                return;
            }
            if (isUnsupportedTypeCast(ex, "jsonb")) {
                try {
                    jdbcTemplate.update(fallbackSql, params);
                    return;
                } catch (DataAccessException fallbackEx) {
                    if (isMissingTable(fallbackEx)) {
                        return;
                    }
                    throw fallbackEx;
                }
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

    private boolean isUnsupportedTypeCast(DataAccessException ex, String typeName) {
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

    private RowMapper<WeeklyReportData> weeklyReportMapper() {
        return (rs, rowNum) -> new WeeklyReportData(
                rs.getLong("id"),
                rs.getLong("elder_id"),
                rs.getObject("report_date", LocalDate.class),
                rs.getObject("period_start", LocalDate.class),
                rs.getObject("period_end", LocalDate.class),
                rs.getString("summary"),
                rs.getString("metrics"),
                rs.getString("top_keywords"),
                rs.getString("recommendations"),
                getLocalDateTime(rs, "generated_at")
        );
    }

    private LocalDateTime getLocalDateTime(ResultSet rs, String columnName) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnName);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    public record WeeklyReportData(
            Long id,
            Long elderId,
            LocalDate reportDate,
            LocalDate weekStartDate,
            LocalDate weekEndDate,
            String summary,
            String metricsJson,
            String topKeywordsJson,
            String recommendationsJson,
            LocalDateTime generatedAt
    ) {
    }
}
