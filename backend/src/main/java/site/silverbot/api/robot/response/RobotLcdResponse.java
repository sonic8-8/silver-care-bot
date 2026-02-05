package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

public record RobotLcdResponse(
        String mode,
        String emotion,
        String message,
        String subMessage,
        NextSchedule nextSchedule,
        LocalDateTime lastUpdatedAt
) {
    public record NextSchedule(
            String label,
            String time
    ) {
    }
}
