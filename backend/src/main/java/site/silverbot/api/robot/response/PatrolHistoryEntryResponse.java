package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.util.List;

import site.silverbot.domain.patrol.PatrolOverallStatus;

public record PatrolHistoryEntryResponse(
        Long patrolResultId,
        String patrolId,
        PatrolOverallStatus overallStatus,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        List<PatrolItemResponse> items
) {
}
