package site.silverbot.api.activity.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.KeyHolder;

import site.silverbot.api.activity.model.ActivityType;

@ExtendWith(MockitoExtension.class)
class ActivityJdbcRepositoryTest {

    @Mock
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Test
    void insert_retriesWithoutCast_whenNonPostgresCastState() {
        ActivityJdbcRepository repository = new ActivityJdbcRepository(jdbcTemplate);
        AtomicInteger callCount = new AtomicInteger();

        when(jdbcTemplate.update(anyString(), any(MapSqlParameterSource.class), any(KeyHolder.class), any(String[].class)))
                .thenAnswer(invocation -> {
                    int call = callCount.incrementAndGet();
                    if (call == 1) {
                        throw castTypeException("HY004");
                    }
                    KeyHolder keyHolder = invocation.getArgument(2);
                    keyHolder.getKeyList().add(Map.of("id", 11L));
                    return 1;
                });

        when(jdbcTemplate.query(anyString(), anyMap(), any(RowMapper.class)))
                .thenReturn(List.of(new ActivityJdbcRepository.ActivityData(
                        11L,
                        10L,
                        20L,
                        ActivityType.WAKE_UP,
                        "기상",
                        "로봇 감지",
                        "거실",
                        LocalDateTime.of(2026, 2, 7, 8, 0),
                        LocalDateTime.of(2026, 2, 7, 8, 1)
                )));

        ActivityJdbcRepository.ActivityData created = repository.insert(
                10L,
                20L,
                ActivityType.WAKE_UP,
                "기상",
                "로봇 감지",
                "거실",
                LocalDateTime.of(2026, 2, 7, 8, 0)
        );

        assertThat(created.id()).isEqualTo(11L);
        assertThat(callCount.get()).isEqualTo(2);
    }

    @Test
    void insert_rethrows_whenPostgresCastState() {
        ActivityJdbcRepository repository = new ActivityJdbcRepository(jdbcTemplate);
        DataAccessException postgresCastFailure = castTypeException("42704");

        when(jdbcTemplate.update(anyString(), any(MapSqlParameterSource.class), any(KeyHolder.class), any(String[].class)))
                .thenThrow(postgresCastFailure);

        assertThatThrownBy(() -> repository.insert(
                10L,
                20L,
                ActivityType.WAKE_UP,
                "기상",
                "로봇 감지",
                "거실",
                LocalDateTime.of(2026, 2, 7, 8, 0)
        )).isSameAs(postgresCastFailure);

        verify(jdbcTemplate, times(1))
                .update(anyString(), any(MapSqlParameterSource.class), any(KeyHolder.class), any(String[].class));
    }

    private DataAccessException castTypeException(String sqlState) {
        SQLException sqlException = new SQLException(
                "Unknown data type: activity_type",
                sqlState
        );
        return new BadSqlGrammarException("insert", "INSERT", sqlException);
    }
}
