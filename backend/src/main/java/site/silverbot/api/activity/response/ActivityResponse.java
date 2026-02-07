package site.silverbot.api.activity.response;

import java.time.LocalDateTime;

import site.silverbot.api.activity.model.ActivityType;

public record ActivityResponse(
        Long id,
        Long elderId,
        Long robotId,
        ActivityType type,
        String title,
        String description,
        String location,
        LocalDateTime detectedAt,
        LocalDateTime createdAt
) {
}
