package site.silverbot.api.emergency.response;

import java.time.LocalDateTime;

import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyType;

public record EmergencyResponse(
        Long emergencyId,
        Long elderId,
        Long robotId,
        EmergencyType type,
        String location,
        Float confidence,
        EmergencyResolution resolution,
        String note,
        LocalDateTime detectedAt,
        LocalDateTime resolvedAt
) {
}
