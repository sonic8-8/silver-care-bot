package site.silverbot.websocket.dto;

import java.time.OffsetDateTime;

public record NotificationMessage(
        WebSocketMessageType type,
        Payload payload,
        OffsetDateTime timestamp
) {
    public static NotificationMessage of(Payload payload) {
        return new NotificationMessage(WebSocketMessageType.NOTIFICATION, payload, OffsetDateTime.now());
    }

    public record Payload(
            Long id,
            String type,
            String title,
            String message,
            Long elderId
    ) {
    }
}
