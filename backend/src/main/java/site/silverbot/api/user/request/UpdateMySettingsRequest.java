package site.silverbot.api.user.request;

import jakarta.validation.Valid;
import site.silverbot.domain.user.ThemeMode;

public record UpdateMySettingsRequest(
        ThemeMode theme,
        @Valid NotificationSettingsRequest notificationSettings
) {
    public record NotificationSettingsRequest(
            Boolean emergencyEnabled,
            Boolean medicationEnabled,
            Boolean scheduleEnabled,
            Boolean activityEnabled,
            Boolean systemEnabled,
            Boolean realtimeEnabled
    ) {
    }
}
