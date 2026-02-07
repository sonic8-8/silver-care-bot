package site.silverbot.api.schedule.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.schedule.ScheduleType;

public record CreateScheduleRequest(
        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 2000)
        String description,

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
