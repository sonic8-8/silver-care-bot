package site.silverbot.domain.robot;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RobotCommandRepository extends JpaRepository<RobotCommand, Long> {
    List<RobotCommand> findAllByRobotIdAndStatusOrderByIssuedAtAscIdAsc(Long robotId, CommandStatus status);

    Optional<RobotCommand> findByRobotIdAndCommandId(Long robotId, String commandId);
}
