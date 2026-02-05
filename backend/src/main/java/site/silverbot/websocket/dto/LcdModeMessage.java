package site.silverbot.websocket.dto;

import java.time.OffsetDateTime;

public record LcdModeMessage(
        WebSocketMessageType type,
        Payload payload,
        OffsetDateTime timestamp
) {
    public static LcdModeMessage of(Payload payload) {
        return new LcdModeMessage(WebSocketMessageType.LCD_MODE_CHANGE, payload, OffsetDateTime.now());
    }

    public record Payload(
            Long robotId,
            String mode,
            String emotion,
            String message,
            String subMessage
    ) {
    }
}
