package site.silverbot.api.robot.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record MedicationResponseRequest(
        Long elderId,
        @NotNull
        Long medicationId,
        @NotBlank
        String action,
        OffsetDateTime respondedAt
) {
}
