package site.silverbot.api.notification.response;

import java.util.List;

public record NotificationListResponse(
        List<NotificationResponse> notifications,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
