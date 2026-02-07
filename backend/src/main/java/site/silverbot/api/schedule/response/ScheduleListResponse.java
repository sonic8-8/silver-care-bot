package site.silverbot.api.schedule.response;

import java.util.List;

public record ScheduleListResponse(
        List<ScheduleResponse> schedules
) {
}
