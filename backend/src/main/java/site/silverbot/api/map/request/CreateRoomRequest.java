package site.silverbot.api.map.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.robot.RoomType;

public record CreateRoomRequest(
        @Size(max = 50)
        String id,
        @NotBlank
        @Size(max = 50)
        String name,
        Float x,
        Float y,
        Boolean useCurrentLocation,
        RoomType type
) {
}
