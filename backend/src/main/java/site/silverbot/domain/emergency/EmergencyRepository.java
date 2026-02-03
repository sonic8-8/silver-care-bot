package site.silverbot.domain.emergency;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyRepository extends JpaRepository<Emergency, Long> {
    List<Emergency> findAllByElderId(Long elderId);
}
