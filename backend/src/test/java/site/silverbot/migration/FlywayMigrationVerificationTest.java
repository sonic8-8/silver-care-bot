package site.silverbot.migration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;

class FlywayMigrationVerificationTest {
    private static final String ENV_URL = "AGENT3_FLYWAY_PG_URL";
    private static final String ENV_USER = "AGENT3_FLYWAY_PG_USER";
    private static final String ENV_PASSWORD = "AGENT3_FLYWAY_PG_PASSWORD";
    private static final String TEST_SCHEMA = "agent3_flyway_verify";
    private static final int EXPECTED_V3_CHECKSUM = 1943870464;

    @Test
    void cleanDb_validateAndMigrate_succeeds() throws Exception {
        resetSchema();
        Flyway flyway = flyway();

        MigrateResult migrateResult = flyway.migrate();
        assertThat(migrateResult.success).isTrue();
        assertThat(migrateResult.targetSchemaVersion).isNotNull();
        assertThat(migrateResult.targetSchemaVersion).isEqualTo("8");
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();

        try (Connection connection = flyway.getConfiguration().getDataSource().getConnection()) {
            assertThat(hasColumn(connection, "users", "refresh_token")).isTrue();
            assertThat(hasColumn(connection, "robot", "offline_notified_at")).isTrue();
            assertThat(hasTable(connection, "activity")).isTrue();
            assertThat(hasTable(connection, "patrol_result")).isTrue();
            assertThat(hasTable(connection, "conversation")).isTrue();
            assertThat(hasTable(connection, "search_result")).isTrue();
            assertThat(hasTable(connection, "ai_report")).isTrue();
        }
    }

    @Test
    void legacyHistory_validateRepairMigrate_succeeds() throws Exception {
        resetSchema();
        Flyway phase12 = flywayWithTarget("2");
        MigrateResult initial = phase12.migrate();
        assertThat(initial.success).isTrue();

        try (Connection connection = phase12.getConfiguration().getDataSource().getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE " + TEST_SCHEMA + ".robot ADD COLUMN offline_notified_at TIMESTAMP");
            statement.execute("""
                    INSERT INTO %s.flyway_schema_history (
                        installed_rank,
                        version,
                        description,
                        type,
                        script,
                        checksum,
                        installed_by,
                        execution_time,
                        success
                    ) VALUES (
                        3,
                        '3',
                        'add refresh token to users',
                        'SQL',
                        'V3__add_refresh_token_to_users.sql',
                        0,
                        'postgres',
                        1,
                        TRUE
                    )
                    """.formatted(TEST_SCHEMA));
        }

        Flyway flyway = flyway();
        var beforeRepair = flyway.validateWithResult();
        assertThat(beforeRepair.validationSuccessful).isFalse();
        assertThat(beforeRepair.invalidMigrations).isNotEmpty();

        flyway.repair();
        try (Connection connection = flyway.getConfiguration().getDataSource().getConnection()) {
            assertThat(flywayHistoryChecksum(connection, "3")).isEqualTo(EXPECTED_V3_CHECKSUM);
        }

        MigrateResult migrated = flyway.migrate();
        assertThat(migrated.success).isTrue();
        assertThat(migrated.targetSchemaVersion).isEqualTo("8");
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();

        try (Connection connection = flyway.getConfiguration().getDataSource().getConnection()) {
            assertThat(hasColumn(connection, "users", "refresh_token")).isTrue();
            assertThat(hasColumn(connection, "robot", "offline_notified_at")).isTrue();
            assertThat(hasTable(connection, "activity")).isTrue();
            assertThat(hasTable(connection, "patrol_result")).isTrue();
            assertThat(hasTable(connection, "conversation")).isTrue();
            assertThat(hasTable(connection, "search_result")).isTrue();
            assertThat(hasTable(connection, "ai_report")).isTrue();
        }
    }

    private Flyway flyway() {
        String url = requiredPostgresUrl();
        return Flyway.configure()
                .dataSource(url, postgresUser(), postgresPassword())
                .locations("classpath:db/migration")
                .schemas(TEST_SCHEMA)
                .defaultSchema(TEST_SCHEMA)
                .createSchemas(true)
                .cleanDisabled(true)
                .load();
    }

    private Flyway flywayWithTarget(String targetVersion) {
        String url = requiredPostgresUrl();
        return Flyway.configure()
                .dataSource(url, postgresUser(), postgresPassword())
                .locations("classpath:db/migration")
                .schemas(TEST_SCHEMA)
                .defaultSchema(TEST_SCHEMA)
                .createSchemas(true)
                .target(targetVersion)
                .cleanDisabled(true)
                .load();
    }

    private String requiredPostgresUrl() {
        String url = System.getenv(ENV_URL);
        assumeTrue(url != null && !url.isBlank(),
                () -> "PostgreSQL integration test skipped. Set " + ENV_URL);
        return url;
    }

    private String postgresUser() {
        String user = System.getenv(ENV_USER);
        return user == null ? "postgres" : user;
    }

    private String postgresPassword() {
        String password = System.getenv(ENV_PASSWORD);
        return password == null ? "postgres" : password;
    }

    private void resetSchema() throws Exception {
        try (Connection connection = DriverManager.getConnection(requiredPostgresUrl(), postgresUser(), postgresPassword());
             Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA IF EXISTS " + TEST_SCHEMA + " CASCADE");
            statement.execute("CREATE SCHEMA " + TEST_SCHEMA);
        }
    }

    private boolean hasColumn(Connection connection, String tableName, String columnName) throws Exception {
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='"
                             + TEST_SCHEMA + "' AND TABLE_NAME='" + tableName + "' AND COLUMN_NAME='" + columnName + "'"
             )) {
            return resultSet.next();
        }
    }

    private boolean hasTable(Connection connection, String tableName) throws Exception {
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"
                             + TEST_SCHEMA + "' AND TABLE_NAME='" + tableName + "'"
             )) {
            return resultSet.next();
        }
    }

    private Integer flywayHistoryChecksum(Connection connection, String version) throws Exception {
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT checksum FROM " + TEST_SCHEMA + ".flyway_schema_history WHERE version='" + version + "'"
             )) {
            if (!resultSet.next()) {
                return null;
            }
            return resultSet.getInt("checksum");
        }
    }
}
