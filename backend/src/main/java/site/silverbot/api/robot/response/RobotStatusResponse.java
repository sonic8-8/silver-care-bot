package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;

public record RobotStatusResponse(
        Long id,
        String serialNumber,
        Integer batteryLevel,
        Boolean isCharging,
        NetworkStatus networkStatus,
        String currentLocation,
        LcdMode lcdMode,
        LocalDateTime lastSyncAt,
        Dispenser dispenser,
        Settings settings
) {
    public record Dispenser(
            Integer remaining,
            Integer capacity,
            Integer daysUntilEmpty
    ) {
    }

    public record Settings(
            String morningMedicationTime,
            String eveningMedicationTime,
            Integer ttsVolume,
            PatrolTimeRange patrolTimeRange
    ) {
    }

    public record PatrolTimeRange(
            String start,
            String end
    ) {
    }
}
