package site.silverbot.domain.patrol;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatrolResultRepository extends JpaRepository<PatrolResult, Long> {
    @EntityGraph(attributePaths = "items")
    Optional<PatrolResult> findTopByElderIdOrderByCompletedAtDescIdDesc(Long elderId);

    @EntityGraph(attributePaths = "items")
    Page<PatrolResult> findByElderIdOrderByCompletedAtDescIdDesc(Long elderId, Pageable pageable);

    Optional<PatrolResult> findByPatrolId(String patrolId);
}
