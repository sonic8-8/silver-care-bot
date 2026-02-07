package site.silverbot.api.map.response;

import java.time.LocalDateTime;

public record CreateRoomResponse(
        String id,
        String name,
        Float x,
        Float y,
        LocalDateTime createdAt
) {
}
