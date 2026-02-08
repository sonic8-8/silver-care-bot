package site.silverbot.api.robot.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.List;
import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolTarget;

public record ReportPatrolResultsRequest(
        @NotNull
        OffsetDateTime patrolledAt,
        @NotEmpty
        List<@Valid PatrolResultItemRequest> results,
        @Size(max = 20)
        String overallStatus
) {
    public record PatrolResultItemRequest(
            @NotNull
            PatrolTarget target,
            @NotNull
            PatrolItemStatus status,
            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Float confidence,
            @Size(max = 50)
            String label,
            @Size(max = 255)
            String imageUrl
    ) {
    }
}
