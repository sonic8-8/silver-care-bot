package site.silverbot.api.map.request;

import jakarta.validation.constraints.Size;
import site.silverbot.domain.robot.RoomType;

public record UpdateRoomRequest(
        @Size(max = 50)
        String name,
        Float x,
        Float y,
        RoomType type
) {
}
