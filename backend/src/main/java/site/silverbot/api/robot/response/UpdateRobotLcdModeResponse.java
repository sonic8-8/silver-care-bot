package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

public record UpdateRobotLcdModeResponse(
        String mode,
        String emotion,
        String message,
        String subMessage,
        LocalDateTime updatedAt
) {
}
