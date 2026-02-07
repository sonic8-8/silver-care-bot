package site.silverbot.api.schedule.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.schedule.ScheduleType;

public record UpdateScheduleRequest(
        @Size(max = 100)
        String title,

        @Size(max = 2000)
        String description,

        LocalDateTime scheduledAt,

        @Size(max = 100)
        String location,

        ScheduleType type,

        @Min(0)
        @Max(1440)
        Integer remindBeforeMinutes
) {
}
