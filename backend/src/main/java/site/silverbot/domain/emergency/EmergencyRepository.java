package site.silverbot.domain.emergency;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyRepository extends JpaRepository<Emergency, Long> {
    List<Emergency> findAllByElderId(Long elderId);

    List<Emergency> findAllByElderIdInOrderByDetectedAtDesc(List<Long> elderIds);

    Optional<Emergency> findTopByElderIdAndResolutionOrderByDetectedAtDesc(Long elderId, EmergencyResolution resolution);

    boolean existsByElderIdAndResolution(Long elderId, EmergencyResolution resolution);
}
