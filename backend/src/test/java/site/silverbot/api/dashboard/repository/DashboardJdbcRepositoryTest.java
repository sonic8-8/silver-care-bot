package site.silverbot.api.dashboard.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.sql.SQLException;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@ExtendWith(MockitoExtension.class)
class DashboardJdbcRepositoryTest {

    @Mock
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Test
    void findRecentNotifications_returnsEmpty_whenTableMissing() {
        DashboardJdbcRepository repository = new DashboardJdbcRepository(jdbcTemplate);

        when(jdbcTemplate.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(missingTableException("notification"));

        assertThat(repository.findRecentNotifications(1L, 5)).isEmpty();
    }

    @Test
    void findRecentNotifications_rethrows_whenDatabaseError() {
        DashboardJdbcRepository repository = new DashboardJdbcRepository(jdbcTemplate);
        DataAccessException dbDown = new DataAccessResourceFailureException("DB down");

        when(jdbcTemplate.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(dbDown);

        assertThatThrownBy(() -> repository.findRecentNotifications(1L, 5))
                .isSameAs(dbDown);
    }

    @Test
    void findWeeklySchedules_returnsEmpty_whenTableMissing() {
        DashboardJdbcRepository repository = new DashboardJdbcRepository(jdbcTemplate);

        when(jdbcTemplate.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(missingTableException("schedule"));

        assertThat(repository.findWeeklySchedules(1L, LocalDateTime.now(), LocalDateTime.now().plusDays(7))).isEmpty();
    }

    @Test
    void findTodayWakeUpTime_returnsNull_whenTableMissing() {
        DashboardJdbcRepository repository = new DashboardJdbcRepository(jdbcTemplate);

        when(jdbcTemplate.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(missingTableException("activity"));

        assertThat(repository.findTodayWakeUpTime(1L, LocalDateTime.now(), LocalDateTime.now().plusDays(1))).isNull();
    }

    @Test
    void findTodayWakeUpTime_rethrows_whenDatabaseError() {
        DashboardJdbcRepository repository = new DashboardJdbcRepository(jdbcTemplate);
        DataAccessException timeout = new DataAccessResourceFailureException("timeout");

        when(jdbcTemplate.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(timeout);

        assertThatThrownBy(() -> repository.findTodayWakeUpTime(1L, LocalDateTime.now(), LocalDateTime.now().plusDays(1)))
                .isSameAs(timeout);
    }

    private DataAccessException missingTableException(String tableName) {
        SQLException sqlException = new SQLException(
                "Table \"" + tableName + "\" not found",
                "42S02"
        );
        return new BadSqlGrammarException("query", "SELECT *", sqlException);
    }
}
