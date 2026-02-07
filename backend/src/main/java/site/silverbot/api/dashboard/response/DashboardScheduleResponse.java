package site.silverbot.api.dashboard.response;

import java.time.LocalDateTime;

public record DashboardScheduleResponse(
        Long id,
        String title,
        LocalDateTime scheduledAt,
        String location,
        String type,
        String status
) {
}
