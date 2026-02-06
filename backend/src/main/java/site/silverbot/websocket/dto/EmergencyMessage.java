package site.silverbot.websocket.dto;

import java.time.OffsetDateTime;

public record EmergencyMessage(
        WebSocketMessageType type,
        Payload payload,
        OffsetDateTime timestamp
) {
    public static EmergencyMessage of(Payload payload) {
        return new EmergencyMessage(WebSocketMessageType.EMERGENCY_ALERT, payload, OffsetDateTime.now());
    }

    public record Payload(
            Long emergencyId,
            Long elderId,
            String elderName,
            String type,
            String location,
            OffsetDateTime detectedAt
    ) {
    }
}
