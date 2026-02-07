package site.silverbot.api.robot.response;

import java.util.List;

public record PatrolSnapshotListResponse(
        String patrolId,
        List<PatrolSnapshotResponse> snapshots
) {
}
