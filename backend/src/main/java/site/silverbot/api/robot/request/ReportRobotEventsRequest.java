package site.silverbot.api.robot.request;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record ReportRobotEventsRequest(
        @NotEmpty
        List<@Valid RobotEventRequest> events
) {
    public record RobotEventRequest(
            @NotBlank
            @Size(max = 40)
            String type,

            @Size(max = 40)
            String action,

            Long medicationId,

            OffsetDateTime timestamp,

            OffsetDateTime detectedAt,

            @Size(max = 50)
            String location,

            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Float confidence,

            Map<String, Object> payload
    ) {
        @AssertTrue(message = "medicationId is required when action is TAKE")
        public boolean isMedicationIdPresentForTake() {
            if (action == null) {
                return true;
            }
            return !"TAKE".equalsIgnoreCase(action.trim()) || medicationId != null;
        }
    }
}
