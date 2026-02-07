package site.silverbot.api.schedule.response;

import java.time.LocalDateTime;

import site.silverbot.domain.schedule.ScheduleSource;
import site.silverbot.domain.schedule.ScheduleStatus;
import site.silverbot.domain.schedule.ScheduleType;

public record ScheduleResponse(
        Long id,
        Long elderId,
        String title,
        String description,
        LocalDateTime scheduledAt,
        String location,
        ScheduleType type,
        ScheduleSource source,
        String voiceOriginal,
        String normalizedText,
        Float confidence,
        ScheduleStatus status,
        Integer remindBeforeMinutes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
