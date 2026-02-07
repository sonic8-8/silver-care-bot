package site.silverbot.api.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.notification.response.NotificationListResponse;
import site.silverbot.api.notification.response.NotificationResponse;
import site.silverbot.api.notification.response.ReadAllResponse;
import site.silverbot.api.notification.response.UnreadCountResponse;
import site.silverbot.api.notification.service.NotificationService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<NotificationListResponse> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean isRead
    ) {
        return ApiResponse.success(notificationService.getNotifications(isRead, page, size));
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount() {
        return ApiResponse.success(notificationService.getUnreadCount());
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable Long notificationId) {
        return ApiResponse.success(notificationService.markAsRead(notificationId));
    }

    @PatchMapping("/read-all")
    public ApiResponse<ReadAllResponse> markAllAsRead() {
        return ApiResponse.success(notificationService.markAllAsRead());
    }
}
