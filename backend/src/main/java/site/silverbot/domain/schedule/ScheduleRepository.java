package site.silverbot.domain.schedule;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ScheduleRepository extends JpaRepository<Schedule, Long>, JpaSpecificationExecutor<Schedule> {
    Optional<Schedule> findByIdAndElderId(Long id, Long elderId);

    List<Schedule> findTop5ByElderIdAndStatusAndScheduledAtGreaterThanEqualOrderByScheduledAtAscIdAsc(
            Long elderId,
            ScheduleStatus status,
            LocalDateTime scheduledAt
    );
}
