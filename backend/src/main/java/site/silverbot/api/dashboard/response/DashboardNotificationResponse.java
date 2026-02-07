package site.silverbot.api.dashboard.response;

import java.time.LocalDateTime;

public record DashboardNotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        boolean isRead,
        LocalDateTime createdAt
) {
}
