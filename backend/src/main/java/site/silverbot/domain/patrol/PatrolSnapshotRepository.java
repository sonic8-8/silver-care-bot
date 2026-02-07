package site.silverbot.domain.patrol;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PatrolSnapshotRepository extends JpaRepository<PatrolSnapshot, Long> {
    List<PatrolSnapshot> findByPatrolResultIdOrderByCapturedAtDescIdDesc(Long patrolResultId);
}
