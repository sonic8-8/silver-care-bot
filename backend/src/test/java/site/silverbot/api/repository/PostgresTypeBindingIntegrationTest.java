package site.silverbot.api.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import site.silverbot.api.activity.model.ActivityType;
import site.silverbot.api.activity.repository.ActivityJdbcRepository;
import site.silverbot.api.report.repository.ReportJdbcRepository;

class PostgresTypeBindingIntegrationTest {
    private static final String ENV_URL = "AGENT1_PG_URL";
    private static final String ENV_URL_FALLBACK = "AGENT3_FLYWAY_PG_URL";
    private static final String ENV_USER = "AGENT1_PG_USER";
    private static final String ENV_USER_FALLBACK = "AGENT3_FLYWAY_PG_USER";
    private static final String ENV_PASSWORD = "AGENT1_PG_PASSWORD";
    private static final String ENV_PASSWORD_FALLBACK = "AGENT3_FLYWAY_PG_PASSWORD";

    @Test
    void activityRepository_insert_succeedsWithEnumBinding() throws Exception {
        try (Connection connection = openConnection();
             Statement statement = connection.createStatement()) {
            resetSchema(statement, "agent1_p3_activity_bind");
            statement.execute("CREATE TYPE activity_type AS ENUM ('WAKE_UP', 'SLEEP', 'CONVERSATION')");
            statement.execute("""
                    CREATE TABLE activity (
                        id BIGSERIAL PRIMARY KEY,
                        elder_id BIGINT NOT NULL,
                        robot_id BIGINT,
                        type activity_type NOT NULL,
                        title VARCHAR(120) NOT NULL,
                        description TEXT,
                        location VARCHAR(120),
                        detected_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT now()
                    )
                    """);

            NamedParameterJdbcTemplate jdbcTemplate =
                    new NamedParameterJdbcTemplate(new SingleConnectionDataSource(connection, true));
            ActivityJdbcRepository repository = new ActivityJdbcRepository(jdbcTemplate);

            ActivityJdbcRepository.ActivityData created = repository.insert(
                    10L,
                    20L,
                    ActivityType.WAKE_UP,
                    "기상",
                    "로봇 감지",
                    "거실",
                    LocalDateTime.of(2026, 2, 7, 8, 0)
            );

            assertThat(created.id()).isNotNull();
            assertThat(created.type()).isEqualTo(ActivityType.WAKE_UP);
        }
    }

    @Test
    void reportRepository_saveWeeklyReport_succeedsWithJsonbBinding() throws Exception {
        try (Connection connection = openConnection();
             Statement statement = connection.createStatement()) {
            resetSchema(statement, "agent1_p3_report_bind");
            statement.execute("""
                    CREATE TABLE ai_report (
                        id BIGSERIAL PRIMARY KEY,
                        elder_id BIGINT NOT NULL,
                        report_date DATE NOT NULL,
                        period_start DATE NOT NULL,
                        period_end DATE NOT NULL,
                        summary TEXT NOT NULL,
                        metrics JSONB NOT NULL,
                        top_keywords JSONB NOT NULL,
                        recommendations JSONB NOT NULL,
                        generated_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT now()
                    )
                    """);

            NamedParameterJdbcTemplate jdbcTemplate =
                    new NamedParameterJdbcTemplate(new SingleConnectionDataSource(connection, true));
            ReportJdbcRepository repository = new ReportJdbcRepository(jdbcTemplate);

            repository.saveWeeklyReport(
                    10L,
                    LocalDate.of(2026, 2, 7),
                    LocalDate.of(2026, 2, 1),
                    LocalDate.of(2026, 2, 7),
                    "주간 요약",
                    "{\"total\":5}",
                    "[\"복약\",\"산책\"]",
                    "[\"내일 아침 복약 알림 강화\"]",
                    LocalDateTime.of(2026, 2, 7, 9, 0)
            );

            try (ResultSet resultSet = statement.executeQuery("""
                    SELECT
                        (metrics ->> 'total')::int AS total_count,
                        jsonb_array_length(top_keywords) AS top_keyword_count,
                        recommendations ->> 0 AS first_recommendation
                    FROM ai_report
                    ORDER BY id DESC
                    LIMIT 1
                    """)) {
                assertThat(resultSet.next()).isTrue();
                assertThat(resultSet.getInt("total_count")).isEqualTo(5);
                assertThat(resultSet.getInt("top_keyword_count")).isEqualTo(2);
                assertThat(resultSet.getString("first_recommendation")).isEqualTo("내일 아침 복약 알림 강화");
            }
        }
    }

    private void resetSchema(Statement statement, String schemaName) throws Exception {
        statement.execute("DROP SCHEMA IF EXISTS " + schemaName + " CASCADE");
        statement.execute("CREATE SCHEMA " + schemaName);
        statement.execute("SET search_path TO " + schemaName);
    }

    private Connection openConnection() throws Exception {
        return DriverManager.getConnection(requiredPostgresUrl(), postgresUser(), postgresPassword());
    }

    private String requiredPostgresUrl() {
        String url = getenvFirst(ENV_URL, ENV_URL_FALLBACK);
        assumeTrue(url != null && !url.isBlank(),
                () -> "PostgreSQL integration test skipped. Set " + ENV_URL + " or " + ENV_URL_FALLBACK);
        return url;
    }

    private String postgresUser() {
        String user = getenvFirst(ENV_USER, ENV_USER_FALLBACK);
        return user == null ? "postgres" : user;
    }

    private String postgresPassword() {
        String password = getenvFirst(ENV_PASSWORD, ENV_PASSWORD_FALLBACK);
        return password == null ? "postgres" : password;
    }

    private String getenvFirst(String primary, String fallback) {
        String primaryValue = System.getenv(primary);
        if (primaryValue != null && !primaryValue.isBlank()) {
            return primaryValue;
        }
        return System.getenv(fallback);
    }
}
