package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.util.List;

import site.silverbot.domain.robot.CommandType;

public record RobotSyncResponse(
        List<PendingCommandResponse> pendingCommands
) {
    public record PendingCommandResponse(
            String commandId,
            CommandType command,
            Object params,
            LocalDateTime issuedAt
    ) {
    }
}
