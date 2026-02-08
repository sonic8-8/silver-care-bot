package site.silverbot.api.robot.request;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record MedicationReminderRequest(
        Long elderId,
        @NotNull
        Long medicationId,
        OffsetDateTime startedAt
) {
}
