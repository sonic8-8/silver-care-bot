package site.silverbot.api.robot.request;

public record UpdateRobotSettingsRequest(
        String morningMedicationTime,
        String eveningMedicationTime,
        Integer ttsVolume,
        PatrolTimeRange patrolTimeRange
) {
    public record PatrolTimeRange(
            String start,
            String end
    ) {
    }
}
