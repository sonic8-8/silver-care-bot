package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

import site.silverbot.domain.robot.CommandStatus;
import site.silverbot.domain.robot.CommandType;

public record CommandResponse(
        String commandId,
        Long robotId,
        CommandType command,
        Object params,
        CommandStatus status,
        LocalDateTime issuedAt
) {
}
