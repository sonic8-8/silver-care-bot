package site.silverbot.api.robot.request;

import java.time.OffsetDateTime;

public record RobotSyncRequest(
        Integer batteryLevel,
        Boolean isCharging,
        Integer networkStrength,
        CurrentLocation currentLocation,
        LcdState lcdState,
        Dispenser dispenser,
        OffsetDateTime timestamp
) {
    public record CurrentLocation(
            String roomId,
            Float x,
            Float y,
            Integer heading
    ) {
    }

    public record LcdState(
            String mode,
            String emotion,
            String message,
            String subMessage
    ) {
    }

    public record Dispenser(
            Integer remaining
    ) {
    }
}
