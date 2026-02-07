package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

import site.silverbot.domain.patrol.PatrolOverallStatus;

public record PatrolReportResponse(
        Long patrolResultId,
        String patrolId,
        PatrolOverallStatus overallStatus,
        LocalDateTime completedAt,
        int itemCount
) {
}
