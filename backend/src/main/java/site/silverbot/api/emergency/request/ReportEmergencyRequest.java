package site.silverbot.api.emergency.request;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import site.silverbot.domain.emergency.EmergencyType;

public record ReportEmergencyRequest(
        @NotNull
        EmergencyType type,
        String location,
        OffsetDateTime detectedAt,
        Float confidence,
        JsonNode sensorData
) {
}
