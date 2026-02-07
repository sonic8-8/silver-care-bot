package site.silverbot.api.robot.response;

import java.time.OffsetDateTime;

public record RobotLocationUpdateResponse(
        boolean received,
        OffsetDateTime serverTime
) {
}
