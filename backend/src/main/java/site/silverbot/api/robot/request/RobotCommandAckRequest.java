package site.silverbot.api.robot.request;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.Map;
import site.silverbot.domain.robot.CommandStatus;

public record RobotCommandAckRequest(
        @NotNull
        CommandStatus status,
        OffsetDateTime completedAt,
        Map<String, Object> result
) {
}
