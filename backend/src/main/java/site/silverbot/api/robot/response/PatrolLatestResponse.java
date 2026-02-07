package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.util.List;

import site.silverbot.domain.patrol.PatrolOverallStatus;

public record PatrolLatestResponse(
        Long patrolResultId,
        String patrolId,
        PatrolOverallStatus overallStatus,
        LocalDateTime lastPatrolAt,
        List<PatrolItemResponse> items
) {
}
