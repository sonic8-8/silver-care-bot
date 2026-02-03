package site.silverbot.domain.robot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RobotCommandRepository extends JpaRepository<RobotCommand, Long> {
    List<RobotCommand> findAllByRobotIdAndStatus(Long robotId, CommandStatus status);
}
