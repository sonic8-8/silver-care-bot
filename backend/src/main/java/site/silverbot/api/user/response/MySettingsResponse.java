package site.silverbot.api.user.response;

import site.silverbot.domain.user.ThemeMode;

public record MySettingsResponse(
        ThemeMode theme,
        NotificationSettings notificationSettings
) {
    public record NotificationSettings(
            boolean emergencyEnabled,
            boolean medicationEnabled,
            boolean scheduleEnabled,
            boolean activityEnabled,
            boolean systemEnabled,
            boolean realtimeEnabled
    ) {
    }
}
