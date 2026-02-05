package site.silverbot.api.emergency.request;

import jakarta.validation.constraints.NotNull;
import site.silverbot.domain.emergency.EmergencyResolution;

public record ResolveEmergencyRequest(
        @NotNull
        EmergencyResolution resolution,
        String note
) {
}
