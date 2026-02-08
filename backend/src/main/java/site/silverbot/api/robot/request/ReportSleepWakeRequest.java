package site.silverbot.api.robot.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

public record ReportSleepWakeRequest(
        @NotBlank
        String status,
        OffsetDateTime detectedAt,
        @DecimalMin("0.0")
        @DecimalMax("1.0")
        Float confidence
) {
}
