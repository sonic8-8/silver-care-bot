package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolTarget;

public record PatrolItemResponse(
        Long id,
        PatrolTarget target,
        String label,
        PatrolItemStatus status,
        Float confidence,
        String imageUrl,
        LocalDateTime checkedAt
) {
}
