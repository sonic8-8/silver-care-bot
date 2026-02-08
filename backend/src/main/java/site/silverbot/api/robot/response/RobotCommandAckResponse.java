package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import site.silverbot.domain.robot.CommandStatus;

public record RobotCommandAckResponse(
        boolean received,
        String commandId,
        CommandStatus status,
        LocalDateTime completedAt,
        OffsetDateTime serverTime
) {
}
