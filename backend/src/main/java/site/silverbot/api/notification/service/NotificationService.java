package site.silverbot.api.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.notification.response.NotificationListResponse;
import site.silverbot.api.notification.response.NotificationResponse;
import site.silverbot.api.notification.response.ReadAllResponse;
import site.silverbot.api.notification.response.UnreadCountResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.notification.Notification;
import site.silverbot.domain.notification.NotificationRepository;
import site.silverbot.domain.notification.NotificationType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.websocket.WebSocketMessageService;
import site.silverbot.websocket.dto.NotificationMessage;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ElderRepository elderRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;
    private final WebSocketMessageService webSocketMessageService;

    public NotificationListResponse getNotifications(Boolean isRead, int page, int size) {
        if (page < 0 || size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid page or size");
        }

        User user = currentUserService.getCurrentUser();
        PageRequest pageable = PageRequest.of(page, size);
        Page<Notification> notifications = isRead == null
                ? notificationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                : notificationRepository.findAllByUserIdAndIsReadOrderByCreatedAtDesc(user.getId(), isRead, pageable);

        List<NotificationResponse> items = notifications.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new NotificationListResponse(
                items,
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notifications.hasNext()
        );
    }

    public UnreadCountResponse getUnreadCount() {
        User user = currentUserService.getCurrentUser();
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return new UnreadCountResponse(unreadCount);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        User user = currentUserService.getCurrentUser();
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));

        notification.markRead(LocalDateTime.now());
        return toResponse(notification);
    }

    @Transactional
    public ReadAllResponse markAllAsRead() {
        User user = currentUserService.getCurrentUser();
        int updated = notificationRepository.markAllAsReadByUserId(user.getId(), LocalDateTime.now());
        return new ReadAllResponse(updated);
    }

    @Transactional
    public void createEmergencyNotification(
            Long userId,
            Long elderId,
            String title,
            String message,
            String targetPath
    ) {
        createByType(userId, elderId, NotificationType.EMERGENCY, title, message, targetPath);
    }

    @Transactional
    public void createMedicationNotification(
            Long userId,
            Long elderId,
            String title,
            String message,
            String targetPath
    ) {
        createByType(userId, elderId, NotificationType.MEDICATION, title, message, targetPath);
    }

    @Transactional
    public void createScheduleNotification(
            Long userId,
            Long elderId,
            String title,
            String message,
            String targetPath
    ) {
        createByType(userId, elderId, NotificationType.SCHEDULE, title, message, targetPath);
    }

    @Transactional
    public void createActivityNotification(
            Long userId,
            Long elderId,
            String title,
            String message,
            String targetPath
    ) {
        createByType(userId, elderId, NotificationType.ACTIVITY, title, message, targetPath);
    }

    @Transactional
    public void createSystemNotification(
            Long userId,
            Long elderId,
            String title,
            String message,
            String targetPath
    ) {
        createByType(userId, elderId, NotificationType.SYSTEM, title, message, targetPath);
    }

    private void createByType(
            Long userId,
            Long elderId,
            NotificationType type,
            String title,
            String message,
            String targetPath
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        NotificationSettings settings = parseSettings(user.getNotificationSettings());
        if (!settings.isTypeEnabled(type)) {
            return;
        }

        Elder elder = null;
        if (elderId != null) {
            elder = elderRepository.findById(elderId)
                    .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        }

        Notification notification = Notification.builder()
                .user(user)
                .elder(elder)
                .type(type)
                .title(title)
                .message(message)
                .targetPath(targetPath)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        if (settings.realtimeEnabled()) {
            webSocketMessageService.sendNotification(
                    user.getId(),
                    new NotificationMessage.Payload(
                            saved.getId(),
                            type.name(),
                            saved.getTitle(),
                            saved.getMessage(),
                            elderId,
                            saved.getTargetPath()
                    )
            );
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        Long elderId = notification.getElder() == null ? null : notification.getElder().getId();
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                elderId,
                notification.getTargetPath(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }

    public NotificationSettings parseSettings(String rawSettings) {
        if (rawSettings == null || rawSettings.isBlank()) {
            return NotificationSettings.defaultSettings();
        }
        try {
            JsonNode node = objectMapper.readTree(rawSettings);
            return new NotificationSettings(
                    readBoolean(node, "emergencyEnabled", true),
                    readBoolean(node, "medicationEnabled", true),
                    readBoolean(node, "scheduleEnabled", true),
                    readBoolean(node, "activityEnabled", true),
                    readBoolean(node, "systemEnabled", true),
                    readBoolean(node, "realtimeEnabled", true)
            );
        } catch (Exception ex) {
            return NotificationSettings.defaultSettings();
        }
    }

    private boolean readBoolean(JsonNode node, String fieldName, boolean defaultValue) {
        if (node == null || node.isNull() || !node.has(fieldName)) {
            return defaultValue;
        }
        JsonNode child = node.get(fieldName);
        if (child.isBoolean()) {
            return child.asBoolean();
        }
        return defaultValue;
    }

    public record NotificationSettings(
            boolean emergencyEnabled,
            boolean medicationEnabled,
            boolean scheduleEnabled,
            boolean activityEnabled,
            boolean systemEnabled,
            boolean realtimeEnabled
    ) {
        public static NotificationSettings defaultSettings() {
            return new NotificationSettings(true, true, true, true, true, true);
        }

        public boolean isTypeEnabled(NotificationType type) {
            return switch (type) {
                case EMERGENCY -> emergencyEnabled;
                case MEDICATION -> medicationEnabled;
                case SCHEDULE -> scheduleEnabled;
                case ACTIVITY -> activityEnabled;
                case SYSTEM -> systemEnabled;
            };
        }

        public String toJson(ObjectMapper mapper) {
            try {
                return mapper.writeValueAsString(this);
            } catch (Exception ex) {
                throw new IllegalStateException("Failed to serialize notification settings", ex);
            }
        }

        public NotificationSettings mergeFromNullable(
                Boolean emergencyEnabled,
                Boolean medicationEnabled,
                Boolean scheduleEnabled,
                Boolean activityEnabled,
                Boolean systemEnabled,
                Boolean realtimeEnabled
        ) {
            return new NotificationSettings(
                    emergencyEnabled == null ? this.emergencyEnabled : emergencyEnabled,
                    medicationEnabled == null ? this.medicationEnabled : medicationEnabled,
                    scheduleEnabled == null ? this.scheduleEnabled : scheduleEnabled,
                    activityEnabled == null ? this.activityEnabled : activityEnabled,
                    systemEnabled == null ? this.systemEnabled : systemEnabled,
                    realtimeEnabled == null ? this.realtimeEnabled : realtimeEnabled
            );
        }
    }
}
