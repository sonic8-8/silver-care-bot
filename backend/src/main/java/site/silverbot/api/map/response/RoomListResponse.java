package site.silverbot.api.map.response;

import java.util.List;

public record RoomListResponse(
        List<RoomResponse> rooms
) {
}
