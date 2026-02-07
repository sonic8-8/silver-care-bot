package site.silverbot.api.robot.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolTarget;

public record ReportPatrolRequest(
        @NotBlank
        @Size(max = 50)
        String patrolId,

        @NotNull
        LocalDateTime startedAt,

        LocalDateTime completedAt,

        @NotEmpty
        List<@Valid PatrolItemRequest> items
) {
    public record PatrolItemRequest(
            @NotNull
            PatrolTarget target,

            @Size(max = 50)
            String label,

            @NotNull
            PatrolItemStatus status,

            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Float confidence,

            @Size(max = 255)
            String imageUrl,

            LocalDateTime checkedAt
    ) {
    }
}
