package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

public record UpdateRobotSettingsResponse(
        String morningMedicationTime,
        String eveningMedicationTime,
        Integer ttsVolume,
        PatrolTimeRange patrolTimeRange,
        LocalDateTime updatedAt
) {
    public record PatrolTimeRange(
            String start,
            String end
    ) {
    }
}
