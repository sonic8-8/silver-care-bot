package site.silverbot.api.schedule.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.schedule.ScheduleType;

public record CreateVoiceScheduleRequest(
        @NotBlank
        @Size(max = 4000)
        String voiceOriginal,

        @NotBlank
        @Size(max = 4000)
        String normalizedText,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("1.0")
        Float confidence,

        @NotBlank
        @Size(max = 100)
        String title,

        @NotNull
        LocalDateTime scheduledAt,

        @Size(max = 100)
        String location,

        @NotNull
        ScheduleType type,

        @Min(0)
        @Max(1440)
        Integer remindBeforeMinutes
) {
}
