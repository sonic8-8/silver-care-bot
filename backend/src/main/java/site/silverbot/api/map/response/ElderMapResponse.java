package site.silverbot.api.map.response;

import java.time.LocalDateTime;
import java.util.List;

public record ElderMapResponse(
        String mapId,
        LocalDateTime lastUpdatedAt,
        List<MapRoom> rooms,
        RobotPosition robotPosition,
        String mapHtml
) {
    public record MapRoom(
            String id,
            String name,
            String type,
            Bounds bounds
    ) {
    }

    public record Bounds(
            Float x,
            Float y,
            Float width,
            Float height
    ) {
    }

    public record RobotPosition(
            Float x,
            Float y,
            String roomId,
            Integer heading
    ) {
    }
}
