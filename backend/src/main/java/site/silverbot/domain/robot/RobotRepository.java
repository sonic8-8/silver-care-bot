package site.silverbot.domain.robot;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RobotRepository extends JpaRepository<Robot, Long> {
    Optional<Robot> findBySerialNumber(String serialNumber);

    Optional<Robot> findBySerialNumberAndAuthCode(String serialNumber, String authCode);

    Optional<Robot> findByElderId(Long elderId);

    List<Robot> findByElderIdIn(List<Long> elderIds);
}
