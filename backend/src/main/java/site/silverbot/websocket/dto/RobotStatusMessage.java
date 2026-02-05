package site.silverbot.websocket.dto;

import java.time.OffsetDateTime;

public record RobotStatusMessage(
        WebSocketMessageType type,
        Payload payload,
        OffsetDateTime timestamp
) {
    public static RobotStatusMessage of(Payload payload) {
        return new RobotStatusMessage(WebSocketMessageType.ROBOT_STATUS_UPDATE, payload, OffsetDateTime.now());
    }

    public record Payload(
            Long robotId,
            Long elderId,
            Integer batteryLevel,
            String networkStatus,
            String currentLocation,
            String lcdMode
    ) {
    }
}
