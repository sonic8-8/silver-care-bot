package site.silverbot.api.elder.response;

import java.time.LocalDateTime;

import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.emergency.EmergencyType;

public record ElderSummaryResponse(
        Long id,
        String name,
        int age,
        ElderStatus status,
        LocalDateTime lastActivity,
        String location,
        Boolean robotConnected,
        EmergencyType emergencyType
) {
}
