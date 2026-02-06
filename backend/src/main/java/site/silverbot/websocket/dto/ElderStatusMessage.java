package site.silverbot.websocket.dto;

import java.time.OffsetDateTime;

public record ElderStatusMessage(
        WebSocketMessageType type,
        Payload payload,
        OffsetDateTime timestamp
) {
    public static ElderStatusMessage of(Payload payload) {
        return new ElderStatusMessage(WebSocketMessageType.ELDER_STATUS_UPDATE, payload, OffsetDateTime.now());
    }

    public record Payload(
            Long elderId,
            String status,
            OffsetDateTime lastActivity,
            String location
    ) {
    }
}
