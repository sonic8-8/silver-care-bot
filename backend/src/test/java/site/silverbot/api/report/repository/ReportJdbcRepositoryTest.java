package site.silverbot.api.report.repository;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@ExtendWith(MockitoExtension.class)
class ReportJdbcRepositoryTest {

    @Mock
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Test
    void saveWeeklyReport_retriesWithoutCast_whenNonPostgresCastState() {
        ReportJdbcRepository repository = new ReportJdbcRepository(jdbcTemplate);
        AtomicInteger callCount = new AtomicInteger();

        when(jdbcTemplate.update(anyString(), any(MapSqlParameterSource.class)))
                .thenAnswer(invocation -> {
                    int call = callCount.incrementAndGet();
                    if (call == 1) {
                        throw castTypeException("HY004");
                    }
                    return 1;
                });

        repository.saveWeeklyReport(
                10L,
                LocalDate.of(2026, 2, 7),
                LocalDate.of(2026, 2, 1),
                LocalDate.of(2026, 2, 7),
                "주간 요약",
                "{\"total\":5}",
                "[\"복약\"]",
                "[\"복약 리마인더 강화\"]",
                LocalDateTime.of(2026, 2, 7, 9, 0)
        );

        verify(jdbcTemplate, times(2)).update(anyString(), any(MapSqlParameterSource.class));
    }

    @Test
    void saveWeeklyReport_rethrows_whenPostgresCastState() {
        ReportJdbcRepository repository = new ReportJdbcRepository(jdbcTemplate);
        DataAccessException postgresCastFailure = castTypeException("42704");

        when(jdbcTemplate.update(anyString(), any(MapSqlParameterSource.class)))
                .thenThrow(postgresCastFailure);

        assertThatThrownBy(() -> repository.saveWeeklyReport(
                10L,
                LocalDate.of(2026, 2, 7),
                LocalDate.of(2026, 2, 1),
                LocalDate.of(2026, 2, 7),
                "주간 요약",
                "{\"total\":5}",
                "[\"복약\"]",
                "[\"복약 리마인더 강화\"]",
                LocalDateTime.of(2026, 2, 7, 9, 0)
        )).isSameAs(postgresCastFailure);

        verify(jdbcTemplate, times(1)).update(anyString(), any(MapSqlParameterSource.class));
    }

    private DataAccessException castTypeException(String sqlState) {
        SQLException sqlException = new SQLException(
                "Unknown data type: jsonb",
                sqlState
        );
        return new BadSqlGrammarException("insert", "INSERT", sqlException);
    }
}
