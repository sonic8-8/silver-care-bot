package site.silverbot.api.activity.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import site.silverbot.api.activity.model.ActivityType;

public record CreateActivityRequest(
        @NotNull ActivityType type,
        @Size(max = 120) String title,
        @Size(max = 1000) String description,
        @Size(max = 120) String location,
        LocalDateTime detectedAt
) {
}
