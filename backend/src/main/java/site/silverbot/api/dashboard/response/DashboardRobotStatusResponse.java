package site.silverbot.api.dashboard.response;

import java.time.LocalDateTime;

public record DashboardRobotStatusResponse(
        Long robotId,
        Integer batteryLevel,
        String networkStatus,
        String currentLocation,
        LocalDateTime lastSyncAt
) {
}
