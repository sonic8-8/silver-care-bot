package site.silverbot.api.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.notification.service.NotificationService;
import site.silverbot.api.user.request.UpdateMySettingsRequest;
import site.silverbot.api.user.response.MySettingsResponse;
import site.silverbot.domain.user.ThemeMode;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MySettingsService {
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public MySettingsResponse getMySettings() {
        User user = currentUserService.getCurrentUser();
        NotificationService.NotificationSettings settings = notificationService.parseSettings(user.getNotificationSettings());
        return toResponse(user.getTheme(), settings);
    }

    @Transactional
    public MySettingsResponse updateMySettings(UpdateMySettingsRequest request) {
        User user = currentUserService.getCurrentUser();
        if (request == null) {
            NotificationService.NotificationSettings settings = notificationService.parseSettings(user.getNotificationSettings());
            return toResponse(user.getTheme(), settings);
        }

        ThemeMode nextTheme = request.theme() == null ? user.getTheme() : request.theme();
        NotificationService.NotificationSettings currentSettings = notificationService.parseSettings(user.getNotificationSettings());
        UpdateMySettingsRequest.NotificationSettingsRequest update = request.notificationSettings();

        NotificationService.NotificationSettings mergedSettings = update == null
                ? currentSettings
                : currentSettings.mergeFromNullable(
                        update.emergencyEnabled(),
                        update.medicationEnabled(),
                        update.scheduleEnabled(),
                        update.activityEnabled(),
                        update.systemEnabled(),
                        update.realtimeEnabled()
                );

        user.updateTheme(nextTheme);
        user.updateNotificationSettings(mergedSettings.toJson(objectMapper));

        return toResponse(nextTheme, mergedSettings);
    }

    private MySettingsResponse toResponse(
            ThemeMode theme,
            NotificationService.NotificationSettings settings
    ) {
        return new MySettingsResponse(
                theme,
                new MySettingsResponse.NotificationSettings(
                        settings.emergencyEnabled(),
                        settings.medicationEnabled(),
                        settings.scheduleEnabled(),
                        settings.activityEnabled(),
                        settings.systemEnabled(),
                        settings.realtimeEnabled()
                )
        );
    }
}
