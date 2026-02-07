package site.silverbot.api.robot.response;

import java.time.OffsetDateTime;

public record RobotEventsReportResponse(
        boolean received,
        int processedCount,
        int medicationTakenCount,
        int medicationDeferredCount,
        OffsetDateTime serverTime
) {
}
