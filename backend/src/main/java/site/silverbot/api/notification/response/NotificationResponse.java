package site.silverbot.api.notification.response;

import java.time.LocalDateTime;
import site.silverbot.domain.notification.NotificationType;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        Long elderId,
        String targetPath,
        boolean isRead,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
}
