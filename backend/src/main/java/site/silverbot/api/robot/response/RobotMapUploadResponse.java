package site.silverbot.api.robot.response;

import java.time.OffsetDateTime;
import java.util.List;

public record RobotMapUploadResponse(
        String mapId,
        OffsetDateTime uploadedAt,
        List<UploadedRoom> rooms
) {
    public record UploadedRoom(
            String id,
            String name
    ) {
    }
}
